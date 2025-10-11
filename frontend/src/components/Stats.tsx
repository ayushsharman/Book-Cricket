import React, { useEffect, useState } from "react";
import axios from "axios";
import { ArrowUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Player = {
    id?: number;
    player: string;
    team: string;
    matches: number;
    runs: number;
    balls: number;
    strikeRate: number | string;
};

type SortKey = "runs" | "strikeRate";

const Stats: React.FC = () => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [sortKey, setSortKey] = useState<SortKey>("runs");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get("http://localhost:3000/matches/stats/players");
                setPlayers(res.data);
            } catch (err) {
                setError("Failed to load player stats. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleSort = (key: SortKey) => {
        if (key === sortKey) {
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortOrder("desc");
        }
    };

    const sortedPlayers = [...players].sort((a, b) => {
        const aVal = Number(a[sortKey]);
        const bVal = Number(b[sortKey]);
        if (sortOrder === "asc") return aVal - bVal;
        return bVal - aVal;
    });


    if (loading) {
        return (
            <div className="relative min-h-screen flex items-center justify-center text-white text-2xl font-semibold overflow-hidden">
                {/* Background */}
                <div
                    className="absolute inset-0 bg-cover bg-center brightness-90 blur-[2px] z-0"
                    style={{
                        backgroundImage:
                            "url(https://t3.ftcdn.net/jpg/00/77/81/02/360_F_77810263_zgIAUTTlwF0Bl8ZCxHsofgTzXlZXy9Nn.jpg)",
                    }}
                ></div>

                {/* Loading Text */}
                <p className="z-10 bg-black/60 px-6 py-3 rounded-xl shadow-lg border border-yellow-400/40">
                    Loading player stats...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="relative min-h-screen flex items-center justify-center text-red-300 text-2xl font-semibold overflow-hidden">
                {/* Background */}
                <div
                    className="absolute inset-0 bg-cover bg-center brightness-90 blur-[2px] z-0"
                    style={{
                        backgroundImage:
                            "url(https://t3.ftcdn.net/jpg/00/77/81/02/360_F_77810263_zgIAUTTlwF0Bl8ZCxHsofgTzXlZXy9Nn.jpg)",
                    }}
                ></div>

                {/* Error Text */}
                <p className="z-10 bg-black/70 px-6 py-3 rounded-xl shadow-lg border border-red-400/40">
                    {error}
                </p>
            </div>
        );
    }


    return (
        <div className="relative min-h-screen text-white p-6 flex flex-col items-center justify-center overflow-hidden">
            {/* Background Layer */}
            <div
                className="absolute inset-0 bg-cover bg-center brightness-90 blur-[2px] z-0"
                style={{
                    backgroundImage:
                        "url(https://t3.ftcdn.net/jpg/00/77/81/02/360_F_77810263_zgIAUTTlwF0Bl8ZCxHsofgTzXlZXy9Nn.jpg)",
                }}
            ></div>

            {/* Back Button */}
            <button
                onClick={() => navigate("/menu")}
                className="absolute top-6 left-6 bg-gray-900/70 hover:bg-yellow-400 hover:text-black text-white px-4 py-2 rounded-lg transition-all z-10 border border-yellow-500/50"
            >
                ← Back
            </button>

            {/* Title */}
            <h1 className="text-5xl font-extrabold mb-10 text-center text-yellow-400 drop-shadow-[0_3px_4px_rgba(0,0,0,0.7)] z-10">
                Player Stats
            </h1>

            {/* Sorting Controls */}
            <div className="flex justify-center gap-4 mb-8 z-10">
                <button
                    onClick={() => handleSort("runs")}
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg text-lg font-semibold transition-all shadow-lg
            ${sortKey === "runs"
                            ? "bg-yellow-400 text-black hover:bg-yellow-300"
                            : "bg-gray-800/80 hover:bg-gray-700/90"
                        }`}
                >
                    Runs
                    <ArrowUpDown
                        size={18}
                        className={`${sortKey === "runs" ? "opacity-100" : "opacity-50"}`}
                    />
                </button>

                <button
                    onClick={() => handleSort("strikeRate")}
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg text-lg font-semibold transition-all shadow-lg
            ${sortKey === "strikeRate"
                            ? "bg-green-400 text-black hover:bg-green-300"
                            : "bg-gray-800/80 hover:bg-gray-700/90"
                        }`}
                >
                    Strike Rate
                    <ArrowUpDown
                        size={18}
                        className={`${sortKey === "strikeRate" ? "opacity-100" : "opacity-50"}`}
                    />
                </button>
            </div>
            
            {/* Table  */}
            <div className="overflow-x-auto w-full max-w-5xl rounded-xl shadow-2xl z-10">
                <table className="w-full text-left rounded-lg overflow-hidden backdrop-blur-md bg-gray-900/80 border border-white/20">
                    <thead className="bg-yellow-400/20 text-yellow-300 font-semibold border-b border-yellow-400/40">
                        <tr>
                            <th className="py-3 px-4">#</th>
                            <th className="py-3 px-4">Player</th>
                            <th className="py-3 px-4">Team</th>
                            <th className="py-3 px-4">Matches</th>
                            <th className="py-3 px-4">Runs</th>
                            <th className="py-3 px-4">Balls</th>
                            <th className="py-3 px-4">Strike Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedPlayers.map((p, i) => {
                            const srNum = Number(p.strikeRate);
                            const srDisplay = Number.isFinite(srNum) ? srNum.toFixed(2) : "0.00";
                            return (
                                <tr
                                    key={p.id ?? i}
                                    className={`${i % 2 === 0
                                            ? "bg-gray-800/70"
                                            : "bg-gray-700/70"
                                        } hover:bg-yellow-400/10 transition`}
                                >
                                    <td className="py-3 px-4 text-gray-400">{i + 1}</td>
                                    <td className="py-3 px-4 font-semibold text-white">{p.player}</td>
                                    <td className="py-3 px-4 text-gray-200">{p.team}</td>
                                    <td className="py-3 px-4 text-gray-100">{p.matches}</td>
                                    <td className="py-3 px-4 text-yellow-300 font-bold">{p.runs}</td>
                                    <td className="py-3 px-4 text-gray-100">{p.balls}</td>
                                    <td className="py-3 px-4 text-green-300 font-bold">{srDisplay}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

export default Stats;
