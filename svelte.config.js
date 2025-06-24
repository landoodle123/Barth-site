import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        adapter: adapter(),
        prerender: {
            entries: [] // disables all prerendering to fix 405 build errors on dynamic routes
        }
    }
};

export default config;