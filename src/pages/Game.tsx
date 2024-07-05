import PlayButton from '../components/PlayButton';
import Player from '../components/Player';
import ScoreBoard from '../components/ScoreBoard';
import bookCricketLogo from '../assets/book cricket.png'
import { useState } from 'react';

const runs = ['W', '1', '2', '3', '4', '6'];

const Game = () => {
    const [player1Score, setPlayer1Score] = useState("0");
    const [player2Score, setPlayer2Score] = useState("0");
    const [currentPlayer, setCurrentPlayer] = useState(1);
    const [lastRuns, setLastRuns] = useState("0");
    const handleMatch = () => {
        const value = Math.floor(Math.random() * runs.length);
        setLastRuns(runs[value]);
        if (currentPlayer === 1) {
            if (runs[value] === 'W') {
                setCurrentPlayer(2);
            } else {
                setPlayer1Score(player1Score + parseInt(runs[value]));
            }
        } else {
            if (runs[value] === 'W') {
                setCurrentPlayer(1);
            } else {
                setPlayer2Score(player2Score + parseInt(runs[value]));
            }
        }
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
                <div className='items-end flex justify-between px-4'>
                    <ScoreBoard title={player1Score} />
                    <ScoreBoard title={player2Score} />
                </div>
                <div className='flex flex-col items-center text-5xl font-semibold'>Player 1 turn</div>
                <br />
                <br />
                <br />
                <div className='flex items-center justify-center text-9xl font-semibold'>{lastRuns}</div>
                <br />
                <br />
                <br />
                <br />
                <div className='flex  flex-col items-center'>
                    <PlayButton onClick={handleMatch}></PlayButton>
                </div>
            </div>
            <footer className="absolute bottom-0 right-0 p-4">
        <img src={bookCricketLogo} alt="Book Cricket Logo" className="h-12 w-auto" />
      </footer>
        </div>
        
    );
};

export default Game;
