import { browser } from '$app/environment';
import { LOCAL_STORAGE_KEYS } from '$lib/constants';
import { get, writable } from 'svelte/store';

const defaultValue: any = [];
// TODO: update contract abi if getting error
function createContractInsStore() {
    const { subscribe, set, update } = writable<any[]>(defaultValue);

    if (browser) {
        const stored = window.localStorage.getItem(LOCAL_STORAGE_KEYS.CONTRACT_INS);
        if (stored && JSON.parse(stored)) {
            console.log("stored abi:", JSON.parse(stored));
            set(JSON.parse(stored));
        }

        subscribe((value) => {
            window.localStorage.setItem(LOCAL_STORAGE_KEYS.CONTRACT_INS, JSON.stringify(value, getCircularReplacer()));
        });
    }

    return {
        subscribe,
        set,
        setContract: (contract: any) => {
            update(contracts => {
                const index = contracts.findIndex(c => String(c.account) === contract.account);
                if (index !== -1) {
                    contracts[index] = contract; // Update existing contract
                } else {
                    contracts.push(contract); // Add new contract
                }
                return contracts;
            });
        },
        findContract: (contractName: string) => {
            const contracts = get({ subscribe }).find(c => String(c.account) === contractName);
            return contracts;
        },
        removeContract: (contractName: string) => {
            update(contracts => contracts.filter(c => String(c.account) !== contractName));
        }
    };

}

function getCircularReplacer() {
    const seen = new WeakSet();
    return (key: string, value: any) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
    };
}

export const contractInsStore = createContractInsStore();
