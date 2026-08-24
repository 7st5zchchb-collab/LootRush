// =====================================================
// LOOTRUSH SERVER AUTH + EMAIL VERIFICATION
// =====================================================
// The site is served directly by the Render backend. No Cloudflare Worker is needed.
const LOOTRUSH_SERVER = String(window.LOOTRUSH_API_URL || "https://lootrush-2.onrender.com").replace(/\/$/, "");
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
  const loginForm = document.getElementById("loginForm"), registerForm = document.getElementById("registerForm");
  if (!loginForm || !registerForm) return;
  const register = form === "register";
  loginForm.classList.toggle("hidden", register);
  registerForm.classList.toggle("hidden", !register);
}

function getToken() { return localStorage.getItem("lootRushToken") || ""; }
function getUser() { try { return JSON.parse(localStorage.getItem("lootRushUser")) || null; } catch { return null; } }

function setSession(data) {
  if (!data?.token || !data?.user) return;
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
  if (!user) return;
  localStorage.setItem("lootRushUser", JSON.stringify(user));
  localStorage.setItem("playerName", user.username);
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

function clearSession() {
  localStorage.removeItem("lootRushToken");
  localStorage.removeItem("lootRushUser");
  localStorage.setItem("lootRushLoggedIn", "false");
  localStorage.setItem("loggedIn", "false");
}

async function readJson(response) {
  return response.json().catch(() => ({}));
}

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
    showMessage("⏳ Creating account and sending verification email...");
    const response = await fetch(`${LOOTRUSH_SERVER}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
      cache: "no-store"
    });
    const data = await readJson(response);
    if (!response.ok) throw new Error(data.error || "Registration failed.");
    const loginEmail = document.getElementById("loginEmail");
    const loginPassword = document.getElementById("loginPassword");
    if (loginEmail) loginEmail.value = email;
    if (loginPassword) loginPassword.value = "";
    switchAuthForm("login");
    showMessage("📧 Check your email and click Verify Email before signing in.");
  } catch (error) {
    console.error(error);
    showMessage(`❌ ${error.message || "Registration failed."}`);
  } finally {
    authBusy = false;
  }
}

async function handleLogin() {
  if (authBusy) return;
  const email = document.getElementById("loginEmail")?.value.trim().toLowerCase() || "";
  const password = document.getElementById("loginPassword")?.value || "";
  if (!email || !password) return showMessage("❌ Enter email and password.");

  authBusy = true;
  try {
    showMessage("⏳ Signing in...");
    const response = await fetch(`${LOOTRUSH_SERVER}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store"
    });
    const data = await readJson(response);
    if (!response.ok || !data.token || !data.user) throw new Error(data.error || "Wrong email or password.");
    setSession(data);
    applyServerUser(data.user);
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

function logout() {
  clearSession();
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
  showMessage("✅ You have been logged out.");
}

function isLoggedIn() { return Boolean(getToken()); }
function register() { return handleRegister(); }
function login() { return handleLogin(); }
function showRegister() { openAuth("register"); }
function showLogin() { openAuth("login"); }

window.addEventListener("DOMContentLoaded", async () => {
  const overlay = document.getElementById("authOverlay");
  if (overlay) overlay.classList.add("hidden");
  switchAuthForm("login");

  const params = new URLSearchParams(location.search);
  const verification = params.get("verification");
  const verifyToken = params.get("verify_email");

  if (verifyToken) {
    try {
      const response = await fetch(`${LOOTRUSH_SERVER}/verify-email?token=${encodeURIComponent(verifyToken)}`, { cache: "no-store" });
      if (response.redirected) {
        location.replace(response.url);
        return;
      }
    } catch {}
  }

  if (verification === "success") showMessage("✅ Email verified! You can now sign in.");
  if (verification === "invalid") showMessage("❌ Verification link is invalid or expired.");

  const token = getToken();
  if (!token) {
    openAuth("login");
    return;
  }

  const ok = await refreshServerUser();
  if (ok && typeof showPage === "function") showPage("game");
  else openAuth("login");
});
