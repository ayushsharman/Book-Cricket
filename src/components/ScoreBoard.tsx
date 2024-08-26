
interface ScoreBoardProps {
    title: string;
}

const ScoreBoard = ({ title }: ScoreBoardProps) => {
    return (
        <div className="bg-white rounded-lg p-4 shadow-lg flex justify-center items-center space-x-2">
                <h1 className="text-2xl font-semibold tracking-wider">{title}</h1>
        </div>
    );
};

export default ScoreBoard;
