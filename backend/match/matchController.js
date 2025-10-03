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

    // Validate userId
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!userExists) {
      return res.status(404).json({ 
        error: `User with ID ${userId} not found. Please create a user first.`,
        hint: "Run the createTestUser script or register a user"
      });
    }

    // Create the match with team-specific stats
    const match = await prisma.match.create({
      data: {
        matchType,
        result,
        
        // Team 1 stats
        team1Name,
        team1Runs,
        team1Wickets,
        team1Overs,
        
        // Team 2 stats
        team2Name,
        team2Runs,
        team2Wickets,
        team2Overs,
        
        // Match metadata
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

    res.status(201).json(match);
  } catch (err) {
    console.error("Error saving match:", err);
    
    if (err.code === 'P2025') {
      res.status(404).json({ 
        error: "User not found. Please create a user first.",
        details: err.meta
      });
    } else {
      res.status(500).json({ error: "Server error", details: err.message });
    }
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

// Create a test user endpoint (for development)
export const createTestUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(200).json({ 
        message: "User already exists",
        user: existingUser 
      });
    }

    // Create new user
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