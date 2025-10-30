// src/components/MeterUI.tsx

import React, { useState, useEffect, useRef } from 'react';
import { getScoreFromPosition, getMeterRegionAtPosition, METER_REGIONS } from '../utils/meterCalculator';

interface MeterUIProps {
  isAnimating: boolean;
  onStop: (score: string) => void;
  disabled?: boolean;
}

const MeterUI: React.FC<MeterUIProps> = ({ isAnimating, onStop, disabled = false }) => {
  const [position, setPosition] = useState(50); // Start at center (W)
  const [displayScore, setDisplayScore] = useState('W');
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Animate meter position
  useEffect(() => {
    if (!isAnimating) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    startTimeRef.current = Date.now();

    const animate = () => {
      if (!startTimeRef.current) return;

      const elapsed = Date.now() - startTimeRef.current;
      const maxDuration = 3000;

      // Easing: fast start, slow down
      const progress = Math.min(elapsed / maxDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // Cubic ease-out

      // Oscillate position: multiple passes through meter, then settle
      const cycles = 8;
      const oscillation = Math.sin(eased * cycles * Math.PI) * (1 - eased);
      
      // Position moves back and forth, then settles randomly
      const basePos = 25 + Math.random() * 50; // Random final position
      const currentPos = 50 + oscillation * 40; // Oscillates ±40 from center

      setPosition(currentPos);
      setDisplayScore(getScoreFromPosition(currentPos));

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete - settle on final position
        setPosition(basePos);
        setDisplayScore(getScoreFromPosition(basePos));
        onStop(getScoreFromPosition(basePos));
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isAnimating, onStop]);

  const getRegionColor = (label: string): string => {
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

  const needleLeft = Math.max(2, Math.min(98, position));

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Meter Container */}
      <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
        {/* Meter Bar */}
        <div className="relative h-20 flex">
          {METER_REGIONS.map((region, idx) => (
            <div
              key={`${region.label}-${idx}`}
              className={`flex-1 flex items-center justify-center text-white font-bold text-sm transition-opacity ${
                getRegionColor(region.label)
              } ${isAnimating ? 'opacity-90' : 'opacity-100'}`}
              style={{
                flex: region.end - region.start,
              }}
            >
              {region.label}
            </div>
          ))}
        </div>

        {/* Needle/Indicator */}
        <div
          className="absolute bottom-0 translate-y-1/2 w-1 h-8 bg-white transform -translate-x-1/2 transition-all duration-75 pointer-events-none z-10 rounded-full shadow-lg"
          style={{
            left: `${needleLeft}%`,
          }}
        >
          <div className="absolute inset-0 bg-white rounded-full animate-pulse" />
        </div>
      </div>

      {/* Display Score */}
      <div className="text-center mt-6">
        <div className="text-6xl font-bold text-white drop-shadow-lg">
          {displayScore}
        </div>
        <div className="text-sm text-gray-400 mt-2">
          Position: {Math.round(position)}%
        </div>
      </div>

      {/* Region Guide */}
      <div className="mt-6 bg-black bg-opacity-50 rounded p-3 text-white text-xs text-center">
        <div className="text-gray-300">Meter layout: 1 | 2 | 3 | 4 | 6 | W | 6 | 4 | 3 | 2 | 1</div>
        <div className="text-gray-500 mt-1">Larger regions = more likely | Stop the meter at your target</div>
      </div>
    </div>
  );
};

export default MeterUI;