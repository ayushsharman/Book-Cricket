// src/pages/Game.tsx
import { useState, useEffect } from 'react'; // Add useEffect
import { useLocation, useNavigate } from 'react-router-dom'; // Import useLocation and useNavigate
import PlayButton from '../components/PlayButton';
import ScoreBoard from '../components/ScoreBoard';
import bookCricketLogo from '../assets/book cricket.png';
import { getRandomRun } from '../utils/score_calculator';

const runs = [
    { run: '1', weight: 5 },
    { run: '2', weight: 4 },
    { run: '4', weight: 3 },
    { run: '6', weight: 2 },
    { run: '3', weight: 1 },
    { run: 'W', weight: 1 }
];

// Define BALLS_PER_OVER here if it's constant
const BALLS_PER_OVER = 6;

// Remove hardcoded constants
// const MAX_OVERS = 10;
// const MAX_WICKETS = 2;

const getInitialPlayerState = () => ({
    runs: 0,
    wickets: 0,
    balls: 0,
    overs: 0,
    perBall: [] as string[],
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

    const [player1, setPlayer1] = useState(getInitialPlayerState());
    const [player2, setPlayer2] = useState(getInitialPlayerState());
    const [currentPlayer, setCurrentPlayer] = useState(1);
    const [lastRuns, setLastRuns] = useState('0');
    const [winner, setWinner] = useState<string | null>(null);
    const [animate, setAnimate] = useState<'boundary' | 'wicket' | null>(null);

    // --- Update isInningsOver to use state variables (ensure they are not null) ---
    // This function might be called before state is set, handle null checks
    const isInningsOver = (player: typeof player1) => {
        if (maxWickets === null || maxOvers === null) return false; // Not ready yet
        return player.wickets >= maxWickets || player.overs >= maxOvers;
    }

    const handleMatch = () => {
        // Ensure settings are loaded before allowing play
        if (isLoading || maxOvers === null || maxWickets === null) {
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
            let { runs, wickets, balls, overs, perBall } = { ...player1 };
            // ... (run/wicket logic remains the same) ...
            if (runValue === 'W') {
                wickets += 1;
                perBall = [...perBall, 'W'];
                setAnimate('wicket');
            } else {
                runs += parseInt(runValue);
                perBall = [...perBall, runValue];
                if (runValue === '4' || runValue === '6') setAnimate('boundary');
            }
            balls += 1;
            if (balls === BALLS_PER_OVER) {
                overs += 1;
                balls = 0;
            }
            setPlayer1({ runs, wickets, balls, overs, perBall });

            // --- Use state variables for end-of-innings check ---
            if (wickets >= maxWickets || (overs === maxOvers && balls === 0)) {
                setCurrentPlayer(2);
                setAnimate(null); // Reset animation when switching innings
                setLastRuns('0'); // Reset last run display
            }
        } else { // Current Player 2
            let { runs, wickets, balls, overs, perBall } = { ...player2 };
            let matchEnded = false;

            // ... (run/wicket logic remains the same) ...
             if (runValue === 'W') {
                 wickets += 1;
                 perBall = [...perBall, 'W'];
                 setAnimate('wicket');
             } else {
                 runs += parseInt(runValue);
                 perBall = [...perBall, runValue];
                 if (runValue === '4' || runValue === '6') setAnimate('boundary');
             }
             balls += 1;
             if (balls === BALLS_PER_OVER) {
                 overs += 1;
                 balls = 0;
             }

            // Check win condition first
            if (runs > player1.runs) {
                setPlayer2({ runs, wickets, balls, overs, perBall }); // Update state first
                setWinner('Player 2');
                matchEnded = true;
            }

            // Check end of innings or other win/draw conditions *after* checking immediate win
            // --- Use state variables for end-of-innings check ---
            if (!matchEnded && (wickets >= maxWickets || (overs === maxOvers && balls === 0))) {
                setPlayer2({ runs, wickets, balls, overs, perBall }); // Update state first
                if (runs === player1.runs) setWinner('Draw');
                else if (runs < player1.runs) setWinner('Player 1');
                // The runs > player1.runs case is handled above, but checking again doesn't hurt
                else setWinner('Player 2');
                matchEnded = true;
            }

            // Update state if match hasn't ended
            if (!matchEnded) {
                setPlayer2({ runs, wickets, balls, overs, perBall });
            }
        }

        // Reset animation after a delay, only if not switching player immediately
         if (!(currentPlayer === 1 && (player1.wickets >= (maxWickets ?? 0) || (player1.overs === (maxOvers ?? 0) && player1.balls === 0)))) {
              setTimeout(() => setAnimate(null), 1000);
         }
    };

    const resetGame = () => {
        // Settings remain the same from the initial navigation state
        setPlayer1(getInitialPlayerState());
        setPlayer2(getInitialPlayerState());
        setCurrentPlayer(1);
        setLastRuns('0');
        setWinner(null);
        setAnimate(null);
        // No need to reset maxOvers/maxWickets as they are fixed for this game instance
    };

    // --- Render loading or the game ---
    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">Loading Game...</div>;
    }

    return (
        <div className="relative h-screen">
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: 'url(https://t3.ftcdn.net/jpg/00/77/81/02/360_F_77810263_zgIAUTTlwF0Bl8ZCxHsofgTzXlZXy9Nn.jpg)' }}
            ></div>
            <div className="relative h-full flex flex-col justify-between">
                {/* Optional: Display game settings */}
                <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white p-2 rounded text-sm z-10">
                    {maxOvers} Overs / {maxWickets} Wickets Match
                </div>

                <div className="flex flex-col items-center pt-10"> {/* Added pt-10 for spacing from settings */}
                    <div className="flex flex-col md:flex-row w-full justify-center gap-4">
                        <ScoreBoard
                            runs={player1.runs}
                            wickets={player1.wickets}
                            overs={player1.overs}
                            balls={player1.balls}
                            perBall={player1.perBall}
                            animate={currentPlayer === 1 ? animate : null}
                            isCurrent={currentPlayer === 1 && !winner}
                            playerName="Player 1"
                            // Optional: Pass max wickets/overs if ScoreBoard needs them
                            // maxWickets={maxWickets}
                            // maxOvers={maxOvers}
                        />
                        <ScoreBoard
                            runs={player2.runs}
                            wickets={player2.wickets}
                            overs={player2.overs}
                            balls={player2.balls}
                            perBall={player2.perBall}
                            animate={currentPlayer === 2 ? animate : null}
                            isCurrent={currentPlayer === 2 && !winner && player1.overs === maxOvers} // Player 2 is current only after P1 finishes
                            playerName="Player 2"
                            // target={currentPlayer === 2 ? player1.runs + 1 : undefined} // Optional: Show target
                            // maxWickets={maxWickets}
                            // maxOvers={maxOvers}
                        />
                    </div>
                </div>
                <div className="flex flex-col items-center mt-6">
                    <div className={`text-4xl md:text-5xl font-semibold mb-2 text-center ${animate === 'boundary' ? 'text-yellow-500 animate-bounce' : ''} ${animate === 'wicket' ? 'text-red-500 animate-pulse' : ''}`}>
                        {winner ? (winner === 'Draw' ? 'Match Drawn!' : `${winner} wins!`)
                               : (currentPlayer === 1 ? `Player 1 Batting` : (player1.wickets >= (maxWickets ?? 0) || player1.overs >= (maxOvers ?? 0)) ? `Player 2 Chasing ${player1.runs + 1}` : `Player 1 Batting`)}
                               {/* Improved turn indicator */}
                    </div>
                    <div className={`flex items-center justify-center text-8xl md:text-9xl font-extrabold transition-all duration-300 ${animate === 'boundary' ? 'text-green-500 animate-bounce' : ''} ${animate === 'wicket' ? 'text-red-600 animate-pulse' : ''}`}>{lastRuns}</div>
                </div>
                <div className="flex flex-col items-center mb-8">
                    <PlayButton onClick={handleMatch} /> {/* Removed disabled prop as it's not a valid prop for PlayButton */}
                    <div className="mt-2 text-gray-600 text-sm">{winner ? 'Click Play to restart!' : 'Tap Play for next ball'}</div>
                     {/* Add a button to go back to menu */}
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
