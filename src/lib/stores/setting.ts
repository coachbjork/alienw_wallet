import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const defaultValue = 'https://wax.greymass.com';

export const blockchain_rpc = writable<string>(defaultValue);

if (browser) {
    blockchain_rpc.subscribe((value) => {
        window.localStorage.setItem('blockchain_rpc', value);
    });

    const stored = window.localStorage.getItem('blockchain_rpc');
    if (stored) {
        blockchain_rpc.set(stored);
    }

}