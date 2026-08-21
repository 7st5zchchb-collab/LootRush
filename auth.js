// =====================================================
// LOOTRUSH AUTH — SINGLE AUTH SYSTEM
// Compatible with game.js and index.html.
// =====================================================

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("lootRushUser")) || null;
  } catch {
    return null;
  }
}

function showMessage(text) {
  const message = document.getElementById("message");
  if (!message) return;
  message.textContent = text;
  message.classList.add("show");
  clearTimeout(window.__lootRushMessageTimer);
  window.__lootRushMessageTimer = setTimeout(() => {
    message.classList.remove("show");
  }, 2500);
}

function switchAuthForm(form) {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  if (!loginForm || !registerForm) return;

  if (form === "register") {
    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");
  } else {
    registerForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
  }
}

function isLoggedIn() {
  return (
    localStorage.getItem("lootRushLoggedIn") === "true" ||
    localStorage.getItem("loggedIn") === "true"
  );
}

function checkAuth() {
  const overlay = document.getElementById("authOverlay");
  if (!overlay) return;

  if (isLoggedIn()) {
    overlay.classList.add("hidden");
  } else {
    overlay.classList.remove("hidden");
  }
}

function handleRegister() {
  const username = document.getElementById("regUsername")?.value.trim();
  const email = document.getElementById("regEmail")?.value.trim();
  const password = document.getElementById("regPassword")?.value;

  if (!username || !email || !password) {
    showMessage("❌ Fill in all fields!");
    return;
  }

  if (username.length < 3) {
    showMessage("❌ Username must be at least 3 characters!");
    return;
  }

  if (!email.includes("@")) {
    showMessage("❌ Enter a valid email!");
    return;
  }

  if (password.length < 4) {
    showMessage("❌ Password must be at least 4 characters!");
    return;
  }

  const user = {
    username,
    email,
    password,
    coins: 150,
    diamonds: 0,
    points: 0
  };

  localStorage.setItem("lootRushUser", JSON.stringify(user));
  localStorage.setItem("registeredUsername", username);
  localStorage.setItem("registeredEmail", email);
  localStorage.setItem("registeredPassword", password);
  localStorage.setItem("playerName", username);
  localStorage.setItem("coins", "150");
  localStorage.setItem("diamonds", "0");
  localStorage.setItem("points", "0");
  localStorage.setItem("lootRushLoggedIn", "false");
  localStorage.setItem("loggedIn", "false");

  showMessage("✅ Account created! Now sign in.");

  setTimeout(() => {
    switchAuthForm("login");
    const loginEmail = document.getElementById("loginEmail");
    if (loginEmail) loginEmail.value = email;
  }, 700);
}

function handleLogin() {
  const email = document.getElementById("loginEmail")?.value.trim();
  const password = document.getElementById("loginPassword")?.value;
  let user = getUser();

  // Recover an account created by the previous game.js version.
  if (!user) {
    const oldEmail = localStorage.getItem("registeredEmail");
    const oldPassword = localStorage.getItem("registeredPassword");
    const oldUsername = localStorage.getItem("registeredUsername");

    if (oldEmail && oldPassword) {
      user = {
        username: oldUsername || "Guest",
        email: oldEmail,
        password: oldPassword,
        coins: Number(localStorage.getItem("coins")) || 150,
        diamonds: Number(localStorage.getItem("diamonds")) || 0,
        points: Number(localStorage.getItem("points")) || 0
      };
      localStorage.setItem("lootRushUser", JSON.stringify(user));
    }
  }

  if (!email || !password) {
    showMessage("❌ Enter email and password!");
    return;
  }

  if (!user) {
    showMessage("❌ Account not found! Register first.");
    return;
  }

  if (
    email.toLowerCase() !== String(user.email).toLowerCase() ||
    password !== user.password
  ) {
    showMessage("❌ Wrong email or password!");
    return;
  }

  localStorage.setItem("lootRushLoggedIn", "true");
  localStorage.setItem("loggedIn", "true");
  localStorage.setItem("playerName", user.username || "Guest");

  if (Number.isFinite(Number(user.coins))) {
    localStorage.setItem("coins", String(user.coins));
  }
  if (Number.isFinite(Number(user.diamonds))) {
    localStorage.setItem("diamonds", String(user.diamonds));
  }
  if (Number.isFinite(Number(user.points))) {
    localStorage.setItem("points", String(user.points));
  }

  const overlay = document.getElementById("authOverlay");
  if (overlay) overlay.classList.add("hidden");

  const passwordInput = document.getElementById("loginPassword");
  if (passwordInput) passwordInput.value = "";

  if (typeof updateAllUI === "function") updateAllUI();
  if (typeof saveGame === "function") saveGame();

  showMessage(`✅ Welcome ${user.username || "Guest"}!`);
}

function logout() {
  syncUserFromGame();

  localStorage.setItem("lootRushLoggedIn", "false");
  localStorage.setItem("loggedIn", "false");

  const overlay = document.getElementById("authOverlay");
  if (overlay) overlay.classList.remove("hidden");

  switchAuthForm("login");

  const passwordInput = document.getElementById("loginPassword");
  if (passwordInput) passwordInput.value = "";
}

// =====================================================
// KEEP ACCOUNT DATA IN SYNC WITH game.js
// =====================================================

function syncUserFromGame() {
  const user = getUser();
  if (!user) return;

  const coinsValue = Number(localStorage.getItem("coins"));
  const diamondsValue = Number(localStorage.getItem("diamonds"));
  const pointsValue = Number(localStorage.getItem("points"));

  if (Number.isFinite(coinsValue)) user.coins = coinsValue;
  if (Number.isFinite(diamondsValue)) user.diamonds = diamondsValue;
  if (Number.isFinite(pointsValue)) user.points = pointsValue;

  user.username = localStorage.getItem("playerName") || user.username;
  localStorage.setItem("lootRushUser", JSON.stringify(user));
}

// game.js defines saveGame before auth.js loads. Wrap it so every
// later game save also updates the logged-in user's account snapshot.
if (typeof window.saveGame === "function" && !window.__lootRushSaveWrapped) {
  const originalSaveGame = window.saveGame;

  window.saveGame = function () {
    originalSaveGame();
    syncUserFromGame();
  };

  window.__lootRushSaveWrapped = true;
}

// Backward-compatible aliases.
function register() { handleRegister(); }
function login() { handleLogin(); }
function showRegister() { switchAuthForm("register"); }
function showLogin() { switchAuthForm("login"); }

document.addEventListener("DOMContentLoaded", () => {
  checkAuth();

  const user = getUser();
  if (user?.username) {
    localStorage.setItem("playerName", user.username);
  }

  syncUserFromGame();
});

window.addEventListener("beforeunload", syncUserFromGame);
