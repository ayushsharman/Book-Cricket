// src/utils/meterCalculator.ts

/**
 * Meter-based score calculator
 * Symmetrical layout: more 1s, slightly more 2s, rare 3s, balanced 4/6, centered W.
 */

export const METER_REGIONS = [
  { label: '1', start: 0, end: 18, weight: 1 },
  { label: '2', start: 18, end: 27, weight: 2 },
  { label: '3', start: 27, end: 35, weight: 3 },
  { label: '4', start: 35, end: 45, weight: 4 },
  { label: '6', start: 45, end: 50, weight: 6 },
  { label: 'W', start: 50, end: 60, weight: 0 }, // perfectly centered
  { label: '6', start: 60, end: 66, weight: 6 },
  { label: '4', start: 66, end: 75, weight: 4 },
  { label: '3', start: 65, end: 70, weight: 3 },
  { label: '2', start: 70, end: 83, weight: 2 },
  { label: '1', start: 83, end: 100, weight: 1 },
];

/**
 * Get the score based on meter position (0-100)
 */
export const getScoreFromPosition = (position: number): string => {
  const clampedPosition = Math.max(0, Math.min(100, position));
  
  for (const region of METER_REGIONS) {
    if (clampedPosition >= region.start && clampedPosition < region.end) {
      return region.label;
    }
  }
  
  return '1'; // Default fallback
};

/**
 * Get the region label and visual info at a position
 */
export const getMeterRegionAtPosition = (position: number) => {
  const clampedPosition = Math.max(0, Math.min(100, position));
  
  for (const region of METER_REGIONS) {
    if (clampedPosition >= region.start && clampedPosition < region.end) {
      return region;
    }
  }
  
  return METER_REGIONS[0]; // Default
};

/**
 * Calculate animation speed based on distance traveled
 * Provides natural deceleration effect
 */
export const calculateMeterSpeed = (elapsedMs: number): number => {
  const maxDuration = 3000; // Max animation 3 seconds
  const progress = Math.min(elapsedMs / maxDuration, 1);
  
  // Easing: starts fast, slows down
  const eased = progress * progress;
  
  // Full rotation cycles, then slows
  const cycles = 5;
  return (eased * cycles * 360) % 360;
};

/**
 * Get all meter regions for rendering
 */
export const getMeterRegions = () => METER_REGIONS;

/**
 * Format position percentage for display
 */
export const formatMeterPosition = (position: number): string => {
  return `${Math.round(position)}%`;
};
