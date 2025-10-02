/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/matchUtils.ts
import { MatchData, ScoreData } from '../services/api';
import { BatsmanStats } from '../components/PlayerStats';

export const formatMatchData = (
  userId: number,
  maxOvers: number,
  maxWickets: number,
  winner: string,
  player1: any,
  player2: any,
  currentPlayer: number
): MatchData => {
  // Determine match type based on overs
  let matchType = '';
  if (maxOvers <= 2) matchType = 'Quick Match';
  else if (maxOvers <= 5) matchType = 'Medium Match';
  else matchType = 'Full Match';

  // Determine result
  let result = '';
  if (winner === 'Draw') {
    result = 'Draw';
  } else if (winner === 'India') {
    result = 'India Won';
  } else if (winner === 'Pakistan') {
    result = 'Pakistan Won';
  }

  // Get the batting team's final score
  const battingTeam = currentPlayer === 2 ? player2 : player1;
  const totalRuns = battingTeam.runs;
  const wicketsLost = battingTeam.wickets;
  const oversPlayed = battingTeam.overs + (battingTeam.balls / 6);

  // Format batsmen scores - only include batsmen who played
  const scores: ScoreData[] = [];
  
  // Add India's batsmen
  player1.batsmen.forEach((batsman: BatsmanStats) => {
    if (batsman.balls > 0) {
      scores.push({
        player: `${batsman.name} (IND)`,
        runs: batsman.runs,
        balls: batsman.balls,
      });
    }
  });

  // Add Pakistan's batsmen
  player2.batsmen.forEach((batsman: BatsmanStats) => {
    if (batsman.balls > 0) {
      scores.push({
        player: `${batsman.name} (PAK)`,
        runs: batsman.runs,
        balls: batsman.balls,
      });
    }
  });

  return {
    userId,
    matchType,
    result,
    totalRuns,
    wicketsLost,
    oversPlayed: Math.round(oversPlayed * 10) / 10, // Round to 1 decimal
    scores,
  };
};