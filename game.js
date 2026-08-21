
/* =====================================================
   LOOTRUSH GAME.JS
===================================================== */
const STRIPE_SERVER_URL =
  "https://lootrush-jy0e.onrender.com";


/* =====================================================
   GLOBAL DATA
===================================================== */

let coins =
    Number(localStorage.getItem("coins")) || 150;

let diamonds =
    Number(localStorage.getItem("diamonds")) || 0;

let points =
    Number(localStorage.getItem("points")) || 0;

let totalRolls =
    Number(localStorage.getItem("totalRolls")) || 0;

let streak =
    Number(localStorage.getItem("streak")) || 0;

let bestStreak =
    Number(localStorage.getItem("bestStreak")) || 0;

let rareItems =
    Number(localStorage.getItem("rareItems")) || 0;

let playerName =
    localStorage.getItem("playerName") || "Guest";

let playerAvatar =
    localStorage.getItem("playerAvatar") ||
    "default-avatar.png";

let currentSkin =
    localStorage.getItem("currentSkin") ||
    "Default";

let inventory = [];

try {
    inventory =
        JSON.parse(
            localStorage.getItem("inventory")
        ) || [];
} catch {
    inventory = [];
}


/* =====================================================
   LOOT
===================================================== */

const loot = [

    {
        name: "Coin Bag",
        icon: "💰",
        rarity: "COMMON",
        description: "A small bag of coins.",
        reward: 50,
        type: "coins",
        chance: 45
    },

    {
        name: "Big Coin Bag",
        icon: "🪙",
        rarity: "UNCOMMON",
        description: "A bigger bag of coins.",
        reward: 100,
        type: "coins",
        chance: 25
    },

    {
        name: "Diamond",
        icon: "💎",
        rarity: "RARE",
        description: "A shiny diamond.",
        reward: 1,
        type: "diamonds",
        chance: 15
    },

    {
        name: "Diamond Pack",
        icon: "💎💎",
        rarity: "EPIC",
        description: "A pack of diamonds.",
        reward: 3,
        type: "diamonds",
        chance: 8
    },

    {
        name: "Golden Chest",
        icon: "🧰",
        rarity: "LEGENDARY",
        description: "A legendary golden chest.",
        reward: 500,
        type: "coins",
        chance: 5
    },

    {
        name: "Mystery Crown",
        icon: "👑",
        rarity: "MYTHIC",
        description: "An extremely rare item.",
        reward: 10,
        type: "diamonds",
        chance: 2
    }

];


/* =====================================================
   COIN SHOP
===================================================== */

const coinShop = [

    {
        name: "Shadow Skin",
        icon: "🌑",
        price: 500,
        type: "coins",
        skin: "Shadow"
    },

    {
        name: "Fire Skin",
        icon: "🔥",
        price: 1000,
        type: "coins",
        skin: "Fire"
    },

    {
        name: "Ice Skin",
        icon: "❄️",
        price: 1500,
        type: "coins",
        skin: "Ice"
    }

];


/* =====================================================
   DIAMOND SHOP
===================================================== */

const diamondShop = [

  {
    name: "50 Diamonds",
    icon: "💎",
    diamonds: 50,
    oldPrice: 50,
    price: 39.99,
    type: "dollarDiamonds",
    productId: "diamonds_50"
  },

  {
    name: "100 Diamonds",
    icon: "💎",
    diamonds: 100,
    oldPrice: 100,
    price: 69.99,
    type: "dollarDiamonds",
    productId: "diamonds_100"
  },

  {
    name: "250 Diamonds",
    icon: "💎",
    diamonds: 250,
    oldPrice: 250,
    price: 149.99,
    type: "dollarDiamonds",
    productId: "diamonds_250"
  },

  {
    name: "500 Diamonds",
    icon: "💎",
    diamonds: 500,
    oldPrice: 500,
    price: 249.99,
    type: "dollarDiamonds",
    productId: "diamonds_500"
  },

  {
    name: "1000 Diamonds",
    icon: "💎",
    diamonds: 1000,
    oldPrice: 1000,
    price: 399.99,
    type: "dollarDiamonds",
    productId: "diamonds_1000"
  }




/* =====================================================
   BOMBER
===================================================== */

let bomberBombs = 3;
let bomberBoard = [];
let bomberGameActive = false;
let bomberMultiplier = 1;
let bomberSafeCount = 0;
let bomberBet = 1;


/* =====================================================
   CRASH
===================================================== */

let crashGameActive = false;
let crashBet = 5;
let crashMultiplier = 1;
let crashStep = 0;
let crashMaxSteps = 10;
let crashHistory = [];

let crashWins =
    Number(localStorage.getItem("crashWins")) || 0;

let crashLosses =
    Number(localStorage.getItem("crashLosses")) || 0;

let crashTotalGames =
    Number(localStorage.getItem("crashTotalGames")) || 0;

let crashBestMultiplier =
    Number(localStorage.getItem("crashBestMultiplier")) || 0;

let crashTotalWon =
    Number(localStorage.getItem("crashTotalWon")) || 0;


/* =====================================================
   START
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateAllUI();

        initShop();

        renderInventory();

        initBomber();

        initCrashGame();

        checkAuth();

        startRewardTimer();

        checkStripePayment();

        renderCrashHistory();

        setInterval(saveGame, 3000);

    }
);


/* =====================================================
   SAVE
===================================================== */

function saveGame() {

    localStorage.setItem("coins", coins);
    localStorage.setItem("diamonds", diamonds);
    localStorage.setItem("points", points);
    localStorage.setItem("totalRolls", totalRolls);
    localStorage.setItem("streak", streak);
    localStorage.setItem("bestStreak", bestStreak);
    localStorage.setItem("rareItems", rareItems);

    localStorage.setItem(
        "inventory",
        JSON.stringify(inventory)
    );

    localStorage.setItem(
        "playerName",
        playerName
    );

    localStorage.setItem(
        "playerAvatar",
        playerAvatar
    );

    localStorage.setItem(
        "currentSkin",
        currentSkin
    );

    localStorage.setItem("crashWins", crashWins);
    localStorage.setItem("crashLosses", crashLosses);
    localStorage.setItem("crashTotalGames", crashTotalGames);
    localStorage.setItem(
        "crashBestMultiplier",
        crashBestMultiplier
    );
    localStorage.setItem(
        "crashTotalWon",
        crashTotalWon
    );
}


/* =====================================================
   UI
===================================================== */

function updateAllUI() {

    updateCurrency();
    updateStats();
    updateProfile();
    updateSkin();
    updateWallet();
    updateBomberUI();
    updateCrashUI();

}


function updateCurrency() {

    const c = document.getElementById("coins");
    const d = document.getElementById("diamonds");
    const p = document.getElementById("points");

    if (c) c.textContent = Math.floor(coins);
    if (d) d.textContent = Math.floor(diamonds);
    if (p) p.textContent = Math.floor(points);

}


function updateStats() {

    const rolls =
        document.getElementById("rolls");

    const streakElement =
        document.getElementById("streak");

    const rare =
        document.getElementById("rareItems");

    if (rolls)
        rolls.textContent = totalRolls;

    if (streakElement)
        streakElement.textContent = bestStreak;

    if (rare)
        rare.textContent = rareItems;

}


function updateProfile() {

    const name =
        document.getElementById("playerNameTop");

    const avatar =
        document.getElementById("playerAvatar");

    if (name)
        name.textContent = playerName;

    if (avatar)
        avatar.src = playerAvatar;

}


function updateSkin() {

    document.body.classList.remove(
        "skin-shadow",
        "skin-fire",
        "skin-ice"
    );

    if (
        currentSkin &&
        currentSkin !== "Default"
    ) {

        document.body.classList.add(
            "skin-" +
            currentSkin.toLowerCase()
        );

    }

}


/* =====================================================
   NAVIGATION
===================================================== */

function showPage(pageId) {

    document
        .querySelectorAll(".page")
        .forEach(page => {
            page.classList.add("hidden");
        });

    const page =
        document.getElementById(pageId);

    if (!page) return;

    page.classList.remove("hidden");

    if (pageId === "inventory")
        renderInventory();

    if (pageId === "wallet")
        updateWallet();

    if (pageId === "bomber")
        initBomber();

    if (pageId === "crash")
        initCrashGame();

}


/* =====================================================
   MESSAGE
===================================================== */

let messageTimer;

function showMessage(text) {

    const message =
        document.getElementById("message");

    if (!message) {
        console.log(text);
        return;
    }

    message.textContent = text;

    message.classList.add("show");

    clearTimeout(messageTimer);

    messageTimer = setTimeout(
        () => {
            message.classList.remove("show");
        },
        2500
    );

}


/* =====================================================
   RANDOM LOOT
===================================================== */

function getRandomLoot() {

    const random =
        Math.random() * 100;

    let current = 0;

    for (const item of loot) {

        current += item.chance;

        if (random <= current)
            return item;

    }

    return loot[0];

}


/* =====================================================
   ROLL
===================================================== */

function rollLoot() {

    const cost = 150;

    if (coins < cost) {

        showMessage(
            "❌ Not enough coins!"
        );

        return;
    }

    coins -= cost;

    totalRolls++;

    const item = getRandomLoot();

    if (
        [
            "RARE",
            "EPIC",
            "LEGENDARY",
            "MYTHIC"
        ].includes(item.rarity)
    ) {

        rareItems++;

        streak++;

        if (streak > bestStreak)
            bestStreak = streak;

    } else {

        streak = 0;

    }

    if (item.type === "coins")
        coins += item.reward;

    if (item.type === "diamonds")
        diamonds += item.reward;

    addInventoryItem(item);

    const rarity =
        document.getElementById("rarity");

    const icon =
        document.getElementById("lootIcon");

    const name =
        document.getElementById("lootName");

    const description =
        document.getElementById("lootDescription");

    const reward =
        document.getElementById("reward");

    if (rarity)
        rarity.textContent = item.rarity;

    if (icon)
        icon.textContent = item.icon;

    if (name)
        name.textContent = item.name;

    if (description)
        description.textContent =
            item.description;

    if (reward) {

        reward.textContent =
            item.type === "coins"
                ? `+${item.reward} 💵`
                : `+${item.reward} 💎`;

    }

    updateAllUI();

    renderInventory();

    saveGame();

    showMessage(
        `🎉 You won ${item.name}!`
    );

}


/* =====================================================
   INVENTORY
===================================================== */

function addInventoryItem(item) {

    const existing =
        inventory.find(
            x => x.name === item.name
        );

    if (existing) {

        existing.amount =
            Number(existing.amount || 0) + 1;

    } else {

        inventory.push({

            name: item.name,
            icon: item.icon,
            rarity: item.rarity,
            amount: 1

        });

    }

}


function renderInventory() {

    const container =
        document.getElementById(
            "inventoryItems"
        );

    if (!container) return;

    container.innerHTML = "";

    if (!inventory.length) {

        container.innerHTML = `
            <div class="empty-item">
                <div class="empty-icon">🎒</div>
                <h2>Inventory is empty</h2>
                <p>Play the game and collect rewards!</p>
            </div>
        `;

        return;
    }

    inventory.forEach(item => {

        const card =
            document.createElement("div");

        card.className = "item inventory-card";

        card.innerHTML = `

            <div class="item-icon">
                ${item.icon}
            </div>

            <h2>
                ${item.name}
            </h2>

            <p>
                ${item.rarity}
            </p>

            <strong>
                ×${item.amount}
            </strong>

        `;

        container.appendChild(card);

    });

}


/* =====================================================
   SHOP
===================================================== */

function initShop() {

    renderShop(
        "coinShopItems",
        coinShop
    );

    renderShop(
        "diamondShopItems",
        diamondShop
    );

}


function renderShop(containerId, items) {

    const container =
        document.getElementById(containerId);

    if (!container) return;

    container.innerHTML = "";

    items.forEach(item => {

        const card =
            document.createElement("div");

        card.className = "item";

        let priceHTML = "";

        if (item.type === "coins") {

            priceHTML = `
                <strong>
                    ${item.price} 💵
                </strong>
            `;

        }

        if (item.type === "dollarDiamonds") {

            priceHTML = `

                <div class="diamond-price">

                    <span class="old-price">
                        $${item.oldPrice}
                    </span>

                    <span class="new-price">
                        $${item.price}
                    </span>

                </div>

                <p>
                    Get ${item.diamonds} 💎
                </p>

            `;

        }

        card.innerHTML = `

            <div class="item-icon">
                ${item.icon}
            </div>

            <h2>
                ${item.name}
            </h2>

            ${priceHTML}

            <button
                class="buy-button"
            >
                Buy
            </button>

        `;

        card
            .querySelector(".buy-button")
            .addEventListener(
                "click",
                () => buySkin(item)
            );

        container.appendChild(card);

    });

}


/* =====================================================
   BUY
===================================================== */

async function buySkin(item) {

    if (item.type === "coins") {

        if (coins < item.price) {

            showMessage(
                "❌ Not enough coins!"
            );

            return;
        }

        coins -= item.price;

        addInventoryItem({
            name: item.name,
            icon: item.icon,
            rarity: "SHOP"
        });

        if (item.skin)
            currentSkin = item.skin;

        updateAllUI();

        renderInventory();

        saveGame();

        showMessage(
            `✅ ${item.name} purchased!`
        );

        return;
    }


    if (item.type === "dollarDiamonds") {

        await buyWithStripe(item);

        return;
    }

    showMessage(
        "❌ Unknown product."
    );

}


/* =====================================================
   STRIPE
===================================================== */

async function buyWithStripe(item) {

  try {

    showMessage("⏳ Opening Stripe Checkout...");

    if (!item.productId) {

      showMessage(
        "❌ Product ID is missing."
      );

      return;
    }

    const response = await fetch(
      `${STRIPE_SERVER_URL}/create-checkout-session`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          productId:
            item.productId

        })

      }
    );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.error ||
        "Stripe Checkout error."
      );

    }


    if (!data.url) {

      throw new Error(
        "Stripe Checkout URL missing."
      );

    }


    window.location.href =
      data.url;


  } catch (error) {

    console.error(
      "Stripe error:",
      error
    );

    showMessage(
      "❌ Stripe payment could not be started."
    );

  }

}

/* =====================================================
   STRIPE SUCCESS
===================================================== */

async function checkStripePayment() {

  const params =
    new URLSearchParams(
      window.location.search
    );


  const payment =
    params.get("payment");

  const sessionId =
    params.get("session_id");


  /* ==========================================
     PAYMENT CANCEL
  ========================================== */

  if (payment === "cancel") {

    showMessage(
      "❌ Payment cancelled."
    );


    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    );


    return;
  }


  /* ==========================================
     PAYMENT SUCCESS
  ========================================== */

  if (
    payment !== "success" ||
    !sessionId
  ) {

    return;

  }


  try {

    showMessage(
      "⏳ Verifying payment..."
    );


    const response =
      await fetch(
        `${STRIPE_SERVER_URL}/verify-payment?session_id=${encodeURIComponent(sessionId)}`
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.error ||
        "Payment verification failed."
      );

    }


    /* ==========================================
       PAYMENT CONFIRMED
    ========================================== */

    if (
      data.success === true &&
      data.paid === true &&
      Number(data.diamonds) > 0
    ) {

      const diamondsToAdd =
        Number(
          data.diamonds
        );


      diamonds +=
        diamondsToAdd;


      updateAllUI();

      saveGame();


      showMessage(
        `✅ Payment successful! +${diamondsToAdd} 💎 added.`
      );


    } else {

      showMessage(
        "❌ Payment was not completed."
      );

    }


  } catch (error) {

    console.error(
      "Payment verification error:",
      error
    );


    showMessage(
      "❌ Could not verify Stripe payment."
    );


  } finally {

    /* ==========================================
       CLEAN URL
    ========================================== */

    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    );

  }

}


/* =====================================================
   AUTH
===================================================== */

function checkAuth() {

    const overlay =
        document.getElementById(
            "authOverlay"
        );

    if (!overlay) return;

    const loggedIn =
        localStorage.getItem(
            "loggedIn"
        );

    if (loggedIn === "true") {

        overlay.classList.add("hidden");

    } else {

        overlay.classList.remove("hidden");

    }

}


function switchAuthForm(type) {

    const login =
        document.getElementById(
            "loginForm"
        );

    const register =
        document.getElementById(
            "registerForm"
        );

    if (!login || !register)
        return;

    if (type === "login") {

        login.classList.remove("hidden");
        register.classList.add("hidden");

    } else {

        login.classList.add("hidden");
        register.classList.remove("hidden");

    }

}


/* =====================================================
   REGISTER
===================================================== */

function handleRegister() {

    const username =
        document.getElementById(
            "regUsername"
        ).value.trim();

    const email =
        document.getElementById(
            "regEmail"
        ).value.trim();

    const password =
        document.getElementById(
            "regPassword"
        ).value;

    if (!username || !email || !password) {

        showMessage(
            "❌ Fill all fields."
        );

        return;
    }

    if (username.length < 3) {

        showMessage(
            "❌ Username must be at least 3 characters."
        );

        return;
    }

    if (!email.includes("@")) {

        showMessage(
            "❌ Invalid email."
        );

        return;
    }

    if (password.length < 4) {

        showMessage(
            "❌ Password is too short."
        );

        return;
    }

    localStorage.setItem(
        "registeredUsername",
        username
    );

    localStorage.setItem(
        "registeredEmail",
        email
    );

    localStorage.setItem(
        "registeredPassword",
        password
    );

    playerName = username;

    localStorage.setItem(
        "playerName",
        username
    );

    localStorage.setItem(
        "loggedIn",
        "false"
    );

    showMessage(
        "✅ Account created! Please login."
    );

    setTimeout(
        () => {

            switchAuthForm("login");

            document.getElementById(
                "loginEmail"
            ).value = email;

        },
        500
    );

}


/* =====================================================
   LOGIN
===================================================== */

function handleLogin() {

    const email =
        document.getElementById(
            "loginEmail"
        ).value.trim();

    const password =
        document.getElementById(
            "loginPassword"
        ).value;

    const savedEmail =
        localStorage.getItem(
            "registeredEmail"
        );

    const savedPassword =
        localStorage.getItem(
            "registeredPassword"
        );

    const savedUsername =
        localStorage.getItem(
            "registeredUsername"
        );

    if (!email || !password) {

        showMessage(
            "❌ Enter email and password."
        );

        return;
    }

    if (!savedEmail || !savedPassword) {

        showMessage(
            "❌ No account found. Register first."
        );

        return;
    }

    if (
        email.toLowerCase() !==
        savedEmail.toLowerCase() ||
        password !== savedPassword
    ) {

        showMessage(
            "❌ Wrong email or password."
        );

        return;
    }

    localStorage.setItem(
        "loggedIn",
        "true"
    );

    playerName =
        savedUsername || "Guest";

    localStorage.setItem(
        "playerName",
        playerName
    );

    const overlay =
        document.getElementById(
            "authOverlay"
        );

    if (overlay)
        overlay.classList.add("hidden");

    document.getElementById(
        "loginPassword"
    ).value = "";

    updateAllUI();

    saveGame();

    showMessage(
        `✅ Welcome ${playerName}!`
    );

}


/* =====================================================
   LOGOUT
===================================================== */

function logout() {

    localStorage.setItem(
        "loggedIn",
        "false"
    );

    const overlay =
        document.getElementById(
            "authOverlay"
        );

    if (overlay)
        overlay.classList.remove("hidden");

    switchAuthForm("login");

}


/* =====================================================
   PROFILE MENU
===================================================== */

function togglePlayerMenu() {

    const dropdown =
        document.getElementById(
            "profileDropdown"
        );

    if (dropdown)
        dropdown.classList.toggle("show");

}


/* =====================================================
   DAILY REWARDS
===================================================== */

const dailyRewards = [

    {
        type: "coins",
        amount: 50
    },

    {
        type: "coins",
        amount: 100
    },

    {
        type: "diamonds",
        amount: 1
    },

    {
        type: "coins",
        amount: 250
    },

    {
        type: "diamonds",
        amount: 2
    },

    {
        type: "coins",
        amount: 500
    },

    {
        type: "diamonds",
        amount: 5
    }

];


function claimDailyReward() {

    const today =
        new Date().toDateString();

    const last =
        localStorage.getItem(
            "lastDailyReward"
        );

    if (today === last) {

        showMessage(
            "⏳ Already claimed today."
        );

        return;
    }

    let day =
        Number(
            localStorage.getItem(
                "rewardDay"
            )
        ) || 1;

    if (day < 1 || day > 7)
        day = 1;

    const reward =
        dailyRewards[day - 1];

    if (reward.type === "coins")
        coins += reward.amount;
    else
        diamonds += reward.amount;

    localStorage.setItem(
        "lastDailyReward",
        today
    );

    localStorage.setItem(
        "rewardDay",
        day >= 7 ? 1 : day + 1
    );

    updateAllUI();

    saveGame();

    showMessage(
        reward.type === "coins"
            ? `🎁 +${reward.amount} 💵`
            : `🎁 +${reward.amount} 💎`
    );

}


function startRewardTimer() {

    function update() {

        const timer =
            document.getElementById(
                "rewardTimer"
            );

        if (!timer) return;

        const now = new Date();

        const tomorrow =
            new Date(now);

        tomorrow.setDate(
            now.getDate() + 1
        );

        tomorrow.setHours(
            0,
            0,
            0,
            0
        );

        const diff =
            tomorrow - now;

        const h =
            Math.floor(
                diff / 3600000
            );

        const m =
            Math.floor(
                (diff % 3600000) / 60000
            );

        const s =
            Math.floor(
                (diff % 60000) / 1000
            );

        timer.textContent =
            `Next reward in ${h}h ${m}m ${s}s`;

    }

    update();

    setInterval(update, 1000);

}


/* =====================================================
   BOMBER
===================================================== */

function initBomber() {

    const selector =
        document.getElementById(
            "bomberBombSelector"
        );

    if (selector)
        bomberBombs =
            Number(selector.value) || 3;

    createBomberBoard();

    updateBomberUI();

}


function changeBomberBombs() {

    if (bomberGameActive) {

        showMessage(
            "❌ Finish current game first."
        );

        return;
    }

    const selector =
        document.getElementById(
            "bomberBombSelector"
        );

    if (selector)
        bomberBombs =
            Number(selector.value) || 3;

    createBomberBoard();

    updateBomberUI();

}


function createBomberBoard() {

    const board =
        document.getElementById(
            "bomberBoard"
        );

    if (!board) return;

    board.innerHTML = "";

    bomberBoard = [];

    for (let i = 0; i < 25; i++) {

        const button =
            document.createElement("button");

        button.className =
            "bomber-cell";

        button.textContent = "❓";

        button.disabled =
            !bomberGameActive;

        button.onclick =
            () => openBomberCell(i);

        board.appendChild(button);

        bomberBoard.push({
            bomb: false,
            opened: false
        });

    }

}


function startBomberGame() {

    if (bomberGameActive)
        return;

    if (diamonds < bomberBet) {

        showMessage(
            "❌ You need 1 💎."
        );

        return;
    }

    diamonds -= bomberBet;

    bomberGameActive = true;
    bomberMultiplier = 1;
    bomberSafeCount = 0;

    bomberBoard =
        Array.from(
            { length: 25 },
            () => ({
                bomb: false,
                opened: false
            })
        );

    let bombs = 0;

    while (bombs < bomberBombs) {

        const index =
            Math.floor(
                Math.random() * 25
            );

        if (!bomberBoard[index].bomb) {

            bomberBoard[index].bomb = true;

            bombs++;

        }

    }

    createBomberBoard();

    document
        .querySelectorAll(".bomber-cell")
        .forEach(
            cell => cell.disabled = false
        );

    const start =
        document.getElementById(
            "bomberStartButton"
        );

    if (start)
        start.disabled = true;

    updateAllUI();

    updateBomberUI();

}


function openBomberCell(index) {

    if (!bomberGameActive)
        return;

    const data =
        bomberBoard[index];

    if (!data || data.opened)
        return;

    const cells =
        document.querySelectorAll(
            ".bomber-cell"
        );

    const cell = cells[index];

    data.opened = true;

    if (data.bomb) {

        cell.textContent = "💣";

        bomberGameActive = false;

        revealBomberBoard();

        updateBomberUI();

        showMessage(
            "💥 BOOM!"
        );

        return;
    }

    bomberSafeCount++;

    bomberMultiplier =
        Number(
            (
                1 +
                bomberSafeCount *
                (bomberBombs / 20)
            ).toFixed(2)
        );

    cell.textContent = "💎";

    cell.classList.add("safe");

    cell.disabled = true;

    const cashout =
        document.getElementById(
            "bomberCashoutButton"
        );

    if (cashout)
        cashout.disabled = false;

    updateBomberUI();

}


function cashOutBomber() {

    if (!bomberGameActive)
        return;

    const win =
        Math.max(
            1,
            Math.floor(
                bomberMultiplier
            )
        );

    diamonds += win;

    bomberGameActive = false;

    revealBomberBoard();

    updateAllUI();

    updateBomberUI();

    saveGame();

    showMessage(
        `💰 Cash Out +${win} 💎`
    );

}


function revealBomberBoard() {

    document
        .querySelectorAll(".bomber-cell")
        .forEach(
            (cell, index) => {

                cell.disabled = true;

                if (
                    bomberBoard[index] &&
                    bomberBoard[index].bomb
                ) {

                    cell.textContent = "💣";

                }

            }
        );

}


function updateBomberUI() {

    const bombs =
        document.getElementById(
            "bombCount"
        );

    const safe =
        document.getElementById(
            "safeCount"
        );

    const multiplier =
        document.getElementById(
            "bomberMultiplier"
        );

    const status =
        document.getElementById(
            "bomberStatus"
        );

    if (bombs)
        bombs.textContent = bomberBombs;

    if (safe)
        safe.textContent = bomberSafeCount;

    if (multiplier)
        multiplier.textContent =
            bomberMultiplier.toFixed(2) + "x";

    if (status)
        status.textContent =
            bomberGameActive
                ? "PLAYING"
                : "READY";

}


/* =====================================================
   CRASH
===================================================== */

function initCrashGame() {

    updateCrashUI();

    renderCrashHistory();

}


function startCrashGame() {

    if (crashGameActive)
        return;

    const input =
        document.getElementById(
            "crashBet"
        );

    crashBet =
        Math.max(
            1,
            Math.floor(
                Number(input?.value) || 5
            )
        );

    if (diamonds < crashBet) {

        showMessage(
            "❌ Not enough diamonds."
        );

        return;
    }

    diamonds -= crashBet;

    crashGameActive = true;
    crashMultiplier = 1;
    crashStep = 0;
    crashHistory = [];

    updateAllUI();

    updateCrashUI();

    runCrashStep();

}


function runCrashStep() {

    if (!crashGameActive)
        return;

    if (crashStep >= crashMaxSteps) {

        crashAutoWin();

        return;
    }

    crashStep++;

    const crashChance =
        crashMultiplier < 2
            ? 0.18
            : crashMultiplier < 3
                ? 0.25
                : crashMultiplier < 5
                    ? 0.34
                    : 0.45;

    if (
        Math.random() <
        crashChance
    ) {

        crashGameLose();

        return;

    }

    const growth =
        0.15 +
        Math.random() * 0.85;

    crashMultiplier =
        Number(
            (
                crashMultiplier +
                growth
            ).toFixed(2)
        );

    if (
        crashMultiplier >
        crashBestMultiplier
    )
        crashBestMultiplier =
            crashMultiplier;

    crashHistory.push(
        crashMultiplier
    );

    updateCrashUI();

    setTimeout(
        runCrashStep,
        900
    );

}


function cashOutCrash() {

    if (!crashGameActive)
        return;

    const win =
        Number(
            (
                crashBet *
                crashMultiplier
            ).toFixed(2)
        );

    diamonds += win;

    crashGameActive = false;

    crashWins++;
    crashTotalGames++;
    crashTotalWon += win;

    saveGame();

    updateAllUI();

    updateCrashUI();

    renderCrashHistory();

    showMessage(
        `💰 CASH OUT +${win.toFixed(2)} 💎`
    );

}


function crashGameLose() {

    crashGameActive = false;

    crashLosses++;
    crashTotalGames++;

    saveGame();

    updateAllUI();

    updateCrashUI();

    renderCrashHistory();

    showMessage(
        `💥 CRASH at ${crashMultiplier.toFixed(2)}x`
    );

}


function crashAutoWin() {

    if (!crashGameActive)
        return;

    const win =
        Number(
            (
                crashBet *
                crashMultiplier
            ).toFixed(2)
        );

    diamonds += win;

    crashGameActive = false;

    crashWins++;
    crashTotalGames++;
    crashTotalWon += win;

    saveGame();

    updateAllUI();

    updateCrashUI();

    renderCrashHistory();

    showMessage(
        `🏆 +${win.toFixed(2)} 💎`
    );

}


function updateCrashUI() {

    const multiplier =
        document.getElementById(
            "crashMultiplier"
        );

    const step =
        document.getElementById(
            "crashStep"
        );

    const bet =
        document.getElementById(
            "crashCurrentBet"
        );

    const win =
        document.getElementById(
            "crashPotentialWin"
        );

    if (multiplier)
        multiplier.textContent =
            crashMultiplier.toFixed(2) + "x";

    if (step)
        step.textContent =
            `${crashStep} / ${crashMaxSteps}`;

    if (bet)
        bet.textContent =
            crashBet.toFixed(2) + " 💎";

    if (win)
        win.textContent =
            (
                crashBet *
                crashMultiplier
            ).toFixed(2) + " 💎";

    const start =
        document.getElementById(
            "crashStartButton"
        );

    const cashout =
        document.getElementById(
            "crashCashoutButton"
        );

    if (start)
        start.disabled = crashGameActive;

    if (cashout)
        cashout.disabled = !crashGameActive;

    renderCrashGraph();

}


function renderCrashGraph() {

    const graph =
        document.getElementById(
            "crashGraph"
        );

    if (!graph)
        return;

    graph.innerHTML = "";

    if (!crashHistory.length) {

        graph.innerHTML =
            "<div>🚀 Start the game</div>";

        return;
    }

    crashHistory.forEach(
        (value, index) => {

            const point =
                document.createElement("div");

            point.className =
                "crash-point";

            point.innerHTML =
                `${index + 1}: <strong>${value.toFixed(2)}x</strong>`;

            graph.appendChild(point);

        }
    );

}


function renderCrashHistory() {

    const history =
        document.getElementById(
            "crashHistory"
        );

    if (!history)
        return;

    history.innerHTML = `

        <div>
            🎮 Games:
            <strong>${crashTotalGames}</strong>
        </div>

        <div>
            🏆 Wins:
            <strong>${crashWins}</strong>
        </div>

        <div>
            💥 Losses:
            <strong>${crashLosses}</strong>
        </div>

        <div>
            📈 Best:
            <strong>${crashBestMultiplier.toFixed(2)}x</strong>
        </div>

        <div>
            💰 Total Won:
            <strong>${crashTotalWon.toFixed(2)} 💎</strong>
        </div>

    `;

}


/* =====================================================
   WALLET
===================================================== */

function updateWallet() {

    const pointsElement =
        document.getElementById(
            "walletPoints"
        );

    const diamondsElement =
        document.getElementById(
            "walletDiamonds"
        );

    const valueElement =
        document.getElementById(
            "walletDollarValue"
        );

    if (pointsElement)
        pointsElement.textContent =
            Math.floor(points);

    if (diamondsElement)
        diamondsElement.textContent =
            Math.floor(diamonds);

    if (valueElement)
        valueElement.textContent =
            diamonds.toFixed(2);

    updateWithdrawValue();

    renderWithdrawalHistory();

}


function convertPointsToDiamonds() {

    if (points < 1000) {

        showMessage(
            "❌ Need 1000 points."
        );

        return;
    }

    points -= 1000;

    diamonds += 1;

    updateAllUI();

    saveGame();

    showMessage(
        "⭐ 1000 points = 1 💎"
    );

}


function updateWithdrawValue() {

    const input =
        document.getElementById(
            "withdrawDiamonds"
        );

    const output =
        document.getElementById(
            "withdrawDollarValue"
        );

    if (!input || !output)
        return;

    output.textContent =
        (
            Number(input.value) || 0
        ).toFixed(2);

}


function formatCardNumber(input) {

    let value =
        input.value
            .replace(/\D/g, "")
            .substring(0, 16);

    const parts = [];

    for (
        let i = 0;
        i < value.length;
        i += 4
    ) {

        parts.push(
            value.substring(
                i,
                i + 4
            )
        );

    }

    input.value =
        parts.join(" ");

}


function createWithdrawalRequest() {

    const amount =
        Number(
            document.getElementById(
                "withdrawDiamonds"
            )?.value
        );

    const name =
        document.getElementById(
            "withdrawName"
        )?.value.trim();

    const card =
        document.getElementById(
            "withdrawCard"
        )?.value.trim();

    if (!amount || amount <= 0) {

        showMessage(
            "❌ Enter amount."
        );

        return;
    }

    if (amount > diamonds) {

        showMessage(
            "❌ Not enough diamonds."
        );

        return;
    }

    if (!name || !card) {

        showMessage(
            "❌ Fill all fields."
        );

        return;
    }

    const clean =
        card.replace(/\D/g, "");

    if (clean.length < 4) {

        showMessage(
            "❌ Invalid card."
        );

        return;
    }

    diamonds -= amount;

    let requests = [];

    try {

        requests =
            JSON.parse(
                localStorage.getItem(
                    "withdrawals"
                )
            ) || [];

    } catch {

        requests = [];

    }

    requests.push({

        amount,
        name,

        card:
            "**** **** **** " +
            clean.slice(-4),

        status: "Pending",

        date:
            new Date().toLocaleString()

    });

    localStorage.setItem(
        "withdrawals",
        JSON.stringify(requests)
    );

    updateAllUI();

    saveGame();

    showMessage(
        "📤 Withdrawal request sent."
    );

}


function renderWithdrawalHistory() {

    const container =
        document.getElementById(
            "withdrawalHistory"
        );

    if (!container)
        return;

    let requests = [];

    try {

        requests =
            JSON.parse(
                localStorage.getItem(
                    "withdrawals"
                )
            ) || [];

    } catch {

        requests = [];

    }

    if (!requests.length) {

        container.innerHTML =
            "<p>📋 No withdrawals yet.</p>";

        return;
    }

    container.innerHTML =
        requests
            .map(
                request => `

                    <div class="item">

                        <h3>
                            💎 ${Number(
                                request.amount
                            ).toFixed(2)}
                        </h3>

                        <p>
                            ${request.name}
                        </p>

                        <p>
                            ${request.card}
                        </p>

                        <strong>
                            ${request.status}
                        </strong>

                        <p>
                            ${request.date}
                        </p>

                    </div>

                `
            )
            .join("");

}


/* =====================================================
   GLOBAL
===================================================== */

document.addEventListener(
    "click",
    event => {

        const menu =
            document.querySelector(
                ".player-menu"
            );

        const dropdown =
            document.getElementById(
                "profileDropdown"
            );

        if (
            menu &&
            dropdown &&
            !menu.contains(event.target)
        ) {

            dropdown.classList.remove(
                "show"
            );

        }

    }
);


document.addEventListener(
    "keydown",
    event => {

        if (
            event.code === "Space" &&
            crashGameActive
        ) {

            event.preventDefault();

            cashOutCrash();

        }

    }
);


window.addEventListener(
    "beforeunload",
    saveGame
);


saveGame();
