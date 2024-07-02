import { bpRPCStore, contractInsStore } from '$lib/stores';
import { Action, APIClient, Bytes, Name, PackedTransaction, Serializer } from "@wharfkit/antelope";
import { Contract, ContractKit } from "@wharfkit/contract";
import { get } from 'svelte/store';


const getSingleData = async (contract: string, scope: string, table: string, key_value: any = undefined, params: any = {}) => {
    try {
        const contractInstance: any = await getContractInstance(contract);
        const tableInstance = contractInstance.table(table, scope);
        const data = await tableInstance.get(key_value, params);
        return data;
    } catch (error) {
        console.log("Error", error);
        return undefined;
    }
}

const getMultiDataCursor = async (contract: string, scope: string, table: string, params: any = {}) => {
    const contractInstance: any = await getContractInstance(contract);
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

    const abi: any = await getSCAbi(Name.from(account));
    if (!abi) return [];
    const actions = abi.actions.map((action: any) => {
        // get action.type and find the type in abi.structs
        const struct = abi.structs.find((struct: any) => struct.name === action.type);
        return { name: action.name, fields: struct.fields, base: struct.base };
    });
    return actions;
}

const decodeAction = async (account: Name, action: Name, data: Bytes) => {
    const abi = await getSCAbi(account);
    const decoded = Serializer.decode({ data, abi, type: String(action) });
    return decoded;
}

const encodeAction = async (account: Name, action: Name, authorization: any, object: any) => {
    const abi = await getSCAbi(account);
    const typedAction = Action.from(
        {
            account: account,
            name: action,
            authorization,
            data: object
        },
        abi
    );
    return typedAction;
}

const getSCAbi = async (account: Name) => {
    const { abi } = await getContractInstance(String(account));
    return abi;
}

const unpackTransaction = async (packed_trx: any) => {
    const packedTransaction = PackedTransaction.from({ packed_trx });
    const transaction = packedTransaction.getTransaction();
    return transaction;
}

const getContractInstance = async (contract: string) => {
    try {
        const contractKit = new ContractKit({
            client: new APIClient({ url: get(bpRPCStore) }),
        });
        const contractLocalIns = contractInsStore.findContract(contract);
        let contractInstance: any;
        if ((!contractLocalIns)) {
            contractInstance = await contractKit.load(contract).catch((error) => { console.log(error) });
            if (!contractInstance) return undefined;
            contractInsStore.setContract({ abi: contractInstance.abi, account: String(contractInstance.account) });
        } else {
            contractInstance = new Contract({
                abi: contractLocalIns.abi,
                account: Name.from(contractLocalIns.account),
                client: new APIClient({ url: get(bpRPCStore) })
            });
        }
        return contractInstance;
    } catch (error) {
        console.log("Error", error);
        return undefined;
    }

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

