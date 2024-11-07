<script>
  import Navbar from './lib/Navbar.svelte';
  let count = 0;
  let clickerCount = 0; // Number of clickers purchased
  let clickerCost = 100; // Initial cost of a clicker
  let clickerIntervals = []; // Array to hold intervals for each clicker
  let multiplierCost = 200; // Initial cost of multiplier
  let amountGained = 1; // Initial multiplier effect

  // Load the state from localStorage when the app starts
  if (localStorage.getItem('count')) {
    count = parseInt(localStorage.getItem('count'), 10);
  }
  if (localStorage.getItem('clickerCount')) {
    clickerCount = parseInt(localStorage.getItem('clickerCount'), 10);
  }
  if (localStorage.getItem('clickerCost')) {
    clickerCost = parseInt(localStorage.getItem('clickerCost'), 10);
  }
  if (localStorage.getItem('multiplierCost')) {
    multiplierCost = parseInt(localStorage.getItem('multiplierCost'), 10);
  }
  if (localStorage.getItem('amountGained')) {
    amountGained = parseInt(localStorage.getItem('amountGained'), 10);
  }

  // Save state to localStorage
  function saveState() {
    localStorage.setItem('count', count.toString());
    localStorage.setItem('clickerCount', clickerCount.toString());
    localStorage.setItem('clickerCost', clickerCost.toString());
    localStorage.setItem('multiplierCost', multiplierCost.toString());
    localStorage.setItem('amountGained', amountGained.toString());
    console.log('State has been saved to localStorage');
  }

  function startClicker() {
    const interval = setInterval(() => {
      count += 1; // Each clicker adds 1 to count per second
      saveState();
    }, 1000);
    clickerIntervals.push(interval);
  }

  function buyClicker() {
    if (count >= clickerCost) {
      count -= clickerCost;
      clickerCount += 1;
      clickerCost = Math.floor(clickerCost * 1.5); // Increase the price exponentially
      saveState();

      startClicker(); // Start a new interval for the purchased clicker
    } else {
      console.log("Not enough points to buy a clicker.");
    }
  }

  function buyMultiplier() {
    if (count >= multiplierCost) {
      count -= multiplierCost;
      amountGained *= 2;
      multiplierCost = Math.floor(multiplierCost * 10); // Increase the price exponentially
      saveState();
    } else {
      console.log("Not enough points to buy a multiplier.");
    }
  }

  function incrementCount() {
    count += amountGained;
    saveState();
  }

  function reset() {
    count = 0;
    clickerCount = 0;
    clickerCost = 100;
    multiplierCost = 200;
    amountGained = 1;

    // Clear all clicker intervals
    clickerIntervals.forEach(clearInterval);
    clickerIntervals = [];
    saveState();
  }

  // Restart intervals on page load if clickerCount > 0
  for (let i = 0; i < clickerCount; i++) {
    startClicker();
  }
</script>

<main>
  <Navbar />
  <h1>Welcome to the Great Realm of Bartholomue!</h1>
  <h2>The best site ever</h2>
  <button class="button" on:click={incrementCount}>Pet Bartholomue ✋🐈</button>
  <p>Bartholomue has been petted {count} times.</p>
  <button class="resetbutton" on:click={reset}>Reset</button>
  <br><br>
  <button on:click={buyClicker} class="button">Add Clicker ({clickerCost} clicks)</button>
  <p>You have {clickerCount} clickers running, each adding 1 click per second!</p>
  <br>
  <button on:click={buyMultiplier} class="button">Add Multiplier ({multiplierCost} clicks)</button>
  <p>Your count is being multiplied by {amountGained} every click!</p>
</main>

<style>
  .resetbutton {
    background-color: red;
    color: white;
    font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
    border: none;
    border-radius: 25px;
    padding: 10px 20px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
</style>
