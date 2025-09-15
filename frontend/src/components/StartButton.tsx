import { useNavigate } from 'react-router-dom';
import CricketIcon from '../assets/cricket-svgrepo-com.svg';
import { useState } from 'react';

const StartButton = () => {
  const [showOptions, setShowOptions] = useState(false);
  const navigate = useNavigate();

  const handleGuest = () => {
    localStorage.setItem('guest', 'true');
    navigate('/menu');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="flex flex-col items-center mt-9 w-full px-6">
      {!showOptions ? (
        <button
          className="bg-blue-500 p-4 rounded-full text-white flex items-center justify-center text-2xl shadow-lg hover:bg-blue-700 transition-all duration-300 ease-in-out w-1/3 min-w-[250px] max-w-[400px]"
          onClick={() => setShowOptions(true)}
        >
          <img src={CricketIcon} alt="Cricket Icon" className="w-8 h-8 mr-4" />
          Start Playing!
        </button>
      ) : (
        <div className="flex flex-col space-y-4 w-1/3 min-w-[250px] max-w-[400px]">
          <button
            onClick={handleGuest}
            className="bg-green-500 p-4 rounded-lg text-white text-xl shadow-lg hover:bg-green-700 transition-all duration-300 ease-in-out"
          >
            Play as Guest
          </button>
          <button
            onClick={handleLogin}
            className="bg-purple-500 p-4 rounded-lg text-white text-xl shadow-lg hover:bg-purple-700 transition-all duration-300 ease-in-out"
          >
            Login
          </button>
        </div>
      )}
    </div>
  );
};

export default StartButton;
