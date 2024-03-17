import { AW_DAO_INFRA, AW_PLANETS } from '$lib/constants';
import { cursorAll, getMultiDataCursor, getSingleData } from '$lib/utils/wharfkit/contractKit';

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

export async function get_articles(cursor: any) {
    const data: any = await cursorAll(cursor);
    const deserializedData: any = [];
    for (const item of data) {
        deserializedData.push({
            article_id: parseInt(item.article_id),
            creator: String(item.creator),
            title: item.title,
            description: item.description,
            image: item.image,
            link: item.link,
            author: item.author,
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

export async function get_article_cursor(activePlanet: string) {
    const planetScope = _.find(AW_PLANETS, (planet: any) => { return planet.name === activePlanet })?.scope || "";
    const cursor: any = await getMultiDataCursor(AW_DAO_INFRA.CONTRACT_NAME, planetScope, AW_DAO_INFRA.TABLES.ARTICLES);
    return cursor;
}

export async function get_identity_by_wallet(activePlanet: string, wallet: string) {
    const planetScope = _.find(AW_PLANETS, (planet: any) => { return planet.name === activePlanet })?.scope || "";
    const data: any = await getSingleData(AW_DAO_INFRA.CONTRACT_NAME, planetScope, AW_DAO_INFRA.TABLES.IDENTITIES, wallet);
    if (!data) return null;
    const deserializedData = {
        wallet: String(data.wallet),
        identity_name: data.identity_name,
        permission_level: String(data.permission_level),
        header_graphic: data.header_graphic,
        logo: data.logo,
        description: data.description,
        contacts: data.contacts,
        created_at: `${String(data.created_at)}Z`,
        updated_at: `${String(data.updated_at)}Z`,
    };
    return deserializedData;
}