/* =====================================================
   LOOTRUSH - COMPLETE GAME.JS
   FIXED VERSION
   LOGIN + REGISTER
   STRIPE
   SHOP
   RANDOM LOOT
   INVENTORY
   DAILY REWARDS
   BOMBER
   CRASH
   WALLET
===================================================== */


/* =====================================================
   STRIPE SERVER
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


/* =====================================================
   INVENTORY
===================================================== */

let inventory = [];

try {
  inventory =
    JSON.parse(
      localStorage.getItem("inventory")
    ) || [];
} catch (error) {
  console.error(
    "Inventory parse error:",
    error
  );

  inventory = [];
}


/* =====================================================
   PLAYER
===================================================== */

let currentSkin =
  localStorage.getItem("currentSkin") ||
  "Default";

let playerName =
  localStorage.getItem("playerName") ||
  "Guest";

let playerAvatar =
  localStorage.getItem("playerAvatar") ||
  "default-avatar.png";


/* =====================================================
   RANDOM LOOT
===================================================== */

const loot = [

  {
    name: "Coin Bag",
    icon: "💰",
    rarity: "COMMON",
    description:
      "A small bag of coins.",
    reward: 50,
    type: "coins",
    chance: 45
  },

  {
    name: "Big Coin Bag",
    icon: "🪙",
    rarity: "UNCOMMON",
    description:
      "A bigger bag of coins.",
    reward: 100,
    type: "coins",
    chance: 25
  },

  {
    name: "Diamond",
    icon: "💎",
    rarity: "RARE",
    description:
      "A shiny diamond.",
    reward: 1,
    type: "diamonds",
    chance: 15
  },

  {
    name: "Diamond Pack",
    icon: "💎💎",
    rarity: "EPIC",
    description:
      "A pack containing diamonds.",
    reward: 3,
    type: "diamonds",
    chance: 8
  },

  {
    name: "Golden Chest",
    icon: "🧰",
    rarity: "LEGENDARY",
    description:
      "A legendary golden chest.",
    reward: 500,
    type: "coins",
    chance: 5
  },

  {
    name: "Mystery Crown",
    icon: "👑",
    rarity: "MYTHIC",
    description:
      "An extremely rare item.",
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
   DIAMOND SHOP - STRIPE
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

];


/* =====================================================
   BOMBER VARIABLES
===================================================== */

let bomberBombs = 3;
let bomberBoard = [];
let bomberGameActive = false;
let bomberMultiplier = 1;
let bomberSafeCount = 0;
let bomberBet = 1;


/* =====================================================
   CRASH VARIABLES
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
  Number(
    localStorage.getItem(
      "crashBestMultiplier"
    )
  ) || 0;

let crashTotalWon =
  Number(localStorage.getItem("crashTotalWon")) || 0;


/* =====================================================
   MESSAGE TIMER
===================================================== */

let messageTimer;


/* =====================================================
   DOM READY
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    updateAllUI();

    initShop();

    renderInventory();

    initBomber();

    initCrashGame();

    checkAuth();

    startRewardTimer();

    checkStripePayment();

    renderCrashHistory();

    setInterval(
      saveGame,
      3000
    );

  }
);


/* =====================================================
   SAVE GAME
===================================================== */

function saveGame() {

  localStorage.setItem(
    "coins",
    coins
  );

  localStorage.setItem(
    "diamonds",
    diamonds
  );

  localStorage.setItem(
    "points",
    points
  );

  localStorage.setItem(
    "totalRolls",
    totalRolls
  );

  localStorage.setItem(
    "streak",
    streak
  );

  localStorage.setItem(
    "bestStreak",
    bestStreak
  );

  localStorage.setItem(
    "rareItems",
    rareItems
  );

  localStorage.setItem(
    "inventory",
    JSON.stringify(inventory)
  );

  localStorage.setItem(
    "currentSkin",
    currentSkin
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
    "crashWins",
    crashWins
  );

  localStorage.setItem(
    "crashLosses",
    crashLosses
  );

  localStorage.setItem(
    "crashTotalGames",
    crashTotalGames
  );

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
   UPDATE ALL UI
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


/* =====================================================
   CURRENCY
===================================================== */

function updateCurrency() {

  const coinsElement =
    document.getElementById("coins");

  const diamondsElement =
    document.getElementById("diamonds");

  const pointsElement =
    document.getElementById("points");


  if (coinsElement) {
    coinsElement.textContent =
      Math.floor(coins);
  }

  if (diamondsElement) {
    diamondsElement.textContent =
      Math.floor(diamonds);
  }

  if (pointsElement) {
    pointsElement.textContent =
      Math.floor(points);
  }

}


/* =====================================================
   STATS
===================================================== */

function updateStats() {

  const rollsElement =
    document.getElementById("rolls");

  const streakElement =
    document.getElementById("streak");

  const rareElement =
    document.getElementById("rareItems");


  if (rollsElement) {
    rollsElement.textContent =
      totalRolls;
  }

  if (streakElement) {
    streakElement.textContent =
      bestStreak;
  }

  if (rareElement) {
    rareElement.textContent =
      rareItems;
  }

}


/* =====================================================
   PROFILE
===================================================== */

function updateProfile() {

  const playerNameElement =
    document.getElementById(
      "playerName"
    );

  const playerNameTopElement =
    document.getElementById(
      "playerNameTop"
    );

  const avatarElement =
    document.getElementById(
      "playerAvatar"
    );


  if (playerNameElement) {
    playerNameElement.textContent =
      playerName;
  }

  if (playerNameTopElement) {
    playerNameTopElement.textContent =
      playerName;
  }

  if (avatarElement) {
    avatarElement.src =
      playerAvatar;
  }

}


/* =====================================================
   SKIN
===================================================== */

function updateSkin() {

  const skinElement =
    document.getElementById(
      "currentSkin"
    );


  if (skinElement) {
    skinElement.textContent =
      currentSkin;
  }


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
    .forEach(
      function (page) {

        page.classList.add(
          "hidden"
        );

      }
    );


  const page =
    document.getElementById(
      pageId
    );


  if (page) {

    page.classList.remove(
      "hidden"
    );

  }


  if (pageId === "inventory") {
    renderInventory();
  }

  if (pageId === "wallet") {
    updateWallet();
  }

  if (pageId === "bomber") {
    initBomber();
  }

  if (pageId === "crash") {
    initCrashGame();
  }

}


/* =====================================================
   MESSAGE
===================================================== */

function showMessage(text) {

  const message =
    document.getElementById(
      "message"
    );


  if (!message) {

    console.log(text);

    return;
  }


  message.textContent =
    text;

  message.classList.add(
    "show"
  );


  clearTimeout(
    messageTimer
  );


  messageTimer =
    setTimeout(
      function () {

        message.classList.remove(
          "show"
        );

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


  for (
    const item of loot
  ) {

    current +=
      item.chance;


    if (
      random <= current
    ) {

      return item;

    }

  }


  return loot[0];

}


/* =====================================================
   ROLL LOOT
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


  const item =
    getRandomLoot();


  if (
    [
      "RARE",
      "EPIC",
      "LEGENDARY",
      "MYTHIC"
    ].includes(
      item.rarity
    )
  ) {

    rareItems++;

    streak++;


    if (
      streak >
      bestStreak
    ) {

      bestStreak =
        streak;

    }

  } else {

    streak = 0;

  }


  if (
    item.type === "coins"
  ) {

    coins +=
      item.reward;

  }


  if (
    item.type === "diamonds"
  ) {

    diamonds +=
      item.reward;

  }


  addInventoryItem(
    item
  );


  const rarity =
    document.getElementById(
      "rarity"
    );

  const icon =
    document.getElementById(
      "lootIcon"
    );

  const name =
    document.getElementById(
      "lootName"
    );

  const description =
    document.getElementById(
      "lootDescription"
    );

  const reward =
    document.getElementById(
      "reward"
    );


  if (rarity) {
    rarity.textContent =
      item.rarity;
  }

  if (icon) {
    icon.textContent =
      item.icon;
  }

  if (name) {
    name.textContent =
      item.name;
  }

  if (description) {
    description.textContent =
      item.description;
  }

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
      function (x) {
        return x.name === item.name;
      }
    );


  if (existing) {

    existing.amount =
      Number(existing.amount || 0) + 1;

  } else {

    inventory.push({

      name:
        item.name,

      icon:
        item.icon,

      rarity:
        item.rarity,

      amount:
        1

    });

  }

}


/* =====================================================
   RENDER INVENTORY
===================================================== */

function renderInventory() {

  const container =
    document.getElementById(
      "inventoryItems"
    );


  if (!container) {
    return;
  }


  container.innerHTML = "";


  if (
    inventory.length === 0
  ) {

    container.innerHTML = `

      <div class="empty-item">

        <div class="empty-icon">
          🎒
        </div>

        <h2>
          Inventory is empty
        </h2>

        <p>
          Play the game and collect rewards!
        </p>

      </div>

    `;

    return;
  }


  inventory.forEach(
    function (item) {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "item inventory-card";


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

        <button
          class="equip-button"
          disabled
        >
          Item
        </button>

      `;


      container.appendChild(
        card
      );

    }
  );

}


/* =====================================================
   STRIPE
===================================================== */

async function buyWithStripe(item) {

  try {

    showMessage(
      "⏳ Opening Stripe Checkout..."
    );


    const response =
      await fetch(
        `${STRIPE_SERVER_URL}/create-checkout-session`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            itemName:
              item.name,

            price:
              item.price,

            currencyType:
              item.type,

            productId:
              item.productId

          })

        }
      );


    let data = null;


    try {

      data =
        await response.json();

    } catch (jsonError) {

      throw new Error(
        "Server returned invalid response."
      );

    }


    if (!response.ok) {

      throw new Error(
        data.error ||
        "Payment error"
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
   STRIPE PAYMENT RESULT
===================================================== */

function checkStripePayment() {

  const params =
    new URLSearchParams(
      window.location.search
    );


  const payment =
    params.get("payment");

  const itemName =
    params.get("item");


  if (
    payment === "success"
  ) {

    let diamondsToAdd = 0;


    if (
      itemName ===
      "50 Diamonds"
    ) {

      diamondsToAdd = 50;

    } else if (
      itemName ===
      "100 Diamonds"
    ) {

      diamondsToAdd = 100;

    } else if (
      itemName ===
      "250 Diamonds"
    ) {

      diamondsToAdd = 250;

    } else if (
      itemName ===
      "500 Diamonds"
    ) {

      diamondsToAdd = 500;

    } else if (
      itemName ===
      "1000 Diamonds"
    ) {

      diamondsToAdd = 1000;

    }


    if (
      diamondsToAdd > 0
    ) {

      diamonds +=
        diamondsToAdd;


      showMessage(
        `✅ Payment successful! +${diamondsToAdd} 💎 added.`
      );

    } else {

      showMessage(
        "✅ Payment successful!"
      );

    }


    updateAllUI();

    saveGame();


    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    );


    return;
  }


  if (
    payment === "cancel"
  ) {

    showMessage(
      "❌ Payment cancelled."
    );


    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    );

  }

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


/* =====================================================
   RENDER SHOP
===================================================== */

function renderShop(
  containerId,
  items
) {

  const container =
    document.getElementById(
      containerId
    );


  if (!container) {
    return;
  }


  container.innerHTML = "";


  items.forEach(
    function (item) {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "item";


      if (
        item.type ===
        "dollars"
      ) {

        card.classList.add(
          "premium-item"
        );

      }


      if (
        item.type === "diamonds" ||
        item.type === "dollarDiamonds"
      ) {

        card.classList.add(
          "diamond-item"
        );

      }


      let priceHTML =
        "";


      if (
        item.type ===
        "coins"
      ) {

        priceHTML = `
          <strong>
            ${item.price} 💵
          </strong>
        `;

      }


      if (
        item.type ===
        "diamonds"
      ) {

        priceHTML = `
          <strong>
            ${item.price} 💎
          </strong>
        `;

      }


      if (
        item.type ===
        "dollars"
      ) {

        priceHTML = `
          <strong>
            $${item.price}
          </strong>
        `;

      }


      if (
        item.type ===
        "dollarDiamonds"
      ) {

        priceHTML = `

          <div class="diamond-price">

            <span class="old-price">
              $${item.oldPrice}
            </span>

            <span class="new-price">
              $${item.price}
            </span>

          </div>

        `;

      }


      const diamondsText =
        item.diamonds
          ? `
            <p>
              Get ${item.diamonds} 💎
            </p>
          `
          : "";


      card.innerHTML = `

        <div class="item-icon">
          ${item.icon}
        </div>

        <h2>
          ${item.name}
        </h2>

        ${diamondsText}

        ${priceHTML}

        <br>
        <br>

        <button
          class="buy-button"
        >
          Buy
        </button>

      `;


      const buyButton =
        card.querySelector(
          ".buy-button"
        );


      if (buyButton) {

        buyButton.addEventListener(
          "click",
          function () {

            buySkin(item);

          }
        );

      }


      container.appendChild(
        card
      );

    }
  );

}


/* =====================================================
   BUY SHOP ITEM
===================================================== */

async function buySkin(item) {

  if (
    item.type === "coins"
  ) {

    if (
      coins < item.price
    ) {

      showMessage(
        "❌ Not enough coins!"
      );

      return;
    }


    coins -=
      item.price;


    addInventoryItem({
      name:
        item.name,

      icon:
        item.icon,

      rarity:
        "SHOP"
    });


    if (item.skin) {

      currentSkin =
        item.skin;

    }


    updateAllUI();

    renderInventory();

    saveGame();


    showMessage(
      `✅ ${item.name} purchased!`
    );


    return;
  }


  if (
    item.type === "diamonds"
  ) {

    if (
      diamonds < item.price
    ) {

      showMessage(
        "❌ Not enough diamonds!"
      );

      return;
    }


    diamonds -=
      item.price;


    addInventoryItem({
      name:
        item.name,

      icon:
        item.icon,

      rarity:
        "SHOP"
    });


    updateAllUI();

    renderInventory();

    saveGame();


    showMessage(
      `✅ ${item.name} purchased!`
    );


    return;
  }


  if (
    item.type === "dollars" ||
    item.type === "dollarDiamonds"
  ) {

    await buyWithStripe(
      item
    );

    return;
  }


  showMessage(
    "❌ Unknown product type."
  );

}


/* =====================================================
   EQUIP SKIN
===================================================== */

function equipSkin(skin) {

  currentSkin =
    skin;

  updateSkin();

  saveGame();


  showMessage(
    `🎨 ${skin} skin equipped!`
  );

}


/* =====================================================
   AUTH - CHECK
===================================================== */

function checkAuth() {

  const overlay =
    document.getElementById(
      "authOverlay"
    );


  if (!overlay) {
    return;
  }


  const loggedIn =
    localStorage.getItem(
      "loggedIn"
    );


  /*
     Եթե հին auth.js-ից մնացել է
     lootRushLoggedIn=true, այն նույնպես
     ընդունում ենք, որպեսզի նախկին
     login-ը չկոտրվի։
  */

  const oldLoggedIn =
    localStorage.getItem(
      "lootRushLoggedIn"
    );


  if (
    loggedIn === "true" ||
    oldLoggedIn === "true"
  ) {

    localStorage.setItem(
      "loggedIn",
      "true"
    );

    localStorage.setItem(
      "lootRushLoggedIn",
      "true"
    );

    overlay.classList.add(
      "hidden"
    );

    overlay.style.display =
      "none";

  } else {

    overlay.classList.remove(
      "hidden"
    );

    overlay.style.display =
      "";

    switchAuthForm(
      "login"
    );

  }

}


/* =====================================================
   AUTH - SWITCH FORM
===================================================== */

function switchAuthForm(
  type
) {

  const loginForm =
    document.getElementById(
      "loginForm"
    );

  const registerForm =
    document.getElementById(
      "registerForm"
    );


  if (
    !loginForm ||
    !registerForm
  ) {

    return;
  }


  if (
    type === "login"
  ) {

    loginForm.classList.remove(
      "hidden"
    );

    registerForm.classList.add(
      "hidden"
    );


  } else {

    registerForm.classList.remove(
      "hidden"
    );

    loginForm.classList.add(
      "hidden"
    );

  }

}


/* =====================================================
   REGISTER
===================================================== */

function handleRegister() {

  const usernameElement =
    document.getElementById(
      "regUsername"
    );

  const emailElement =
    document.getElementById(
      "regEmail"
    );

  const passwordElement =
    document.getElementById(
      "regPassword"
    );


  if (
    !usernameElement ||
    !emailElement ||
    !passwordElement
  ) {

    showMessage(
      "❌ Register form not found."
    );

    return;
  }


  const username =
    usernameElement.value.trim();

  const email =
    emailElement.value.trim();

  const password =
    passwordElement.value;


  if (
    !username ||
    !email ||
    !password
  ) {

    showMessage(
      "❌ Please fill all fields."
    );

    return;
  }


  if (
    username.length < 3
  ) {

    showMessage(
      "❌ Username must be at least 3 characters."
    );

    return;
  }


  if (
    !email.includes("@")
  ) {

    showMessage(
      "❌ Enter a valid email."
    );

    return;
  }


  if (password.length < 6) {
    showMessage(
        "❌ Password must be at least 6 characters."
    );
    return;
}


  /*
     SAVE ACCOUNT
  */

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


  /*
     Հին auth համակարգի տվյալները
     նույնպես պահում ենք, որպեսզի
     նախկին տարբերակից մնացած տվյալների
     հետ խնդիր չլինի։
  */

  const compatibleUser = {
    username: username,
    email: email,
    password: password
  };


  localStorage.setItem(
    "lootRushUser",
    JSON.stringify(
      compatibleUser
    )
  );


  playerName =
    username;


  localStorage.setItem(
    "playerName",
    playerName
  );


  /*
     Registration DOES NOT automatically
     log the user in.
  */

  localStorage.setItem(
    "loggedIn",
    "false"
  );

  localStorage.setItem(
    "lootRushLoggedIn",
    "false"
  );


  updateProfile();


  showMessage(
    "✅ Account created! Now login."
  );


  setTimeout(
    function () {

      switchAuthForm(
        "login"
      );


      const loginEmail =
        document.getElementById(
          "loginEmail"
        );


      if (loginEmail) {

        loginEmail.value =
          email;

      }


      const loginPassword =
        document.getElementById(
          "loginPassword"
        );


      if (loginPassword) {

        loginPassword.value =
          "";

        loginPassword.focus();

      }

    },
    500
  );

}


/* =====================================================
   LOGIN
   FIXED
===================================================== */

function handleLogin() {

  const emailElement =
    document.getElementById(
      "loginEmail"
    );

  const passwordElement =
    document.getElementById(
      "loginPassword"
    );


  if (
    !emailElement ||
    !passwordElement
  ) {

    showMessage(
      "❌ Login form not found."
    );

    return;
  }


  const email =
    emailElement.value.trim();

  const password =
    passwordElement.value;


  if (
    !email ||
    !password
  ) {

    showMessage(
      "❌ Enter email and password."
    );

    return;
  }


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


  /*
     FALLBACK FOR OLD ACCOUNT FORMAT
  */

  let oldUser = null;

  try {

    const oldUserData =
      localStorage.getItem(
        "lootRushUser"
      );

    if (oldUserData) {

      oldUser =
        JSON.parse(
          oldUserData
        );

    }

  } catch (error) {

    console.error(
      "Old account parse error:",
      error
    );

  }


  const finalEmail =
    savedEmail ||
    (
      oldUser
        ? oldUser.email
        : null
    );

  const finalPassword =
    savedPassword ||
    (
      oldUser
        ? oldUser.password
        : null
    );

  const finalUsername =
    savedUsername ||
    (
      oldUser
        ? oldUser.username
        : "Guest"
    );


  /*
     NO ACCOUNT
  */

  if (
    !finalEmail ||
    !finalPassword
  ) {

    showMessage(
      "❌ No account found. Please register first."
    );

    return;
  }


  /*
     EMAIL CHECK
  */

  if (
    email.toLowerCase() !==
    String(finalEmail).toLowerCase()
  ) {

    showMessage(
      "❌ Wrong email or password."
    );

    return;
  }


  /*
     PASSWORD CHECK
  */

  if (
    password !==
    finalPassword
  ) {

    showMessage(
      "❌ Wrong email or password."
    );

    return;
  }


  /* =================================================
     LOGIN SUCCESS
  ================================================= */


  /*
     BOTH AUTH FLAGS ARE SET
     This prevents conflict with old auth.js
  */

  localStorage.setItem(
    "loggedIn",
    "true"
  );

  localStorage.setItem(
    "lootRushLoggedIn",
    "true"
  );


  /*
     SAVE USER
  */

  playerName =
    finalUsername ||
    "Guest";


  localStorage.setItem(
    "playerName",
    playerName
  );


  /*
     KEEP OLD ACCOUNT FORMAT
  */

  localStorage.setItem(
    "registeredUsername",
    finalUsername
  );

  localStorage.setItem(
    "registeredEmail",
    finalEmail
  );

  localStorage.setItem(
    "registeredPassword",
    finalPassword
  );


  /*
     UPDATE PROFILE
  */

  updateProfile();


  /*
     CLOSE AUTH OVERLAY
  */

  const overlay =
    document.getElementById(
      "authOverlay"
    );


  if (overlay) {

    overlay.classList.add(
      "hidden"
    );

    /*
       Force hide.
       Սա կարևոր է, եթե CSS-ի
       .hidden-ը ճիշտ չի աշխատում։
    */

    overlay.style.display =
      "none";

  }


  /*
     MAKE SURE MAIN PAGE IS VISIBLE
  */

  const pages =
    document.querySelectorAll(
      ".page"
    );


  pages.forEach(
    function (page) {

      page.classList.remove(
        "auth-hidden"
      );

    }
  );


  /*
     CLEAR PASSWORD
  */

  passwordElement.value =
    "";


  /*
     UPDATE EVERYTHING
  */

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

  localStorage.setItem(
    "lootRushLoggedIn",
    "false"
  );


  const overlay =
    document.getElementById(
      "authOverlay"
    );


  if (overlay) {

    overlay.classList.remove(
      "hidden"
    );

    overlay.style.display =
      "";

  }


  switchAuthForm(
    "login"
  );


  /*
     Clear login fields
  */

  const email =
    document.getElementById(
      "loginEmail"
    );

  const password =
    document.getElementById(
      "loginPassword"
    );


  if (email) {
    email.value = "";
  }

  if (password) {
    password.value = "";
  }


  showMessage(
    "👋 Logged out."
  );

}


/* =====================================================
   PLAYER MENU
===================================================== */

function togglePlayerMenu() {

  const dropdown =
    document.getElementById(
      "profileDropdown"
    );


  if (dropdown) {

    dropdown.classList.toggle(
      "show"
    );

  }

}


/* =====================================================
   CHANGE AVATAR
===================================================== */

function changeAvatar(
  event
) {

  if (
    !event ||
    !event.target
  ) {

    return;
  }


  const file =
    event.target.files[0];


  if (!file) {
    return;
  }


  const reader =
    new FileReader();


  reader.onload =
    function () {

      playerAvatar =
        reader.result;


      localStorage.setItem(
        "playerAvatar",
        playerAvatar
      );


      updateProfile();


      showMessage(
        "🖼️ Avatar updated!"
      );

    };


  reader.readAsDataURL(
    file
  );

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


/* =====================================================
   CLAIM DAILY REWARD
===================================================== */

function claimDailyReward() {

  const today =
    new Date().toDateString();


  const lastClaim =
    localStorage.getItem(
      "lastDailyReward"
    );


  if (
    today === lastClaim
  ) {

    showMessage(
      "⏳ You already claimed today's reward."
    );

    return;
  }


  let day =
    Number(
      localStorage.getItem(
        "rewardDay"
      )
    ) || 1;


  if (
    day < 1 ||
    day > 7
  ) {

    day = 1;

  }


  const reward =
    dailyRewards[
      day - 1
    ];


  if (
    reward.type === "coins"
  ) {

    coins +=
      reward.amount;

  } else {

    diamonds +=
      reward.amount;

  }


  localStorage.setItem(
    "lastDailyReward",
    today
  );


  localStorage.setItem(
    "rewardDay",
    day >= 7
      ? 1
      : day + 1
  );


  updateAllUI();

  saveGame();


  if (
    reward.type === "coins"
  ) {

    showMessage(
      `🎁 +${reward.amount} 💵`
    );

  } else {

    showMessage(
      `🎁 +${reward.amount} 💎`
    );

  }

}


/* =====================================================
   REWARD TIMER
===================================================== */

function startRewardTimer() {

  function updateTimer() {

    const timer =
      document.getElementById(
        "rewardTimer"
      );


    if (!timer) {
      return;
    }


    const now =
      new Date();


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


    const hours =
      Math.floor(
        diff / 3600000
      );


    const minutes =
      Math.floor(
        (diff % 3600000) /
        60000
      );


    const seconds =
      Math.floor(
        (diff % 60000) /
        1000
      );


    timer.textContent =
      `Next reward in ${hours}h ${minutes}m ${seconds}s`;

  }


  updateTimer();


  setInterval(
    updateTimer,
    1000
  );

}


/* =====================================================
   BOMBER INIT
===================================================== */

function initBomber() {

  const selector =
    document.getElementById(
      "bomberBombSelector"
    );


  if (selector) {

    bomberBombs =
      Number(
        selector.value
      ) || 3;

  }


  createBomberBoard();

  updateBomberUI();

}


/* =====================================================
   BOMBER BOMB CHANGE
===================================================== */

function changeBomberBombs() {

  if (
    bomberGameActive
  ) {

    showMessage(
      "❌ Finish the current game first."
    );


    const selector =
      document.getElementById(
        "bomberBombSelector"
      );


    if (selector) {

      selector.value =
        bomberBombs;

    }


    return;

  }


  const selector =
    document.getElementById(
      "bomberBombSelector"
    );


  if (selector) {

    bomberBombs =
      Number(
        selector.value
      ) || 3;

  }


  createBomberBoard();

  updateBomberUI();

}


/* =====================================================
   CREATE BOMBER BOARD
===================================================== */

function createBomberBoard() {

  const board =
    document.getElementById(
      "bomberBoard"
    );


  if (!board) {
    return;
  }


  board.innerHTML =
    "";


  bomberBoard =
    [];


  for (
    let i = 0;
    i < 25;
    i++
  ) {

    const button =
      document.createElement(
        "button"
      );


    button.className =
      "bomber-cell";


    button.textContent =
      "❓";


    button.disabled =
      !bomberGameActive;


    button.dataset.index =
      i;


    button.addEventListener(
      "click",
      function () {

        openBomberCell(i);

      }
    );


    board.appendChild(
      button
    );


    bomberBoard.push({

      bomb: false,

      opened: false

    });

  }

}


/* =====================================================
   START BOMBER
===================================================== */

function startBomberGame() {

  if (
    bomberGameActive
  ) {

    return;

  }


  if (
    diamonds <
    bomberBet
  ) {

    showMessage(
      "❌ You need 1 💎 to play Bomber."
    );

    return;

  }


  diamonds -=
    bomberBet;


  bomberGameActive =
    true;

  bomberMultiplier =
    1;

  bomberSafeCount =
    0;


  bomberBoard =
    Array.from(
      { length: 25 },
      function () {

        return {
          bomb: false,
          opened: false
        };

      }
    );


  const bombPositions =
    [];


  while (
    bombPositions.length <
    bomberBombs
  ) {

    const random =
      Math.floor(
        Math.random() *
        25
      );


    if (
      !bombPositions.includes(
        random
      )
    ) {

      bombPositions.push(
        random
      );


      bomberBoard[
        random
      ].bomb = true;

    }

  }


  createBomberBoard();


  document
    .querySelectorAll(
      ".bomber-cell"
    )
    .forEach(
      function (cell) {

        cell.disabled =
          false;

      }
    );


  const startButton =
    document.getElementById(
      "bomberStartButton"
    );

  const cashoutButton =
    document.getElementById(
      "bomberCashoutButton"
    );


  if (startButton) {

    startButton.disabled =
      true;

  }


  if (cashoutButton) {

    cashoutButton.disabled =
      true;

  }


  updateAllUI();

  updateBomberUI();


  showMessage(
    "💣 Bomber started!"
  );

}


/* =====================================================
   OPEN BOMBER CELL
===================================================== */

function openBomberCell(
  index
) {

  if (
    !bomberGameActive
  ) {

    return;

  }


  if (
    !bomberBoard[index]
  ) {

    return;

  }


  const cells =
    document.querySelectorAll(
      ".bomber-cell"
    );


  const cell =
    cells[index];


  if (
    !cell ||
    bomberBoard[index].opened
  ) {

    return;

  }


  bomberBoard[
    index
  ].opened = true;


  if (
    bomberBoard[index].bomb
  ) {

    cell.textContent =
      "💣";


    cell.classList.add(
      "bomb"
    );


    bomberGameActive =
      false;


    revealBomberBoard();

    updateBomberUI();


    showMessage(
      "💥 BOOM! You lost!"
    );


    return;

  }


  bomberSafeCount++;


  bomberMultiplier =
    calculateBomberMultiplier(
      bomberBombs,
      bomberSafeCount
    );


  cell.textContent =
    "💎";


  cell.classList.add(
    "safe"
  );


  cell.disabled =
    true;


  const cashoutButton =
    document.getElementById(
      "bomberCashoutButton"
    );


  if (cashoutButton) {

    cashoutButton.disabled =
      false;

  }


  const safeFields =
    25 - bomberBombs;


  if (
    bomberSafeCount >=
    safeFields
  ) {

    bomberGameActive =
      false;


    const win =
      Math.floor(
        bomberMultiplier
      );


    diamonds +=
      win;


    revealBomberBoard();

    updateAllUI();

    updateBomberUI();

    saveGame();


    showMessage(
      `🏆 Perfect win! +${win} 💎`
    );


    return;

  }


  updateBomberUI();

}


/* =====================================================
   BOMBER MULTIPLIER
===================================================== */

function calculateBomberMultiplier(
  bombs,
  safe
) {

  const base =
    1 +
    safe *
    (bombs / 20);


  return Math.max(
    1,
    Number(
      base.toFixed(2)
    )
  );

}


/* =====================================================
   BOMBER CASH OUT
===================================================== */

function cashOutBomber() {

  if (
    !bomberGameActive
  ) {

    return;

  }


  const win =
    Math.max(
      1,
      Math.floor(
        bomberMultiplier
      )
    );


  diamonds +=
    win;


  bomberGameActive =
    false;


  revealBomberBoard();


  updateAllUI();

  updateBomberUI();

  saveGame();


  showMessage(
    `💰 Cash Out! +${win} 💎`
  );

}


/* =====================================================
   REVEAL BOMBER BOARD
===================================================== */

function revealBomberBoard() {

  document
    .querySelectorAll(
      ".bomber-cell"
    )
    .forEach(
      function (
        cell,
        index
      ) {

        cell.disabled =
          true;


        if (
          bomberBoard[index] &&
          bomberBoard[index].bomb
        ) {

          cell.textContent =
            "💣";


          cell.classList.add(
            "bomb"
          );


        } else if (
          bomberBoard[index] &&
          bomberBoard[index].opened
        ) {

          cell.textContent =
            "💎";


          cell.classList.add(
            "safe"
          );

        }

      }
    );

}


/* =====================================================
   BOMBER UI
===================================================== */

function updateBomberUI() {

  const bombCount =
    document.getElementById(
      "bombCount"
    );

  const safeCount =
    document.getElementById(
      "safeCount"
    );

  const bomberWin =
    document.getElementById(
      "bomberWin"
    );

  const multiplierElement =
    document.getElementById(
      "bomberMultiplier"
    );


  if (bombCount) {

    bombCount.textContent =
      bomberBombs;

  }


  if (safeCount) {

    safeCount.textContent =
      bomberSafeCount;

  }


  if (bomberWin) {

    bomberWin.textContent =
      Math.floor(
        bomberMultiplier
      ) + " 💎";

  }


  if (
    multiplierElement
  ) {

    multiplierElement.textContent =
      bomberMultiplier.toFixed(
        2
      ) + "x";

  }


  const status =
    document.getElementById(
      "bomberStatus"
    );


  if (status) {

    status.textContent =
      bomberGameActive
        ? "PLAYING"
        : "READY";


    status.className =
      bomberGameActive
        ? "bomber-status playing"
        : "bomber-status";

  }

}


/* =====================================================
   CRASH INIT
===================================================== */

function initCrashGame() {

  updateCrashUI();

  renderCrashHistory();

}


/* =====================================================
   START CRASH
===================================================== */

function startCrashGame() {

  if (
    crashGameActive
  ) {

    return;

  }


  const input =
    document.getElementById(
      "crashBet"
    );


  crashBet =
    Number(
      input
        ? input.value
        : 5
    ) || 5;


  crashBet =
    Math.max(
      1,
      Math.floor(
        crashBet
      )
    );


  if (
    diamonds <
    crashBet
  ) {

    showMessage(
      `❌ You need ${crashBet} 💎.`
    );

    return;

  }


  diamonds -=
    crashBet;


  crashGameActive =
    true;

  crashMultiplier =
    1;

  crashStep =
    0;

  crashHistory =
    [];


  updateAllUI();

  updateCrashUI();


  showMessage(
    "🚀 Multiplier started!"
  );


  runCrashStep();

}


/* =====================================================
   CRASH STEP
===================================================== */

function runCrashStep() {

  if (
    !crashGameActive
  ) {

    return;

  }


  if (
    crashStep >=
    crashMaxSteps
  ) {

    crashAutoWin();

    return;

  }


  crashStep++;


  let crashChance;


  if (
    crashMultiplier < 2
  ) {

    crashChance =
      0.18;

  } else if (
    crashMultiplier < 3
  ) {

    crashChance =
      0.25;

  } else if (
    crashMultiplier < 5
  ) {

    crashChance =
      0.34;

  } else {

    crashChance =
      0.45;

  }


  /*
     Small random crash event
  */

  if (
    Math.random() <
    0.08
  ) {

    crashMultiplier =
      Number(
        (
          Math.random() *
          2
        ).toFixed(2)
      );


    if (
      crashMultiplier <
      1
    ) {

      crashMultiplier =
        0;

    }


    crashHistory.push(
      crashMultiplier
    );


    updateCrashUI();


    if (
      crashMultiplier <=
      0.01
    ) {

      crashGameLose();

      return;

    }

  }


  /*
     Normal crash
  */

  if (
    Math.random() <
    crashChance
  ) {

    crashGameLose();

    return;

  }


  /*
     Multiplier growth
  */

  const growth =
    0.15 +
    Math.random() *
    0.85;


  crashMultiplier =
    Number(
      (
        crashMultiplier +
        growth
      ).toFixed(2)
    );


  /*
     Random bonus growth
  */

  if (
    Math.random() <
    0.08
  ) {

    crashMultiplier =
      Number(
        (
          crashMultiplier +
          Math.random() * 2
        ).toFixed(2)
      );

  }


  if (
    crashMultiplier <
    1
  ) {

    crashMultiplier =
      1;

  }


  crashHistory.push(
    crashMultiplier
  );


  if (
    crashMultiplier >
    crashBestMultiplier
  ) {

    crashBestMultiplier =
      crashMultiplier;

  }


  updateCrashUI();


  setTimeout(
    runCrashStep,
    900
  );

}


/* =====================================================
   CRASH CASH OUT
===================================================== */

function cashOutCrash() {

  if (
    !crashGameActive
  ) {

    return;

  }


  const win =
    Number(
      (
        crashBet *
        crashMultiplier
      ).toFixed(2)
    );


  diamonds +=
    win;


  crashGameActive =
    false;


  crashWins++;

  crashTotalGames++;

  crashTotalWon +=
    win;


  if (
    crashMultiplier >
    crashBestMultiplier
  ) {

    crashBestMultiplier =
      crashMultiplier;

  }


  saveGame();

  updateAllUI();

  updateCrashUI();

  renderCrashHistory();


  showMessage(
    `💰 CASH OUT: +${win.toFixed(2)} 💎`
  );

}


/* =====================================================
   CRASH LOSE
===================================================== */

function crashGameLose() {

  crashGameActive =
    false;


  crashLosses++;

  crashTotalGames++;


  saveGame();

  updateAllUI();

  updateCrashUI();

  renderCrashHistory();


  showMessage(
    `💥 CRASH at ${crashMultiplier.toFixed(2)}x!`
  );

}


/* =====================================================
   CRASH AUTO WIN
===================================================== */

function crashAutoWin() {

  if (
    !crashGameActive
  ) {

    return;

  }


  const win =
    Number(
      (
        crashBet *
        crashMultiplier
      ).toFixed(2)
    );


  diamonds +=
    win;


  crashGameActive =
    false;


  crashWins++;

  crashTotalGames++;

  crashTotalWon +=
    win;


  saveGame();

  updateAllUI();

  updateCrashUI();

  renderCrashHistory();


  showMessage(
    `🏆 10 steps completed! +${win.toFixed(2)} 💎`
  );

}


/* =====================================================
   CRASH UI
===================================================== */

function updateCrashUI() {

  const multiplier =
    document.getElementById(
      "crashMultiplier"
    );

  const step =
    document.getElementById(
      "crashStep"
    );

  const currentBet =
    document.getElementById(
      "crashCurrentBet"
    );

  const potentialWin =
    document.getElementById(
      "crashPotentialWin"
    );

  const wins =
    document.getElementById(
      "crashWins"
    );

  const losses =
    document.getElementById(
      "crashLosses"
    );

  const best =
    document.getElementById(
      "crashBest"
    );

  const totalGames =
    document.getElementById(
      "crashTotalGames"
    );


  if (multiplier) {

    multiplier.textContent =
      crashMultiplier.toFixed(
        2
      ) + "x";

  }


  if (step) {

    step.textContent =
      `${crashStep} / ${crashMaxSteps}`;

  }


  if (currentBet) {

    currentBet.textContent =
      crashBet.toFixed(2) +
      " 💎";

  }


  if (potentialWin) {

    potentialWin.textContent =
      (
        crashBet *
        crashMultiplier
      ).toFixed(2) +
      " 💎";

  }


  if (wins) {

    wins.textContent =
      crashWins;

  }


  if (losses) {

    losses.textContent =
      crashLosses;

  }


  if (best) {

    best.textContent =
      crashBestMultiplier.toFixed(
        2
      ) + "x";

  }


  if (totalGames) {

    totalGames.textContent =
      crashTotalGames;

  }


  const startButton =
    document.getElementById(
      "crashStartButton"
    );

  const cashoutButton =
    document.getElementById(
      "crashCashoutButton"
    );


  if (startButton) {

    startButton.disabled =
      crashGameActive;

  }


  if (cashoutButton) {

    cashoutButton.disabled =
      !crashGameActive;

  }


  const status =
    document.getElementById(
      "crashStatus"
    );


  if (status) {

    status.textContent =
      crashGameActive
        ? "🚀 RUNNING"
        : "READY";


    status.className =
      crashGameActive
        ? "crash-status running"
        : "crash-status";

  }


  renderCrashGraph();

}


/* =====================================================
   CRASH GRAPH
===================================================== */

function renderCrashGraph() {

  const graph =
    document.getElementById(
      "crashGraph"
    );


  if (!graph) {
    return;
  }


  graph.innerHTML =
    "";


  if (
    crashHistory.length === 0
  ) {

    graph.innerHTML = `

      <div class="crash-empty">
        🚀 Start the game to see the multiplier.
      </div>

    `;

    return;
  }


  crashHistory.forEach(
    function (
      value,
      index
    ) {

      const point =
        document.createElement(
          "div"
        );


      point.className =
        "crash-point";


      point.innerHTML = `

        <span>
          ${index + 1}
        </span>

        <strong>
          ${Number(value).toFixed(2)}x
        </strong>

      `;


      graph.appendChild(
        point
      );

    }
  );

}


/* =====================================================
   CRASH HISTORY
===================================================== */

function renderCrashHistory() {

  const history =
    document.getElementById(
      "crashHistory"
    );


  if (!history) {
    return;
  }


  history.innerHTML = `

    <div class="crash-history-card">

      <span>
        🎮 Games
      </span>

      <strong>
        ${crashTotalGames}
      </strong>

    </div>


    <div class="crash-history-card">

      <span>
        🏆 Wins
      </span>

      <strong>
        ${crashWins}
      </strong>

    </div>


    <div class="crash-history-card">

      <span>
        💥 Losses
      </span>

      <strong>
        ${crashLosses}
      </strong>

    </div>


    <div class="crash-history-card">

      <span>
        📈 Best
      </span>

      <strong>
        ${crashBestMultiplier.toFixed(2)}x
      </strong>

    </div>


    <div class="crash-history-card">

      <span>
        💰 Total Won
      </span>

      <strong>
        ${crashTotalWon.toFixed(2)} 💎
      </strong>

    </div>

  `;

}


/* =====================================================
   WALLET
===================================================== */

function updateWallet() {

  const walletPoints =
    document.getElementById(
      "walletPoints"
    );

  const walletDiamonds =
    document.getElementById(
      "walletDiamonds"
    );

  const walletDollarValue =
    document.getElementById(
      "walletDollarValue"
    );


  if (walletPoints) {

    walletPoints.textContent =
      Math.floor(points);

  }


  if (walletDiamonds) {

    walletDiamonds.textContent =
      Math.floor(diamonds);

  }


  if (walletDollarValue) {

    walletDollarValue.textContent =
      diamonds.toFixed(2);

  }


  updateWithdrawValue();

  renderWithdrawalHistory();

}


/* =====================================================
   POINTS -> DIAMONDS
===================================================== */

function convertPointsToDiamonds() {

  if (
    points < 1000
  ) {

    showMessage(
      "❌ You need 1000 points."
    );

    return;
  }


  points -=
    1000;

  diamonds +=
    1;


  updateAllUI();

  saveGame();


  showMessage(
    "⭐ 1000 points converted to 💎 1!"
  );

}


/* =====================================================
   WITHDRAW VALUE
===================================================== */

function updateWithdrawValue() {

  const input =
    document.getElementById(
      "withdrawDiamonds"
    );

  const output =
    document.getElementById(
      "withdrawDollarValue"
    );


  if (
    !input ||
    !output
  ) {

    return;

  }


  output.textContent =
    (
      Number(
        input.value
      ) || 0
    ).toFixed(2);

}


/* =====================================================
   CARD NUMBER FORMAT
===================================================== */

function formatCardNumber(
  input
) {

  if (!input) {
    return;
  }


  let value =
    input.value
      .replace(
        /\D/g,
        ""
      )
      .substring(
        0,
        16
      );


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


/* =====================================================
   WITHDRAWAL REQUEST
===================================================== */

function createWithdrawalRequest() {

  const amount =
    Number(
      (
        document.getElementById(
          "withdrawDiamonds"
        ) || {}
      ).value
    );


  const nameElement =
    document.getElementById(
      "withdrawName"
    );

  const cardElement =
    document.getElementById(
      "withdrawCard"
    );


  const name =
    nameElement
      ? nameElement.value.trim()
      : "";


  const card =
    cardElement
      ? cardElement.value.trim()
      : "";


  if (
    !amount ||
    amount <= 0
  ) {

    showMessage(
      "❌ Enter a valid diamond amount."
    );

    return;
  }


  if (
    amount > diamonds
  ) {

    showMessage(
      "❌ Not enough diamonds."
    );

    return;
  }


  if (
    !name ||
    !card
  ) {

    showMessage(
      "❌ Fill all withdrawal fields."
    );

    return;
  }


  const cleanCard =
    card.replace(
      /\D/g,
      ""
    );


  if (
    cleanCard.length < 4
  ) {

    showMessage(
      "❌ Enter a valid card number."
    );

    return;
  }


  diamonds -=
    amount;


  let requests = [];


  try {

    requests =
      JSON.parse(
        localStorage.getItem(
          "withdrawals"
        )
      ) || [];

  } catch (error) {

    requests = [];

  }


  requests.push({

    amount:
      amount,

    name:
      name,

    card:
      "**** **** **** " +
      cleanCard.slice(-4),

    status:
      "Pending",

    date:
      new Date().toLocaleString()

  });


  localStorage.setItem(
    "withdrawals",
    JSON.stringify(
      requests
    )
  );


  updateAllUI();

  saveGame();

  renderWithdrawalHistory();


  showMessage(
    "📤 Withdrawal request sent!"
  );

}


/* =====================================================
   WITHDRAWAL HISTORY
===================================================== */

function renderWithdrawalHistory() {

  const container =
    document.getElementById(
      "withdrawalHistory"
    );


  if (!container) {
    return;
  }


  let requests = [];


  try {

    requests =
      JSON.parse(
        localStorage.getItem(
          "withdrawals"
        )
      ) || [];

  } catch (error) {

    requests = [];

  }


  if (
    requests.length === 0
  ) {

    container.innerHTML = `

      <div class="empty-item">

        <div class="empty-icon">
          📋
        </div>

        <p>
          No withdrawal requests yet.
        </p>

      </div>

    `;

    return;
  }


  container.innerHTML =
    requests
      .map(
        function (request) {

          return `

            <div class="item">

              <h2>
                💎 $${Number(
                  request.amount
                ).toFixed(2)}
              </h2>

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

          `;

        }
      )
      .join("");

}


/* =====================================================
   GLOBAL CLICK
===================================================== */

document.addEventListener(
  "click",
  function (event) {

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
      !menu.contains(
        event.target
      )
    ) {

      dropdown.classList.remove(
        "show"
      );

    }

  }
);


/* =====================================================
   SPACE = CRASH CASHOUT
===================================================== */

document.addEventListener(
  "keydown",
  function (event) {

    if (
      event.code === "Space" &&
      crashGameActive
    ) {

      event.preventDefault();

      cashOutCrash();

    }

  }
);


/* =====================================================
   BEFORE UNLOAD
===================================================== */

window.addEventListener(
  "beforeunload",
  function () {

    saveGame();

  }
);


/* =====================================================
   INITIAL SAVE
===================================================== */

saveGame();
