/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/gameUtils.ts
import { BatsmanStats } from '../components/PlayerStats';
import { BowlerStatistics } from '../components/BowlerStats';

export const BALLS_PER_OVER = 6;

export const INDIA_PLAYERS = ['Virat Kohli', 'Rohit Sharma', 'MS Dhoni', 'Shubman Gill'];
export const PAKISTAN_PLAYERS = ['Babar Azam', 'Mohammad Rizwan', 'Shaheen Afridi', 'Fakhar Zaman'];

export const runsOptions = [
  { run: '1', weight: 5 },
  { run: '2', weight: 4 },
  { run: '4', weight: 3 },
  { run: '6', weight: 2 },
  { run: '3', weight: 1 },
  { run: 'W', weight: 1 }
];

export const getInitialBatsmen = (maxOvers: number) => {
  if (maxOvers <= 2) {
    return [
      { name: INDIA_PLAYERS[0], runs: 0, balls: 0, isOnStrike: true },
      { name: INDIA_PLAYERS[1], runs: 0, balls: 0 }
    ];
  } else if (maxOvers <= 5) {
    return [
      { name: INDIA_PLAYERS[0], runs: 0, balls: 0, isOnStrike: true },
      { name: INDIA_PLAYERS[1], runs: 0, balls: 0 },
      { name: INDIA_PLAYERS[2], runs: 0, balls: 0 }
    ];
  } else {
    return [
      { name: INDIA_PLAYERS[0], runs: 0, balls: 0, isOnStrike: true },
      { name: INDIA_PLAYERS[1], runs: 0, balls: 0 },
      { name: INDIA_PLAYERS[2], runs: 0, balls: 0 },
      { name: INDIA_PLAYERS[3], runs: 0, balls: 0 }
    ];
  }
};

export const getInitialPakistanBatsmen = (maxOvers: number) => {
  if (maxOvers <= 2) {
    return [
      { name: PAKISTAN_PLAYERS[0], runs: 0, balls: 0, isOnStrike: true },
      { name: PAKISTAN_PLAYERS[1], runs: 0, balls: 0 }
    ];
  } else if (maxOvers <= 5) {
    return [
      { name: PAKISTAN_PLAYERS[0], runs: 0, balls: 0, isOnStrike: true },
      { name: PAKISTAN_PLAYERS[1], runs: 0, balls: 0 },
      { name: PAKISTAN_PLAYERS[2], runs: 0, balls: 0 }
    ];
  } else {
    return [
      { name: PAKISTAN_PLAYERS[0], runs: 0, balls: 0, isOnStrike: true },
      { name: PAKISTAN_PLAYERS[1], runs: 0, balls: 0 },
      { name: PAKISTAN_PLAYERS[2], runs: 0, balls: 0 },
      { name: PAKISTAN_PLAYERS[3], runs: 0, balls: 0 }
    ];
  }
};

export const getInitialBowlers = (maxOvers: number, isIndianBowlers: boolean) => {
  const players = isIndianBowlers ? PAKISTAN_PLAYERS : INDIA_PLAYERS;
  const numBowlers = maxOvers <= 2 ? 2 : maxOvers <= 5 ? 3 : 4;

  const bowlers: BowlerStatistics[] = [];
  for (let i = 0; i < numBowlers; i++) {
    bowlers.push({
      name: players[i],
      overs: 0,
      balls: 0,
      runs: 0,
      wickets: 0,
      economy: 0,
      isBowling: i === 0
    });
  }

  return bowlers;
};

export const getInitialPlayerState = (maxOvers: number, isIndia: boolean) => ({
  runs: 0,
  wickets: 0,
  balls: 0,
  overs: 0,
  perBall: [] as string[],
  batsmen: isIndia ? getInitialBatsmen(maxOvers) : getInitialPakistanBatsmen(maxOvers),
  bowlers: isIndia ? getInitialBowlers(maxOvers, false) : getInitialBowlers(maxOvers, true)
});

export const calculateEconomy = (runs: number, overs: number, balls: number): number => {
  if (overs === 0 && balls === 0) return 0;
  const totalOvers = overs + (balls / BALLS_PER_OVER);
  return runs / totalOvers;
};

export const rotateBowlers = (bowlers: BowlerStatistics[]): BowlerStatistics[] => {
  const updated = [...bowlers];
  const currentBowlerIndex = updated.findIndex(b => b.isBowling);
  if (currentBowlerIndex === -1) return updated;
  updated[currentBowlerIndex].isBowling = false;
  const nextBowlerIndex = (currentBowlerIndex + 1) % updated.length;
  updated[nextBowlerIndex].isBowling = true;
  return updated;
};

export const rotateStrike = (batsmen: BatsmanStats[]) => {
  const updated = [...batsmen];
  const strikerIndex = updated.findIndex(b => b.isOnStrike);
  if (strikerIndex === -1) return updated;
  updated[strikerIndex].isOnStrike = false;
  for (let i = 0; i < updated.length; i++) {
    if (i !== strikerIndex && !updated[i].isOut) {
      updated[i].isOnStrike = true;
      break;
    }
  }
  return updated;
};

export const bringNextBatsmanIn = (batsmen: BatsmanStats[]) => {
  const updated = [...batsmen];
  const strikerIndex = updated.findIndex(b => b.isOnStrike);
  if (strikerIndex === -1) return updated;
  updated[strikerIndex].isOnStrike = false;
  updated[strikerIndex].isOut = true;

  let nextBatsmanIndex = -1;
  for (let i = 0; i < updated.length; i++) {
    if (!updated[i].isOut && !updated[i].isOnStrike) {
      nextBatsmanIndex = i;
      break;
    }
  }

  if (nextBatsmanIndex !== -1) updated[nextBatsmanIndex].isOnStrike = true;
  return updated;
};
