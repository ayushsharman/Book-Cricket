import React, { useState } from 'react';

interface PlayButtonProps {
    onClick: () => void;
}

const PlayButton = ({ onClick }: PlayButtonProps) => {
    const [clicked, setClicked] = useState(false);

    const handleClick = () => {
        setClicked(true);
        onClick();
        setTimeout(() => setClicked(false), 200);
    };

    return (
        <button
            className={`bg-yellow-400 p-4 rounded-full text-white font-bold drop-shadow-[0_5px_3px_rgba(0,0,0,0.4)] mt-9 w-1/3 text-2xl shadow-lg hover:bg-yellow-500 transition-all duration-300 ease-in-out active:scale-95 ${clicked ? 'scale-110 animate-bounce' : ''}`}
            onClick={handleClick}
        >
            Play
        </button>
    );
};

export default PlayButton;
