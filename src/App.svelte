<script>
  import Navbar from './lib/Navbar.svelte';
  let count = 0;
</script>

<main>
  <Navbar/>
  <h1>Welcome to the Great Realm of Bartholomue!</h1>
  <h2>The best site ever</h2>
  <button class="button" on:click={count = count+1}>Pet bartholomue ✋🐈</button>
  <p>Bartholomue has been petted {count} times.</p>
</main>
