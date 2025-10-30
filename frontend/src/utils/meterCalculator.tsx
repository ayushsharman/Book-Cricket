// src/utils/meterCalculator.ts

/**
 * Meter-based score calculator
 * Meter layout: 1 | 2 | 3 | 4 | 6 | W | 6 | 4 | 3 | 2 | 1
 * Position 0-100 maps to score based on region
 */

export const METER_REGIONS = [
  { label: '1', start: 0, end: 10, weight: 1 },
  { label: '2', start: 10, end: 20, weight: 2 },
  { label: '3', start: 20, end: 30, weight: 3 },
  { label: '4', start: 30, end: 40, weight: 4 },
  { label: '6', start: 40, end: 45, weight: 6 },
  { label: 'W', start: 45, end: 55, weight: 0 }, // Wicket (center)
  { label: '6', start: 55, end: 60, weight: 6 },
  { label: '4', start: 60, end: 70, weight: 4 },
  { label: '3', start: 70, end: 80, weight: 3 },
  { label: '2', start: 80, end: 90, weight: 2 },
  { label: '1', start: 90, end: 100, weight: 1 },
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