// src/components/MeterUI.tsx

import React, { useState, useEffect, useRef } from 'react';
import { getScoreFromPosition, METER_REGIONS } from '../utils/meterCalculator';

interface MeterUIProps {
  isAnimating: boolean;
  onStop: (score: string) => void;
  disabled?: boolean;
}

const MeterUI: React.FC<MeterUIProps> = ({ isAnimating, onStop, disabled = false }) => {
  const [position, setPosition] = useState(50);
  const [displayScore, setDisplayScore] = useState('W');
  const [isStopping, setIsStopping] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const velocityRef = useRef(2); // pixels per frame
  const positionRef = useRef(50);

  // Continuous meter animation - only stops when user clicks Stop
  useEffect(() => {
    if (!isAnimating || isStopping) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const animate = () => {
      positionRef.current += velocityRef.current;

      // Bounce at edges
      if (positionRef.current >= 100 || positionRef.current <= 0) {
        velocityRef.current *= -1;
        positionRef.current = Math.max(0, Math.min(100, positionRef.current));
      }

      setPosition(positionRef.current);
      setDisplayScore(getScoreFromPosition(positionRef.current));

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isAnimating, isStopping]);

  // Handle stop button click - instant freeze and callback
  const handleStop = () => {
    setIsStopping(true);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Immediately call onStop with current position
    const finalScore = getScoreFromPosition(positionRef.current);
    setDisplayScore(finalScore);
    
    // Small delay to ensure UI updates, then callback
    setTimeout(() => {
      onStop(finalScore);
    }, 50);
  };

  // Expose stop handler via ref if needed
  useEffect(() => {
    if (!isAnimating && isStopping) {
      setIsStopping(false);
    }
  }, [isAnimating]);

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
              className={`flex-1 flex items-center justify-center text-white font-bold text-sm ${
                getRegionColor(region.label)
              }`}
              style={{
                flex: region.end - region.start,
              }}
            >
              {region.label}
            </div>
          ))}
        </div>

        {/* Needle/Indicator - smooth transition */}
        <div
          className="absolute bottom-0 translate-y-1/2 w-1 h-8 bg-white transform -translate-x-1/2 pointer-events-none z-10 rounded-full shadow-lg"
          style={{
            left: `${needleLeft}%`,
            transition: isStopping ? 'left 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
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
      </div>

   
    </div>
  );
};

export default MeterUI;