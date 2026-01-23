import { writable } from 'svelte/store';

// Default to false; will update on login/logout
export const loggedIn = writable(false);
