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

