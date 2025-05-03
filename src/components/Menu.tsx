import React from "react";
import { useNavigate } from "react-router-dom";

const Menu: React.FC = () => {
  const navigate = useNavigate();
  const handleSelect = (overs: number, wickets: number) => {
    navigate('/game', {
      state: {
        maxOvers: overs,
        maxWickets: wickets
      }
    });
  };

  return (
    // 1. Outer container: relative positioning context, full screen height
    <div className="relative h-screen">

      {/* 2. Background layer: absolute, covers parent, holds the image */}
      <div
        className="absolute inset-0 bg-cover bg-center" // Removed opacity-100 as it's default
        style={{ backgroundImage: 'url(https://t3.ftcdn.net/jpg/00/77/81/02/360_F_77810263_zgIAUTTlwF0Bl8ZCxHsofgTzXlZXy9Nn.jpg)' }}
      ></div>

      {/* 3. Content layer: relative (to sit above absolute background), centered content */}
      <div className="relative flex flex-col items-center justify-center h-full text-white">

        {/* Menu Content - Adjusted styles for better visibility/consistency */}
        <h1 className="text-6xl md:text-8xl font-bold mb-12 drop-shadow-[0_5px_3px_rgba(0,0,0,0.4)]">
          Choose Your Match
        </h1>

        <div className="flex flex-col gap-6 w-72"> {/* Increased gap and width */}
          <button
            onClick={() => handleSelect(2, 1)}
            // Enhanced button styles: larger padding, text size, shadow
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 px-8 rounded-lg transition-all text-lg shadow-md hover:shadow-lg"
          >
            Quick Match: 2 Overs (1 Wicket)
          </button>
          <button
            onClick={() => handleSelect(5, 2)}
            className="bg-green-500 hover:bg-green-600 text-black font-bold py-4 px-8 rounded-lg transition-all text-lg shadow-md hover:shadow-lg"
          >
            Standard Match: 5 Overs (2 Wickets)
          </button>
          <button
            onClick={() => handleSelect(10, 3)}
            className="bg-red-500 hover:bg-red-600 text-black font-bold py-4 px-8 rounded-lg transition-all text-lg shadow-md hover:shadow-lg"
          >
            Test Match: 10 Overs (3 Wickets)
          </button>
        </div>
      </div>
      {/* Optional: Add the footer if you want it on the menu page too */}
      {/* <footer className="absolute bottom-0 right-0 p-4">
        <img src={bookCricketLogo} alt="Book Cricket Logo" className="h-12 w-auto" />
      </footer> */}
    </div>
  );
};
export default Menu;