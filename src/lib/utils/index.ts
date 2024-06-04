
export function voteDecayFormula(voteDate: string, votePower: number): number {

    const voteTimestamp = new Date(voteDate).getTime();
    const secondsSinceVote = (Date.now() - voteTimestamp) / 1000;
    const thirtyDaysSeconds = 2592000;
    const X = secondsSinceVote / thirtyDaysSeconds;
    const Z = 0.5 ** X;
    const decayedVotePower = votePower * Z;
    return decayedVotePower;
}

export function retryAsync(fn: any, retries = 3, delay = 30) {
    return new Promise((resolve, reject) => {
        const attempt = () => {
            fn().then(resolve).catch((error: any) => {
                if (retries === 0) {
                    reject(error);
                } else {
                    setTimeout(() => {
                        retries--;
                        attempt();
                    }, delay);
                }
            });
        };
        attempt();
    });
}