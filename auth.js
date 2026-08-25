// =====================================================
// LOOTRUSH AUTH
// =====================================================
// Register -> Login handoff:
// 1. Register creates the account on the server.
// 2. Username + password are temporarily kept in sessionStorage.
// 3. Login automatically fills both fields.
// 4. After a successful login, the temporary password is deleted.

const LOOTRUSH_SERVER = "";
let authBusy = false;

function showMessage(text) {
  const message = document.getElementById("message");
  if (!message) return;
  message.textContent = text;
  message.classList.add("show");
  clearTimeout(window.__lootRushMessageTimer);
  window.__lootRushMessageTimer = setTimeout(() => message.classList.remove("show"), 5000);
}

function switchAuthForm(form) {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  if (!loginForm || !registerForm) return;
  const register = form === "register";
  loginForm.classList.toggle("hidden", register);
  registerForm.classList.toggle("hidden", !register);
}

function setupLoginUsernameField() {
  const oldInput = document.getElementById("loginEmail");
  const input = oldInput || document.getElementById("loginUsername");
  if (!input) return;
  input.type = "text";
  input.placeholder = "Enter username";
  input.autocomplete = "username";
  input.id = "loginUsername";
  const label = input.closest(".input-group")?.querySelector("label");
  if (label) label.textContent = "Username";
}

function getToken() { return localStorage.getItem("lootRushToken") || ""; }

function setSession(data) {
  if (!data?.token || !data?.user) return false;
  localStorage.setItem("lootRushToken", data.token);
  localStorage.setItem("lootRushLoggedIn", "true");
  localStorage.setItem("loggedIn", "true");
  localStorage.setItem("lootRushUser", JSON.stringify(data.user));
  localStorage.setItem("playerName", data.user.username || "Guest");
  if (data.user.email) localStorage.setItem("lootRushLoginEmail", data.user.email);
  localStorage.setItem("coins", String(data.user.coins ?? 150));
  localStorage.setItem("diamonds", String(data.user.diamonds ?? 0));
  localStorage.setItem("points", String(data.user.points ?? 0));
  return true;
}

function applyServerUser(user) {
  if (!user) return;
  localStorage.setItem("lootRushUser", JSON.stringify(user));
  localStorage.setItem("playerName", user.username || "Guest");
  if (user.email) localStorage.setItem("lootRushLoginEmail", user.email);
  if (typeof coins !== "undefined") coins = Number(user.coins) || 0;
  if (typeof diamonds !== "undefined") diamonds = Number(user.diamonds) || 0;
  if (typeof points !== "undefined") points = Number(user.points) || 0;
  localStorage.setItem("coins", String(user.coins ?? 0));
  localStorage.setItem("diamonds", String(user.diamonds ?? 0));
  localStorage.setItem("points", String(user.points ?? 0));
  const name = document.getElementById("playerNameTop");
  if (name) name.textContent = user.username || "Guest";
  if (typeof updateAllUI === "function") updateAllUI();
}

function clearSession() {
  localStorage.removeItem("lootRushToken");
  localStorage.removeItem("lootRushUser");
  localStorage.setItem("lootRushLoggedIn", "false");
  localStorage.setItem("loggedIn", "false");
}

async function readJson(response) { return response.json().catch(() => ({})); }

async function refreshServerUser() {
  const token = getToken();
  if (!token) return false;
  try {
    const response = await fetch(`${LOOTRUSH_SERVER}/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    });
    if (!response.ok) throw new Error("Session expired");
    const data = await readJson(response);
    if (!data.success || !data.user) throw new Error("Invalid account response");
    applyServerUser(data.user);
    return true;
  } catch {
    clearSession();
    return false;
  }
}

function checkAuth(loggedIn) {
  const overlay = document.getElementById("authOverlay");
  if (overlay && loggedIn === true) {
    overlay.classList.add("hidden");
    overlay.classList.remove("show-auth");
  }
}

function openAuth(form = "login") {
  const overlay = document.getElementById("authOverlay");
  if (!overlay) return;
  setupLoginUsernameField();
  switchAuthForm(form);
  overlay.classList.remove("hidden");
  overlay.classList.add("show-auth");
}

async function handleRegister() {
  if (authBusy) return;
  const username = document.getElementById("regUsername")?.value.trim() || "";
  const email = document.getElementById("regEmail")?.value.trim().toLowerCase() || "";
  const password = document.getElementById("regPassword")?.value || "";

  if (username.length < 3) return showMessage("❌ Username must be at least 3 characters.");
  if (!email || !email.includes("@")) return showMessage("❌ Enter a valid email.");
  if (password.length < 6) return showMessage("❌ Password must be at least 6 characters.");

  authBusy = true;
  try {
    showMessage("⏳ Creating account...");
    const response = await fetch(`${LOOTRUSH_SERVER}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
      cache: "no-store"
    });
    const data = await readJson(response);
    if (!response.ok) throw new Error(data.error || "Registration failed.");

    sessionStorage.setItem("lootRushPendingUsername", username);
    sessionStorage.setItem("lootRushPendingPassword", password);
    sessionStorage.setItem("lootRushPendingEmail", email);
    localStorage.setItem("lootRushPendingUsername", username);

    setupLoginUsernameField();
    const loginUsername = document.getElementById("loginUsername");
    const loginPassword = document.getElementById("loginPassword");
    if (loginUsername) loginUsername.value = username;
    if (loginPassword) loginPassword.value = password;
    switchAuthForm("login");
    showMessage("✅ Account created! Login details filled automatically.");
  } catch (error) {
    console.error(error);
    showMessage(`❌ ${error.message || "Registration failed."}`);
  } finally {
    authBusy = false;
  }
}

async function handleLogin() {
  if (authBusy) return;
  setupLoginUsernameField();

  const username = document.getElementById("loginUsername")?.value.trim() || "";
  const password = document.getElementById("loginPassword")?.value || "";
  if (!username || !password) return showMessage("❌ Enter username and password.");

  authBusy = true;
  try {
    showMessage("⏳ Signing in...");
    const response = await fetch(`${LOOTRUSH_SERVER}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store"
    });
    const data = await readJson(response);
    if (!response.ok || !data.token || !data.user) {
      throw new Error(data.error || "Wrong username or password.");
    }

    if (data.user.username && data.user.username.toLowerCase() !== username.toLowerCase()) {
      throw new Error("Username or password is incorrect.");
    }

    setSession(data);
    applyServerUser(data.user);

    // Password is removed as soon as it has been used.
    sessionStorage.removeItem("lootRushPendingPassword");
    sessionStorage.removeItem("lootRushPendingUsername");
    sessionStorage.removeItem("lootRushPendingEmail");
    localStorage.removeItem("lootRushPendingUsername");

    checkAuth(true);
    if (typeof showPage === "function") showPage("game");
    showMessage(`✅ Welcome ${data.user.username}!`);
  } catch (error) {
    console.error(error);
    showMessage(`❌ ${error.message || "Login failed."}`);
  } finally {
    authBusy = false;
  }
}

async function logout() {
  clearSession();
  setupLoginUsernameField();
  switchAuthForm("login");
  const overlay = document.getElementById("authOverlay");
  if (overlay) {
    overlay.classList.remove("hidden");
    overlay.classList.add("show-auth");
  }
  const dropdown = document.getElementById("profileDropdown");
  if (dropdown) dropdown.classList.remove("show");
  const name = document.getElementById("playerNameTop");
  if (name) name.textContent = "Guest";
  const loginUsername = document.getElementById("loginUsername");
  const loginPassword = document.getElementById("loginPassword");
  if (loginUsername) loginUsername.value = sessionStorage.getItem("lootRushPendingUsername") || localStorage.getItem("lootRushPendingUsername") || "";
  if (loginPassword) loginPassword.value = sessionStorage.getItem("lootRushPendingPassword") || "";
  showMessage("✅ You have been logged out.");
}

function isLoggedIn() { return Boolean(getToken()); }
function register() { return handleRegister(); }
function login() { return handleLogin(); }
function showRegister() { openAuth("register"); }
function showLogin() { openAuth("login"); }

window.addEventListener("DOMContentLoaded", async () => {
  setupLoginUsernameField();
  const overlay = document.getElementById("authOverlay");
  if (overlay) overlay.classList.add("hidden");
  switchAuthForm("login");

  // Auto-fill the Login form when Register has just completed.
  const pendingUsername = sessionStorage.getItem("lootRushPendingUsername") || localStorage.getItem("lootRushPendingUsername") || "";
  const pendingPassword = sessionStorage.getItem("lootRushPendingPassword") || "";
  const loginUsername = document.getElementById("loginUsername");
  const loginPassword = document.getElementById("loginPassword");
  if (loginUsername && pendingUsername) loginUsername.value = pendingUsername;
  if (loginPassword && pendingPassword) loginPassword.value = pendingPassword;

  const token = getToken();
  if (!token) {
    openAuth("login");
    return;
  }

  const ok = await refreshServerUser();
  if (ok && typeof showPage === "function") {
    checkAuth(true);
    showPage("game");
  } else {
    openAuth("login");
  }
});
