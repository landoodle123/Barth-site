<script>
  import { onMount, onDestroy } from 'svelte';
  import {SCRIPT_KEY} from '$env';

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
  let saveInterval;

  let saveMessage = '';
  let saveMessageType = '';
  let saveMessageTimeout;

  let clickTimestamps = [];
  const AUTODETECT_WINDOW = 15;
  const MIN_INTERVAL_MS = 90;
  const MAX_VARIANCE_MS = 5;

  async function fetchState() {
  const res = await fetch('/api/game-state');
  if (res.ok) {
    const data = await res.json();
    count = parseInt(data.count ?? "0");
    amountGained = parseInt(data.amountGained ?? "1");
    clickerCount = parseInt(data.clickerCount ?? "0");
    clickerCost = parseInt(data.clickerCost ?? "100");
    multiplierCost = parseInt(data.multiplierCost ?? "150");
    clickerMultiplierCost = parseInt(data.clickerMultiplierCost ?? "1000");
    clickerGain = parseInt(data.clickerGain ?? "1");
  }
}

  async function saveState() {
  try {
    const res = await fetch('/api/game-state', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-script-key': SCRIPT_KEY
      },
      body: JSON.stringify({
        count,
        amountGained,
        clickerCount,
        clickerCost,
        multiplierCost,
        clickerMultiplierCost,
        clickerGain
      })
    });
    if (res.ok) {
      showSaveMessage(`Saved at ${new Date().toLocaleTimeString()} successfully`, 'success');
    } else {
      const data = await res.json();
      if (data.error === 'anticheat') {
        showSaveMessage('Anticheat violation detected, progress reset.', 'error');
        quickReset();
      } else {
        showSaveMessage('Save failed! E: Server error', 'error');
      }
    }
  } catch (e) {
    showSaveMessage('Save failed! E: Disconnected from network', 'error');
  }
}

  function showSaveMessage(message, type) {
    saveMessage = message;
    saveMessageType = type;
    clearTimeout(saveMessageTimeout);
    saveMessageTimeout = setTimeout(() => {
      saveMessage = '';
      saveMessageType = '';
    }, 3000);
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
      }, 1000);
      clickerIntervals.push(interval);
    }
  }

  function buyClicker() {
    if (count >= clickerCost) {
      count = count - clickerCost;
      clickerCount = clickerCount + 1;
      clickerCost = Math.floor(clickerCost * 2.5);
      startAllClickers();
    }
  }

  function buyMultiplier() {
    if (count >= multiplierCost) {
      count = count - multiplierCost;
      amountGained = amountGained * 2;
      multiplierCost = Math.floor(multiplierCost * 3);
    }
  }

  function buyClickerMultiplier() {
    if (count >= clickerMultiplierCost) {
      count = count - clickerMultiplierCost;
      clickerGain = clickerGain * 2;
      clickerMultiplierCost = Math.floor(clickerMultiplierCost * 15);
      startAllClickers();
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
      startAllClickers();
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
    clearAllClickers();
    confirmReset = false;
    startAllClickers();
    saveState();
  }

  function handleKeydown(e) {
    if (e.key === "Enter") {
      alert("Enter key pressed! Progress reset. The enter key can be used to cheat significant amounts of points rapidly, thus pressing it can reset your progress.");
      e.preventDefault();
      e.stopPropagation();
      quickReset();
    }
  }

  onMount(async () => {
    await fetchState();
    startAllClickers();
    loaded = true;
    saveInterval = setInterval(saveState, 60000); // Save every minute
  });

  onDestroy(() => {
    clearAllClickers();
    if (saveInterval) clearInterval(saveInterval);
  });
</script>

{#if saveMessage}
  <div class="save-popup {saveMessageType}">
    {saveMessage}
  </div>
{/if}

{#if loaded}
<main>
  <h1>Welcome to the Great Realm of Bartholomue!</h1>
  <h2>The best site ever</h2>
  <button class="button" on:click={incrementCount} on:keydown={handleKeydown}>Pet Bartholomue ✋🐈</button>
  <p>Bartholomue has been petted {count} times.</p>
  <p class="warningLabel">Warning, pressing "enter" with the site focused *will* reset your progress.</p>
  <button class="resetbutton" on:click={reset}>
    {confirmReset ? "Are you sure?" : "Reset"}
  </button>
  <button class="button" on:click={saveState}>Update</button>
  <br><br>
  <button on:click={buyClicker} class="button">Add Clicker ({clickerCost} clicks)</button>
  <p>You have {clickerCount} clickers running, each adding {clickerGain} clicks per second!</p>
  <br>
  <button on:click={buyMultiplier} class="button">Add Multiplier ({multiplierCost} clicks)</button>
  <p>Each click is being multiplied by {amountGained}!</p>
  <br>
  <button on:click={buyClickerMultiplier} class="button">Add Clicker Multiplier ({clickerMultiplierCost} clicks)</button>
  <div class="photogallery">
    <h2>Photo Gallery</h2>
    <img src="/lib/images/bartholomue.png" alt="bartholomue the great">
    <img src="/lib/images/imAllEars.jpg" alt="i'm all ears looking ahh cat">
    <img src="/lib/images/catThatProbWantsFood.jpg" alt="cat that definitely wants food">
    <p>cat</p>
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
  .warningLabel {
    color: red;
    font-weight: bold;
  }
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
  .save-popup {
    position: fixed;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 1.1em;
    z-index: 1000;
    background: #222;
    color: #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    opacity: 0.95;
    transition: opacity 0.3s;
  }
  .save-popup.success {
    background: #2e7d32;
    color: #fff;
  }
  .save-popup.error {
    background: #c62828;
    color: #fff;
  }
  .spinner-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 40vh;
  }
  .spinner {
  color: #ffffff;
  font-size: 45px;
  text-indent: -9999em;
  overflow: hidden;
  width: 1em;
  height: 1em;
  border-radius: 50%;
  position: relative;
  transform: translateZ(0);
  animation: mltShdSpin 1.7s infinite ease, round 1.7s infinite ease;
}

@keyframes mltShdSpin {
  0% {
    box-shadow: 0 -0.83em 0 -0.4em,
    0 -0.83em 0 -0.42em, 0 -0.83em 0 -0.44em,
    0 -0.83em 0 -0.46em, 0 -0.83em 0 -0.477em;
  }
  5%,
  95% {
    box-shadow: 0 -0.83em 0 -0.4em, 
    0 -0.83em 0 -0.42em, 0 -0.83em 0 -0.44em, 
    0 -0.83em 0 -0.46em, 0 -0.83em 0 -0.477em;
  }
  10%,
  59% {
    box-shadow: 0 -0.83em 0 -0.4em, 
    -0.087em -0.825em 0 -0.42em, -0.173em -0.812em 0 -0.44em, 
    -0.256em -0.789em 0 -0.46em, -0.297em -0.775em 0 -0.477em;
  }
  20% {
    box-shadow: 0 -0.83em 0 -0.4em, -0.338em -0.758em 0 -0.42em,
     -0.555em -0.617em 0 -0.44em, -0.671em -0.488em 0 -0.46em, 
     -0.749em -0.34em 0 -0.477em;
  }
  38% {
    box-shadow: 0 -0.83em 0 -0.4em, -0.377em -0.74em 0 -0.42em,
     -0.645em -0.522em 0 -0.44em, -0.775em -0.297em 0 -0.46em, 
     -0.82em -0.09em 0 -0.477em;
  }
  100% {
    box-shadow: 0 -0.83em 0 -0.4em, 0 -0.83em 0 -0.42em, 
    0 -0.83em 0 -0.44em, 0 -0.83em 0 -0.46em, 0 -0.83em 0 -0.477em;
  }
}

@keyframes round {
  0% { transform: rotate(0deg) }
  100% { transform: rotate(360deg) }
}
 
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>