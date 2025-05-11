// src/pages/Game.tsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PlayButton from '../components/PlayButton';
import ScoreBoard from '../components/ScoreBoard';
import bookCricketLogo from '../assets/book cricket.png';
import { getRandomRun } from '../utils/score_calculator';
import { BatsmanStats } from '../components/PlayerStats';

const runs = [
    { run: '1', weight: 5 },
    { run: '2', weight: 4 },
    { run: '4', weight: 3 },
    { run: '6', weight: 2 },
    { run: '3', weight: 1 },
    { run: 'W', weight: 1 }
];

const BALLS_PER_OVER = 6;

// Define Indian and Pakistani players
const INDIA_PLAYERS = ['Virat Kohli', 'Rohit Sharma', 'MS Dhoni', 'Shubman Gill'];
const PAKISTAN_PLAYERS = ['Babar Azam', 'Mohammad Rizwan', 'Shaheen Afridi', 'Fakhar Zaman'];

// Get initial batsmen based on match format
const getInitialBatsmen = (maxOvers: number) => {
    if (maxOvers <= 2) {
        // For 2 over matches, only 2 batsmen
        return [
            { name: INDIA_PLAYERS[0], runs: 0, balls: 0, isOnStrike: true },
            { name: INDIA_PLAYERS[1], runs: 0, balls: 0 }
        ];
    } else if (maxOvers <= 5) {
        // For medium length matches, 3 batsmen
        return [
            { name: INDIA_PLAYERS[0], runs: 0, balls: 0, isOnStrike: true },
            { name: INDIA_PLAYERS[1], runs: 0, balls: 0 },
            { name: INDIA_PLAYERS[2], runs: 0, balls: 0 }
        ];
    } else {
        // For long matches, all 4 batsmen
        return [
            { name: INDIA_PLAYERS[0], runs: 0, balls: 0, isOnStrike: true },
            { name: INDIA_PLAYERS[1], runs: 0, balls: 0 },
            { name: INDIA_PLAYERS[2], runs: 0, balls: 0 },
            { name: INDIA_PLAYERS[3], runs: 0, balls: 0 }
        ];
    }
};

// Get initial Pakistan batsmen based on match format
const getInitialPakistanBatsmen = (maxOvers: number) => {
    if (maxOvers <= 2) {
        // For 2 over matches, only 2 batsmen
        return [
            { name: PAKISTAN_PLAYERS[0], runs: 0, balls: 0, isOnStrike: true },
            { name: PAKISTAN_PLAYERS[1], runs: 0, balls: 0 }
        ];
    } else if (maxOvers <= 5) {
        // For medium length matches, 3 batsmen
        return [
            { name: PAKISTAN_PLAYERS[0], runs: 0, balls: 0, isOnStrike: true },
            { name: PAKISTAN_PLAYERS[1], runs: 0, balls: 0 },
            { name: PAKISTAN_PLAYERS[2], runs: 0, balls: 0 }
        ];
    } else {
        // For long matches, all 4 batsmen
        return [
            { name: PAKISTAN_PLAYERS[0], runs: 0, balls: 0, isOnStrike: true },
            { name: PAKISTAN_PLAYERS[1], runs: 0, balls: 0 },
            { name: PAKISTAN_PLAYERS[2], runs: 0, balls: 0 },
            { name: PAKISTAN_PLAYERS[3], runs: 0, balls: 0 }
        ];
    }
};

const getInitialPlayerState = (maxOvers: number, isIndia: boolean) => ({
    runs: 0,
    wickets: 0,
    balls: 0,
    overs: 0,
    perBall: [] as string[],
    batsmen: isIndia ? getInitialBatsmen(maxOvers) : getInitialPakistanBatsmen(maxOvers)
});

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

    const [player1, setPlayer1] = useState<any>(null); // Will be initialized in useEffect
    const [player2, setPlayer2] = useState<any>(null); // Will be initialized in useEffect
    const [currentPlayer, setCurrentPlayer] = useState(1);
    const [lastRuns, setLastRuns] = useState('0');
    const [winner, setWinner] = useState<string | null>(null);
    const [animate, setAnimate] = useState<'boundary' | 'wicket' | null>(null);

    // Initialize player states when maxOvers is available
    useEffect(() => {
        if (maxOvers !== null) {
            setPlayer1(getInitialPlayerState(maxOvers, true));
            setPlayer2(getInitialPlayerState(maxOvers, false));
        }
    }, [maxOvers]);

    // --- Update isInningsOver to use state variables (ensure they are not null) ---
    const isInningsOver = (player: any) => {
        if (maxWickets === null || maxOvers === null) return false; // Not ready yet
        return player.wickets >= maxWickets || player.overs >= maxOvers;
    }

    // Function to rotate strike
    const rotateStrike = (batsmen: BatsmanStats[]) => {
        const updated = [...batsmen];
        
        // Find current striker and non-striker
        const strikerIndex = updated.findIndex(b => b.isOnStrike);
        if (strikerIndex === -1) return updated; // Safety check
        
        // Set current striker to not on strike
        updated[strikerIndex].isOnStrike = false;
        
        // Find first non-out batsman who isn't the striker to put on strike
        for (let i = 0; i < updated.length; i++) {
            if (i !== strikerIndex && !updated[i].isOut) {
                updated[i].isOnStrike = true;
                break;
            }
        }
        
        return updated;
    };

    // Function to get the next batsman in when a wicket falls
    const bringNextBatsmanIn = (batsmen: BatsmanStats[]) => {
        const updated = [...batsmen];
        
        // Find current striker
        const strikerIndex = updated.findIndex(b => b.isOnStrike);
        if (strikerIndex === -1) return updated; // Safety check
        
        // Mark current striker as out
        updated[strikerIndex].isOnStrike = false;
        updated[strikerIndex].isOut = true;
        
        // Find the next available batsman
        let nextBatsmanIndex = -1;
        for (let i = 0; i < updated.length; i++) {
            if (!updated[i].isOut && !updated[i].isOnStrike) {
                nextBatsmanIndex = i;
                break;
            }
        }
        
        // If found, put them on strike
        if (nextBatsmanIndex !== -1) {
            updated[nextBatsmanIndex].isOnStrike = true;
        }
        
        return updated;
    };

    const handleMatch = () => {
        // Ensure settings are loaded before allowing play
        if (isLoading || maxOvers === null || maxWickets === null || !player1 || !player2) {
            console.warn("Game settings not loaded yet.");
            return;
        }

        if (winner) {
            resetGame();
            return;
        }

        const runValue = getRandomRun(runs);
        setLastRuns(runValue);

        if (currentPlayer === 1) {
            let { runs, wickets, balls, overs, perBall, batsmen } = { ...player1 };
            let updatedBatsmen = [...batsmen];
            
            // Find the current striker
            const strikerIndex = batsmen.findIndex((b: { isOnStrike: any; }) => b.isOnStrike);
            if (strikerIndex === -1) return; // Safety check
            
            if (runValue === 'W') {
                wickets += 1;
                perBall = [...perBall, 'W'];
                setAnimate('wicket');
                
                // Update batsman stats and bring in next batsman
                updatedBatsmen[strikerIndex].balls += 1;
                updatedBatsmen = bringNextBatsmanIn(updatedBatsmen);
            } else {
                const runsScored = parseInt(runValue);
                runs += runsScored;
                perBall = [...perBall, runValue];
                
                // Update batsman stats
                updatedBatsmen[strikerIndex].runs += runsScored;
                updatedBatsmen[strikerIndex].balls += 1;
                
                if (runValue === '4' || runValue === '6') {
                    setAnimate('boundary');
                }
                
                // Rotate strike for odd runs
                if (runsScored % 2 === 1) {
                    updatedBatsmen = rotateStrike(updatedBatsmen);
                }
            }
            
            balls += 1;
            if (balls === BALLS_PER_OVER) {
                overs += 1;
                balls = 0;
                // Rotate strike at the end of the over
                if (wickets < maxWickets) {
                    updatedBatsmen = rotateStrike(updatedBatsmen);
                }
            }
            
            setPlayer1({ runs, wickets, balls, overs, perBall, batsmen: updatedBatsmen });

            // Check if innings is over
            if (wickets >= maxWickets || (overs === maxOvers && balls === 0)) {
                setCurrentPlayer(2);
                setAnimate(null); // Reset animation when switching innings
                setLastRuns('0'); // Reset last run display
            }
        } else { // Current Player 2
            let { runs, wickets, balls, overs, perBall, batsmen } = { ...player2 };
            let matchEnded = false;
            let updatedBatsmen = [...batsmen];
            
            // Find the current striker
            const strikerIndex = batsmen.findIndex((b: { isOnStrike: any; }) => b.isOnStrike);
            if (strikerIndex === -1) return; // Safety check
            
            if (runValue === 'W') {
                wickets += 1;
                perBall = [...perBall, 'W'];
                setAnimate('wicket');
                
                // Update batsman stats and bring in next batsman
                updatedBatsmen[strikerIndex].balls += 1;
                updatedBatsmen = bringNextBatsmanIn(updatedBatsmen);
            } else {
                const runsScored = parseInt(runValue);
                runs += runsScored;
                perBall = [...perBall, runValue];
                
                // Update batsman stats
                updatedBatsmen[strikerIndex].runs += runsScored;
                updatedBatsmen[strikerIndex].balls += 1;
                
                if (runValue === '4' || runValue === '6') {
                    setAnimate('boundary');
                }
                
                // Rotate strike for odd runs
                if (runsScored % 2 === 1) {
                    updatedBatsmen = rotateStrike(updatedBatsmen);
                }
            }
            
            balls += 1;
            if (balls === BALLS_PER_OVER) {
                overs += 1;
                balls = 0;
                // Rotate strike at the end of the over
                if (wickets < maxWickets) {
                    updatedBatsmen = rotateStrike(updatedBatsmen);
                }
            }

            // Check win condition first
            if (runs > player1.runs) {
                setPlayer2({ runs, wickets, balls, overs, perBall, batsmen: updatedBatsmen }); // Update state first
                setWinner('Pakistan');
                matchEnded = true;
            }

            // Check end of innings or other win/draw conditions
            if (!matchEnded && (wickets >= maxWickets || (overs === maxOvers && balls === 0))) {
                setPlayer2({ runs, wickets, balls, overs, perBall, batsmen: updatedBatsmen }); // Update state first
                if (runs === player1.runs) setWinner('Draw');
                else if (runs < player1.runs) setWinner('India');
                else setWinner('Pakistan');
                matchEnded = true;
            }

            // Update state if match hasn't ended
            if (!matchEnded) {
                setPlayer2({ runs, wickets, balls, overs, perBall, batsmen: updatedBatsmen });
            }
        }

        // Reset animation after a delay, only if not switching player immediately
        if (!(currentPlayer === 1 && isInningsOver(player1))) {
            setTimeout(() => setAnimate(null), 1000);
        }
    };

    const resetGame = () => {
        if (maxOvers === null) return;
        
        setPlayer1(getInitialPlayerState(maxOvers, true));
        setPlayer2(getInitialPlayerState(maxOvers, false));
        setCurrentPlayer(1);
        setLastRuns('0');
        setWinner(null);
        setAnimate(null);
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

                <div className="flex flex-col items-center pt-10">
                    <div className="flex flex-col md:flex-row w-full justify-center gap-4">
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
                        />
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
                            target={currentPlayer === 2 ? player1.runs + 1 : undefined}
                        />
                    </div>
                </div>
                <div className="flex flex-col items-center mt-6">
                    <div className={`text-4xl md:text-5xl font-semibold mb-2 text-center ${animate === 'boundary' ? 'text-yellow-500 animate-bounce' : ''} ${animate === 'wicket' ? 'text-red-500 animate-pulse' : ''}`}>
                        {winner ? (winner === 'Draw' ? 'Match Drawn!' : `${winner} wins!`)
                               : (currentPlayer === 1 ? `India Batting` : `Pakistan Chasing ${player1.runs + 1}`)}
                    </div>
                    <div className={`flex items-center justify-center text-8xl md:text-9xl font-extrabold transition-all duration-300 ${animate === 'boundary' ? 'text-green-500 animate-bounce' : ''} ${animate === 'wicket' ? 'text-red-600 animate-pulse' : ''}`}>{lastRuns}</div>
                </div>
                <div className="flex flex-col items-center mb-8">
                    <PlayButton onClick={handleMatch} />
                    <div className="mt-2 text-gray-600 text-sm">{winner ? 'Click Play to restart!' : 'Tap Play for next ball'}</div>
                     <button
                         onClick={() => navigate('/')}
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