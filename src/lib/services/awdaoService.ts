import { AW } from '$lib/constants';
import { cursorAll, getMultiDataCursor, getSingleData } from '$lib/contractKit';
import _ from "lodash";

export async function get_dacglobals(activePlanet: string) {
    const planetScope = _.find(AW.PLANETS, (planet: any) => { return planet.name === activePlanet })?.scope || "";
    const data: any = await getSingleData(AW.CONTRACT_NAME, planetScope, AW.DACGLOBALS_TABLE);

    return data.data;
}

export async function get_votes_by_user(activePlanet: string, voter: string) {
    // const voter = "hznmm.c.wam";
    const planetScope = _.find(AW.PLANETS, (planet: any) => { return planet.name === activePlanet })?.scope || "";
    const res: any = await getSingleData(AW.CONTRACT_NAME, planetScope, AW.VOTES_TABLE, voter);

    return res;
}

export async function get_candidates(activePlanet: string) {
    const planetScope = _.find(AW.PLANETS, (planet: any) => { return planet.name === activePlanet })?.scope || "";

    const cursor: any = await getMultiDataCursor(AW.CONTRACT_NAME, planetScope, AW.CANDIDATES_TABLE);
    const data: any = await cursorAll(cursor);

    const serializedCandidates = data.filter((item: any) => { return parseInt(item.is_active.value) === 1 }).map((item: any) => {
        return {
            candidate_name: String(item.candidate_name),
            requestedpay: String(item.requestedpay),
            rank: parseInt(item.rank),
            gap_filler: parseInt(item.gap_filler),
            total_vote_power: parseInt(item.total_vote_power) / 10000,
            is_active: parseInt(item.is_active),
            number_voters: parseInt(item.number_voters),
            avg_vote_time_stamp: `${String(item.avg_vote_time_stamp)}Z`,
            running_weight_time: parseInt(item.running_weight_time),
        }
    }).sort((a: any, b: any) => {
        return b.rank - a.rank;
    });

    return serializedCandidates;

}