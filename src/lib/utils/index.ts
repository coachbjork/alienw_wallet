import moment from 'moment';

export function voteDecayFormula(voteDate: string, votePower: number): number {
    const voteTimestamp = moment(voteDate, 'YYYY-MM-DDTHH:mm:ss');
    const secondsSinceVote = moment.utc().diff(voteTimestamp, 'seconds');
    const thirtyDaysSeconds = 2592000;
    const X = secondsSinceVote / thirtyDaysSeconds;
    const Z = 0.5 ** X;
    const decayedVotePower = votePower * Z;
    return decayedVotePower;
}