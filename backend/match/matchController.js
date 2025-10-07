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
            player_team: {
              player: s.player,
              team: s.team
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

// 📊 Get Player Stats (with Strike Rate)
export const getPlayerStats = async (req, res) => {
  try {
    const stats = await prisma.playerStats.findMany();

    const enrichedStats = stats.map(s => ({
      ...s,
      strikeRate: s.balls > 0 ? ((s.runs / s.balls) * 100).toFixed(2) : "0.00"
    }));

    res.json(enrichedStats);
  } catch (err) {
    console.error("Error fetching player stats:", err);
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

// Create a test user endpoint
export const createTestUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(200).json({
        message: "User already exists",
        user: existingUser
      });
    }

    const user = await prisma.user.create({
      data: {
        email: email || 'testuser@example.com',
        password: password || 'password123',
      }
    });

    res.status(201).json(user);
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Server error" });
  }
};
