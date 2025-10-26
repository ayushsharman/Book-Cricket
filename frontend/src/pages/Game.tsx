// src/pages/Game.tsx
import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// PlayButton replaced by direct hit buttons in UI
import ScoreBoard from '../components/ScoreBoard';
import bookCricketLogo from '../assets/book cricket.png';
import { getRandomRun, computeProbabilities, resetGameState, setStance } from '../utils/score_calculator';
import { BatsmanStats } from '../components/PlayerStats';
import { BowlerStatistics } from '../components/BowlerStats';
import { saveMatchData } from '../services/matchData';
import { formatMatchData } from '../utils/matchUtils';
import {
    BALLS_PER_OVER,
    getInitialPlayerState,
    rotateBowlers,
    calculateEconomy,
    rotateStrike,
    bringNextBatsmanIn,
} from '../utils/gameUtils';




// runs are defined in utils/gameUtils if needed elsewhere; local runs array kept for component-specific use
// Available shot types - each has its own risk/reward profile in score_calculator.tsx
const SHOT_TYPES = ['1', '2', '4', '6'];


// Define the type for the expected state
interface GameSettings {
    maxOvers: number;
    maxWickets: number;
}

const Game = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // --- Get game settings from location state ---
    const gameSettings = location.state as GameSettings | null;

    // --- Use state to hold the settings, allowing for defaults or loading ---
    const [maxOvers, setMaxOvers] = useState<number | null>(null);
    const [maxWickets, setMaxWickets] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Loading state
    const getStoredUserId = () => {
        try {
            const raw = localStorage.getItem('user');
            if (!raw) return 1;
            const parsed = JSON.parse(raw);
            return parsed?.id ?? 1;
        } catch (e) {
            return 1;
        }
    };

    const [userId] = useState<number>(getStoredUserId());
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [matchSaved, setMatchSaved] = useState(false);

    useEffect(() => {
        if (gameSettings && gameSettings.maxOvers && gameSettings.maxWickets) {
            setMaxOvers(gameSettings.maxOvers);
            setMaxWickets(gameSettings.maxWickets);
            setIsLoading(false);
        } else {
            // If state is missing, redirect back to menu
            console.error("Game settings not found in location state. Redirecting to menu.");
            alert("Please select a game mode first."); // Optional user feedback
            navigate('/');
        }
    }, [gameSettings, navigate]); // Depend on gameSettings and navigate

    interface PlayerState {
        runs: number;
        wickets: number;
        balls: number;
        overs: number;
        perBall: string[];
        batsmen: BatsmanStats[];
        bowlers: BowlerStatistics[];
    }

    const [player1, setPlayer1] = useState<PlayerState | null>(null); // Will be initialized in useEffect
    const [player2, setPlayer2] = useState<PlayerState | null>(null); // Will be initialized in useEffect
    const [currentPlayer, setCurrentPlayer] = useState(1);
    const [lastRuns, setLastRuns] = useState('0');
    const [winner, setWinner] = useState<string | null>(null);
    const [animate, setAnimate] = useState<'boundary' | 'wicket' | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [buttonProbs, setButtonProbs] = useState<{ run: string; probability: number; description: string }[] | null>(null);

    // Initialize player states when maxOvers is available
    useEffect(() => {
        if (maxOvers !== null) {
            setPlayer1(getInitialPlayerState(maxOvers, true));
            setPlayer2(getInitialPlayerState(maxOvers, false));
        }
    }, [maxOvers]);

    const handleSaveMatch = useCallback(async () => {
        if (!winner || matchSaved || isSaving) return;

        setIsSaving(true);
        setSaveError(null);

        try {
            const matchData = formatMatchData(
                userId,
                maxOvers!,
                maxWickets!,
                winner,
                player1,
                player2,
                currentPlayer
            );

            await saveMatchData(matchData);
            setMatchSaved(true);
            console.log('Match saved successfully!');
        } catch (error) {
            console.error('Failed to save match:', error);
            setSaveError('Failed to save match. Please try again.');
        } finally {
            setIsSaving(false);
        }
    }, [winner, matchSaved, isSaving, userId, maxOvers, maxWickets, player1, player2, currentPlayer]);

    useEffect(() => {
        if (winner && !matchSaved) {
            handleSaveMatch();
        }
    }, [winner, matchSaved, handleSaveMatch]);

    // --- Update isInningsOver to use state variables (ensure they are not null) ---
    const isInningsOver = (player: PlayerState | null) => {
        if (maxWickets === null || maxOvers === null || !player) return false; // Not ready yet
        return player.wickets >= maxWickets || player.overs >= maxOvers;
    }

    


    // strike rotation helpers moved to utils/gameUtils

    // Handle when a player chooses a shot (1,2,4,6)
    const handleMatch = (shotType?: string) => {
        // Ensure settings are loaded before allowing play
        if (isLoading || maxOvers === null || maxWickets === null || !player1 || !player2) {
            console.warn("Game settings not loaded yet.");
            return;
        }

        if (winner) {
            resetGame();
            return;
        }

        // Set UI to animating state
        setIsAnimating(true);

        // If player didn't choose a specific shot, pick a safe one (1 run attempt)
        const chosenShot = shotType || '1';
        
        // Get the outcome based on the shot's risk/reward profile
        const outcome = getRandomRun(chosenShot);
        
        // Update UI with result
        setLastRuns(outcome);
        
        // Show probabilities for the chosen shot in the UI
        const probabilities = computeProbabilities(chosenShot);
        setButtonProbs(probabilities);

        // Apply animations
        if (outcome === '4' || outcome === '6') {
            setAnimate('boundary');
        } else if (outcome === 'W') {
            setAnimate('wicket');
        } else {
            setAnimate(null);
        }

        // Visual animation start
        setIsAnimating(true);

        const runValue = outcome;
        setLastRuns(runValue);

        if (currentPlayer === 1) {
            // Make copies of the current state to work with
            const updatedPlayer1 = { ...player1 };
            const updatedPlayer2 = { ...player2 };
            let updatedBatsmen = [...updatedPlayer1.batsmen];
            let updatedBowlers = [...updatedPlayer2.bowlers];

            // Find the current striker
            const strikerIndex = updatedBatsmen.findIndex(b => b.isOnStrike);
            if (strikerIndex === -1) return; // Safety check

            // Find the current bowler
            const currentBowlerIndex = updatedBowlers.findIndex(b => b.isBowling);
            if (currentBowlerIndex === -1) return; // Safety check

            // Update batting and bowling stats
            if (runValue === 'W') {
                updatedPlayer1.wickets += 1;
                updatedPlayer1.perBall = [...updatedPlayer1.perBall, 'W'];
                setAnimate('wicket');

                // Update batsman stats and bring in next batsman
                updatedBatsmen[strikerIndex].balls += 1;
                updatedBatsmen = bringNextBatsmanIn(updatedBatsmen);

                // Update bowler stats - wicket taken
                updatedBowlers[currentBowlerIndex].wickets += 1;
                updatedBowlers[currentBowlerIndex].balls += 1;
            } else {
                const runsScored = parseInt(runValue);
                updatedPlayer1.runs += runsScored;
                updatedPlayer1.perBall = [...updatedPlayer1.perBall, runValue];

                // Update batsman stats
                updatedBatsmen[strikerIndex].runs += runsScored;
                updatedBatsmen[strikerIndex].balls += 1;

                // Update bowler stats - runs conceded
                updatedBowlers[currentBowlerIndex].runs += runsScored;
                updatedBowlers[currentBowlerIndex].balls += 1;

                if (runValue === '4' || runValue === '6') {
                    setAnimate('boundary');
                }

                // Rotate strike for odd runs
                if (runsScored % 2 === 1) {
                    updatedBatsmen = rotateStrike(updatedBatsmen);
                }
            }

            updatedPlayer1.balls += 1;
            if (updatedPlayer1.balls === BALLS_PER_OVER) {
                updatedPlayer1.overs += 1;
                updatedPlayer1.balls = 0;

                // Update bowler's overs
                updatedBowlers[currentBowlerIndex].overs += 1;
                updatedBowlers[currentBowlerIndex].balls = 0;

                // Calculate economy rate for the bowler
                updatedBowlers[currentBowlerIndex].economy = calculateEconomy(
                    updatedBowlers[currentBowlerIndex].runs,
                    updatedBowlers[currentBowlerIndex].overs,
                    updatedBowlers[currentBowlerIndex].balls
                );

                // Rotate bowlers at the end of the over
                updatedBowlers = rotateBowlers(updatedBowlers);

                // Rotate strike at the end of the over
                if (updatedPlayer1.wickets < maxWickets) {
                    updatedBatsmen = rotateStrike(updatedBatsmen);
                }
            } else {
                // Update economy for current bowler after each ball
                updatedBowlers[currentBowlerIndex].economy = calculateEconomy(
                    updatedBowlers[currentBowlerIndex].runs,
                    updatedBowlers[currentBowlerIndex].overs,
                    updatedBowlers[currentBowlerIndex].balls
                );
            }

            // Update player states
            updatedPlayer1.batsmen = updatedBatsmen;
            updatedPlayer2.bowlers = updatedBowlers;
            setPlayer1(updatedPlayer1);
            setPlayer2(updatedPlayer2);

            // Check if innings is over
            if (updatedPlayer1.wickets >= maxWickets || (updatedPlayer1.overs === maxOvers && updatedPlayer1.balls === 0)) {
                setCurrentPlayer(2);
                setAnimate(null); // Reset animation when switching innings
                setLastRuns('0'); // Reset last run display
            }
        } else { // Current Player 2 (Pakistan batting)
            // Make copies of the current state to work with
            const updatedPlayer1 = { ...player1 };
            const updatedPlayer2 = { ...player2 };
            let updatedBatsmen = [...updatedPlayer2.batsmen];
            let updatedBowlers = [...updatedPlayer1.bowlers];
            let matchEnded = false;

            // Find the current striker
            const strikerIndex = updatedBatsmen.findIndex(b => b.isOnStrike);
            if (strikerIndex === -1) return; // Safety check

            // Find the current bowler
            const currentBowlerIndex = updatedBowlers.findIndex(b => b.isBowling);
            if (currentBowlerIndex === -1) return; // Safety check

            // Update batting and bowling stats
            if (runValue === 'W') {
                updatedPlayer2.wickets += 1;
                updatedPlayer2.perBall = [...updatedPlayer2.perBall, 'W'];
                setAnimate('wicket');

                // Update batsman stats and bring in next batsman
                updatedBatsmen[strikerIndex].balls += 1;
                updatedBatsmen = bringNextBatsmanIn(updatedBatsmen);

                // Update bowler stats - wicket taken
                updatedBowlers[currentBowlerIndex].wickets += 1;
                updatedBowlers[currentBowlerIndex].balls += 1;
            } else {
                const runsScored = parseInt(runValue);
                updatedPlayer2.runs += runsScored;
                updatedPlayer2.perBall = [...updatedPlayer2.perBall, runValue];

                // Update batsman stats
                updatedBatsmen[strikerIndex].runs += runsScored;
                updatedBatsmen[strikerIndex].balls += 1;

                // Update bowler stats - runs conceded
                updatedBowlers[currentBowlerIndex].runs += runsScored;
                updatedBowlers[currentBowlerIndex].balls += 1;

                if (runValue === '4' || runValue === '6') {
                    setAnimate('boundary');
                }

                // Rotate strike for odd runs
                if (runsScored % 2 === 1) {
                    updatedBatsmen = rotateStrike(updatedBatsmen);
                }
            }

            updatedPlayer2.balls += 1;
            if (updatedPlayer2.balls === BALLS_PER_OVER) {
                updatedPlayer2.overs += 1;
                updatedPlayer2.balls = 0;

                // Update bowler's overs
                updatedBowlers[currentBowlerIndex].overs += 1;
                updatedBowlers[currentBowlerIndex].balls = 0;

                // Calculate economy rate for the bowler
                updatedBowlers[currentBowlerIndex].economy = calculateEconomy(
                    updatedBowlers[currentBowlerIndex].runs,
                    updatedBowlers[currentBowlerIndex].overs,
                    updatedBowlers[currentBowlerIndex].balls
                );

                // Rotate bowlers at the end of the over
                updatedBowlers = rotateBowlers(updatedBowlers);

                // Rotate strike at the end of the over
                if (updatedPlayer2.wickets < maxWickets) {
                    updatedBatsmen = rotateStrike(updatedBatsmen);
                }
            } else {
                // Update economy for current bowler after each ball
                updatedBowlers[currentBowlerIndex].economy = calculateEconomy(
                    updatedBowlers[currentBowlerIndex].runs,
                    updatedBowlers[currentBowlerIndex].overs,
                    updatedBowlers[currentBowlerIndex].balls
                );
            }

            // Update player states with the new batsmen and bowlers data
            updatedPlayer2.batsmen = updatedBatsmen;
            updatedPlayer1.bowlers = updatedBowlers;

            // Check win condition first
            if (updatedPlayer2.runs > updatedPlayer1.runs) {
                setPlayer1(updatedPlayer1);
                setPlayer2(updatedPlayer2);
                setWinner('Pakistan');

                matchEnded = true;
            }

            // Check end of innings or other win/draw conditions
            if (!matchEnded && (updatedPlayer2.wickets >= maxWickets || (updatedPlayer2.overs === maxOvers && updatedPlayer2.balls === 0))) {
                setPlayer1(updatedPlayer1);
                setPlayer2(updatedPlayer2);
                if (updatedPlayer2.runs === updatedPlayer1.runs) setWinner('Draw');
                else if (updatedPlayer2.runs < updatedPlayer1.runs) setWinner('India');
                else setWinner('Pakistan');
                matchEnded = true;
            }

            // If the match hasn't ended, update the state
            if (!matchEnded) {
                setPlayer1(updatedPlayer1);
                setPlayer2(updatedPlayer2);
            }
        }

        // Reset animation after a delay, only if not switching player immediately
        if (!(currentPlayer === 1 && isInningsOver(player1))) {
            setTimeout(() => {
                setAnimate(null);
                setIsAnimating(false);
            }, 1000);
        } else {
            setTimeout(() => setIsAnimating(false), 500);
        }
    };

    // State for batting stance
    const [stance, setCurrentStance] = useState<'normal' | 'aggressive' | 'defensive'>('normal');

    // Reset both game state and UI
    const resetGame = () => {
        if (maxOvers === null) return;

        setPlayer1(getInitialPlayerState(maxOvers, true));
        setPlayer2(getInitialPlayerState(maxOvers, false));
        setCurrentPlayer(1);
        setLastRuns('0');
        setWinner(null);
        setAnimate(null);

        // Reset match state
        setMatchSaved(false);
        setSaveError(null);
        setIsSaving(false);

        // Reset strategic elements
        resetGameState();
        setCurrentStance('normal');
    };

    // --- Render loading or the game ---
    if (isLoading || !player1 || !player2) {
        return <div className="flex items-center justify-center h-screen">Loading Game...</div>;
    }

    return (
        <div className="relative h-screen">
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: 'url(https://t3.ftcdn.net/jpg/00/77/81/02/360_F_77810263_zgIAUTTlwF0Bl8ZCxHsofgTzXlZXy9Nn.jpg)' }}
            ></div>
            <div className="relative h-full flex flex-col justify-between">
                {/* Game settings display */}
                <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white p-2 rounded text-sm z-10">
                    {maxOvers} Overs / {maxWickets} Wickets Match
                </div>

                {/* Scoreboards in corners to leave central area free for larger matches */}
                <div className="absolute top-6 left-6 w-96">
                    <ScoreBoard
                        runs={player1.runs}
                        wickets={player1.wickets}
                        overs={player1.overs}
                        balls={player1.balls}
                        perBall={player1.perBall}
                        animate={currentPlayer === 1 ? animate : null}
                        isCurrent={currentPlayer === 1 && !winner}
                        playerName="India"
                        teamName="India"
                        batsmen={player1.batsmen}
                        bowlers={player2.bowlers}
                        showBowlingStats={currentPlayer === 1 || !winner}
                    />
                </div>
                <div className="absolute top-6 right-6 w-96">
                    <ScoreBoard
                        runs={player2.runs}
                        wickets={player2.wickets}
                        overs={player2.overs}
                        balls={player2.balls}
                        perBall={player2.perBall}
                        animate={currentPlayer === 2 ? animate : null}
                        isCurrent={currentPlayer === 2 && !winner}
                        playerName="Pakistan"
                        teamName="Pakistan"
                        batsmen={player2.batsmen}
                        bowlers={player1.bowlers}
                        target={currentPlayer === 2 ? player1.runs + 1 : undefined}
                        showBowlingStats={currentPlayer === 2 || !winner}
                    />
                </div>
                <div className="flex flex-col items-center mt-6">
                    <div className={`text-4xl md:text-5xl font-semibold mb-2 text-center ${animate === 'boundary' ? 'text-yellow-500 animate-bounce' : ''} ${animate === 'wicket' ? 'text-red-500 animate-pulse' : ''}`}>
                        {winner ? (winner === 'Draw' ? 'Match Drawn!' : `${winner} wins!`)
                            : (currentPlayer === 1 ? `India Batting` : `Pakistan Chasing ${player1.runs + 1}`)}
                    </div>
                    <div className={`flex items-center justify-center text-8xl md:text-9xl font-extrabold transition-all duration-300 ${animate === 'boundary' ? 'text-green-500 animate-bounce' : ''} ${animate === 'wicket' ? 'text-red-600 animate-pulse' : ''}`}>{lastRuns}</div>
                </div>
                <div className="flex flex-col items-center mb-8">
                    {/* Stance selector */}
                    <div className="flex gap-4 mb-4">
                        {(['normal', 'defensive', 'aggressive'] as const).map(s => (
                            <button
                                key={s}
                                onClick={() => {
                                    setCurrentStance(s);
                                    setStance(s);
                                }}
                                className={`px-4 py-1 rounded-full text-sm font-medium transition-all ${
                                    stance === s 
                                        ? 'bg-white text-black' 
                                        : 'bg-black/30 text-white hover:bg-black/50'
                                }`}
                            >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Shot buttons */}
                    <div className="flex gap-6 items-center">
                        {['1','2','4','6'].map(shot => {
                            const shotProbs = buttonProbs || computeProbabilities(shot);
                            const hitProb = shotProbs.find(p => p.run === shot)?.probability ?? 0;
                            const wicketProb = shotProbs.find(p => p.run === 'W')?.probability ?? 0;
                            
                            return (
                                <div key={shot} className="flex flex-col items-center">
                                    <button
                                        onClick={() => handleMatch(shot)}
                                        disabled={isAnimating}
                                        className={`group relative bg-yellow-400 disabled:opacity-50 hover:bg-yellow-300 text-black font-bold py-3 px-6 rounded-full text-2xl shadow-lg ${isAnimating ? 'scale-95' : 'scale-100'}`}>
                                        {shot}
                                        {/* Enhanced Risk/Reward tooltip */}
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            {shotProbs.map(p => p.description).join('\n')}
                                        </div>
                                    </button>
                                    {/* Two-line probability display */}
                                    <div className="text-xs text-gray-200 mt-1 text-center">
                                        <div className="text-green-400">{Math.round(hitProb * 100)}% hit</div>
                                        <div className="text-red-400">{Math.round(wicketProb * 100)}% out</div>
                                    </div>
                                </div>
                            );
                        })}
                        <div className="flex flex-col items-center">
                          <button 
                            onClick={() => handleMatch('1')} 
                            disabled={isAnimating} 
                            className="bg-gray-500 disabled:opacity-50 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full text-lg shadow-inner">
                              Safe
                          </button>
                          <div className="text-xs text-gray-200 mt-1">Conservative</div>
                        </div>
                    </div>
                    <div className="mt-2 text-gray-600 text-sm">{winner ? 'Click any to restart!' : 'Choose a hit for next ball'}</div>
                    {winner && (
                    <div className="mt-2 text-center">
                        {isSaving && (
                            <div className="text-blue-600 text-sm font-medium">
                                Saving match...
                            </div>
                        )}
                        {matchSaved && !saveError && (
                            <div className="text-green-600 text-sm font-semibold">
                                ✓ Match saved successfully!
                            </div>
                        )}
                        {saveError && (
                            <div className="text-red-600 text-sm">
                                {saveError}
                                <button
                                    onClick={handleSaveMatch}
                                    className="ml-2 underline hover:text-red-700"
                                >
                                    Retry
                                </button>
                            </div>
                        )}
                    </div>
                )}
                    <button
                        onClick={() => navigate('/menu')}
                        className="mt-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded text-sm transition-all"
                    >
                        Back to Menu
                    </button>
                </div>
            </div>
            <footer className="absolute bottom-0 right-0 p-4">
                <img src={bookCricketLogo} alt="Book Cricket Logo" className="h-12 w-auto" />
            </footer>
        </div>
    );
};

export default Game;