import { browser } from '$app/environment';
import type { Planet } from '$lib/types';
import { writable } from 'svelte/store';

const defaultValue: Planet = { name: 'Kavian', scope: 'kavian' };
export const activePlanet = writable<Planet>(defaultValue);

if (browser) {
    const stored = window.localStorage.getItem('activePlanet');
    if (stored) {
        if (JSON.parse(stored)) {
            activePlanet.set(JSON.parse(stored));
        }
    }

    activePlanet.subscribe((value) => {
        window.localStorage.setItem('activePlanet', JSON.stringify(value));
    });
}