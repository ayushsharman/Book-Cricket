import React from 'react';
import { useNavigate } from 'react-router-dom';

const Stats: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen text-white p-6 flex flex-col items-center justify-center overflow-hidden">
            <div
                className="absolute inset-0 bg-cover bg-center brightness-90 blur-[2px] z-0"
                style={{
                    backgroundImage:
                        "url(https://t3.ftcdn.net/jpg/00/77/81/02/360_F_77810263_zgIAUTTlwF0Bl8ZCxHsofgTzXlZXy9Nn.jpg)",
                }}
            ></div>

            <button
                onClick={() => navigate('/menu')}
                className="absolute top-6 left-6 bg-gray-900/70 hover:bg-yellow-400 hover:text-black text-white px-4 py-2 rounded-lg transition-all z-10 border border-yellow-500/50"
            >
                ← Back
            </button>

            <h1 className="text-5xl font-extrabold mb-10 text-center text-yellow-400 drop-shadow-[0_3px_4px_rgba(0,0,0,0.7)] z-10">
                Statistics
            </h1>

            <div className="flex gap-6 z-10">
                <button
                    onClick={() => navigate('/stats/players')}
                    className="px-8 py-4 rounded-lg bg-gray-800/90 text-white font-bold shadow-lg hover:bg-gray-700 transition"
                >
                    Player Stats
                </button>

                <button
                    onClick={() => navigate('/stats/matches')}
                    className="px-8 py-4 rounded-lg bg-gray-800/90 text-white font-bold shadow-lg hover:bg-gray-700 transition"
                >
                    Match Stats
                </button>
            </div>
        </div>
    );
};

export default Stats;
