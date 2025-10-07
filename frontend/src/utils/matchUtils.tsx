/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/matchUtils.ts
import { BatsmanStats } from '../components/PlayerStats';

// Updated interface to match new schema
export interface ScoreData {
  player: string;
  team: string;
  runs: number;
  balls: number;
}

export interface MatchData {
  userId: number;
  matchType: string;
  result: string;

  // Team 1 (India) stats
  team1Name: string;
  team1Runs: number;
  team1Wickets: number;
  team1Overs: number;

  // Team 2 (Pakistan) stats
  team2Name: string;
  team2Runs: number;
  team2Wickets: number;
  team2Overs: number;

  // Match metadata
  totalOvers: number;
  maxWickets: number;

  scores: ScoreData[];
}




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

  // Determine result with score details
  let result = '';
  if (winner === 'Draw') {
    result = `Match Drawn - India: ${player1.runs}/${player1.wickets}, Pakistan: ${player2.runs}/${player2.wickets}`;
  } else if (winner === 'India') {
    const margin = player1.runs - player2.runs;
    result = `India Won by ${margin} runs`;
  } else if (winner === 'Pakistan') {
    const wicketsRemaining = maxWickets - player2.wickets;
    result = `Pakistan Won by ${wicketsRemaining} wickets`;
  }

  // Utility function for cricket-style overs
  const calcOvers = (overs: number, balls: number): number => {
    const totalBalls = overs * 6 + balls;
    const completedOvers = Math.floor(totalBalls / 6);
    const remainingBalls = totalBalls % 6;
    return parseFloat(`${completedOvers}.${remainingBalls}`);
  };

  // Calculate overs for each team
  const team1Overs = calcOvers(player1.overs, player1.balls);
  const team2Overs = calcOvers(player2.overs, player2.balls);

  // Format batsmen scores - only include batsmen who played
  const scores: ScoreData[] = [];

  // Add India's batsmen
  player1.batsmen.forEach((batsman: BatsmanStats) => {
    if (batsman.balls > 0) {
      scores.push({
        player: batsman.name,
        team: 'India',
        runs: batsman.runs,
        balls: batsman.balls,
      });
    }
  });

  // Add Pakistan's batsmen
  player2.batsmen.forEach((batsman: BatsmanStats) => {
    if (batsman.balls > 0) {
      scores.push({
        player: batsman.name,
        team: 'Pakistan',
        runs: batsman.runs,
        balls: batsman.balls,
      });
    }
  });

  return {
    userId,
    matchType,
    result,

    // Team 1 (India) stats
    team1Name: 'India',
    team1Runs: player1.runs,
    team1Wickets: player1.wickets,
    team1Overs: Math.round(team1Overs * 10) / 10,

    // Team 2 (Pakistan) stats
    team2Name: 'Pakistan',
    team2Runs: player2.runs,
    team2Wickets: player2.wickets,
    team2Overs: Math.round(team2Overs * 10) / 10,

    // Match metadata
    totalOvers: maxOvers,
    maxWickets: maxWickets,

    scores,
  };
};