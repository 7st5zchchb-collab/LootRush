// =====================================================
// LOOTRUSH SERVER AUTH
// Login/Register use the Render API. Server is authoritative.
// =====================================================
const LOOTRUSH_SERVER = "https://lootrush-2.onrender.com";

function showMessage(text) {
  const message = document.getElementById("message");
  if (!message) return;
  message.textContent = text;
  message.classList.add("show");
  clearTimeout(window.__lootRushMessageTimer);
  window.__lootRushMessageTimer = setTimeout(() => message.classList.remove("show"), 3000);
}

function switchAuthForm(form) {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  if (!loginForm || !registerForm) return;
  const register = form === "register";
  loginForm.classList.toggle("hidden", register);
  registerForm.classList.toggle("hidden", !register);
}

function getToken() {
  return localStorage.getItem("lootRushToken") || "";
}

function getUser() {
  try { return JSON.parse(localStorage.getItem("lootRushUser")) || null; }
  catch { return null; }
}

function setSession(data) {
  localStorage.setItem("lootRushToken", data.token);
  localStorage.setItem("lootRushLoggedIn", "true");
  localStorage.setItem("loggedIn", "true");
  localStorage.setItem("lootRushUser", JSON.stringify(data.user));
  localStorage.setItem("playerName", data.user.username);
  localStorage.setItem("coins", String(data.user.coins ?? 150));
  localStorage.setItem("diamonds", String(data.user.diamonds ?? 0));
  localStorage.setItem("points", String(data.user.points ?? 0));
}

function applyServerUser(user) {
  localStorage.setItem("lootRushUser", JSON.stringify(user));
  localStorage.setItem("playerName", user.username);

  // These values are only a UI cache. The server/database remains authoritative.
  if (typeof coins !== "undefined") coins = Number(user.coins) || 0;
  if (typeof diamonds !== "undefined") diamonds = Number(user.diamonds) || 0;
  if (typeof points !== "undefined") points = Number(user.points) || 0;

  localStorage.setItem("coins", String(user.coins ?? 0));
  localStorage.setItem("diamonds", String(user.diamonds ?? 0));
  localStorage.setItem("points", String(user.points ?? 0));

  const name = document.getElementById("playerNameTop");
  if (name) name.textContent = user.username;
  if (typeof updateAllUI === "function") updateAllUI();
}

async function refreshServerUser() {
  const token = getToken();
  if (!token) return false;

  try {
    const response = await fetch(`${LOOTRUSH_SERVER}/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    });

    if (!response.ok) throw new Error("Session expired");
    const data = await response.json();
    if (!data.success || !data.user) throw new Error("Invalid account response");

    applyServerUser(data.user);
    return true;
  } catch (error) {
    console.warn("LootRush session check failed:", error);
    localStorage.removeItem("lootRushToken");
    localStorage.setItem("lootRushLoggedIn", "false");
    localStorage.setItem("loggedIn", "false");
    return false;
  }
}

function checkAuth(loggedIn) {
  const overlay = document.getElementById("authOverlay");
  if (!overlay) return;
  overlay.classList.toggle("hidden", loggedIn === true);
}

async function handleRegister() {
  const username = document.getElementById("regUsername")?.value.trim() || "";
  const email = document.getElementById("regEmail")?.value.trim().toLowerCase() || "";
  const password = document.getElementById("regPassword")?.value || "";

  if (username.length < 3) return showMessage("❌ Username must be at least 3 characters.");
  if (!email || !email.includes("@")) return showMessage("❌ Enter a valid email.");
  if (password.length < 6) return showMessage("❌ Password must be at least 6 characters.");

  try {
    const response = await fetch(`${LOOTRUSH_SERVER}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Registration failed.");

    document.getElementById("loginEmail").value = email;
    document.getElementById("loginPassword").value = "";
    switchAuthForm("login");
    showMessage("✅ Account created. Now sign in.");
  } catch (error) {
    showMessage(`❌ ${error.message}`);
  }
}

async function handleLogin() {
  const email = document.getElementById("loginEmail")?.value.trim().toLowerCase() || "";
  const password = document.getElementById("loginPassword")?.value || "";

  if (!email || !password) return showMessage("❌ Enter email and password.");

  try {
    showMessage("⏳ Signing in...");
    const response = await fetch(`${LOOTRUSH_SERVER}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.token || !data.user) {
      throw new Error(data.error || "Wrong email or password.");
    }

    setSession(data);
    applyServerUser(data.user);
    checkAuth(true);

    // Always start from the Game page after a successful login.
    if (typeof showPage === "function") showPage("game");
    showMessage(`✅ Welcome ${data.user.username}!`);
  } catch (error) {
    console.error(error);
    checkAuth(false);
    showMessage(`❌ ${error.message}`);
  }
}

function logout() {
  localStorage.removeItem("lootRushToken");
  localStorage.setItem("lootRushLoggedIn", "false");
  localStorage.setItem("loggedIn", "false");
  checkAuth(false);
  switchAuthForm("login");
  document.getElementById("loginPassword")?.focus();
}

function isLoggedIn() { return Boolean(getToken()); }
function register() { return handleRegister(); }
function login() { return handleLogin(); }
function showRegister() { switchAuthForm("register"); }
function showLogin() { switchAuthForm("login"); }

window.addEventListener("DOMContentLoaded", async () => {
  switchAuthForm("login");
  const token = getToken();

  if (!token) {
    checkAuth(false);
    return;
  }

  const ok = await refreshServerUser();
  checkAuth(ok);

  if (ok && typeof showPage === "function") {
    showPage("game");
  }
});
