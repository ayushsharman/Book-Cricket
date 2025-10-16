export const getRandomRun = (weightedRuns: any) => {
    const totalWeight = weightedRuns.reduce((acc: any, run: any) => acc + run.weight, 0);
    const randomValue = Math.random() * totalWeight;
    let cumulativeWeight = 0;

    for (let i = 0; i < weightedRuns.length; i++) {
        cumulativeWeight += weightedRuns[i].weight;
        if (randomValue < cumulativeWeight) {
            return weightedRuns[i].run;
        }
    }
    return weightedRuns[weightedRuns.length - 1].run;
};

// Compute distribution (probabilities) from weighted runs
export const computeProbabilities = (weightedRuns: { run: string; weight: number }[]) => {
    const totalWeight = weightedRuns.reduce((acc, r) => acc + r.weight, 0);
    return weightedRuns.map(r => ({ run: r.run, weight: r.weight, probability: totalWeight > 0 ? r.weight / totalWeight : 0 }));
};

// Pick a run from the distribution (kept for clarity)
export const pickFromDistribution = (weightedRuns: { run: string; weight: number }[]) => {
    return getRandomRun(weightedRuns);
};

