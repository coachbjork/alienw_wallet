import { bpRPCStore } from '$lib/stores';
import { APIClient, Bytes, Name, PackedTransaction, Serializer } from "@wharfkit/antelope";
import { ContractKit } from "@wharfkit/contract";
import { get } from 'svelte/store';


const getSingleData = async (contract: string, scope: string, table: string, key_value: any = undefined, params: any = {}) => {
    try {
        const contractKit = new ContractKit({
            client: new APIClient({ url: get(bpRPCStore) }),
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
        client: new APIClient({ url: get(bpRPCStore) }),
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

const getActionsOfSmartContract = async (account: string) => {
    const client = new APIClient({ url: get(bpRPCStore) });
    const res: any = await client.v1.chain.get_abi(account).catch((e) => { });
    if (!res) return [];
    const actions = res.abi.actions.map((action: any) => {
        // get action.type and find the type in abi.structs
        const struct = res.abi.structs.find((struct: any) => struct.name === action.type);
        return { name: action.name, fields: struct.fields, base: struct.base };
    });
    return actions;
}

const decodeAction = async (account: Name, action: Name, data: Bytes) => {
    const client = new APIClient({ url: get(bpRPCStore) });
    const { abi } = await client.v1.chain.get_abi(account);
    const decoded = Serializer.decode({ data, abi, type: String(action) });
    return decoded;

}

const unpackTransaction = async (packed_trx: any) => {
    const packedTransaction = PackedTransaction.from({ packed_trx });
    const transaction = packedTransaction.getTransaction();
    return transaction;
}

// const data =
//     "0000402601aca2dac0a6cbd9c58a65cc005480120000000004544c4d000000003732707634732e632e77616d20612e6433752e632e77616d2068776561712e77616d2067796b62342e77616d206f757a346f2e632e77616d"

// const client = new APIClient({ url: "https://wax.greymass.com" })
// const { abi } = await client.v1.chain.get_abi("alien.worlds")

// const decoded = Serializer.decode({ data, abi, type: "transfer" })

// console.log(decoded)
// console.log(JSON.stringify(decoded))


export {
    cursorAll,
    cursorNext,
    cursorReset, decodeAction, getActionsOfSmartContract, getMultiDataCursor,
    getSingleData, unpackTransaction
};

