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
    const stored = window.localStorage.getItem('activePlanet');
    if (stored) {
        activePlanet.set(JSON.parse(stored));
    }

    // Subscribe to changes in the active planet, and save them to localStorage
    activePlanet.subscribe((value) => {
        if (browser) {
            try {
                window.localStorage.setItem('activePlanet', JSON.stringify(value));
            } catch (error) {
                console.error('Error saving activePlanet to localStorage', error);
            }
        }
    });
}