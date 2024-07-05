import CricketIcon from '../assets/cricket-svgrepo-com.svg';

const StartButton = () => (
  <button className="bg-blue-500 p-4 rounded-full text-white mt-8 flex items-center w-1/3 justify-center text-2xl shadow-lg hover:bg-blue-700 transition-all duration-300 ease-in-out">
    <img src={CricketIcon} alt="Cricket Icon" className="w-8 h-8 mr-4" />
    Start Playing!
  </button>
);

export default StartButton;
