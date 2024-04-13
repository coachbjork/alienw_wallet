import { AW_PLANETS, AW_REFERENDUM } from '$lib/constants';
import { cursorNext, decodeAction, getMultiDataCursor } from '$lib/utils/wharfkit/contractKit';
import Bluebird from 'bluebird';

import _ from "lodash";


export async function get_referundum_cursor(activePlanet: string, next_key: any = undefined, limit: number = 1000) {
    const planetScope = _.find(AW_PLANETS, (planet: any) => { return planet.name === activePlanet })?.scope || "";
    const params: any = {
        index_position: '1',
        key_type: 'i64',
        reverse: true,
        rowsPerAPIRequest: limit,
    }
    if (next_key) {
        params.to = next_key;
    }
    const cursor: any = await getMultiDataCursor(AW_REFERENDUM.CONTRACT_NAME, planetScope, AW_REFERENDUM.TABLES.REFERENDUMS, params);
    return cursor;
}

export async function get_referendums(cursor: any) {
    const data: any = await cursorNext(cursor);
    const planetName = _.find(AW_PLANETS, (planet: any) => { return planet.scope === cursor.params.scope })?.name || "";
    // Use Bluebird.map for concurrency
    const next_key = data.length > 0 ? parseInt(data[data.length - 1].referendum_id) - 1 : undefined;
    const deserializedData = await Bluebird.map(data, async (item: any) => {
        const account_votes = item.account_votes.map((vote: any) => {
            return {
                name: String(vote.key),
                value: parseInt(vote.value),
            };
        });


        const token_votes = item.token_votes.map((vote: any) => {
            return {
                name: String(vote.key),
                value: parseInt(vote.value),
            };
        });

        // unpack transaction
        // const unpacked = await unpackTransaction(item.packed_transaction);
        // const expiration = unpacked.expiration.toDate();
        // Decode action
        const actions = [];
        for (const action of item.acts) {
            const decoded = await decodeAction(action.account, action.name, action.data);
            actions.push({
                contract_name: String(action.account),
                action_name: String(action.name),
                action_data: JSON.parse(JSON.stringify(decoded)),
            });
        }

        return {
            referendum_id: parseInt(item.referendum_id),
            proposer: String(item.proposer),
            type: String(item.type),
            voting_type: String(item.voting_type),
            status: String(item.status),
            title: item.title,
            content_ref: String(item.content_ref),
            token_votes,
            account_votes,
            expires: `${String(item.expires)}Z`,
            acts: actions,
        };
    }, { concurrency: 3 });
    console.log("deserializedData", deserializedData);
    return { rows: deserializedData, next_key, planetName };
}