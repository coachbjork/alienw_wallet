import { AW_MSIG, AW_PLANETS } from '$lib/constants';
import { getSingleData } from '$lib/contractKit';

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
