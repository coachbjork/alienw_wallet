import type { Session } from '@wharfkit/session';
import { writable } from 'svelte/store';

export const allSessions = writable<Session[] | []>([]);
export const session = writable<Session | null>(null);
