import { useState } from 'react';
import PlayButton from '../components/PlayButton';
import Player from '../components/Player';
import ScoreBoard from '../components/ScoreBoard';
import CurrentScore from '../components/CurrentScore';
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

const MAX_OVERS = 10;
const BALLS_PER_OVER = 6;
const MAX_WICKETS = 2;

const getInitialPlayerState = () => ({
    runs: 0,
    wickets: 0,
    balls: 0,
    overs: 0,
    perBall: [] as string[],
});

const Game = () => {
    const [player1, setPlayer1] = useState(getInitialPlayerState());
    const [player2, setPlayer2] = useState(getInitialPlayerState());
    const [currentPlayer, setCurrentPlayer] = useState(1);
    const [lastRuns, setLastRuns] = useState('0');
    const [winner, setWinner] = useState<string | null>(null);
    const [animate, setAnimate] = useState<'boundary' | 'wicket' | null>(null);

    const isInningsOver = (player: typeof player1) =>
        player.wickets >= MAX_WICKETS || player.overs >= MAX_OVERS;

    const handleMatch = () => {
        if (winner) {
            resetGame();
            return;
        }

        const runValue = getRandomRun(runs);
        setLastRuns(runValue);

        if (currentPlayer === 1) {
            let { runs, wickets, balls, overs, perBall } = { ...player1 };
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
            if (wickets >= MAX_WICKETS || (overs === MAX_OVERS && balls === 0)) {
                setCurrentPlayer(2);
            }
        } else {
            let { runs, wickets, balls, overs, perBall } = { ...player2 };
            let matchEnded = false;
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
            if (runs > player1.runs) {
                setPlayer2({ runs, wickets, balls, overs, perBall });
                setWinner('Player 2');
                matchEnded = true;
            }
            if (!matchEnded && (wickets >= MAX_WICKETS || (overs === MAX_OVERS && balls === 0))) {
                setPlayer2({ runs, wickets, balls, overs, perBall });
                if (runs === player1.runs) setWinner('Draw');
                else if (runs < player1.runs) setWinner('Player 1');
                else setWinner('Player 2');
                matchEnded = true;
            }
            if (!matchEnded) {
                setPlayer2({ runs, wickets, balls, overs, perBall });
            }
        }
        setTimeout(() => setAnimate(null), 1000);
    };

    const resetGame = () => {
        setPlayer1(getInitialPlayerState());
        setPlayer2(getInitialPlayerState());
        setCurrentPlayer(1);
        setLastRuns('0');
        setWinner(null);
        setAnimate(null);
    };

    return (
        <div className="relative h-screen">
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: 'url(https://t3.ftcdn.net/jpg/00/77/81/02/360_F_77810263_zgIAUTTlwF0Bl8ZCxHsofgTzXlZXy9Nn.jpg)' }}
            ></div>

            <div className="relative h-full flex flex-col justify-between">
                <div className="flex flex-col items-center pt-4">
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
                        />
                        <ScoreBoard
                            runs={player2.runs}
                            wickets={player2.wickets}
                            overs={player2.overs}
                            balls={player2.balls}
                            perBall={player2.perBall}
                            animate={currentPlayer === 2 ? animate : null}
                            isCurrent={currentPlayer === 2 && !winner}
                            playerName="Player 2"
                        />
                    </div>
                </div>
                <div className="flex flex-col items-center mt-6">
                    <div className={`text-5xl font-semibold mb-2 ${animate === 'boundary' ? 'text-yellow-500 animate-bounce' : ''} ${animate === 'wicket' ? 'text-red-500 animate-pulse' : ''}`}>
                        {winner ? (winner === 'Draw' ? 'Match Drawn!' : `${winner} wins!`) : `Player ${currentPlayer} turn`}
                    </div>
                    <div className={`flex items-center justify-center text-9xl font-extrabold transition-all duration-300 ${animate === 'boundary' ? 'text-green-500 animate-bounce' : ''} ${animate === 'wicket' ? 'text-red-600 animate-pulse' : ''}`}>{lastRuns}</div>
                </div>
                <div className="flex flex-col items-center mb-8">
                    <PlayButton onClick={handleMatch} />
                    <div className="mt-2 text-gray-600 text-sm">{winner ? 'Click Play to restart!' : 'Tap Play for next ball'}</div>
                </div>
            </div>
            <footer className="absolute bottom-0 right-0 p-4">
                <img src={bookCricketLogo} alt="Book Cricket Logo" className="h-12 w-auto" />
            </footer>
        </div>
    );
};

export default Game;
