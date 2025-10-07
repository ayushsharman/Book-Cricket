import express from "express";
import { createMatch, getUserMatches } from "./matchController.js";
import { getPlayerStats } from "./matchController.js";

const router = express.Router();

router.post("/", createMatch);          // Save a match
router.get("/:userId", getUserMatches); // Get all matches of a user
router.get("/stats/players", getPlayerStats); // Get player stats

export default router;
