import { browser } from '$app/environment';
import type { Custodian, Planet } from '$lib/types';
import { writable } from 'svelte/store';

const defaultValue: Planet = { name: 'Kavian', scope: 'kavian', account: "kavian.dac" };
export const activePlanetStore = writable<Planet>(defaultValue);
export const custodiansStore = writable<Custodian[]>([]);

if (browser) {
    const stored = window.localStorage.getItem('activePlanetStore');
    if (stored) {
        if (JSON.parse(stored)) {
            activePlanetStore.set(JSON.parse(stored));
        }
    }

    activePlanetStore.subscribe((value) => {
        window.localStorage.setItem('activePlanetStore', JSON.stringify(value));
    });

    const storedCustodians = window.localStorage.getItem('custodiansStore');
    if (storedCustodians) {
        if (JSON.parse(storedCustodians)) {
            custodiansStore.set(JSON.parse(storedCustodians));
        }
    }

    custodiansStore.subscribe((value) => {
        window.localStorage.setItem('custodiansStore', JSON.stringify(value));
    });
}