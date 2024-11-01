<script>
  import Navbar from './lib/Navbar.svelte';
  let count = 0;
  let clickerRunning = false;

  // Load the count and clickerRunning state from localStorage when the app starts
  if (localStorage.getItem('count')) {
    count = parseInt(localStorage.getItem('count'), 10);
  }
  if (localStorage.getItem('clickerRunning')) {
    clickerRunning = localStorage.getItem('clickerRunning') === 'true';
  }

  // Function to save the count and clickerRunning state to localStorage
  function saveState() {
    localStorage.setItem('count', count.toString());
    localStorage.setItem('clickerRunning', clickerRunning.toString());
    console.log('State has been saved to localStorage');
  }

  async function clicker() {
    while (clickerRunning) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      count += 1;
      saveState(); // Save the updated state
    }
  }

  function buyClicker() {
    if (count >= 100) {
      if (!clickerRunning) {
        clickerRunning = true;
        saveState(); // Update clickerRunning in localStorage
        clicker();
      }
      count -= 100;
      saveState();
    } else {
      console.log("Not enough points to start the clicker.");
    }
  }

  // Update the count when the button is clicked
  function incrementCount() {
    count += 1;
    saveState();
  }

  function reset() {
    count = 0;
    clickerRunning = false;
    saveState();
  }

  // Start the clicker if clickerRunning is true on page load
  if (clickerRunning) {
    clicker();
  }
</script>

<main>
  <Navbar />
  <h1>Welcome to the Great Realm of Bartholomue!</h1>
  <h2>The best site ever</h2>
  <button class="button" on:click={incrementCount}>Pet Bartholomue ✋🐈</button>
  <p>Bartholomue has been petted {count} times.</p>
  <button class="resetbutton" on:click={reset}>Reset</button>
  <br>
  <br>
  <button on:click={buyClicker} class="button">Add Clicker (100 clicks)</button>
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
