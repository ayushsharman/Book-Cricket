
interface ScoreBoardProps {
    title: string;
}

const ScoreBoard = ({ title }: ScoreBoardProps) => {
    return (
        <div className="text-2xl font-semibold bg-white rounded-xl p-2">
            <h1>{title}</h1>
        </div>
    );
};

export default ScoreBoard;
