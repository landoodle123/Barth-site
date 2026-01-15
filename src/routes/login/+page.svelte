<script lang="js">
  import bcrypt from "bcryptjs";
  let email = '';
  let password = '';
  let remember = false;
  let error = '';
  let loading = false;
  let date = Date.now();
  date = date.toString();
  const salt = bcrypt.genSaltSync(10);
  let sessionID;

  async function handleLogin() {
    error = '';
    if (password.length < 8) {
      error = 'Password must be at least 8 characters.';
      return;
    }
    loading = true;
    sessionID = bcrypt.hashSync(date, salt)
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, remember, sessionID })
    });
    loading = false;
    if (res.ok) {
      window.location.href = '/';
    } else {
      error = (await res.json()).error || 'Login failed';
    }
  }
</script>

<main>
  <form class="login-form" on:submit|preventDefault={handleLogin}>
    <h2>Login</h2>
    <label>
      Email:
      <input type="email" bind:value={email} required autocomplete="username" />
    </label>
    <label>
      Password:
      <input type="password" bind:value={password} required minlength="8" autocomplete="current-password" />
    </label>
    <label class="remember">
      <input type="checkbox" bind:checked={remember} />
      Remember me
    </label>
    <button class="button" type="submit" disabled={loading}>Log In</button>
    <p>
      Don't have an account?
      <a href="/signup">Sign up</a>
    </p>
    {#if error}
      <p class="error">{error}</p>
    {/if}
  </form>
</main>

<style>
  .login-form {
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
  .login-form h2 {
    margin: 0 0 8px 0;
    font-size: 2rem;
    font-weight: 700;
    color: #fff;
  }
  .login-form label {
    display: flex;
    flex-direction: column;
    font-size: 1.1rem;
    gap: 4px;
    color: #fff;
    font-weight: 500;
  }
  .login-form input[type="email"],
  .login-form input[type="password"] {
    border: 2px solid #222;
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 1rem;
    background: #444;
    color: #fff;
    outline: none;
    transition: border-color 0.2s;
  }
  .login-form input[type="email"]:focus,
  .login-form input[type="password"]:focus {
    border-color: #0078d7;
  }
  .login-form .remember {
    flex-direction: row;
    align-items: center;
    gap: 8px;
    font-size: 1rem;
    font-weight: 400;
  }
  .login-form .button {
    margin-top: 8px;
    width: 100%;
  }
  .login-form .error {
    color: #b30000;
    font-weight: 600;
    margin: 0;
    text-align: center;
  }
</style>