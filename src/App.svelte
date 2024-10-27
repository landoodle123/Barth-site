<script>
  import Navbar from './lib/Navbar.svelte';
  let count = 0;

  // Load the count from localStorage when the app starts
  if (localStorage.getItem('count')) {
    count = parseInt(localStorage.getItem('count'), 10);
  }

  // Function to save the count to localStorage
  function saveCount() {
    localStorage.setItem('count', count.toString()); // Convert count to a string
    console.log('The count has been saved to localStorage');
  }

  // Update the count when the button is clicked
  function incrementCount() {
    count += 1;
    saveCount();
  }
</script>

<main>
  <Navbar/>
  <h1>Welcome to the Great Realm of Bartholomue!</h1>
  <h2>The best site ever</h2>
  <button class="button" on:click={count = count+1}>Pet bartholomue ✋🐈</button>
  <p>Bartholomue has been petted {count} times.</p>
</main>
