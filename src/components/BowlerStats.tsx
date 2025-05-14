import React from 'react';

export interface BowlerStatistics {
    name: string;
    overs: number;
    balls: number;
    runs: number;
    wickets: number;
    economy: number;
    isBowling?: boolean;
}

interface BowlerStatsProps {
    bowlers: BowlerStatistics[];
    teamName: string;
}

const BowlerStats: React.FC<BowlerStatsProps> = ({ bowlers, teamName }) => {
    return (
        <div className="w-full bg-gray-50 rounded p-2 mt-3">
            <h3 className="text-sm font-semibold mb-1">{teamName} Bowling</h3>
            
            {/* Header Row */}
            <div className="grid grid-cols-5 text-xs font-semibold mb-1">
                <div className="text-left">Bowler</div>
                <div className="text-center">O</div>
                <div className="text-center">R</div>
                <div className="text-center">W</div>
                <div className="text-center">Econ</div>
            </div>
            
            {/* Bowler Data Rows */}
            <div className="space-y-1">
                {bowlers.map((bowler, idx) => (
                    <div key={idx} className="grid grid-cols-5 text-sm items-center">
                        <div className="flex items-center text-left truncate pr-1">
                            <span className="font-medium">{bowler.name}</span>
                            {bowler.isBowling && <span className="ml-1 text-green-600 text-xs">●</span>}
                        </div>
                        <div className="text-center font-mono">{bowler.overs}.{bowler.balls}</div>
                        <div className="text-center font-mono">{bowler.runs}</div>
                        <div className="text-center font-mono">{bowler.wickets}</div>
                        <div className="text-center font-mono">{bowler.economy.toFixed(1)}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BowlerStats;