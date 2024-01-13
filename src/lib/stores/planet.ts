import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const defaultValue = 'Kavian';
const initialValue = browser ? window.localStorage.getItem('activePlanet') ?? defaultValue : defaultValue;
export const activePlanet = writable<string>(initialValue);

activePlanet.subscribe((value) => {
    if (browser) {
        window.localStorage.setItem('activePlanet', value);
    }
});

if (browser) {
    const stored = window.localStorage.getItem('activePlanet');
    if (stored) {
        activePlanet.set(stored);
    }
}
