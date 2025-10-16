// src/services/matchData.ts
import { saveMatch as apiSaveMatch, getUserMatches } from './api';
import { ScoreData, MatchData } from '../utils/matchUtils';

export interface AggregatedPlayerStats {
  player: string;
  team: string;
  runs: number;
  balls: number;
}

export const saveMatchData = async (matchData: MatchData) => {
  return await apiSaveMatch(matchData);
};

// Aggregate player stats across multiple matches
export const aggregatePlayerStats = (matches: MatchData[]) => {
  const stats: Record<string, AggregatedPlayerStats> = {};

  matches.forEach(m => {
    m.scores.forEach((s: ScoreData) => {
      if (!stats[s.player]) {
        stats[s.player] = { player: s.player, team: s.team, runs: 0, balls: 0 };
      }
      stats[s.player].runs += s.runs;
      stats[s.player].balls += s.balls;
    });
  });

  return Object.values(stats).sort((a, b) => b.runs - a.runs);
};

export const getAggregatedStatsForUser = async (userId: number) => {
  const matches = await getUserMatches(userId);
  // assume backend returns MatchData[]
  return aggregatePlayerStats(matches as MatchData[]);
};
