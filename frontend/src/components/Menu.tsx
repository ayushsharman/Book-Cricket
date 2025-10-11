import React from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3 } from "lucide-react"; // 📊 stats icon

const Menu: React.FC = () => {
  const navigate = useNavigate();

  const handleSelect = (overs: number, wickets: number) => {
    navigate("/game", {
      state: { maxOvers: overs, maxWickets: wickets },
    });
  };

  return (
    <div className="relative h-screen">
      {/* Background Layer */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage:
            "url(https://t3.ftcdn.net/jpg/00/77/81/02/360_F_77810263_zgIAUTTlwF0Bl8ZCxHsofgTzXlZXy9Nn.jpg)",
        }}
      ></div>

      {/* Stats Icon (top-right corner) */}
      <button
        onClick={() => navigate("/stats")}
        className="absolute top-6 right-6 bg-black/60 hover:bg-black/80 p-3 rounded-full transition-all text-white shadow-md z-20"
        title="View Player Stats"
      >
        <BarChart3 size={28} />
      </button>

      {/* Main Content */}
      <div className="relative flex flex-col items-center justify-center h-full text-white z-10">
        <h1 className="text-6xl md:text-8xl font-bold mb-12 drop-shadow-[0_5px_3px_rgba(0,0,0,0.4)]">
          Choose Your Match
        </h1>

        <div className="flex flex-col gap-6 w-72">
          <button
            onClick={() => handleSelect(2, 1)}
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
    </div>
  );
};

export default Menu;
