import express from 'express';
import cors from 'cors';
import {PrismaClient} from '../backend/generated/prisma/index.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000
const app = express();
const prsima = new PrismaClient();


app.use(cors());
app.use(express.json())

app.get("/", (req, res) => {
    res.send("Server Health: GOOD")
})


app.listen(PORT, ()=> {
    console.log("Backend is Live!")
})

