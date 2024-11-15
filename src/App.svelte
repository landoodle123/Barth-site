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

  // Load state from localStorage
  if (localStorage.getItem('count')) count = parseInt(localStorage.getItem('count'), 10);
  if (localStorage.getItem('clickerCount')) clickerCount = parseInt(localStorage.getItem('clickerCount'), 10);
  if (localStorage.getItem('clickerCost')) clickerCost = parseInt(localStorage.getItem('clickerCost'), 10);
  if (localStorage.getItem('multiplierCost')) multiplierCost = parseInt(localStorage.getItem('multiplierCost'), 10);
  if (localStorage.getItem('clickerMultiplierCost')) clickerMultiplierCost = parseInt(localStorage.getItem('clickerMultiplierCost'), 10);
  if (localStorage.getItem('amountGained')) amountGained = parseInt(localStorage.getItem('amountGained'), 10);
  if (localStorage.getItem('clickerGain')) clickerGain = parseInt(localStorage.getItem('clickerGain'), 10);

  // Save state to localStorage
  function saveState() {
    localStorage.setItem('count', count.toString());
    localStorage.setItem('clickerCount', clickerCount.toString());
    localStorage.setItem('clickerCost', clickerCost.toString());
    localStorage.setItem('multiplierCost', multiplierCost.toString());
    localStorage.setItem('clickerMultiplierCost', clickerMultiplierCost.toString());
    localStorage.setItem('amountGained', amountGained.toString());
    localStorage.setItem('clickerGain', clickerGain.toString());
    console.log('State saved to localStorage');
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

  function incrementCount() {
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
      setTimeout(() => (confirmReset = false), 3000); // Reset confirmation after 3 seconds
    }
  }

  // Restart intervals on page load
  for (let i = 0; i < clickerCount; i++) {
    startClicker();
  }
</script>