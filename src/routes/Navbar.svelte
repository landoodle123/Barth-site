<script>
  import { onMount } from 'svelte';
  export let loggedIn = false;
  let open = false;

  function toggleMenu() {
    open = !open;
  }

  async function logout() {
    await fetch('/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  // Close menu on navigation or on wider screens
  let mql;
  onMount(() => {
    mql = window.matchMedia('(min-width: 700px)');
    const handler = () => { if (mql.matches) open = false; };
    mql.addEventListener?.('change', handler);
    return () => mql.removeEventListener?.('change', handler);
  });
</script>
<nav class="navbar">
  <div class="navbar-text">
    <a href="/">GREAT REALM OF BARTHOLOMUE</a>
  </div>
  <div class="navbar-links">
    <!-- hamburger for small screens -->
    <button class="hamburger" aria-label="Toggle menu" aria-expanded={open} on:click={toggleMenu}>
      <span class="bar"></span>
      <span class="bar"></span>
      <span class="bar"></span>
    </button>

    <div class:mobile-open={open} class="links-container" role="navigation">
      <a href="/leaderboard">Leaderboard</a>
      {#if loggedIn}
        <button type="button" on:click={() => { logout(); open = false; }}>Log out</button>
      {:else}
        <a href="/login" on:click={() => open = false}>Login</a>
        <a href="/signup" on:click={() => open = false}>Sign up</a>
      {/if}
    </div>
  </div>
</nav>

<style>
  .navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32px;
    background: #242424;
    background-image: url('/lib/images/barthnavbar.png');
    background-size: cover;
    background-position: center;
    height: 64px;
    border-bottom: 2px solid #fff;
    box-sizing: border-box;
    width: 100vw;
  }

  .navbar-text a {
    font-size: 2rem;
    font-weight: bold;
    font-style: italic;
    color: #000;
    text-decoration: none;
    letter-spacing: 1px;
    transition: color 0.2s;
  }
  .navbar-text a:hover {
    color: #0078d7;
  }

  .navbar-links {
    display: flex;
    gap: 24px;
    align-items: center;
    max-width: 50%;
    justify-content: flex-end;
  }

  /* allow title to shrink and truncate */
  .navbar-text {
    max-width: 48%;
    overflow: hidden;
  }
  .navbar-text a {
    display: inline-block;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    max-width: 100%;
  }

  .navbar-links a,
  .navbar-links button {
    text-decoration: none;
    color: #000;
    font-size: 1.25rem;
    font-weight: 500;
    padding: 6px 16px;
    border-radius: 8px;
    transition: background 0.2s, color 0.2s;
    background: none;
    border: none;
    cursor: pointer;
    outline: none;
    appearance: none;
  }
  .navbar-links a:hover,
  .navbar-links button:hover {
    background: #f0f0f0;
    color: #0078d7;
  }

  /* Hamburger button (hidden on wide screens) */
  .hamburger {
    display: none;
    flex-direction: column;
    gap: 4px;
    padding: 8px;
    background: none;
    border: none;
    cursor: pointer;
  }
  .hamburger .bar {
    width: 22px;
    height: 2px;
    background: #000;
    display: block;
    border-radius: 2px;
  }

  /* Mobile menu container (hidden on wide screens) */
  .links-container {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  /* Small screen behavior */
  @media (max-width: 700px) {
    .navbar {
      padding: 0 12px;
    }
    .navbar-text a { font-size: 1.25rem; }
    .hamburger { display: flex; }
    .links-container {
      position: absolute;
      top: 64px;
  right: 8px;
      background: rgba(255,255,255,0.95);
      color: #000;
      flex-direction: column;
      align-items: flex-start;
      padding: 12px;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      transform-origin: top right;
      display: none;
      min-width: 140px;
  z-index: 9999;
    }
    .links-container.mobile-open {
      display: flex;
    }
    .navbar-links a,
    .navbar-links button {
      color: #000;
      background: none;
      padding: 8px 12px;
      width: 100%;
      text-align: left;
    }
  }
</style>