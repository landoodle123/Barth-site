<script lang="ts">
  let email = '';
  let name = '';
  let password = '';
  let confirm = '';
  let error = '';
  let loading = false;

  async function handleSignup() {
    error = '';
    if (password.length < 8) {
      error = 'Password must be at least 8 characters.';
      return;
    }
    if (password !== confirm) {
      error = 'Passwords do not match.';
      return;
    }
    loading = true;
    const res = await fetch('/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password })
    });
    loading = false;
    if (res.ok) {
      window.location.href = '/login';
    } else {
      error = (await res.json()).error || 'Signup failed';
    }
  }
</script>

<main>
  <form class="signup-form" on:submit|preventDefault={handleSignup}>
    <h2>Sign Up</h2>
    <label>
      Name:
      <input type="text" bind:value={name} required />
    </label>
    <label>
      Email:
      <input type="email" bind:value={email} required autocomplete="username" />
    </label>
    <label>
      Password:
      <input type="password" bind:value={password} required minlength="8" autocomplete="new-password" />
    </label>
    <label>
      Confirm Password:
      <input type="password" bind:value={confirm} required minlength="8" autocomplete="new-password" />
    </label>
    <button class="button" type="submit" disabled={loading}>Sign Up</button>
    <p>
      Already have an account?
      <a href="/login">Log in</a>
    </p>
    {#if error}
      <p class="error">{error}</p>
    {/if}
  </form>
</main>

<style>
  .signup-form {
    background: #333;
    color: #fff;
    border-radius: 16px;
    box-shadow: 0 2px 16px rgba(0,0,0,0.08);
    padding: 32px 24px;
    max-width: 350px;
    margin: 40px auto;
    display: flex;
    flex-direction: column;
    gap: 18px;
    align-items: stretch;
  }
  .signup-form h2 {
    margin: 0 0 8px 0;
    font-size: 2rem;
    font-weight: 700;
    color: #fff;
  }
  .signup-form label {
    display: flex;
    flex-direction: column;
    font-size: 1.1rem;
    gap: 4px;
    color: #fff;
    font-weight: 500;
  }
  .signup-form input[type="email"],
  .signup-form input[type="password"],
  .signup-form input[type="text"] {
    border: 2px solid #222;
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 1rem;
    background: #444;
    color: #fff;
    outline: none;
    transition: border-color 0.2s;
  }
  .signup-form input:focus {
    border-color: #0078d7;
  }
  .signup-form .button {
    margin-top: 8px;
    width: 100%;
  }
  .signup-form .error {
    color: #b30000;
    font-weight: 600;
    margin: 0;
    text-align: center;
  }
  .signup-form a {
    color: #0078d7;
    text-decoration: underline;
    font-weight: 500;
  }
</style>