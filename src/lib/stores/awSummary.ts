import axios from 'axios';
import { writable } from 'svelte/store';

function createAwSummaryStore() {

    const { subscribe, set } = writable<any | null>(null);

    return {
        subscribe,
        set,
        fetch: async () => {
            const response = await axios.get(`https://api.alienw.com/summary`);
            console.log("summary", response.data);
            set(response.data);
        }
    };
}

export const awSummaryStore = createAwSummaryStore();
