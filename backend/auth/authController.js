// auth.js
import { PrismaClient } from "../generated/prisma/index.js";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const auth = async (req, res) => {
  const { email, password } = req.body;
  try {
    // 1. Check if user exists
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // If not found → create new user
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await prisma.user.create({
        data: { email, password: hashedPassword },
      });
      console.log("✅ New user created:", email);
    } else {
      // If exists → check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      console.log("✅ User logged in:", email);
    }

    // Don't send back password
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
