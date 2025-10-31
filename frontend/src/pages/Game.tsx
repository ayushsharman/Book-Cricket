// src/pages/Game.tsx (Updated)
import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ScoreBoard from '../components/ScoreBoard';
import MeterUI from '../components/MeterUI';
import bookCricketLogo from '../assets/book cricket.png';
import { useRef } from 'react';
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

interface GameSettings {
    maxOvers: number;
    maxWickets: number;
}

interface PlayerState {
    runs: number;
    wickets: number;
    balls: number;
    overs: number;
    perBall: string[];
    batsmen: BatsmanStats[];
    bowlers: BowlerStatistics[];
}

const Game = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const gameSettings = location.state as GameSettings | null;

    const [maxOvers, setMaxOvers] = useState<number | null>(null);
    const [maxWickets, setMaxWickets] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
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
    const stopMeterRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        if (gameSettings?.maxOvers && gameSettings?.maxWickets) {
            setMaxOvers(gameSettings.maxOvers);
            setMaxWickets(gameSettings.maxWickets);
            setIsLoading(false);
        } else {
            console.error("Game settings not found in location state. Redirecting to menu.");
            alert("Please select a game mode first.");
            navigate('/');
        }
    }, [gameSettings, navigate]);

    const [player1, setPlayer1] = useState<PlayerState | null>(null);
    const [player2, setPlayer2] = useState<PlayerState | null>(null);
    const [currentPlayer, setCurrentPlayer] = useState(1);
    const [lastRuns, setLastRuns] = useState('0');
    const [winner, setWinner] = useState<string | null>(null);
    const [animate, setAnimate] = useState<'boundary' | 'wicket' | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isMeterAnimating, setIsMeterAnimating] = useState(false);

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

    const isInningsOver = (player: PlayerState | null) => {
        if (maxWickets === null || maxOvers === null || !player) return false;
        return player.wickets >= maxWickets || player.overs >= maxOvers;
    };

    const handleMeterStop = (score: string) => {
        setLastRuns(score);
        console.log(score);
        setIsMeterAnimating(false);
        console.log('Meter stopped at score:', score);

        // Determine animation type
        if (score === '4' || score === '6') {
            setAnimate('boundary');
        } else if (score === 'W') {
            setAnimate('wicket');
        }

        // Process the ball result
        handleMatchResolve(score);
    };

    const handlePlayClick = () => {
        if (isLoading || maxOvers === null || maxWickets === null || !player1 || !player2) {
            console.warn("Game settings not loaded yet.");
            return;
        }

        if (winner) {
            resetGame();
            return;
        }

        if (isMeterAnimating) {
            // Stop the meter
            setIsMeterAnimating(false);
        } else {
            // Start the meter. Do not set `isAnimating` here — that's used for
            // boundary/wicket visual animations. Keeping it false keeps the
            // Play/Stop button enabled while the meter runs.
            setIsMeterAnimating(true);
            setIsAnimating(false);
        }
    };

    function handleMatchResolve(runValue: string) {
        if (currentPlayer === 1) {
            const updatedPlayer1 = { ...player1 } as PlayerState;
            const updatedPlayer2 = { ...player2 } as PlayerState;
            let updatedBatsmen = [...updatedPlayer1.batsmen];
            let updatedBowlers = [...updatedPlayer2.bowlers];

            const strikerIndex = updatedBatsmen.findIndex(b => b.isOnStrike);
            const currentBowlerIndex = updatedBowlers.findIndex(b => b.isBowling);

            if (strikerIndex === -1 || currentBowlerIndex === -1) return;

            if (runValue === 'W') {
                updatedPlayer1.wickets += 1;
                updatedPlayer1.perBall = [...updatedPlayer1.perBall, 'W'];

                updatedBatsmen[strikerIndex].balls += 1;
                updatedBatsmen = bringNextBatsmanIn(updatedBatsmen);

                updatedBowlers[currentBowlerIndex].wickets += 1;
                updatedBowlers[currentBowlerIndex].balls += 1;
            } else {
                const runsScored = parseInt(runValue);
                updatedPlayer1.runs += runsScored;
                updatedPlayer1.perBall = [...updatedPlayer1.perBall, runValue];

                updatedBatsmen[strikerIndex].runs += runsScored;
                updatedBatsmen[strikerIndex].balls += 1;

                updatedBowlers[currentBowlerIndex].runs += runsScored;
                updatedBowlers[currentBowlerIndex].balls += 1;

                if (runsScored % 2 === 1) {
                    updatedBatsmen = rotateStrike(updatedBatsmen);
                }
            }

            updatedPlayer1.balls += 1;
            if (updatedPlayer1.balls === BALLS_PER_OVER) {
                updatedPlayer1.overs += 1;
                updatedPlayer1.balls = 0;

                updatedBowlers[currentBowlerIndex].overs += 1;
                updatedBowlers[currentBowlerIndex].balls = 0;

                updatedBowlers[currentBowlerIndex].economy = calculateEconomy(
                    updatedBowlers[currentBowlerIndex].runs,
                    updatedBowlers[currentBowlerIndex].overs,
                    updatedBowlers[currentBowlerIndex].balls
                );

                updatedBowlers = rotateBowlers(updatedBowlers);

                if (updatedPlayer1.wickets < maxWickets!) {
                    updatedBatsmen = rotateStrike(updatedBatsmen);
                }
            } else {
                updatedBowlers[currentBowlerIndex].economy = calculateEconomy(
                    updatedBowlers[currentBowlerIndex].runs,
                    updatedBowlers[currentBowlerIndex].overs,
                    updatedBowlers[currentBowlerIndex].balls
                );
            }

            updatedPlayer1.batsmen = updatedBatsmen;
            updatedPlayer2.bowlers = updatedBowlers;
            setPlayer1(updatedPlayer1);
            setPlayer2(updatedPlayer2);

            if (updatedPlayer1.wickets >= maxWickets! || (updatedPlayer1.overs === maxOvers! && updatedPlayer1.balls === 0)) {
                setCurrentPlayer(2);
                setAnimate(null);
                setLastRuns('0');
            }
        } else {
            const updatedPlayer1 = { ...player1 } as PlayerState;
            const updatedPlayer2 = { ...player2 } as PlayerState;
            let updatedBatsmen = [...updatedPlayer2.batsmen];
            let updatedBowlers = [...updatedPlayer1.bowlers];
            let matchEnded = false;

            const strikerIndex = updatedBatsmen.findIndex(b => b.isOnStrike);
            const currentBowlerIndex = updatedBowlers.findIndex(b => b.isBowling);

            if (strikerIndex === -1 || currentBowlerIndex === -1) return;

            if (runValue === 'W') {
                updatedPlayer2.wickets += 1;
                updatedPlayer2.perBall = [...updatedPlayer2.perBall, 'W'];

                updatedBatsmen[strikerIndex].balls += 1;
                updatedBatsmen = bringNextBatsmanIn(updatedBatsmen);

                updatedBowlers[currentBowlerIndex].wickets += 1;
                updatedBowlers[currentBowlerIndex].balls += 1;
            } else {
                const runsScored = parseInt(runValue);
                updatedPlayer2.runs += runsScored;
                updatedPlayer2.perBall = [...updatedPlayer2.perBall, runValue];

                updatedBatsmen[strikerIndex].runs += runsScored;
                updatedBatsmen[strikerIndex].balls += 1;

                updatedBowlers[currentBowlerIndex].runs += runsScored;
                updatedBowlers[currentBowlerIndex].balls += 1;

                if (runsScored % 2 === 1) updatedBatsmen = rotateStrike(updatedBatsmen);
            }

            updatedPlayer2.balls += 1;
            if (updatedPlayer2.balls === BALLS_PER_OVER) {
                updatedPlayer2.overs += 1;
                updatedPlayer2.balls = 0;

                updatedBowlers[currentBowlerIndex].overs += 1;
                updatedBowlers[currentBowlerIndex].balls = 0;

                updatedBowlers[currentBowlerIndex].economy = calculateEconomy(
                    updatedBowlers[currentBowlerIndex].runs,
                    updatedBowlers[currentBowlerIndex].overs,
                    updatedBowlers[currentBowlerIndex].balls
                );

                updatedBowlers = rotateBowlers(updatedBowlers);
                if (updatedPlayer2.wickets < maxWickets!) updatedBatsmen = rotateStrike(updatedBatsmen);
            } else {
                updatedBowlers[currentBowlerIndex].economy = calculateEconomy(
                    updatedBowlers[currentBowlerIndex].runs,
                    updatedBowlers[currentBowlerIndex].overs,
                    updatedBowlers[currentBowlerIndex].balls
                );
            }

            updatedPlayer2.batsmen = updatedBatsmen;
            updatedPlayer1.bowlers = updatedBowlers;

            if (updatedPlayer2.runs > updatedPlayer1.runs) {
                setPlayer1(updatedPlayer1);
                setPlayer2(updatedPlayer2);
                setWinner('Pakistan');
                matchEnded = true;
            }

            if (!matchEnded && (updatedPlayer2.wickets >= maxWickets! || (updatedPlayer2.overs === maxOvers! && updatedPlayer2.balls === 0))) {
                setPlayer1(updatedPlayer1);
                setPlayer2(updatedPlayer2);
                if (updatedPlayer2.runs === updatedPlayer1.runs) setWinner('Draw');
                else if (updatedPlayer2.runs < updatedPlayer1.runs) setWinner('India');
                else setWinner('Pakistan');
                matchEnded = true;
            }

            if (!matchEnded) {
                setPlayer1(updatedPlayer1);
                setPlayer2(updatedPlayer2);
            }
        }

        setTimeout(() => {
            setAnimate(null);
            setIsAnimating(false);
        }, 1000);
    }

    const resetGame = () => {
        if (maxOvers === null) return;

        setPlayer1(getInitialPlayerState(maxOvers, true));
        setPlayer2(getInitialPlayerState(maxOvers, false));
        setCurrentPlayer(1);
        setLastRuns('0');
        setWinner(null);
        setAnimate(null);

        setMatchSaved(false);
        setSaveError(null);
        setIsSaving(false);
    };

    if (isLoading || !player1 || !player2) {
        return <div className="flex items-center justify-center h-screen">Loading Game...</div>;
    }

    return (
        <div className="relative h-screen">
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ 
                    backgroundImage: 'url(https://t3.ftcdn.net/jpg/00/77/81/02/360_F_77810263_zgIAUTTlwF0Bl8ZCxHsofgTzXlZXy9Nn.jpg)'
                }}
            ></div>
            <div className="relative h-full flex flex-col justify-between">
                <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white px-3 py-1 rounded text-sm z-10">
                    {maxOvers} Overs / {maxWickets} Wickets Match
                </div>

                <div className="absolute top-16 left-6 w-96">
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
                <div className="absolute top-16 right-6 w-96">
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

                <div className="flex flex-col items-center justify-center flex-grow gap-8">
                    <div className="text-center">
                        <div className={`text-6xl font-bold mb-6 ${
                            animate === 'boundary' ? 'text-yellow-500 animate-bounce' : 
                            animate === 'wicket' ? 'text-red-500 animate-pulse' : 'text-black'
                        }`}>
                            {winner 
                                ? (winner === 'Draw' ? 'Match Drawn!' : `${winner} wins!`)
                                : (currentPlayer === 1 
                                    ? 'India Batting' 
                                    : `Pakistan Needs ${player1.runs + 1 - player2.runs}`)
                            }
                        </div>
                    </div>

                    <MeterUI
                        isAnimating={isMeterAnimating}
                        onStop={handleMeterStop}
                        disabled={!!winner}
                    />

                    <div className="flex flex-col items-center gap-4">
                        <button
                            onClick={handlePlayClick}
                            /* Allow stopping while the meter is running. Only disable during other animations. */
                            disabled={isAnimating}
                            className={`bg-yellow-400 hover:bg-yellow-300 
                                disabled:opacity-50 text-black font-bold 
                                py-6 px-16 rounded text-4xl shadow-lg 
                                transition-all duration-300 ease-out
                                ${isAnimating ? 'scale-95' : ''}`}
                        >
                            {isMeterAnimating ? 'Stop' : (winner ? 'Play Again' : 'Play')}
                        </button>
                        
                        {winner && (
                        <div className="text-center bg-black bg-opacity-75 rounded px-6 py-3 mt-2">
                            {isSaving && <div className="text-white text-lg">Saving match...</div>}
                            {matchSaved && !saveError && <div className="text-white text-lg">✓ Match saved!</div>}
                            {saveError && (
                                <div className="text-white text-lg">
                                    {saveError}
                                    <button onClick={handleSaveMatch} className="ml-2 underline">
                                        Retry
                                    </button>
                                </div>
                            )}
                        </div>
                        )}

                        <button
                            onClick={() => navigate('/menu')}
                            className="bg-gray-800 hover:bg-gray-700 
                                text-white font-bold py-4 px-10 
                                rounded text-xl transition-colors 
                                duration-300 mt-4"
                        >
                            Back to Menu
                        </button>
                    </div>
                </div>
            </div>
            <footer className="absolute bottom-0 right-0 p-4">
                <img src={bookCricketLogo} alt="Book Cricket Logo" className="h-12 w-auto" />
            </footer>
        </div>
    );
};

export default Game;