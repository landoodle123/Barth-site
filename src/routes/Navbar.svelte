<script>
  export let loggedIn = false;
  async function logout() {
    await fetch('/logout', { method: 'POST' });
    window.location.href = '/login';
  }
</script>
<nav class="navbar">
  <div class="navbar-text">
    <a href="/">GREAT REALM OF BARTHOLOMUE</a>
  </div>
  <div class="navbar-links">
    {#if loggedIn}
      <button type="button" on:click={logout}>Log out</button>
    {:else}
      <a href="/login">Login</a>
      <a href="/signup">Sign up</a>
    {/if}
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
</style>