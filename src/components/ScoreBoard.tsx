import React from 'react';

interface ScoreBoardProps {
    runs: number;
    wickets: number;
    overs: number;
    balls: number;
    perBall: string[];
    animate?: 'boundary' | 'wicket' | null;
    isCurrent?: boolean;
    playerName: string;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ runs, wickets, overs, balls, perBall, animate, isCurrent, playerName }) => {
    return (
        <div className={`bg-white rounded-lg p-4 shadow-lg w-full max-w-md mx-2 border-4 ${isCurrent ? 'border-green-500' : 'border-gray-200'} transition-all duration-500`}> 
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold flex items-center">
                    {playerName} {isCurrent && <span className="ml-2 animate-pulse text-green-600 text-base">● Live</span>}
                </h2>
                <span className="text-lg font-mono">{runs}/{wickets} ({overs}.{balls})</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
                {perBall.map((run, idx) => (
                    <span
                        key={idx}
                        className={`inline-block w-8 h-8 text-center rounded-full font-bold text-lg border border-gray-300 ${
                            run === '4' ? 'bg-yellow-300 animate-bounce' :
                            run === '6' ? 'bg-green-300 animate-bounce' :
                            run === 'W' ? 'bg-red-400 text-white animate-pulse' :
                            'bg-gray-100'
                        } ${animate && idx === perBall.length - 1 ? (animate === 'boundary' ? 'ring-4 ring-yellow-400' : 'ring-4 ring-red-400') : ''}`}
                    >
                        {run}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default ScoreBoard;
