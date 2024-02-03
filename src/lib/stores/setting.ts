import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const defaultValue = 'https://wax.greymass.com';
export const bpRPCStore = writable<string>(defaultValue);

if (browser) {

    const stored = window.localStorage.getItem('bpRPCStore');
    if (stored) {
        bpRPCStore.set(stored);
    }

    bpRPCStore.subscribe((value) => {
        window.localStorage.setItem('bpRPCStore', value);
    });



}