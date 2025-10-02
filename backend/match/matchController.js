import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

// Create match
export const createMatch = async (req, res) => {
  try {
    console.log("🎯 Incoming match save request:", req.body);

    const { userId, matchType, result, totalRuns, wicketsLost, oversPlayed, scores } = req.body;

    if (!userId) {
      console.error("❌ Missing userId");
      return res.status(400).json({ error: "userId is required" });
    }

    const match = await prisma.match.create({
      data: {
        matchType,
        result,
        totalRuns,
        wicketsLost,
        oversPlayed,
        user: { connect: { id: Number(userId) } },
        scores: {
          create: scores?.map(s => ({
            player: s.player,
            runs: s.runs,
            balls: s.balls,
          })) || [],
        },
      },
      include: { scores: true },
    });

    console.log("✅ Match saved successfully:", match);
    res.json(match);
  } catch (err) {
    console.error("🔥 Error saving match:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all matches
export const getUserMatches = async (req, res) => {
  try {
    console.log("📥 Fetching matches for user:", req.params.userId);

    const { userId } = req.params;
    const matches = await prisma.match.findMany({
      where: { userId: Number(userId) },
      orderBy: { createdAt: "desc" },
    });

    console.log(`✅ Found ${matches.length} matches`);
    res.json(matches);
  } catch (err) {
    console.error("🔥 Error fetching matches:", err);
    res.status(500).json({ error: "Server error" });
  }
};
