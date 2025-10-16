import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Game from './pages/Game';
import Landing from './pages/Landing';
import Menu from './components/Menu';
import Login from './pages/Login';
import Stats from './pages/Stats';
import PlayerStats from './pages/PlayerStats';
import MatchStats from './pages/MatchStats';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/game" element={<Game />} />
  <Route path="/stats" element={<Stats />} />
  <Route path="/stats/players" element={<PlayerStats />} />
  <Route path="/stats/matches" element={<MatchStats />} />
      </Routes>
    </Router>
  );
};

export default App;
