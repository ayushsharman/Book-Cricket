import express from "express";
import { createMatch, getUserMatches } from "./matchController.js";

const router = express.Router();

router.post("/", createMatch);          // Save a match
router.get("/:userId", getUserMatches); // Get all matches of a user

export default router;
