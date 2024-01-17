
export function voteDecayFormula(voteDate: string, votePower: number): number {
    const voteTimestamp = new Date(voteDate).getTime();
    const secondsSinceVote = (Date.now() - voteTimestamp) / 1000;
    const thirtyDaysSeconds = 2592000;
    const X = secondsSinceVote / thirtyDaysSeconds;
    const Z = 0.5 ** X;
    const decayedVotePower = votePower * Z;
    console.log(decayedVotePower);
    return decayedVotePower;
}