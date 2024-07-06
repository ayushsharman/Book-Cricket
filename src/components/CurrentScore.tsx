interface CurrentScoreProps {
    player: string;
    score: number;
}

const CurrentScore = ({ player, score }: CurrentScoreProps) => {
    return (
        <div className="text-center p-2">
            <h2 className="text-2xl font-bold">{player}</h2>
            <p className="text-xl">{score}</p>
        </div>
    );
};

export default CurrentScore;
