import { browser } from '$app/environment';
import { LOCAL_STORAGE_KEYS } from '$lib/constants';
import type { Custodian, Planet } from '$lib/types';
import { writable } from 'svelte/store';

const defaultValue: Planet = { name: 'Kavian', scope: 'kavian', account: "kavian.dac" };
export const activePlanetStore = writable<Planet>(defaultValue);
export const custodiansStore = writable<Custodian[]>([]);

if (browser) {
    const stored = window.localStorage.getItem(LOCAL_STORAGE_KEYS.ACTIVE_PLANET);
    if (stored) {
        if (JSON.parse(stored)) {
            activePlanetStore.set(JSON.parse(stored));
        }
    }

    activePlanetStore.subscribe((value) => {
        window.localStorage.setItem(LOCAL_STORAGE_KEYS.ACTIVE_PLANET, JSON.stringify(value));
    });

    const storedCustodians = window.localStorage.getItem(LOCAL_STORAGE_KEYS.CUSTODIANS);
    if (storedCustodians) {
        if (JSON.parse(storedCustodians)) {
            custodiansStore.set(JSON.parse(storedCustodians));
        }
    }

    custodiansStore.subscribe((value) => {
        window.localStorage.setItem(LOCAL_STORAGE_KEYS.CUSTODIANS, JSON.stringify(value));
    });
}