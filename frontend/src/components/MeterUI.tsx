import React, { useState, useEffect, useRef } from 'react';

// Meter configuration with proper proportions
// 1 gets largest area, 6 and W get smallest
const METER_REGIONS = [
  { label: '1', start: 0, end: 20 },      // 20% (large)
  { label: '2', start: 20, end: 32 },     // 12%
  { label: '3', start: 32, end: 42 },     // 10%
  { label: '4', start: 42, end: 48 },     // 6%
  { label: '6', start: 48, end: 52 },     // 4% (small)
  { label: 'W', start: 52, end: 56 },     // 4% (small) - wicket at center
  { label: '6', start: 56, end: 60 },     // 4%
  { label: '4', start: 60, end: 66 },     // 6%
  { label: '3', start: 66, end: 76 },     // 10%
  { label: '2', start: 76, end: 88 },     // 12%
  { label: '1', start: 88, end: 100 },    // 12% (large)
];

const getScoreFromPosition = (position) => {
  const clampedPosition = Math.max(0, Math.min(100, position));
  for (const region of METER_REGIONS) {
    if (clampedPosition >= region.start && clampedPosition < region.end) {
      return region.label;
    }
  }
  return '1';
};

const getRegionColor = (label) => {
  switch (label) {
    case '1':
      return 'bg-green-600';
    case '2':
      return 'bg-blue-500';
    case '3':
      return 'bg-yellow-500';
    case '4':
      return 'bg-orange-500';
    case '6':
      return 'bg-red-500';
    case 'W':
      return 'bg-purple-700';
    default:
      return 'bg-gray-500';
  }
};

const MeterUI = ({ isAnimating, onStop }) => {
  const [position, setPosition] = useState(54); // Start near W
  const [displayScore, setDisplayScore] = useState('W');
  const [isRunning, setIsRunning] = useState(false);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (!isAnimating) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        // When stopping, send current position's score
        onStop(getScoreFromPosition(position));
      }
      setIsRunning(false);
      return;
    }

    setIsRunning(true);
    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current!;
      const speed = 0.002; // Slower speed for better control
      const newPosition = 50 + Math.sin(elapsed * speed) * 45; // 45 degree swing for better control
      
      setPosition(newPosition);
      setDisplayScore(getScoreFromPosition(newPosition));
      
      if (isAnimating) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isAnimating, onStop, position]);

  const needleLeft = Math.max(2, Math.min(98, position));

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Meter Container */}
      <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl border-4 border-gray-800">
        {/* Meter Bar */}
        <div className="relative h-24 flex">
          {METER_REGIONS.map((region, idx) => (
            <div
              key={`${region.label}-${idx}`}
              className={`flex items-center justify-center text-white font-bold text-lg transition-all duration-100 ${
                getRegionColor(region.label)
              } ${isRunning ? 'opacity-85' : 'opacity-100'}`}
              style={{
                flex: region.end - region.start,
                minWidth: '20px',
              }}
            >
              <span className="drop-shadow-lg">{region.label}</span>
            </div>
          ))}
        </div>

        {/* Needle/Indicator */}
        <div
          className="absolute bottom-0 translate-y-1/2 w-2 h-10 bg-white transform -translate-x-1/2 pointer-events-none z-20 rounded-full shadow-xl border-2 border-yellow-300"
          style={{
            left: `${needleLeft}%`,
            transition: isRunning ? 'none' : 'left 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: '0 0 15px rgba(255, 255, 255, 0.8)',
          }}
        />
      </div>

      {/* Display Score */}
      <div className="text-center mt-8">
        <div className="text-7xl font-bold text-white drop-shadow-lg mb-2">
          {displayScore}
        </div>
        <div className="text-lg text-gray-300">
          {isRunning ? 'Spinning...' : 'Ready'}
        </div>
      </div>

      {/* Status Text */}
      <div className="text-center mt-6">
        <div className="text-lg text-gray-300">
          {isRunning ? 'Click STOP when ready!' : 'Ready to play'}
        </div>
      </div>
    </div>
  );
};

export default MeterUI;