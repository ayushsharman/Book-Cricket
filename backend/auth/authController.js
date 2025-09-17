import {PrismaClient} from '../generated/prisma/index.js';


const prisma = new PrismaClient();

export const signup = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const user = await prisma.user.create({
      data: { email, password },
    });

    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    console.log("hogya bhai login");

    if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
    }
    res.json(user);
}