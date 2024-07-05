import Player from '../components/Player';

const Game = () => {
    return (
        <div className="relative h-screen">
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: 'url(https://t3.ftcdn.net/jpg/00/77/81/02/360_F_77810263_zgIAUTTlwF0Bl8ZCxHsofgTzXlZXy9Nn.jpg)' }}
            ></div>
            <div className="relative h-full flex items-start justify-between p-4">
                <Player title="Player 1" />
                <Player title="Player 2" />
            </div>
        </div>
    );
};

export default Game;
