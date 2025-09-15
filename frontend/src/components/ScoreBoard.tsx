import React from 'react';
import PlayerStats, { BatsmanStats } from './PlayerStats';
import BowlerStats, { BowlerStatistics } from './BowlerStats';

interface ScoreBoardProps {
    runs: number;
    wickets: number;
    overs: number;
    balls: number;
    perBall: string[];
    animate?: 'boundary' | 'wicket' | null;
    isCurrent?: boolean;
    playerName: string;
    teamName: string;
    batsmen: BatsmanStats[];
    bowlers?: BowlerStatistics[];
    target?: number;
    showBowlingStats?: boolean;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({
    runs,
    wickets,
    overs,
    balls,
    perBall,
    animate,
    isCurrent,
    playerName,
    teamName,
    batsmen,
    bowlers,
    target,
    showBowlingStats = false
}) => {
    return (
        <div className={`bg-white rounded-lg p-4 shadow-lg w-full max-w-md mx-2 border-4 ${isCurrent ? 'border-green-500' : 'border-gray-200'} transition-all duration-500`}>
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold flex items-center">
                    {teamName} {isCurrent && <span className="ml-2 text-green-600 text-xs">● Live</span>}
                </h2>
                <span className="text-lg font-mono">{runs}/{wickets} ({overs}.{balls})</span>
            </div>
            
            {target && (
                <div className="text-sm font-medium text-gray-600 mb-2">
                    Target: {target} runs
                </div>
            )}
            
            <PlayerStats batsmen={batsmen} teamName={teamName} />
            
            {showBowlingStats && bowlers && bowlers.length > 0 && (
                <BowlerStats bowlers={bowlers} teamName={teamName === "India" ? "Pakistan" : "India"} />
            )}
            
            <div className="flex flex-wrap gap-1 mt-2">
                {perBall.map((run, idx) => (
                    <span
                        key={idx}
                        className={`inline-block w-7 h-7 text-center rounded-full font-bold leading-7 border border-gray-300 ${
                            run === '4' ? 'bg-yellow-300' :
                            run === '6' ? 'bg-green-300' :
                            run === 'W' ? 'bg-red-400 text-white' :
                            'bg-gray-100'
                        } ${animate && idx === perBall.length - 1 ? (animate === 'boundary' ? 'ring-2 ring-yellow-400' : 'ring-2 ring-red-400') : ''}`}
                    >
                        {run}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default ScoreBoard;