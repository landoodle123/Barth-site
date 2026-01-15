# /src/rouutes/+page.svelte:
This file contains the home page for the site.
**Variables:**
* MAX_COUNT: prevents overflow errors
* count: measures how many clicks the user has locally
* amountGained: amount of points user gains each click
* clickerCount: the amount of clickers the user has
* clickerCost: how much a clicker costs, increases each purchase
* multiplierCost: how much a multiplier costs
* clickerMultiplierCost: how much a clicker multiplier costs
* clickerGain: how much each clicker earns
* clickerInterval: time between clickers, used to keep clickers in time
* confirmReset: flag toggled when reset button pressed for the first time
* loaded: flag for load state
* saveInterval: time between saves
* audio: var for playing audio files
* audioWarningShown: warning if audio fails to initialize
* offlineClickerCount: number of offline clickers
* offlineClickerCost: how much an offline clicker costs
* playAudio: flag for mute switch
* saveMessage: message shown in user-facing save/error popup
* saveMessageType: variety of save message (error or save)
* clickTimeStamps, WINDOW, MS_INTVL, MS_VARNC: thou shalln't know

**Functions:**
* toNumber: handles bigints
* fetchstate: pulls data from server. if data cannot be pulled, it throws an error. if it can, it updates the variables. also runs offline clickers
* saveState: writes current variables to server, handles offline clicker logic, checks for ac
* showMessageBox: shows a message box with information about a save or an error
* clearAllClickers: erases clickers
* startAllClickers: stops clickers and starts them again
* buyClicker: adds a clicker, increases prices, and removes money.
* buyMultiplier and buyClickerMultiplier: same as buyClicker but for their individual upgrades
* buyOfflineClicker: adds offline clicker, increases prices, removes money, and checks for persistence.
* runOfflineClickers: checks values and uses those values to update clicker count based on the offlineClickers multiplier
* incrementCount: applies multipliers and adds click. also does ac stuff
* reset: handles reset button logic
* quickReset: sets all values to their starting values and saves
* handleKeydown: prevents exploit
* onMount: handles initialization logic
* onDestroy: handles exit logic

# /src/routes/api/game-state/+server.ts
This file handles the server.
**Variables:**
* prisma: database
* MAX_COUNT: stops overflows
* ANTICHEAT_JUMP: prevents unrealistic gains

**Functions:**
* RequestHandler: handles requests (shocking)
* POST: RequestHandler: handles outgoing requests (also shocking)
* prisma.gameState.upsert: database shennanigans