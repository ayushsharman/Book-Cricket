# Book Cricket v2 — Roadmap, Architecture & Implementation Plan

> Purpose: turn your frontend-only Book Cricket into a persistent, authenticated web app with leaderboards, personal history, and real-time multiplayer. Teach migrations and schema evolution along the way.

---

## High-level vision

* Keep web-first (React + TypeScript). Backend in Node.js/TypeScript.
* Relational DB (Postgres) for migrations, leaderboards, and strong query guarantees.
* Use Prisma ORM for type-safe schema + migrations (teaches migrations well).
* Auth: guest + email/password + OAuth (Google). Use JWT sessions with refresh tokens.
* Real-time multiplayer: Socket.io (or WebSocket) for live matches (non-persistent). Persist final match results when user opts to save.
* Leaderboard: global + per-match-type, with ability to show a player's rank and top N table.
* Extendability: player profiles, auction/auction-lore features, and detailed player stats.

---

## Architecture (text diagram)

Frontend (React + TS) ↔ REST API (Node/Express or Fastify) ↔ Postgres (managed)
↕
Socket.io

* Frontend deployed on Vercel.
* Backend + Socket server on Render / Railway / Fly.io / DigitalOcean App Platform.
* Postgres managed (Supabase, Neon, Railway DB). Use connection pooling (pgbouncer) on scale.

---

## Technology choices & tradeoffs

* **Postgres + Prisma**: Good for learning migrations and schema changes, ACID guarantees, complex queries (leaderboard). Prisma gives type-safety and a smooth dev DX. Slight overhead vs raw SQL but worth it.
* **Mongo**: you know it, but not ideal for leaderboard aggregation and schema migrations learning.
* **Socket.io** for realtime matchmaking: easy, battle-tested. If you want pure WebSocket later, swapable.
* **Auth**: Start with email/password (bcrypt) + JWT stored in httpOnly cookie. Add Google OAuth for convenience. Guest users get a temporary local id (client-side) and can optionally upgrade.
* **Deployment**: Vercel (frontend) + Render or Railway for backend + managed Postgres. These give easy CI/CD and free tiers for prototyping.

---

## Data model (Postgres / Prisma first draft)

### Core domain objects

* **User** — account info, display name, stats aggregate
* **Match** — final saved match result, match-type, timestamp, participants
* **MatchPlayer** — per-player stats inside a saved match (runs, wickets, balls, playerRef)
* **Team** — optional: if you store teams/players for auction & lore
* **PlayerProfile** — auction player / lore entity with career stats
* **LeaderboardCache** — optional precomputed table for fast leaderboard queries

### Prisma schema (simplified)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String   @id @default(cuid())
  email         String?  @unique
  passwordHash  String?  // null for OAuth users
  displayName   String
  createdAt     DateTime @default(now())
  matches       MatchPlayer[]
  isGuest       Boolean  @default(false)
  stats         Json?    // aggregate stats cached, optional
}

model Match {
  id           String    @id @default(cuid())
  matchType    String    // '2over-1w', '5over-2w', '10over-3w'
  completedAt  DateTime  @default(now())
  winnerUserId  String?  // nullable for ties or guest winners
  scoreSummary Json     // small JSON summary (runs, overs, topPlayers)
  players      MatchPlayer[]
}

model MatchPlayer {
  id        String   @id @default(cuid())
  match     Match    @relation(fields: [matchId], references: [id])
  matchId   String
  user      User?    @relation(fields: [userId], references: [id])
  userId    String?
  runs      Int
  wickets   Int
  balls     Int
  createdAt DateTime @default(now())
}

model PlayerProfile {
  id        String  @id @default(cuid())
  name      String
  role      String
  bio       String?
  stats     Json?
}

// Optional: persisted leaderboard cache for fast reads
model LeaderboardCache {
  id        String  @id @default(cuid())
  matchType String
  entries   Json    // [{userId, score, rank}, ...]
  updatedAt DateTime @updatedAt
}
```

Notes: `Json` typed fields let you store flexible aggregates without redesigning early iterations.

---

## API design (REST endpoints) + Socket events

### Auth

* `POST /api/auth/signup` — email, password → create user
* `POST /api/auth/login` — email, password → returns httpOnly JWT cookie
* `POST /api/auth/oauth/google` — OAuth
* `POST /api/auth/guest` — returns a temporary guest token (short-lived)
* `POST /api/auth/refresh` — refresh token
* `POST /api/auth/logout` — clear cookie

### Matches

* `POST /api/matches` — save final match result (requires auth or guest token)

  * body: { matchType, participants: \[{userId?, displayName, runs, wickets, balls}], summary }
* `GET /api/matches/me` — list saved matches for current user
* `GET /api/matches/:id` — view a saved match

### Leaderboard

* `GET /api/leaderboard?matchType=5over-2w&limit=10&offset=0` — top players
* `GET /api/leaderboard/me?matchType=5over-2w` — returns user's rank & context

### Player / Auction

* `GET /api/players` — browse player profiles and stats
* `GET /api/players/:id` — profile detail
* `POST /api/auction/bid` — (stretch) bid flow

### Socket.io events (realtime, non-persistent)

* `connect` / `disconnect`
* `match:create` — request to create a live match lobby
* `match:join` — join lobby
* `match:ready` — player ready
* `match:roll` — server emits random-roll result to both players
* `match:update` — update live scoreboard
* `match:end` — final result; client can then `POST /api/matches` to save result

Security: server decides and signs each roll on the server to avoid client cheating. Clients only request a roll; server computes randomness and broadcasts.

---

## Leaderboard queries and indexes

* Store final match results with a `score` field (e.g., runs) and `matchType`.
* Create index on `(matchType, score DESC)` and on `userId` for history queries.
* To get top 10: `SELECT userId, SUM(score) as total_runs FROM match_players mp JOIN matches m on mp.matchId=m.id WHERE m.matchType=$1 GROUP BY userId ORDER BY total_runs DESC LIMIT 10;`
* To compute rank for current user: `SELECT count(*)+1 FROM (aggregated scores of others with greater score) ...` — or use a window function with `RANK()`.

Consider caching leaderboard aggregates in `LeaderboardCache` and refresh after N new matches or via cron.

---

## Migration & schema-change lesson plan

1. Start with the minimal schema (User, Match, MatchPlayer).
2. Run `prisma migrate dev --name init` to generate migration files.
3. Add a new column (e.g., `matchType` enrichment or `isGuest`) → `prisma migrate dev --name add_is_guest`.
4. Practice writing a manual SQL migration if needed (ALTER TABLE ...).
5. Simulate a breaking change (split `scoreSummary` into a proper table) — write `up` and `down` SQL and run in a migration.
6. Deploy migrations in CI (Github Actions) to run `prisma migrate deploy` before app starts.

---

## Realtime anti-cheat and randomness

* **Never trust the client for dice/roll generation** if saving final results. For live non-persisted play you still should prefer server-signed randomness so cheating is hard.
* Use Node's `crypto.randomInt()` for unbiased rolls. Log (server-side) the seed or results for dispute resolution.

---

## Auction & lore (future / design notes)

* Create `PlayerProfile`, `Auction`, `AuctionBid` models.
* Auction flow: Auction created → players bid (Socket events) → winner assigned → link player to team roster.
* Track `careerStats` at `PlayerProfile` level (aggregated from MatchPlayer rows).

---

## Monitoring, observability & scale considerations

* Add request logging (pino/winston) and error tracking (Sentry).
* Expose health-check endpoints.
* Add rate-limiting (to protect roll endpoints) and input validation (zod).
* For scale: separate socket & API concerns (run multiple socket instances with Redis adapter for pub/sub), set up DB pooler.

---

## Security / Privacy

* Store passwords bcrypt-hashed, use httpOnly secure cookies for JWT.
* Rate-limit roll endpoints and lobby creation.
* Validate and sanitize all inputs.
* For guest flow: minimal info, warn that guest matches won’t be saved to history unless they upgrade.

---

## Deployment checklist (minimum viable)

1. Create repo with `frontend/` and `api/` directories.
2. Frontend: React + Vite + TypeScript. Implement login screens, guest flow, and Socket integration.
3. API: Node + Fastify/Express + Prisma. Implement auth, `POST /api/matches` save, `GET /api/leaderboard`.
4. Dockerize backend for production, add `prisma migrate deploy` in container start.
5. Deploy frontend to Vercel, backend to Render/Railway, provision Postgres.
6. Wire environment variables (DATABASE\_URL, JWT secrets, OAuth keys).

---

## Milestones (ordered)

1. Repo scaffolding + dev environment (Prisma, Postgres, TS).
2. Auth (guest + email/password) + user model.
3. Match save endpoint + DB model + simple frontend "Save result" flow.
4. Leaderboard read endpoint + UI.
5. Socket-based live matches (server-signed random roll) — lobbies & basic gameplay (no save).
6. Personal match history UI + edit/export.
7. Auction & player-lore pieces + expanded stats.
8. Production deployment + migrations CI + monitoring.

---

## Immediate next steps (what you should do now)

1. Create repo with `frontend/` and `api/` directories.
2. Initialize Postgres locally (docker-compose + psql) and add `DATABASE_URL` env var.
3. Add Prisma and paste the schema above into `schema.prisma`.
4. Run `npx prisma migrate dev --name init` and `npx prisma generate`.
5. Implement a lightweight auth route (`/api/auth/guest`) that returns a guest token and a basic `POST /api/matches` that persists a match JSON (allow unauthenticated but attach guest marker).
6. Wire a simple frontend button: "Save match (guest)" → POST match.

---

## Helpful dev snippets

**Server roll (Node)**

```ts
import { randomInt } from 'crypto'

function roll() {
  const outcomes = [1,2,3,4,6, 0] // 0 => wicket
  const i = randomInt(0, outcomes.length)
  return outcomes[i]
}
```

**Leaderboard SQL (aggregate by runs)**

```sql
SELECT userId, SUM(mp.runs) as total_runs, COUNT(*) as matches_played
FROM MatchPlayer mp
JOIN Match m ON m.id = mp.matchId
WHERE m.matchType = $1
GROUP BY userId
ORDER BY total_runs DESC
LIMIT 10;
```

---

If you want, I can also generate:

* a ready-to-run `prisma` schema + seed script,
* starter Express/Fastify server template (TS) with auth endpoints,
* React components for login, guest flow, match-save and leaderboard.

Tell me which of the above you want me to *generate now* (pick one or more). I'm ready to produce the code scaffolding or a concrete migration example next.
