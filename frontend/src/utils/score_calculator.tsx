// Define game state factors that affect shot probabilities
interface GameState {
    momentum: number;        // 0-100: Builds with successful shots, affects all probabilities
    form: number;           // 0-100: Recent batting performance
    consecutiveShots: number; // Count of consecutive aggressive shots (4s/6s)
    lastNBalls: string[];    // Last N balls faced (track form)
    stance: 'normal' | 'aggressive' | 'defensive';
}

// Base risk/reward profiles for each shot type
interface ShotProfile {
    targetRun: string;
    baseDistribution: {
        [outcome: string]: number;
    };
    momentum: {
        boost: number;      // How much this shot builds momentum if successful
        requirement: number; // Minimum momentum for best odds
    };
    fatigue: {
        maxAttempts: number;  // Max consecutive attempts before fatigue
        penalty: number;      // Probability penalty when fatigued
    };
}

const BASE_PROFILES: { [key: string]: ShotProfile } = {
    '1': {
        targetRun: '1',
        baseDistribution: {
            '1': 0.65,  // Base 65% chance of scoring 1
            '0': 0.30,  // Base 30% chance of dot ball
            'W': 0.05   // Base 5% chance of wicket
        },
        momentum: {
            boost: 5,    // Small momentum boost
            requirement: 0  // No momentum required
        },
        fatigue: {
            maxAttempts: 6,  // Can play many 1s
            penalty: 0.05    // Small penalty
        }
    },
    '2': {
        targetRun: '2',
        baseDistribution: {
            '2': 0.50,
            '0': 0.40,
            'W': 0.10
        },
        momentum: {
            boost: 10,
            requirement: 20
        },
        fatigue: {
            maxAttempts: 4,
            penalty: 0.10
        }
    },
    '4': {
        targetRun: '4',
        baseDistribution: {
            '4': 0.35,
            '0': 0.45,
            'W': 0.20
        },
        momentum: {
            boost: 20,
            requirement: 40
        },
        fatigue: {
            maxAttempts: 2,
            penalty: 0.15
        }
    },
    '6': {
        targetRun: '6',
        baseDistribution: {
            '6': 0.25,
            '0': 0.45,
            'W': 0.30
        },
        momentum: {
            boost: 30,
            requirement: 60
        },
        fatigue: {
            maxAttempts: 1,
            penalty: 0.20
        }
    }
};

// Initialize default game state
let gameState: GameState = {
    momentum: 0,
    form: 50,
    consecutiveShots: 0,
    lastNBalls: [],
    stance: 'normal'
};

// Update game state based on shot outcome
const updateGameState = (shotType: string, outcome: string) => {
    const profile = BASE_PROFILES[shotType];
    
    // Update momentum
    if (outcome === shotType) {  // Successful shot
        gameState.momentum = Math.min(100, gameState.momentum + profile.momentum.boost);
        gameState.form = Math.min(100, gameState.form + 10);
    } else if (outcome === 'W') {  // Wicket
        gameState.momentum = Math.max(0, gameState.momentum - 30);
        gameState.form = Math.max(0, gameState.form - 20);
    } else if (outcome === '0') {  // Dot ball
        gameState.momentum = Math.max(0, gameState.momentum - 10);
        gameState.form = Math.max(0, gameState.form - 5);
    }

    // Track consecutive shots
    if (['4','6'].includes(shotType)) {
        gameState.consecutiveShots++;
    } else {
        gameState.consecutiveShots = 0;
    }

    // Update form tracking
    gameState.lastNBalls = [outcome, ...gameState.lastNBalls.slice(0, 5)];
};

// Set batting stance (can be called from Game component)
export const setStance = (stance: 'normal' | 'aggressive' | 'defensive') => {
    gameState.stance = stance;
};

// Reset game state (call when new innings starts)
export const resetGameState = () => {
    gameState = {
        momentum: 0,
        form: 50,
        consecutiveShots: 0,
        lastNBalls: [],
        stance: 'normal'
    };
};

// Compute actual probabilities based on current game state
const getAdjustedDistribution = (shotType: string): { [key: string]: number } => {
    const profile = BASE_PROFILES[shotType];
    const base = { ...profile.baseDistribution };
    
    // Momentum adjustments
    const momentumBoost = Math.max(0, (gameState.momentum - profile.momentum.requirement) / 100);
    
    // Form adjustments (better form improves success chance)
    const formBoost = (gameState.form - 50) / 200;  // -0.25 to +0.25
    
    // Fatigue penalty
    const fatiguePenalty = gameState.consecutiveShots > profile.fatigue.maxAttempts 
        ? profile.fatigue.penalty 
        : 0;

    // Stance adjustments
    const stanceMultiplier = {
        normal: { success: 1, wicket: 1 },
        aggressive: { success: 1.2, wicket: 1.3 },
        defensive: { success: 0.8, wicket: 0.7 }
    }[gameState.stance];

    // Apply all modifiers
    const targetRun = profile.targetRun;
    base[targetRun] = Math.min(0.95, base[targetRun] * stanceMultiplier.success * (1 + momentumBoost + formBoost - fatiguePenalty));
    base['W'] = Math.max(0.02, base['W'] * stanceMultiplier.wicket * (1 - momentumBoost + fatiguePenalty));
    base['0'] = 1 - (base[targetRun] + base['W']);  // Adjust dot ball to maintain total = 1

    return base;
};

// Get the outcome of a shot attempt based on current game state
export const getRandomRun = (shotType: string): string => {
    const distribution = getAdjustedDistribution(shotType);
    const roll = Math.random();
    let cumulative = 0;

    for (const [outcome, probability] of Object.entries(distribution)) {
        cumulative += probability;
        if (roll < cumulative) {
            // Update game state based on outcome
            updateGameState(shotType, outcome);
            return outcome;
        }
    }

    return '0';
};

// Return probability distribution for UI display
export const computeProbabilities = (shotType: string) => {
    const distribution = getAdjustedDistribution(shotType);
    const state = gameState;  // Capture current state for display

    return Object.entries(distribution).map(([run, probability]) => ({
        run,
        probability,
        description: getOutcomeDescription(run, probability, state)
    }));
};

// Enhanced description including game state factors
const getOutcomeDescription = (outcome: string, probability: number, state: GameState): string => {
    const percentage = Math.round(probability * 100);
    const momentum = state.momentum > 70 ? "🔥 Hot streak! " : 
                    state.momentum > 40 ? "👍 Good rhythm. " : "";
    const fatigue = state.consecutiveShots > 1 ? "⚠️ Risky! " : "";
    
    let desc = "";
    switch (outcome) {
        case 'W':
            desc = `${percentage}% wicket risk`;
            break;
        case '0':
            desc = `${percentage}% dot ball`;
            break;
        default:
            desc = `${percentage}% for ${outcome}`;
    }

    return `${momentum}${fatigue}${desc}`;
};

// For consistency with existing API
export const pickFromDistribution = (shotType: string): string => {
    return getRandomRun(shotType);
};

