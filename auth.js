// =====================================================
// LOOTRUSH AUTH — COMPATIBLE WITH index.html
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
  setTimeout(() => message.classList.remove("show"), 2500);
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

function handleRegister() {
  const username = document.getElementById("regUsername")?.value.trim();
  const email = document.getElementById("regEmail")?.value.trim();
  const password = document.getElementById("regPassword")?.value;

  if (!username || !email || !password) {
    showMessage("❌ Fill in all fields!");
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
  localStorage.setItem("playerName", username);
  localStorage.setItem("coins", "150");
  localStorage.setItem("diamonds", "0");
  localStorage.setItem("points", "0");

  showMessage("✅ Account created! Now sign in.");
  setTimeout(() => switchAuthForm("login"), 700);
}

function handleLogin() {
  const email = document.getElementById("loginEmail")?.value.trim();
  const password = document.getElementById("loginPassword")?.value;
  const user = getUser();

  if (!email || !password) {
    showMessage("❌ Enter email and password!");
    return;
  }

  if (!user) {
    showMessage("❌ Account not found! Register first.");
    return;
  }

  if (email !== user.email || password !== user.password) {
    showMessage("❌ Wrong email or password!");
    return;
  }

  localStorage.setItem("lootRushLoggedIn", "true");
  localStorage.setItem("playerName", user.username);

  if (Number.isFinite(Number(user.coins))) localStorage.setItem("coins", String(user.coins));
  if (Number.isFinite(Number(user.diamonds))) localStorage.setItem("diamonds", String(user.diamonds));
  if (Number.isFinite(Number(user.points))) localStorage.setItem("points", String(user.points));

  showMessage("✅ Login successful!");
  setTimeout(() => {
    window.location.href = "index.html";
  }, 500);
}

function logout() {
  localStorage.removeItem("lootRushLoggedIn");
  window.location.href = "index.html";
}

// Backward-compatible aliases for older code.
function register() { handleRegister(); }
function login() { handleLogin(); }
function showRegister() { switchAuthForm("register"); }
function showLogin() { switchAuthForm("login"); }

// Keep logged-in state when index.html loads.
document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("authOverlay");
  const loggedIn = localStorage.getItem("lootRushLoggedIn") === "true";

  if (overlay && loggedIn) {
    overlay.style.display = "none";
  }
});
