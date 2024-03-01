import { browser } from '$app/environment';
import { LOCAL_STORAGE_KEYS } from '$lib/constants';
import { writable } from 'svelte/store';

const defaultValue = 'https://wax.greymass.com';
export const bpRPCStore = writable<string>(defaultValue);

if (browser) {

    const stored = window.localStorage.getItem(LOCAL_STORAGE_KEYS.BP_RPC);
    if (stored) {
        bpRPCStore.set(stored);
    }

    bpRPCStore.subscribe((value) => {
        window.localStorage.setItem(LOCAL_STORAGE_KEYS.BP_RPC, value);
    });
}