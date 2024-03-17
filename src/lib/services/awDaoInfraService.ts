import { AW_DAO_INFRA, AW_PLANETS } from '$lib/constants';
import { cursorAll, getMultiDataCursor } from '$lib/utils/wharfkit/contractKit';

import _ from "lodash";

export async function get_identities(cursor: any) {
    const data: any = await cursorAll(cursor);
    const deserializedData: any = [];
    for (const item of data) {
        deserializedData.push({
            wallet: String(item.wallet),
            identity_name: item.identity_name,
            permission_level: String(item.permission_level),
            header_graphic: item.header_graphic,
            logo: item.logo,
            description: item.description,
            contacts: item.contacts,
            created_at: `${String(item.created_at)}Z`,
            updated_at: `${String(item.updated_at)}Z`,
        });
    }
    return deserializedData;
}

export async function get_identity_cursor(activePlanet: string) {
    const planetScope = _.find(AW_PLANETS, (planet: any) => { return planet.name === activePlanet })?.scope || "";
    const cursor: any = await getMultiDataCursor(AW_DAO_INFRA.CONTRACT_NAME, planetScope, AW_DAO_INFRA.TABLES.IDENTITIES);
    return cursor;
}