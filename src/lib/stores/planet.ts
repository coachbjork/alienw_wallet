import { browser } from '$app/environment';
import type { Planet } from '$lib/types';
import { writable } from 'svelte/store';

// Default planet value
const defaultValue: Planet = { name: 'Kavian', scope: 'kavian' };

// Create a writable store for the active planet
export const activePlanet = writable<Planet>(defaultValue);

// If running in the browser, try to load the active planet from localStorage again
// This is to ensure that the active planet is updated if it was changed in another tab
if (browser) {
    // Subscribe to changes in the active planet, and save them to localStorage
    activePlanet.subscribe((value) => {
        window.localStorage.setItem('activePlanet', JSON.stringify(value));
    });


    const stored = window.localStorage.getItem('activePlanet');
    if (stored) {
        if (JSON.parse(stored)) {
            activePlanet.set(JSON.parse(stored));
        }
    }

}