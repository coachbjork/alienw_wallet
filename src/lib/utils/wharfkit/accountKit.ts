import { bpRPCStore } from '$lib/stores';
import { AccountKit } from "@wharfkit/account";
import { APIClient } from "@wharfkit/antelope";
import { Chains } from "@wharfkit/common";
import { get } from 'svelte/store';


const getAccountOnchain = async (account: string) => {
    try {
        const accountKit = new AccountKit(Chains.WAX, {
            client: new APIClient({ url: get(bpRPCStore) }),
        });
        const accountInstance = await accountKit.load(account);

        return accountInstance;
    } catch (error) {
        console.log("Error", error);
        return undefined;
    }
}

export {
    getAccountOnchain
};

