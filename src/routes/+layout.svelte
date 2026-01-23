<script>
    import Navbar from './Navbar.svelte';
    import '../app.css';
    export let data;
</script>

<div class="app">
    <Navbar loggedIn={data.loggedIn} />
    <main>
        <slot />
    </main>
    <footer>
        <p>Barth Site v2.5 | Created by <a href=https://github.com/landoodle123>landoodle123 on GitHub</a></p>
    </footer>
</div>

<style>
    .app {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }

    main {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 1rem;
        width: 100%;
        max-width: 64rem;
        margin: 0 auto;
        box-sizing: border-box;
    }

    footer {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 12px;
    }

    footer a {
        font-weight: bold;
    }

    @media (min-width: 480px) {
        footer {
            padding: 12px 0;
        }
    }
</style>