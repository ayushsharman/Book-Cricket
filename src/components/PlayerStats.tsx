// src/components/PlayerStats.tsx
import React from 'react';

export interface BatsmanStats {
    name: string;
    runs: number;
    balls: number;
    isOnStrike?: boolean;
    isOut?: boolean;
}

interface PlayerStatsProps {
    batsmen: BatsmanStats[];
    teamName: string;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ batsmen, teamName }) => {
    return (
        <div className="w-full bg-gray-50 rounded p-2 mt-2">
            <h3 className="text-sm font-semibold mb-1">{teamName} Batting</h3>
            <div className="space-y-1">
                {batsmen.map((batsman, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                        <div className="flex items-center">
                            <span className="font-medium">{batsman.name}</span>
                            {batsman.isOnStrike && <span className="ml-1 text-green-600 text-xs">*</span>}
                            {batsman.isOut && <span className="ml-1 text-red-600 text-xs">out</span>}
                        </div>
                        <div className="font-mono">
                            {batsman.runs}({batsman.balls})
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlayerStats;