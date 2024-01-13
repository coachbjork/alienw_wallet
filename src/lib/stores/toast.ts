// src/lib/stores/toast.ts
import { TOAST_TYPES } from '$lib/constants';
import { writable } from 'svelte/store';

let id = 0;

function createToastStore() {
    const { subscribe, update } = writable<any[]>([]);
    return {
        subscribe,
        add: (message: any, type: string = TOAST_TYPES.INFO) => update(toasts => [...toasts, { id: id++, message, counter: 5, open: true, type }]),
        remove: (id: any) => update(toasts => toasts.filter(t => t.id !== id)),
        set: (id: any, counter: any) => update(toasts => toasts.map(t => t.id === id ? { ...t, counter } : t)),
    };
}

export const toastStore = createToastStore();