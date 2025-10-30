// Simple spinner utilities for a central "spin" button UI.
// We keep a small, deterministic-weighted system for outcomes: 1,2,4,6 and W.
// The spinner animation sequence may be visually biased (so 6/W appear less),
// but the final result is drawn from the true base-weighted distribution.

const OUTCOMES = ['1','2','4','6','W'];

// Base weights: lower weight for 6 and W to make them rarer
const BASE_WEIGHTS: Record<string, number> = {
    '1': 25,
    '2': 25,
    '4': 18,
    '6': 17,  // Increased from 7
    'W': 15,  // Slightly reduced to balance
};

// Return normalized probabilities (for UI display)
export const computeProbabilities = () => {
    const total = Object.values(BASE_WEIGHTS).reduce((a,b) => a + b, 0) || 1;
    return OUTCOMES.map(run => ({ run, probability: (BASE_WEIGHTS[run] || 0) / total }));
};

// Create a visual spinner sequence. This uses a 'visualBias' that reduces how
// often very-rare (or very-dangerous) outcomes appear during the rapid
// animation so the user has a fair chance to stop at any visible value.
export const getSpinnerSequence = (length = 36, visualBias = 0.5) => {
    // copy base weights and apply visual bias to 6 and W
    const adjusted: Record<string, number> = {};
    OUTCOMES.forEach(k => {
        if (k === '6' || k === 'W') adjusted[k] = (BASE_WEIGHTS[k] || 0) * visualBias;
        else adjusted[k] = (BASE_WEIGHTS[k] || 0);
    });

    const total = Object.values(adjusted).reduce((a,b) => a + b, 0) || 1;
    const normalized: Record<string, number> = {};
    Object.keys(adjusted).forEach(k => normalized[k] = adjusted[k] / total);

    // sample sequence
    const outcomes = Object.keys(normalized);
    const seq: string[] = [];
    for (let i = 0; i < length; i++) {
        const r = Math.random();
        let c = 0;
        for (const o of outcomes) {
            c += normalized[o];
            if (r < c) { seq.push(o); break; }
        }
        if (!seq[i]) seq[i] = outcomes[outcomes.length - 1];
    }
    return seq;
};

// Final outcome selection uses the true base weights (no visual bias)
export const getRandomRun = (): string => {
    const total = Object.values(BASE_WEIGHTS).reduce((a,b) => a + b, 0) || 1;
    const r = Math.random() * total;
    let c = 0;
    for (const o of OUTCOMES) {
        c += (BASE_WEIGHTS[o] || 0);
        if (r < c) return o;
    }
    return OUTCOMES[OUTCOMES.length - 1];
};

export const pickFromDistribution = getRandomRun;

