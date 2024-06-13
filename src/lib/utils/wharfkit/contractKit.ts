import { bpRPCStore } from '$lib/stores';
import { Action, APIClient, Bytes, Name, PackedTransaction, Serializer } from "@wharfkit/antelope";
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

const encodeAction = async (account: Name, action: Name, authorization: any, object: any) => {
    const client = new APIClient({ url: get(bpRPCStore) });
    const { abi } = await client.v1.chain.get_abi(account);

    const typedAction = Action.from(
        {
            account: account,
            name: action,
            authorization,
            data: object
        },
        abi
    );
    // const encoded = Serializer.encode({ object, abi, type: String(action) });
    return typedAction;
}

const getSCAbi = async (account: Name) => {
    const client = new APIClient({ url: get(bpRPCStore) });
    const { abi } = await client.v1.chain.get_abi(account);
    return abi;
}

const unpackTransaction = async (packed_trx: any) => {
    const packedTransaction = PackedTransaction.from({ packed_trx });
    const transaction = packedTransaction.getTransaction();
    return transaction;
}

// const main = async () => {
//     const unpacked = await unpackTransaction("1d4b1666000000000000000000000100004ef1520ea84900b262491fe94c4401000000c824e0ae9a00000000a8ed3232080000000080eeae9a00");
//     console.log(unpacked);
//     const decoded = await decodeAction(unpacked.actions[0].account, unpacked.actions[0].name, unpacked.actions[0].data);
//     console.log(decoded);
//     const encoded = await encodeAction(unpacked.actions[0].account, unpacked.actions[0].name, [], decoded);
//     console.log(encoded.data.toString());
// }
// main();

// const data =
//     "000000c824e0ae9a000000000060705a000000c824e0ae9a00000000a8ed3232"

// const client = new APIClient({ url: "https://wax.greymass.com" })
// const { abi } = await client.v1.chain.get_abi("eosio.msig")

// const decoded = Serializer.decode({ data, abi, type: "approve" })

// console.log(decoded)
// console.log(JSON.stringify(decoded))


export {
    cursorAll,
    cursorNext,
    cursorReset, decodeAction, encodeAction, getActionsOfSmartContract, getMultiDataCursor, getSCAbi, getSingleData, unpackTransaction
};

