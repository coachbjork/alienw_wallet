import { AW_MSIG, AW_PLANETS } from '$lib/constants';
import { cursorNext, decodeAction, getMultiDataCursor, getSingleData, unpackTransaction } from '$lib/utils/wharfkit/contractKit';
import Bluebird from 'bluebird';

import _ from "lodash";


export async function get_msig_proposal_by_id(activePlanet: string, proposal_name: string) {
    const planetScope = _.find(AW_PLANETS, (planet: any) => { return planet.name === activePlanet })?.scope || "";
    const data: any = await getSingleData(AW_MSIG.CONTRACT_NAME, planetScope, AW_MSIG.TABLES.PROPOSALS, proposal_name);
    if (!data) return {};
    const deserializedData = {
        id: parseInt(data.id),
        proposal_name: String(data.proposal_name),
        proposer: String(data.proposer),
        packed_transaction: String(data.packed_transaction),
        earliest_exec_time: `${String(data.earliest_exec_time)}Z`,
        modified_date: `${String(data.modified_date)}Z`,
        state: parseInt(data.state),
        metadata: data.metadata,
    };
    return deserializedData;
}

export async function get_msig_approvals_by_id(activePlanet: string, proposal_name: string) {
    const planetScope = _.find(AW_PLANETS, (planet: any) => { return planet.name === activePlanet })?.scope || "";
    const data: any = await getSingleData(AW_MSIG.CONTRACT_NAME, planetScope, AW_MSIG.TABLES.APPROVALS, proposal_name);
    if (!data) return {};
    const deserializedData = {
        proposal_name: String(data.proposal_name),
        requested_approvals: data.requested_approvals,
        provided_approvals: data.provided_approvals,
    };
    return deserializedData;
}


export async function get_msig_cursor(activePlanet: string, next_key: any = undefined, limit: number = 1000) {
    const planetScope = _.find(AW_PLANETS, (planet: any) => { return planet.name === activePlanet })?.scope || "";
    const params: any = {
        index_position: '3',
        key_type: 'i64',
        reverse: true,
        rowsPerAPIRequest: limit,
    }
    if (next_key) {
        params.to = next_key;
    }
    const cursor: any = await getMultiDataCursor(AW_MSIG.CONTRACT_NAME, planetScope, AW_MSIG.TABLES.PROPOSALS, params);
    return cursor;
}

export async function get_msigs(cursor: any) {
    const data: any = await cursorNext(cursor);
    const planetName = _.find(AW_PLANETS, (planet: any) => { return planet.scope === cursor.params.scope })?.name || "";

    // Use Bluebird.map for concurrency
    const next_key = data.length > 0 ? parseInt(data[data.length - 1].modified_date.value) - 1 : undefined;
    const deserializedData: any = await Bluebird.map(data, async (item: any) => {
        const proposal_title = item.metadata.find((item: any) => item.key === "title")?.value || "- No title -";
        const description = item.metadata.find((item: any) => item.key === "description")?.value || "- No description -";
        // unpack transaction
        const unpacked = await unpackTransaction(item.packed_transaction);
        const expiration = unpacked.expiration.toDate();
        // Decode action
        const actions = [];
        for (const action of unpacked.actions) {
            const decoded = await decodeAction(action.account, action.name, action.data);
            actions.push({
                contract_name: String(action.account),
                action_name: String(action.name),
                action_data: JSON.parse(JSON.stringify(decoded)),
            });
        }
        // Fetch approvals concurrently
        const msig_approvals: any = await get_msig_approvals_by_id(planetName, item.proposal_name);
        const approvals = msig_approvals?.provided_approvals.map((item: any) => { return String(item.level.actor) }) || [];

        return {
            proposal_id: String(item.proposal_name),
            proposer: String(item.proposer),
            earliest_exec_time: `${String(item.earliest_exec_time)}Z`,
            modified_date: `${String(item.modified_date)}Z`,
            proposal_status: parseInt(item.state),
            metadata: item.metadata,
            proposal_title,
            expiration,
            description,
            approved_by: approvals,
            actions
        };
    }, { concurrency: 3 });
    return { rows: deserializedData, next_key, planetName };
}