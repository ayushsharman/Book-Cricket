import express from "express";
import { createMatch, getUserMatches, getMatchStats, getPlayerStats } from "./matchController.js";

const router = express.Router();

router.post("/", createMatch);          // Save a match
router.get("/:userId", getUserMatches); // Get all matches of a user
router.get("/stats/players", getPlayerStats); // Get player stats
router.get("/stats/match/:matchId", getMatchStats); // Get single match stats

export default router;
