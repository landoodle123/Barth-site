<script>
  import Navbar from './lib/Navbar.svelte';

  let count = 0;
  let amountGained = 1;
  let clickerCount = 0;
  let clickerCost = 100;
  let multiplierCost = 150;
  let clickerMultiplierCost = 1000;
  let clickerGain = 1;
  let clickerIntervals = [];
  let confirmReset = false;

  let clickTimestamps = [];
  const AUTODETECT_WINDOW = 15;
  const MIN_INTERVAL_MS = 40;
  const MAX_VARIANCE_MS = 10;

  count = parseInt(localStorage.getItem('count') || "0", 10);
  clickerCount = parseInt(localStorage.getItem('clickerCount') || "0", 10);
  clickerCost = parseInt(localStorage.getItem('clickerCost') || "100", 10);
  multiplierCost = parseInt(localStorage.getItem('multiplierCost') || "150", 10);
  clickerMultiplierCost = parseInt(localStorage.getItem('clickerMultiplierCost') || "1000", 10);
  amountGained = parseInt(localStorage.getItem('amountGained') || "1", 10);
  clickerGain = parseInt(localStorage.getItem('clickerGain') || "1", 10);

  function saveState() {
    localStorage.setItem('count', count.toString());
    localStorage.setItem('clickerCount', clickerCount.toString());
    localStorage.setItem('clickerCost', clickerCost.toString());
    localStorage.setItem('multiplierCost', multiplierCost.toString());
    localStorage.setItem('clickerMultiplierCost', clickerMultiplierCost.toString());
    localStorage.setItem('amountGained', amountGained.toString());
    localStorage.setItem('clickerGain', clickerGain.toString());
    console.log('State saved:', { count, clickerCount, clickerCost, multiplierCost, clickerMultiplierCost, amountGained, clickerGain });
  }

  function startClicker() {
    const interval = setInterval(() => {
      count += clickerGain;
      saveState();
    }, 1000);
    clickerIntervals.push(interval);
  }

  function buyClicker() {
    if (count >= clickerCost) {
      count -= clickerCost;
      clickerCount += 1;
      clickerCost = Math.floor(clickerCost * 1.5);
      saveState();
      startClicker();
    } else {
      console.log("Not enough points to buy a clicker.");
    }
  }

  function buyMultiplier() {
    if (count >= multiplierCost) {
      count -= multiplierCost;
      amountGained *= 2;
      multiplierCost = Math.floor(multiplierCost * 2);
      saveState();
    } else {
      console.log("Not enough points to buy a multiplier.");
    }
  }

  function buyClickerMultiplier() {
    if (count >= clickerMultiplierCost) {
      count -= clickerMultiplierCost;
      clickerGain *= 2;
      clickerMultiplierCost = Math.floor(clickerMultiplierCost * 15);
      saveState();
    } else {
      console.log("Not enough points to buy a clicker multiplier.");
    }
  }

  function detectAutoclicker() {
    if (clickTimestamps.length < AUTODETECT_WINDOW) return false;
    let intervals = [];
    for (let i = 1; i < clickTimestamps.length; i++) {
      intervals.push(clickTimestamps[i] - clickTimestamps[i - 1]);
    }
    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((a, b) => a + Math.abs(b - avg), 0) / intervals.length;
    return avg < MIN_INTERVAL_MS && variance < MAX_VARIANCE_MS;
  }

  function incrementCount() {
    const now = Date.now();
    clickTimestamps.push(now);
    if (clickTimestamps.length > AUTODETECT_WINDOW) {
      clickTimestamps.shift();
    }
    if (detectAutoclicker()) {
      alert("Autoclicker detected! Progress reset.");
      quickReset();
      clickTimestamps = [];
      return;
    }
    count += amountGained;
    saveState();
  }

  function reset() {
    if (confirmReset) {
      count = 0;
      clickerCount = 0;
      clickerCost = 100;
      multiplierCost = 150;
      clickerMultiplierCost = 1000;
      clickerGain = 1;
      amountGained = 1;
      clickerIntervals.forEach(clearInterval);
      clickerIntervals = [];
      confirmReset = false;
      saveState();
    } else {
      confirmReset = true;
      setTimeout(() => (confirmReset = false), 3000);
    }
  }

  function quickReset() {
    count = 0;
    clickerCount = 0;
    clickerCost = 100;
    multiplierCost = 150;
    clickerMultiplierCost = 1000;
    clickerGain = 1;
    amountGained = 1;
    clickerIntervals.forEach(clearInterval);
    clickerIntervals = [];
    confirmReset = false;
    saveState();
  }

  function handleKeydown(e) {
    if (e.key === "Enter") {
      alert("Enter key pressed! Progress reset.");
      e.preventDefault();
      e.stopPropagation();
      quickReset();
    } else {
      console.log("Key pressed:", e.key);
    }
  }

  clickerIntervals.forEach(clearInterval);
  clickerIntervals = [];
  for (let i = 0; i < clickerCount; i++) {
    startClicker();
  }
</script>

<main>
  <Navbar />
  <h1>Welcome to the Great Realm of Bartholomue!</h1>
  <h2>The best site ever</h2>
  <button class="button" on:click={incrementCount} on:keydown={handleKeydown}>Pet Bartholomue ✋🐈</button>
  <p>Bartholomue has been petted {count} times.</p>
  <button class="resetbutton" on:click={reset}>
    {confirmReset ? "Are you sure?" : "Reset"}
  </button>
  <br><br>
  <button on:click={buyClicker} class="button">Add Clicker ({clickerCost} clicks)</button>
  <p>You have {clickerCount} clickers running, each adding {clickerGain} clicks per second!</p>
  <br>
  <button on:click={buyMultiplier} class="button">Add Multiplier ({multiplierCost} clicks)</button>
  <p>Each click is being multiplied by {amountGained} every click!</p>
  <br>
  <button on:click={buyClickerMultiplier} class="button">Add Clicker Multiplier ({clickerMultiplierCost} clicks)</button>
  <div class="photogallery">
    <h2>Photo Gallery</h2>
    <img src="bartholomue.png" alt="bartholomue the great">
    <img src="bartholomue.png" alt="bartholomue is life">
    <p>bartholomue</p>
  </div>
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
  .photogallery {
    width: 200px;
    height: auto;
    display: block;
    margin-left: auto;
    margin-right: auto;
  }
</style>