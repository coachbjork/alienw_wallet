import { blockchain_rpc } from '$lib/stores';
import { APIClient } from "@wharfkit/antelope";
import { ContractKit } from "@wharfkit/contract";
import { get } from 'svelte/store';


const getSingleData = async (contract: string, scope: string, table: string, key_value: any = undefined, params: any = {}) => {
    try {
        const contractKit = new ContractKit({
            client: new APIClient({ url: get(blockchain_rpc) }),
        });
        const contractInstance = await contractKit.load(contract);
        const tableInstance = contractInstance.table(table, scope);
        const data = await tableInstance.get(key_value, params);
        return data;
    } catch (error) {
        console.log("Error", error);
        return undefined;
    }
}

const getMultiDataCursor = async (contract: string, scope: string, table: string, params: any = {}) => {
    const contractKit = new ContractKit({
        client: new APIClient({ url: get(blockchain_rpc) }),
    });
    const contractInstance = await contractKit.load(contract);
    return contractInstance.table(table, scope).query(params);
}

const cursorNext = async (cursor: any) => {
    return await cursor.next();
}
const cursorAll = async (cursor: any) => {
    return await cursor.all();
}
const cursorReset = async (cursor: any) => {
    return await cursor.reset();
}

export { cursorAll, cursorNext, cursorReset, getMultiDataCursor, getSingleData };

