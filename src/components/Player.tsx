
interface PlayerProps {
    title: string;
}

const Player = ({ title }: PlayerProps) => {
    return (
        <div className="text-2xl font-semibold bg-lime-300 rounded-xl p-2">
            <h1>{title}</h1>
        </div>
    );
};

export default Player;
