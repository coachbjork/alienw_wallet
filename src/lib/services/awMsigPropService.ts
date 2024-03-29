import { AW_MSIG, AW_PLANETS } from '$lib/constants';
import { cursorAll, getMultiDataCursor, getSingleData } from '$lib/utils/wharfkit/contractKit';

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


export async function get_msig_cursor(activePlanet: string) {
    const planetScope = _.find(AW_PLANETS, (planet: any) => { return planet.name === activePlanet })?.scope || "";
    const cursor: any = await getMultiDataCursor(AW_MSIG.CONTRACT_NAME, planetScope, AW_MSIG.TABLES.PROPOSALS, {
        index_position: 3,
        key_type: 'i64',
        reverse: true,
    });
    return cursor;
}

export async function get_msigs(cursor: any) {
    const data: any = await cursorAll(cursor);
    const planetName = _.find(AW_PLANETS, (planet: any) => { return planet.scope === cursor.params.scope })?.name || "";
    console.log(data[0]);
    const d = {
        "id": 339,
        "proposal_name": "c3fr42rgg15b",
        "proposer": "tzgai.wam",
        "packed_transaction": "161a0c66000000000000000000000100004ef1520ea84900b262491fe94c4401000032094ce3b68100000000a8ed323208000000004ce3b68100",
        "earliest_exec_time": null,
        "modified_date": "2024-03-27T08:05:03",
        "state": 0,
        "metadata": [
            {
                "key": "description",
                "value": "The AW community had previously developed a Telegram/Discord notification bot system that would broadcast the new quest information as soon as it was available on the website.  At some point, the security updates to the GraphQL to lock down all data broke this bot's ability to read the quest information directly from the API.\n\nWe believe the issue with the API is the requirement of the session token for quest information, so we are proposing to adjust the permissions of the GraphQL roles to allow quest information to be retrieved as well as allow quest information to be displayed before logging into the website.  Includes review of all site code, updates, deployment, and testing of all updates.  Expected time is 10 hours ($1000), so at the current price 38,800 TLM\n\nTotal Requested Amount: 38,800 TLM"
            },
            {
                "key": "title",
                "value": "MineQuest Quest API Update"
            }
        ]
    };
    const c = {
        "_num": 339,
        "schema_version": 1,
        "planet": "kavian",
        "proposal_title": "- No title -",
        "proposal_id": "c3fr42rgg15b",
        "proposer": "tzgai.wam",
        "trx_contracts": {
            "0": {
                "dao.worlds": "claimbudget"
            }
        },
        "trx_actions": {
            "0": {
                "dac_id": "kavian"
            }
        },
        "trx_packed": {
            "0": "000000004ce3b681"
        },
        "description": "- No description -",
        "proposal_status": 0,
        "approved_by": [
            "hweaq.wam"
        ],
        "created": "2024-03-26T14:45:50",
        "modified": "2024-03-26T14:45:50",
        "expiration": "2024-04-02T14:45:42",
        "trx_id": "5de0e6416f403fe5719cdf50dfc13b1025efce8066725b2bdc6c8cd866c158ae",
        "unique_hash": "5de0e6416f403fe5719cdf50dfc13b1025efce8066725b2bdc6c8cd866c158aec3fr42rgg15b",
        "actions": [
            {
                "contract_name": "dao.worlds",
                "action_name": "claimbudget",
                "action_data": {
                    "dac_id": "kavian"
                }
            }
        ]
    }
    console.log(data.length);

    const approvals_cursor: any = await getMultiDataCursor(AW_MSIG.CONTRACT_NAME, cursor.params.scope, AW_MSIG.TABLES.APPROVALS, {

        limit: data.length,
    });
    const all_approvals = await cursorAll(approvals_cursor);
    console.log(all_approvals);

    const deserializedData: any = [];
    for (const item of data) {
        const proposal_title = item.metadata.find((item: any) => item.key === "title")?.value || "- No title -";
        const description = item.metadata.find((item: any) => item.key === "description")?.value || "- No description -";
        // const approvals = await get_msig_approvals_by_id(planetName, item.proposal_name);
        // console.log(approvals);
        deserializedData.push({
            proposal_id: String(item.proposal_name),
            proposer: String(item.proposer),
            earliest_exec_time: `${String(item.earliest_exec_time)}Z`,
            modified_date: `${String(item.modified_date)}Z`,
            proposal_status: parseInt(item.state),
            metadata: item.metadata,
            proposal_title,
            description,
        });
    }
    return deserializedData;
}