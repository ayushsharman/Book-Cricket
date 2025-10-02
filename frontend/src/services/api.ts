// src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface ScoreData {
  player: string;
  runs: number;
  balls: number;
}

export interface MatchData {
  userId: number;
  matchType: string;
  result: string;
  totalRuns: number;
  wicketsLost: number;
  oversPlayed: number;
  scores: ScoreData[];
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
      throw new Error(`Failed to save match: ${response.statusText}`);
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