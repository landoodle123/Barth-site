import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';
import Navbar from './lib/Navbar.svelte';

const app = mount(App, {
  target: document.getElementById('app'), // Ensures the main Svelte app is mounted
});

export default app;
