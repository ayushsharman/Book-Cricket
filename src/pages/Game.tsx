import { useState } from 'react';
import PlayButton from '../components/PlayButton';
import Player from '../components/Player';
import ScoreBoard from '../components/ScoreBoard';
import CurrentScore from '../components/CurrentScore'; // Import the new component
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

const Game = () => {
    const [player1Score, setPlayer1Score] = useState("0"); 
    const [player2Score, setPlayer2Score] = useState("0"); 
    const [player1Total, setPlayer1Total] = useState(0); 
    const [player2Total, setPlayer2Total] = useState(0); 
    const [currentPlayer, setCurrentPlayer] = useState(1);
    const [lastRuns, setLastRuns] = useState("0");
    const [winner, setWinner] = useState(null as string | null);

    const handleMatch = () => {
    if (winner) {
        resetGame();
        return;
    }
    
    const runValue = getRandomRun(runs);
    setLastRuns(runValue);

    if (currentPlayer === 1) {
        if (runValue === 'W') {
            setCurrentPlayer(2);
        } else {
            setPlayer1Score(prevScore => prevScore === "0" ? runValue + " " : prevScore + runValue + " ");
            setPlayer1Total(prevTotal => prevTotal + parseInt(runValue));
        }
    } else {
        if (runValue === 'W') {
            if (player2Total > player1Total) {
                setWinner('Player 2');
            } else {
                setWinner('Player 1');
            }
        } else {
            setPlayer2Score(prevScore => prevScore === "0" ? runValue + " " : prevScore + runValue + " ");
            setPlayer2Total(prevTotal => {
                const newTotal = prevTotal + parseInt(runValue);
                if (newTotal > player1Total) {
                    setWinner('Player 2');
                }
                return newTotal;
            });
        }
    }
};

    

    const resetGame = () => {
        setPlayer1Score("0");
        setPlayer2Score("0");
        setPlayer1Total(0);
        setPlayer2Total(0);
        setCurrentPlayer(1);
        setLastRuns("0");
        setWinner(null as string | null);
    };

    return (
        <div className="relative h-screen">
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: 'url(https://t3.ftcdn.net/jpg/00/77/81/02/360_F_77810263_zgIAUTTlwF0Bl8ZCxHsofgTzXlZXy9Nn.jpg)' }}
            >
            </div>

            <div className="relative h-full flex flex-col">
                <div className='items-start flex justify-between p-4'>
                    <Player title="Player 1" />
                    <Player title="Player 2" />
                </div>
                <div className='items-start flex justify-between pb-4 pr-4 pl-4'>
                    <CurrentScore score={player1Total} />
                    <CurrentScore score={player2Total} />
                </div>
                <div className='items-end flex justify-between px-4'>
                    <ScoreBoard title={player1Score} />
                    <ScoreBoard title={player2Score} />
                </div>
                <div className='flex flex-col items-center text-5xl font-semibold'>
                    {winner ? `${winner} wins!` : `Player ${currentPlayer} turn`}
                </div>
                <br />
                <br />
                <br />
                <div className='flex items-center justify-center text-9xl font-semibold'>{lastRuns}</div>
                <br />
                <br />
                <br />
                <br />
                <div className='flex flex-col items-center'>
                    <PlayButton onClick={handleMatch} />
                </div>
            </div>
            <footer className="absolute bottom-0 right-0 p-4">
                <img src={bookCricketLogo} alt="Book Cricket Logo" className="h-12 w-auto" />
            </footer>
        </div>
    );
};

export default Game;
