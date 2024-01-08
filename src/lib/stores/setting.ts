import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const defaultValue = 'https://wax.greymass.com';
const initialValue = browser ? window.localStorage.getItem('blockchain_rpc') ?? defaultValue : defaultValue;
export const blockchain_rpc = writable<string>(initialValue);

blockchain_rpc.subscribe((value) => {
    if (browser) {
        window.localStorage.setItem('blockchain_rpc', value);
    }
});
if (browser) {
    const stored = window.localStorage.getItem('blockchain_rpc');
    if (stored) {
        blockchain_rpc.set(stored);
    }
}
