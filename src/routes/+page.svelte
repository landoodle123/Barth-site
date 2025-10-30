<!--Barth Site source code
Please refrain from tampering with anything here while attempting to use the site properly
Documentation can be found at least somewhat in the comments
Leave any error reports or feature suggestions in the issues page on GitHub-->
<script>
  import { onMount, onDestroy } from 'svelte';

  // Max safe value to avoid DB/BigInt issues
  const MAX_COUNT = 2_000_000_000;

  // variable declarations
  let count = 0;
  let amountGained = 1;
  let clickerCount = 0;
  let clickerCost = 100;
  let multiplierCost = 150;
  let clickerMultiplierCost = 1000;
  let clickerGain = 1;
  let clickerInterval = null; // single interval for all clickers
  let confirmReset = false;
  let loaded = false;
  let saveInterval;
  let audio;
  let audioWarningShown = false;
  let offlineClickerCount = 0;
  let offlineClickerCost = 500;

  let saveMessage = '';
  let saveMessageType = '';
  let saveMessageTimeout;

  // AUTO_DETECT vars and consts
  let clickTimestamps = [];
  const WINDOW = 15;
  const MS_INTVL = 90;
  const MS_VARNC = 5;

  function toNumber(v, def = 0) {
    // handle strings (including BigInt serialized as string) and numbers
    if (v === undefined || v === null) return def;
    const n = Number(v);
    return Number.isFinite(n) ? n : def;
  }

  async function fetchState() {
    try {
      const res = await fetch('/api/game-state');
      if (res.ok) {
        const data = await res.json();
        // parse and clamp values to safe numbers
        count = Math.min(MAX_COUNT, Math.max(0, toNumber(data.count, 0)));
        amountGained = Math.max(1, toNumber(data.amountGained, 1));
        clickerCount = Math.max(0, toNumber(data.clickerCount, 0));
        clickerCost = Math.max(1, toNumber(data.clickerCost, 100));
        multiplierCost = Math.max(1, toNumber(data.multiplierCost, 150));
        clickerMultiplierCost = Math.max(1, toNumber(data.clickerMultiplierCost, 1000));
        clickerGain = Math.max(1, toNumber(data.clickerGain, 1));
        offlineClickerCount = Math.max(0, toNumber(data.offlineClickerCount ?? 0, 0));
        offlineClickerCost = Math.max(1, toNumber(data.offlineClickerCost ?? 500, 500));
        startAllClickers();
      } else {
        console.error('Failed to fetch game state', res.status);
        if (res.status === 401) {
          showSaveMessage('Not logged in, progress will not be saved', 'error');
        } else {
          showSaveMessage('Failed to load save data from server. Error: ' + res.status, 'error');
        }
      }
    } catch (e) {
      console.error('Error fetching game state:', e);
      showSaveMessage('Error fetching game state. Error: ' + (e?.message ?? e), 'error');
    }
  }

  async function saveState() {
    try {
      // ensure numeric values and cap to avoid DB errors
      const payload = {
        count: Math.min(MAX_COUNT, Math.max(0, Math.floor(Number(count || 0)))),
        amountGained: Math.max(1, Math.floor(Number(amountGained || 1))),
        clickerCount: Math.max(0, Math.floor(Number(clickerCount || 0))),
        clickerCost: Math.max(1, Math.floor(Number(clickerCost || 100))),
        multiplierCost: Math.max(1, Math.floor(Number(multiplierCost || 150))),
        clickerMultiplierCost: Math.max(1, Math.floor(Number(clickerMultiplierCost || 1000))),
        clickerGain: Math.max(1, Math.floor(Number(clickerGain || 1))),
        offlineClickerCount: Math.max(0, Math.floor(Number(offlineClickerCount || 0))),
        offlineClickerCost: Math.max(1, Math.floor(Number(offlineClickerCost || 500)))
      };

      const res = await fetch('/api/game-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showSaveMessage(`Saved at ${new Date().toLocaleTimeString()}`, 'success');
        return true;
      } else {
        const data = await res.json().catch(() => ({}));
        if (data.error === 'anticheat') {
          showSaveMessage('Anticheat violation detected, progress reset.', 'error');
          quickReset();
        } else {
          showSaveMessage('Save failed! Server error', 'error');
        }
        return false;
      }
    } catch (e) {
      showSaveMessage('Save failed! Disconnected from network', 'error');
      return false;
    }
  }

  // shows save message box on screen
  function showSaveMessage(message, type) {
    saveMessage = message;
    saveMessageType = type;
    clearTimeout(saveMessageTimeout);
    saveMessageTimeout = setTimeout(() => {
      saveMessage = '';
      saveMessageType = '';
    }, 3000);
  }

  // disables built-in clickers
  function clearAllClickers() {
    if (clickerInterval) {
      clearInterval(clickerInterval);
      clickerInterval = null;
    }
  }

  // enables built-in clickers (single interval for efficiency)
  function startAllClickers() {
    clearAllClickers();
    if (clickerCount > 0) {
      clickerInterval = setInterval(() => {
        // add clicks per second: clickerCount * clickerGain
        count = Math.min(MAX_COUNT, count + clickerCount * clickerGain);
      }, 1000);
    }
  }

  // purchases a new clicker and increases the cost
  function buyClicker() {
    if (count >= clickerCost) {
      count -= clickerCost;
      clickerCount += 1;
      clickerCost = Math.floor(clickerCost * 2.5);
      startAllClickers();
    }
  }

  // purchases a new multiplier and increases the cost
  function buyMultiplier() {
    if (count >= multiplierCost) {
      count -= multiplierCost;
      amountGained *= 2;
      multiplierCost = Math.floor(multiplierCost * 3);
    }
  }

  // purchases a new clickerMultiplier and increases the cost
  function buyClickerMultiplier() {
    if (count >= clickerMultiplierCost) {
      count -= clickerMultiplierCost;
      clickerGain *= 2;
      clickerMultiplierCost = Math.floor(clickerMultiplierCost * 15);
      startAllClickers();
    }
  }

  // offline clicker purchase
  async function buyOfflineClicker() {
    if (count >= offlineClickerCost) {
      // optimistic update
      const oldCount = count;
      const oldOfflineCount = offlineClickerCount;
      count -= offlineClickerCost;
      offlineClickerCount += 1;
      offlineClickerCost = Math.floor(offlineClickerCost * 2.5);
      showSaveMessage(`Bought offline clicker. You have ${offlineClickerCount}.`, 'success');

      // immediate save; revert if save fails
      const ok = await saveState();
      if (!ok) {
        // revert optimistic changes
        count = oldCount;
        offlineClickerCount = oldOfflineCount;
        offlineClickerCost = Math.max(1, Math.floor(offlineClickerCost / 2.5));
        showSaveMessage('Purchase failed to persist. Reverted.', 'error');
      }
    } else {
      showSaveMessage('Not enough clicks to buy offline clicker.', 'error');
    }
  }

  // run offline clickers between two timestamps (ms)
  function runOfflineClicker(dateStartedMs, dateEndedMs) {
    console.info("runOfflineClicker beginning");
    try {
      const secondsElapsed = Math.floor((dateEndedMs - dateStartedMs) / 1000);
      if (secondsElapsed <= 0 || offlineClickerCount <= 0) return 0;
      const incrementsPerClicker = Math.floor(secondsElapsed / 10); // 1 per 10s
      const totalGained = incrementsPerClicker * offlineClickerCount * clickerGain;
      if (totalGained > 0) {
      showSaveMessage(`Offline clickers added ${totalGained} clicks!`, 'success');
    }
    console.info("runOfflineClicker completed successfully");
    return totalGained;
  } catch (e) {
    console.error('Error running offline clicker:', e);
    showSaveMessage('An unexpected error has occurred with offline clicker logic.', 'error');
    return 0;
  }
  }

  // intentionally obfuscated function
  function AUTO_DETECTOR() {
    if (clickTimestamps.length < WINDOW) return false;
    let intervals = [];
    for (let i = 1; i < clickTimestamps.length; i++) {
      intervals.push(clickTimestamps[i] - clickTimestamps[i - 1]);
    }
    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((a, b) => a + Math.abs(b - avg), 0) / intervals.length;
    return avg < MS_INTVL && variance < MS_VARNC;
  }

  // adds a click * multiplier count to the val "count" and runs AUTO_DETECTOR() while playing audio
  function incrementCount() {
    const now = Date.now();
    clickTimestamps = [...clickTimestamps, now];
    if (clickTimestamps.length > WINDOW) {
      clickTimestamps = clickTimestamps.slice(-WINDOW);
    }
    if (AUTO_DETECTOR()) {
      alert("Autoclicker detected! Progress reset.");
      quickReset();
      clickTimestamps = [];
      return;
    }
    count = Math.min(MAX_COUNT, count + amountGained);
    try {
      audio?.play();
    } catch (e) {
      console.warn('Audio play failed:', e);
      if (!audioWarningShown) {
        showSaveMessage('Audio playback failed', 'error');
        audioWarningShown = true;
      }
    }
  }

  // reset confirmation
  function reset() {
    if (confirmReset) {
      quickReset();
    } else {
      confirmReset = true;
      setTimeout(() => (confirmReset = false), 3000);
    }
  }

  // resets all vals, used in reset() and for ac violations
  function quickReset() {
    count = 0;
    clickerCount = 0;
    clickerCost = 100;
    multiplierCost = 150;
    clickerMultiplierCost = 1000;
    clickerGain = 1;
    amountGained = 1;
    offlineClickerCount = 0;
    offlineClickerCost = 500;
    clearAllClickers();
    confirmReset = false;
    startAllClickers();
    // ensure we save cleaned state (fire-and-forget)
    saveState().catch(() => {});
  }

  // checks for enter key exploit
  function handleKeydown(e) {
    if (e.key === "Enter") {
      alert("Enter key pressed! Progress reset.");
      e.preventDefault();
      e.stopPropagation();
      quickReset();
    }
  }

  // runs fetch functions and sets up audio, prepares autosave
  onMount(async () => {
    console.info("onMount beginning");
    audio = new Audio('/lib/audios/meow.mp3');
    await fetchState().catch((e) => console.error('Fetch failed:', e));
    loaded = true;
    saveInterval = setInterval(saveState, 60000);

    // Offline clicker logic: apply offline gain based on offlineClickerCount
    const lastClose = localStorage.getItem('barth_last_close');
    try {
    console.log("lastClose from localStorage:", lastClose);
    if (lastClose) {
      const lastMs = parseInt(lastClose, 10);
      if (!Number.isNaN(lastMs)) {
        const now = Date.now();
        console.info("Preparing to run offlineClicker")
        const offlineClickerGains = await runOfflineClicker(lastMs, now);
        if (Number.isNaN(offlineClickerGains)) {
          throw new Error('Invalid offline clicker gains');
        }
        count = Math.min(MAX_COUNT, count + offlineClickerGains);
        // save after adding offline gains
        saveState().catch(() => {});
      }
      localStorage.removeItem('barth_last_close');
    }
  } catch (e) {
    console.error('Error during offline clicker initialization:', e);
    showSaveMessage('An unexpected error has occurred with offline clicker logic.', 'error');
  }
  console.info("onMount completed successfully");
  });

  // runs logic for when the site is closed
  onDestroy(() => {
    clearAllClickers();
    if (saveInterval) clearInterval(saveInterval);
    // Save the current time to localStorage when the site is closed
    try {
      localStorage.setItem('barth_last_close', Date.now().toString());
    } catch (e) {
      console.error("Error saving last close time to localStorage:", e);
    }
  });
</script>

{#if saveMessage}
  <div class="save-popup {saveMessageType}">{saveMessage}</div>
{/if}

{#if loaded}
<main>
  <h1>Welcome to the Great Realm of Bartholomue!</h1>
  <h2>The best site ever</h2>
  <button class="button" on:click={incrementCount} on:keydown={handleKeydown}>
    Pet Bartholomue ✋🐈
  </button>
  <p>Bartholomue has been petted {count} times.</p>
  <p class="warningLabel">
    Warning, pressing "enter" with the site focused *will* reset your progress.
  </p>

  <button class="resetbutton" on:click={reset}>
    {confirmReset ? "Are you sure?" : "Reset"}
  </button>
  <button class="button" on:click={saveState}>Update</button>

  <br><br>

  <button class="button" on:click={buyClicker}>Add Clicker ({clickerCost} clicks)</button>
  <p>You have {clickerCount} clickers running, each adding {clickerGain} clicks/sec!</p>

  <br>

  <button class="button" on:click={buyMultiplier}>Add Multiplier ({multiplierCost} clicks)</button>
  <p>Each click is multiplied by {amountGained}!</p>

  <br>

  <button class="button" on:click={buyClickerMultiplier}>Add Clicker Multiplier ({clickerMultiplierCost} clicks)</button>

  <br><br>

  <button class="button" on:click={buyOfflineClicker}>Buy Offline Clicker ({offlineClickerCost} clicks)</button>
  <p>You have {offlineClickerCount} offline clickers. They earn 1 click per 10s each while you're away.</p>

  <div class="photogallery">
    <h2>Photo Gallery</h2>
    <div class="grid">
      <img src="/lib/images/bartholomue.png" alt="bartholomue the great">
      <img src="/lib/images/imAllEars.jpg" alt="i'm all ears looking ahh cat">
      <img src="/lib/images/catThatProbWantsFood.jpg" alt="cat that definitely wants food">
      <img src="/lib/images/bonk.jpg" alt="sneak attack">
      <img src="/lib/images/cat.png" alt="cat">
      <img src="/lib/images/cokecat.png" alt="coke cat">
      <img src="/lib/images/ohlawdhecoming.jpg" alt="chonky">
      <img src="/lib/images/protein.png" alt="protein shake">
      <img src="/lib/images/goob.jpeg" alt="goob">
    </div>
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
  /*stylesheets are fairly self-explanatory*/
  .warningLabel {
    color: red;
    font-weight: bold;
  }
  .resetbutton {
    background-color: red;
    color: white;
    font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
    border: none;
    border-radius: 25px;
    padding: 10px 20px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  .photogallery {
    width: 80%;
    margin: 0 auto;
    text-align: center;
  }
  .grid {
    column-count: 3;
    column-gap: 15px;
  }
  .grid img {
    width: 100%;
    margin-bottom: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    break-inside: avoid;
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