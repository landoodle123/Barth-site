import { mount } from 'svelte';
import Navbar from './lib/Navbar.svelte';

export let navbar = mount(Navbar, {
    target: document.getElementById('navbar'), // Mounts only the Navbar component
});
