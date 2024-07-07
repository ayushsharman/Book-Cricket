interface PlayButtonProps {
    onClick: () => void;
}


const PlayButton = ({ onClick }: PlayButtonProps) => {
    return (
        <button
            className="bg-yellow-400 p-4 rounded-full text-white font-bold drop-shadow-[0_5px_3px_rgba(0,0,0,0.4) mt-9 w-1/3 text-2xl shadow-lg hover:bg-yellow-500 transition-all duration-300 ease-in-out "
            onClick={onClick}
        >
            Play
        </button>
    );
};

export default PlayButton;
