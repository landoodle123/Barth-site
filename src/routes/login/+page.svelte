<script lang="js">
  let email = '';
  let password = '';
  let remember = false;
  let error = '';
  let loading = false;

  async function handleLogin() {
    error = '';

    if (password.length < 8) {
      error = 'Password must be at least 8 characters.';
      return;
    }

    loading = true;

    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, remember })
    });

    loading = false;

    if (res.ok) {
      window.location.href = '/';
    } else {
      error = (await res.json()).error || 'Login failed';
    }
  }
</script>
