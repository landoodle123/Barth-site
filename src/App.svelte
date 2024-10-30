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
  <button class="button" on:click={incrementCount}>Pet bartholomue ✋🐈</button>
  <p>Bartholomue has been petted {count} times.</p>
  <button class="resetbutton" on:click={count = 0}>Reset</button>
  <h1>Pictures</h1>
  <img src="/bartholomue.png" alt="bartholomu" />
</main>

<style>
  .resetbutton {
    background-color: red;
    color: white;
    font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif; /* Font family */
    border: none;           /* No border */
    border-radius: 25px;   /* Rounded corners */
    padding: 10px 20px;    /* Padding for the button */
    cursor: pointer;        /* Pointer cursor on hover */
    transition: background-color 0.3s; /* Smooth background change on hover */
  }
</style>
