import { BookOpen } from 'lucide-react';
import StartButton from './components/StartButton';
import bookCricketLogo from './assets/book cricket.png'; // Import the logo image

export default function App() {
  return (
    <div className="relative h-screen">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-100"
        style={{ backgroundImage: 'url(https://t3.ftcdn.net/jpg/00/77/81/02/360_F_77810263_zgIAUTTlwF0Bl8ZCxHsofgTzXlZXy9Nn.jpg)' }}
      ></div>
      <div className="relative flex flex-col items-center h-full">
        <h1 className="text-8xl mt-28 font-bold text-white drop-shadow-[0_5px_3px_rgba(0,0,0,0.4)]">
          Book Cricket
        </h1>
        <div className="bg-white p-8 mt-8 rounded-lg shadow-xl">
          <h2 className="text-3xl font-semibold text-center flex items-center justify-center">
            <BookOpen className="mr-2" /> Rule Book
          </h2>
          <ul className="mt-6 text-xl space-y-4">
            <li className="flex items-center">
              1. Two players take turns to play.
            </li>
            <li className="flex items-center">
              2. Each turn involves a random roll resulting in W, 1, 2, 3, 4, 5, or 6 runs.
            </li>
            <li className="flex items-center">
              3. Runs are counted normally.
            </li>
            <li className="flex items-center">
              4. A roll of W means the player is out.
            </li>
          </ul>
        </div>
        <StartButton></StartButton>
      </div>
      <footer className="absolute bottom-0 right-0 p-4">
        <img src={bookCricketLogo} alt="Book Cricket Logo" className="h-12 w-auto" />
      </footer>
    </div>
  );
}
