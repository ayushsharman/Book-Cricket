import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

// Create match (after a game ends)
export const createMatch = async (req, res) => {
  try {
    const {
      userId,
      matchType,
      result,
      team1Name,
      team1Runs,
      team1Wickets,
      team1Overs,
      team2Name,
      team2Runs,
      team2Wickets,
      team2Overs,
      totalOvers,
      maxWickets,
      scores
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const userExists = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!userExists) {
      return res.status(404).json({
        error: `User with ID ${userId} not found.`,
        hint: "Run the createTestUser script or register a user"
      });
    }

    // 🏏 Create match entry
    const match = await prisma.match.create({
      data: {
        matchType,
        result,
        team1Name,
        team1Runs,
        team1Wickets,
        team1Overs,
        team2Name,
        team2Runs,
        team2Wickets,
        team2Overs,
        totalOvers,
        maxWickets,
        user: { connect: { id: userId } },
        scores: {
          create: scores?.map(s => ({
            player: s.player,
            team: s.team,
            runs: s.runs,
            balls: s.balls,
            user: { connect: { id: userId } },
          })) || [],
        },
      },
      include: {
        scores: true,
        user: {
          select: {
            id: true,
            email: true
          }
        }
      },
    });

    // 🔁 Update Player Stats (runs, balls, matches)
    if (scores && scores.length > 0) {
      const playersUpdated = new Set();

      for (const s of scores) {
        await prisma.playerStats.upsert({
          where: {
            player_team_userId: {
              player: s.player,
              team: s.team,
              userId: userId,
            }
          },
          update: {
            runs: { increment: s.runs },
            balls: { increment: s.balls },
            matches: playersUpdated.has(`${s.player}_${s.team}`)
              ? undefined
              : { increment: 1 } // count only once per player per match
          },
          create: {
            player: s.player,
            team: s.team,
            runs: s.runs,
            balls: s.balls,
            matches: 1,
            user: { connect: { id: userId } }
          }
        });

        playersUpdated.add(`${s.player}_${s.team}`);
      }
    }

    res.status(201).json(match);

  } catch (err) {
    console.error("Error saving match:", err);

    if (err.code === 'P2025') {
      res.status(404).json({
        error: "User not found.",
        details: err.meta
      });
    } else {
      res.status(500).json({ error: "Server error", details: err.message });
    }
  }
};

// in your controller file (matchController.js / matchesController.js)
export const getPlayerStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const stats = await prisma.playerStats.findMany(
      {
        where: { userId: Number(userId) }
      }
    );

    // Return explicit fields and numeric strikeRate
    const enrichedStats = stats.map((s) => {
      const strikeRate = s.balls > 0 ? Number(((s.runs / s.balls) * 100).toFixed(2)) : 0;
      return {
        id: s.id,
        player: s.player,
        team: s.team,
        runs: s.runs,
        balls: s.balls,
        matches: s.matches ?? 0,
        strikeRate, // number
      };
    });

    res.json(enrichedStats);
  } catch (err) {
    console.error("Error fetching player stats:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getMatchStats = async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await prisma.match.findUnique({
      where: { id: Number(matchId) },
      include: {
        scores: {
          orderBy: { runs: "desc" },
        },
        user: {
          select: { id: true, email: true },
        },
      },
    });

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    // Format data for frontend (group by team)
    const team1Scores = match.scores.filter((s) => s.team === match.team1Name);
    const team2Scores = match.scores.filter((s) => s.team === match.team2Name);

    const formatted = {
      id: match.id,
      matchType: match.matchType,
      result: match.result,
      totalOvers: match.totalOvers,
      maxWickets: match.maxWickets,
      team1: {
        name: match.team1Name,
        runs: match.team1Runs,
        wickets: match.team1Wickets,
        overs: match.team1Overs,
        players: team1Scores.map((p) => ({
          player: p.player,
          runs: p.runs,
          balls: p.balls,
          strikeRate: p.balls > 0 ? ((p.runs / p.balls) * 100).toFixed(2) : "0.00",
        })),
      },
      team2: {
        name: match.team2Name,
        runs: match.team2Runs,
        wickets: match.team2Wickets,
        overs: match.team2Overs,
        players: team2Scores.map((p) => ({
          player: p.player,
          runs: p.runs,
          balls: p.balls,
          strikeRate: p.balls > 0 ? ((p.runs / p.balls) * 100).toFixed(2) : "0.00",
        })),
      },
      createdAt: match.createdAt,
    };

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching match stats:", err);
    res.status(500).json({ error: "Server error" });
  }
};


// Get all matches for a user
export const getUserMatches = async (req, res) => {
  try {
    const { userId } = req.params;

    const matches = await prisma.match.findMany({
      where: { userId: Number(userId) },
      include: {
        scores: true
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(matches);
  } catch (err) {
    console.error("Error fetching matches:", err);
    res.status(500).json({ error: "Server error" });
  }
};

