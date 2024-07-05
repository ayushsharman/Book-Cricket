interface PlayButtonProps {
    onClick: () => void;
}


const PlayButton = ({ onClick }: PlayButtonProps) => {
    return (
        <button
            className="bg-violet-800 p-4 rounded-full text-white mt-9 w-1/3 text-2xl shadow-lg hover:bg-violet-900 transition-all duration-300 ease-in-out"
            onClick={onClick}
        >
            Play
        </button>
    );
};

export default PlayButton;
