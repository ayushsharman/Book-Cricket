import { useNavigate } from 'react-router-dom';
import CricketIcon from '../assets/cricket-svgrepo-com.svg';

const StartButton = () => {
  const navigate = useNavigate();

  const handleStartGame = () => {
    navigate('/game');
  };

  return (
    <button 
      className="bg-blue-500 p-4 rounded-full text-white mt-9 flex items-center w-1/3 justify-center text-2xl shadow-lg hover:bg-blue-700 transition-all duration-300 ease-in-out"
      onClick={handleStartGame}
    >
      <img src={CricketIcon} alt="Cricket Icon" className="w-8 h-8 mr-4" />
      Start Playing!
    </button>
  );
};

export default StartButton;
