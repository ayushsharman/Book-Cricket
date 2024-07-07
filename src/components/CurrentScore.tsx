interface CurrentScoreProps {
    score: number;
}

const CurrentScore = ({ score }: CurrentScoreProps) => {
    return (
        <p className="text-2xl font-semibold bg-white rounded-xl p-2">Total Runs: {score}</p>
    );
};

export default CurrentScore;
