import { AW_DAO, AW_PLANETS, AW_TOKEN } from '$lib/constants';
import { cursorAll, getMultiDataCursor, getSingleData } from '$lib/contractKit';
import { voteDecayFormula } from '$lib/utils';
import _ from "lodash";

export async function get_dacglobals(activePlanet: string) {
    const planetScope = _.find(AW_PLANETS, (planet: any) => { return planet.name === activePlanet })?.scope || "";
    const data: any = await getSingleData(AW_DAO.CONTRACT_NAME, planetScope, AW_DAO.TABLES.DACGLOBALS);
    return data.data;
}

export async function get_votes_by_user(activePlanet: string, voter: string) {
    const planetScope = _.find(AW_PLANETS, (planet: any) => { return planet.name === activePlanet })?.scope || "";
    const res: any = await getSingleData(AW_DAO.CONTRACT_NAME, planetScope, AW_DAO.TABLES.VOTES, voter);
    // const res: any = await getSingleData(AW_DAO.CONTRACT_NAME, planetScope, AW_DAO.TABLES.VOTES, "um.i2.wam");
    return res;
}

export async function get_staked_by_user(activePlanet: string, user: string) {
    // const voter = "hznmm.c.wam";
    const planetScope = _.find(AW_PLANETS, (planet: any) => { return planet.name === activePlanet })?.scope || "";
    const res: any = await getSingleData(AW_TOKEN.CONTRACT_NAME, planetScope, AW_TOKEN.TABLES.STAKES, user);
    // const res: any = await getSingleData(AW_TOKEN.CONTRACT_NAME, planetScope, AW_TOKEN.TABLES.STAKES, "um.i2.wam");
    return res;
}

export async function get_candidates(activePlanet: string) {

    const planetScope = _.find(AW_PLANETS, (planet: any) => { return planet.name === activePlanet })?.scope || "";
    const cursor: any = await getMultiDataCursor(AW_DAO.CONTRACT_NAME, planetScope, AW_DAO.TABLES.CANDIDATES);
    const data: any = await cursorAll(cursor);

    const deserializedData = data.filter((item: any) => { return parseInt(item.is_active.value) === 1 }).map((item: any) => {
        let vote_decay: number = voteDecayFormula(`${String(item.avg_vote_time_stamp)}Z`, item.total_vote_power);
        const total_vote_power = parseInt(item.total_vote_power) / 10000;
        let current_vote_power: any = total_vote_power;

        if (vote_decay <= 0) {
            vote_decay = 0;
        } else {
            vote_decay = (100 - (vote_decay / item.total_vote_power) * 100)
            vote_decay = Math.round(vote_decay * 100) / 100;
            current_vote_power = total_vote_power - total_vote_power * vote_decay / 100;
        }

        return {
            candidate_name: String(item.candidate_name),
            requestedpay: String(item.requestedpay),
            rank: parseInt(item.rank),
            gap_filler: parseInt(item.gap_filler),
            total_vote_power,
            is_active: parseInt(item.is_active),
            number_voters: parseInt(item.number_voters),
            avg_vote_time_stamp: `${String(item.avg_vote_time_stamp)}Z`,
            running_weight_time: parseInt(item.running_weight_time),
            vote_decay,
            current_vote_power
        }
    }).sort((a: any, b: any) => {
        return b.rank - a.rank;
    });
    return deserializedData;
}

export async function get_custodians(activePlanet: string) {
    const planetScope = _.find(AW_PLANETS, (planet: any) => { return planet.name === activePlanet })?.scope || "";

    const cursor: any = await getMultiDataCursor(AW_DAO.CONTRACT_NAME, planetScope, AW_DAO.TABLES.CUSTODIANS1);
    const data: any = await cursorAll(cursor);

    const deserializedData = data.map((item: any) => {
        return {
            cust_name: String(item.cust_name),
            requestedpay: String(item.requestedpay),
            total_vote_power: parseInt(item.total_vote_power),
            rank: parseInt(item.rank),
            number_voters: parseInt(item.number_voters),
            avg_vote_time_stamp: `${String(item.avg_vote_time_stamp)}Z`,
        };
    }).sort((a: any, b: any) => {
        return b.rank - a.rank;
    });

    return deserializedData;
}