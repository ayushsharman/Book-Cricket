// src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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

export interface User {
  id: number;
  email: string;
  createdAt: string;
}

export const saveMatch = async (matchData: MatchData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/matches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(matchData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to save match: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving match:', error);
    throw error;
  }
};

export const getUserMatches = async (userId: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/matches/${userId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch matches: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching matches:', error);
    throw error;
  }
};