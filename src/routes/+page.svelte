<script>
  import { onMount, onDestroy } from 'svelte';

  let count = 0;
  let amountGained = 1;
  let clickerCount = 0;
  let clickerCost = 100;
  let multiplierCost = 150;
  let clickerMultiplierCost = 1000;
  let clickerGain = 1;
  let clickerIntervals = [];
  let confirmReset = false;
  let loaded = false;

  let clickTimestamps = [];
  const AUTODETECT_WINDOW = 15;
  const MIN_INTERVAL_MS = 40;
  const MAX_VARIANCE_MS = 10;

  function saveState() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('count', count.toString());
      localStorage.setItem('clickerCount', clickerCount.toString());
      localStorage.setItem('clickerCost', clickerCost.toString());
      localStorage.setItem('multiplierCost', multiplierCost.toString());
      localStorage.setItem('clickerMultiplierCost', clickerMultiplierCost.toString());
      localStorage.setItem('amountGained', amountGained.toString());
      localStorage.setItem('clickerGain', clickerGain.toString());
    }
  }

  function clearAllClickers() {
    clickerIntervals.forEach(clearInterval);
    clickerIntervals = [];
  }

  function startAllClickers() {
    clearAllClickers();
    for (let i = 0; i < clickerCount; i++) {
      const interval = setInterval(() => {
        count = count + clickerGain;
        saveState();
      }, 1000);
      clickerIntervals.push(interval);
    }
  }

  function buyClicker() {
    if (count >= clickerCost) {
      count = count - clickerCost;
      clickerCount = clickerCount + 1;
      clickerCost = Math.floor(clickerCost * 1.5);
      saveState();
      startAllClickers();
    }
  }

  function buyMultiplier() {
    if (count >= multiplierCost) {
      count = count - multiplierCost;
      amountGained = amountGained * 2;
      multiplierCost = Math.floor(multiplierCost * 2);
      saveState();
    }
  }

  function buyClickerMultiplier() {
    if (count >= clickerMultiplierCost) {
      count = count - clickerMultiplierCost;
      clickerGain = clickerGain * 2;
      clickerMultiplierCost = Math.floor(clickerMultiplierCost * 15);
      saveState();
      startAllClickers(); // Restart clickers with new gain
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
    clickTimestamps = [...clickTimestamps, now];
    if (clickTimestamps.length > AUTODETECT_WINDOW) {
      clickTimestamps = clickTimestamps.slice(-AUTODETECT_WINDOW);
    }
    if (detectAutoclicker()) {
      alert("Autoclicker detected! Progress reset.");
      quickReset();
      clickTimestamps = [];
      return;
    }
    count = count + amountGained;
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
      clearAllClickers();
      confirmReset = false;
      saveState();
      startAllClickers();
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
    clearAllClickers();
    confirmReset = false;
    saveState();
    startAllClickers();
  }

  function handleKeydown(e) {
    if (e.key === "Enter") {
      alert("Enter key pressed! Progress reset.");
      e.preventDefault();
      e.stopPropagation();
      quickReset();
    }
  }

  // Load state from localStorage only in the browser
  onMount(() => {
    if (typeof window !== 'undefined') {
      count = parseInt(localStorage.getItem('count') || "0", 10) || 0;
      clickerCount = parseInt(localStorage.getItem('clickerCount') || "0", 10) || 0;
      clickerCost = parseInt(localStorage.getItem('clickerCost') || "100", 10) || 100;
      multiplierCost = parseInt(localStorage.getItem('multiplierCost') || "150", 10) || 150;
      clickerMultiplierCost = parseInt(localStorage.getItem('clickerMultiplierCost') || "1000", 10) || 1000;
      amountGained = parseInt(localStorage.getItem('amountGained') || "1", 10) || 1;
      clickerGain = parseInt(localStorage.getItem('clickerGain') || "1", 10) || 1;
      startAllClickers();
      loaded = true;
    }
  });

  onDestroy(() => {
    clearAllClickers();
  });
</script>

{#if loaded}
<main>
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
    <img src="./lib/images/bartholomue.png" alt="bartholomue the great">
    <img src="./lib/images/bartholomue.png" alt="bartholomue is life">
    <p>bartholomue</p>
  </div>
</main>
{:else}
<main>
  <div class="spinner-container">
    <div class="spinner"></div>
    <h2>Loading...</h2>
  </div>
</main>
{/if}

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
  .spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 40vh;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 6px solid #e0e0e0;
  border-top: 6px solid #0078d7; /* Windows 10 blue */
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>