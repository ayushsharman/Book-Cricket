import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

type MatchSummary = {
  id: number;
  matchType: string;
  result: string;
  team1Name: string;
  team2Name: string;
  createdAt: string;
};

type MatchDetail = {
  id: number;
  matchType: string;
  result: string;
  totalOvers: number;
  maxWickets: number;
  team1: {
    name: string;
    runs: number;
    wickets: number;
    overs: number;
    players: { player: string; runs: number; balls: number; strikeRate: string }[];
  };
  team2: {
    name: string;
    runs: number;
    wickets: number;
    overs: number;
    players: { player: string; runs: number; balls: number; strikeRate: string }[];
  };
  createdAt: string;
};

const MatchStats: React.FC = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<MatchDetail | null>(null);
  const [loadingMatchDetail, setLoadingMatchDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = 1; // TODO: replace with real user ID from auth

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoadingMatches(true);
        const res = await axios.get(`http://localhost:3000/matches/${userId}`);
        // Map to summary
        const raw = res.data as unknown[];
        type RawMatch = {
          id: number;
          matchType: string;
          result: string;
          team1Name: string;
          team2Name: string;
          createdAt: string;
        };

        const data: MatchSummary[] = raw.map((m) => {
          const item = m as RawMatch;
          return {
            id: item.id,
            matchType: item.matchType,
            result: item.result,
            team1Name: item.team1Name,
            team2Name: item.team2Name,
            createdAt: item.createdAt,
          };
        });
        setMatches(data);
      } catch (err) {
        setError('Failed to load matches.');
      } finally {
        setLoadingMatches(false);
      }
    };

    fetchMatches();
  }, [userId]);

  const openMatch = async (matchId: number) => {
    try {
      setLoadingMatchDetail(true);
      setSelectedMatch(null);
      const res = await axios.get(`http://localhost:3000/matches/stats/match/${matchId}`);
      setSelectedMatch(res.data as MatchDetail);
    } catch (err) {
      setError('Failed to load match details.');
    } finally {
      setLoadingMatchDetail(false);
    }
  };

  return (
    <div className="relative min-h-screen text-white p-6 flex flex-col items-center gap-6 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center brightness-90 blur-[2px] z-0"
        style={{
          backgroundImage:
            "url(https://t3.ftcdn.net/jpg/00/77/81/02/360_F_77810263_zgIAUTTlwF0Bl8ZCxHsofgTzXlZXy9Nn.jpg)",
        }}
      ></div>

      <button
        onClick={() => navigate('/stats')}
        className="absolute top-6 left-6 bg-gray-900/70 hover:bg-yellow-400 hover:text-black text-white px-4 py-2 rounded-lg transition-all z-30 border border-yellow-500/50"
        aria-label="Back to stats"
      >
        ← Back
      </button>

      <h1 className="text-4xl font-extrabold mb-2 text-center text-yellow-400 z-10 w-full">Match Stats</h1>

  <div className="z-10 flex gap-6 w-full max-w-6xl mx-auto">
        <aside className="w-1/3 bg-black/50 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-3">Your Matches</h2>
          {loadingMatches ? (
            <div>Loading matches...</div>
          ) : error ? (
            <div className="text-red-400">{error}</div>
          ) : matches.length === 0 ? (
            <div>No matches found.</div>
          ) : (
            <ul className="flex flex-col gap-2">
              {matches.map((m) => (
                <li key={m.id}>
                  <button
                    onClick={() => openMatch(m.id)}
                    className="w-full text-left p-3 bg-gray-800/70 rounded hover:bg-yellow-400/10 transition"
                  >
                    <div className="font-semibold">{m.team1Name} vs {m.team2Name}</div>
                    <div className="text-sm text-gray-300">{m.matchType} • {new Date(m.createdAt).toLocaleString()}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <main className="flex-1 bg-black/50 p-4 rounded-lg min-h-[300px]">
          {loadingMatchDetail ? (
            <div>Loading scorecard...</div>
          ) : selectedMatch ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold">{selectedMatch.team1.name} vs {selectedMatch.team2.name}</h3>
                  <div className="text-sm text-gray-300">{selectedMatch.matchType} • {new Date(selectedMatch.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-yellow-300 font-bold text-lg">{selectedMatch.team1.runs}/{selectedMatch.team1.wickets} ({selectedMatch.team1.overs} overs)</div>
                  <div className="text-yellow-300 font-bold text-lg">{selectedMatch.team2.runs}/{selectedMatch.team2.wickets} ({selectedMatch.team2.overs} overs)</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">{selectedMatch.team1.name} Batting</h4>
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-sm text-gray-300">
                        <th>Player</th>
                        <th>R</th>
                        <th>B</th>
                        <th>SR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedMatch.team1.players.map((p) => (
                        <tr key={p.player} className="border-t border-gray-700">
                          <td className="py-1">{p.player}</td>
                          <td className="py-1">{p.runs}</td>
                          <td className="py-1">{p.balls}</td>
                          <td className="py-1">{p.strikeRate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">{selectedMatch.team2.name} Batting</h4>
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-sm text-gray-300">
                        <th>Player</th>
                        <th>R</th>
                        <th>B</th>
                        <th>SR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedMatch.team2.players.map((p) => (
                        <tr key={p.player} className="border-t border-gray-700">
                          <td className="py-1">{p.player}</td>
                          <td className="py-1">{p.runs}</td>
                          <td className="py-1">{p.balls}</td>
                          <td className="py-1">{p.strikeRate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-300">Select a match on the left to view its scorecard.</div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MatchStats;
