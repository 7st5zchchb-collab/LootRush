// =====================================================
// LOOTRUSH SERVER AUTH
// Real account + server-side balance. No client balance authority.
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
  loginForm.classList.toggle("hidden", form !== "login");
  registerForm.classList.toggle("hidden", form !== "register");
}
function getToken() { return localStorage.getItem("lootRushToken") || ""; }
function getUser() { try { return JSON.parse(localStorage.getItem("lootRushUser")) || null; } catch { return null; } }
function setSession(data) {
  localStorage.setItem("lootRushToken", data.token);
  localStorage.setItem("lootRushLoggedIn", "true");
  localStorage.setItem("loggedIn", "true");
  localStorage.setItem("lootRushUser", JSON.stringify(data.user));
  localStorage.setItem("playerName", data.user.username);
  // These are UI cache only. Server remains authoritative.
  localStorage.setItem("coins", String(data.user.coins));
  localStorage.setItem("diamonds", String(data.user.diamonds));
  localStorage.setItem("points", String(data.user.points));
}
function applyServerUser(user) {
  localStorage.setItem("lootRushUser", JSON.stringify(user));
  localStorage.setItem("playerName", user.username);
  coins = Number(user.coins);
  diamonds = Number(user.diamonds);
  points = Number(user.points);
  localStorage.setItem("coins", String(coins));
  localStorage.setItem("diamonds", String(diamonds));
  localStorage.setItem("points", String(points));
  if (typeof updateAllUI === "function") updateAllUI();
}
async function refreshServerUser() {
  const token = getToken();
  if (!token) return false;
  try {
    const r = await fetch(`${LOOTRUSH_SERVER}/me`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!r.ok) throw new Error("Session expired");
    const data = await r.json();
    applyServerUser(data.user);
    return true;
  } catch {
    localStorage.removeItem("lootRushToken");
    localStorage.setItem("lootRushLoggedIn", "false");
    localStorage.setItem("loggedIn", "false");
    return false;
  }
}
function checkAuth() {
  const overlay = document.getElementById("authOverlay");
  if (overlay) overlay.classList.toggle("hidden", Boolean(getToken()));
}

async function handleRegister() {
  const username = document.getElementById("regUsername")?.value.trim();
  const email = document.getElementById("regEmail")?.value.trim();
  const password = document.getElementById("regPassword")?.value || "";
  if (username.length < 3 || !email.includes("@") || password.length < 6) {
    showMessage("❌ Username 3+, valid email and password 6+ characters required."); return;
  }
  try {
    const r = await fetch(`${LOOTRUSH_SERVER}/register`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({username,email,password}) });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Registration failed");
    showMessage("✅ Account created. Sign in now.");
    document.getElementById("loginEmail").value = email;
    switchAuthForm("login");
  } catch (e) { showMessage(`❌ ${e.message}`); }
}

async function handleLogin() {
  const email = document.getElementById("loginEmail")?.value.trim();
  const password = document.getElementById("loginPassword")?.value || "";
  if (!email || !password) { showMessage("❌ Enter email and password!"); return; }
  try {
    const r = await fetch(`${LOOTRUSH_SERVER}/login`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email,password}) });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Login failed");
    setSession(data);
    const overlay = document.getElementById("authOverlay");
    if (overlay) overlay.classList.add("hidden");
    showMessage(`✅ Welcome ${data.user.username}!`);
    await refreshServerUser();
  } catch (e) { showMessage(`❌ ${e.message}`); }
}

function logout() {
  localStorage.removeItem("lootRushToken");
  localStorage.setItem("lootRushLoggedIn", "false");
  localStorage.setItem("loggedIn", "false");
  const overlay = document.getElementById("authOverlay");
  if (overlay) overlay.classList.remove("hidden");
  switchAuthForm("login");
}
function isLoggedIn() { return Boolean(getToken()); }
function register() { handleRegister(); }
function login() { handleLogin(); }
function showRegister() { switchAuthForm("register"); }
function showLogin() { switchAuthForm("login"); }

window.addEventListener("DOMContentLoaded", async () => {
  const ok = await refreshServerUser();
  checkAuth();
  if (ok) {
    const user = getUser();
    if (user) document.getElementById("playerNameTop")?.replaceChildren(document.createTextNode(user.username));
  }
});
