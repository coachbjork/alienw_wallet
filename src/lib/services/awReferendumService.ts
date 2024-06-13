import { AW_PLANETS, AW_REFERENDUM } from '$lib/constants';
import { cursorNext, decodeAction, getMultiDataCursor, getSingleData } from '$lib/utils/wharfkit/contractKit';
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
    return { rows: deserializedData, next_key, planetName };
}

export async function get_ref_cfg(activePlanet: string) {
    const planetScope = _.find(AW_PLANETS, (planet: any) => { return planet.name === activePlanet })?.scope || "";
    const data: any = await getSingleData(AW_REFERENDUM.CONTRACT_NAME, planetScope, AW_REFERENDUM.TABLES.CONFIG);
    if (!data) return {};
    const deserializedData = {
        fee: data.fee.reduce((acc: any, fee: any) => {
            acc[String(fee.key)] = {
                quantity: fee.value.quantity,
                contract: String(fee.value.contract),
            }
            return acc;
        }, {}),
        pass: data.pass.map((pass: any) => {
            return {
                name: String(pass.key),
                value: parseInt(pass.value),
            };
        }),
        quorum_token: data.quorum_token.map((quorum: any) => {
            return {
                name: String(quorum.key),
                value: parseInt(quorum.value),
            };
        }),
        quorum_account: data.quorum_account.map((quorum: any) => {
            return {
                name: String(quorum.key),
                value: parseInt(quorum.value),
            };
        }),
        allow_per_account_voting: data.allow_per_account_voting.map((allow: any) => {

            return {
                name: String(allow.key),
                value: allow.value,
            };
        }),
        allow_vote_type: data.allow_vote_type.map((allow: any) => {
            return {
                name: String(allow.key),
                value: allow.value,
            };
        }),
        next_referendum_id: parseInt(data.next_referendum_id),
    }
    return deserializedData;
}

export async function get_deposited_bal(user: string) {
    const data: any = await getSingleData(AW_REFERENDUM.CONTRACT_NAME, AW_REFERENDUM.CONTRACT_NAME, AW_REFERENDUM.TABLES.DEPOSITS, user);
    if (!data) return {};
    const deserializedData = {
        account: String(data.account),
        deposit: {
            quantity: data.deposit.quantity,
            contract: String(data.deposit.contract),
        }
    }

    return deserializedData;
}

export async function get_votes_by_user(activePlanet: string, user: string) {
    const planetScope = _.find(AW_PLANETS, (planet: any) => { return planet.name === activePlanet })?.scope || "";
    const data: any = await getSingleData(AW_REFERENDUM.CONTRACT_NAME, planetScope, AW_REFERENDUM.TABLES.VOTES, user);
    if (!data) return {};
    const deserializedData = {
        voter: String(data.voter),
        votes: data.votes.map((vote: any) => {
            return {
                referendum_id: parseInt(vote.key),
                vote: String(vote.value),
            };
        }),
    }

    return deserializedData;
}