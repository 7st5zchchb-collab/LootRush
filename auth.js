// ================================
// LOGIN / REGISTER 3D TRANSITION
// ================================

const authCard = document.getElementById("authCard");

// ================================
// SHOW REGISTER
// ================================

function showRegister() {
  authCard.classList.add("register-active");
}

// ================================
// SHOW LOGIN
// ================================

function showLogin() {
  authCard.classList.remove("register-active");
}

// ================================
// REGISTER
// ================================

function register() {
  const username = document.getElementById("registerUsername").value.trim();

  const email = document.getElementById("registerEmail").value.trim();

  const password = document.getElementById("registerPassword").value;

  const password2 = document.getElementById("registerPassword2").value;

  if (!username || !email || !password || !password2) {
    showMessage("❌ Fill in all fields!");

    return;
  }

  if (password !== password2) {
    showMessage("❌ Passwords do not match!");

    return;
  }

  const user = {
    username: username,

    email: email,

    password: password,

    coins: 100,

    diamonds: 0,
  };

  localStorage.setItem("lootRushUser", JSON.stringify(user));

  showMessage("✅ Account created!");

  setTimeout(function () {
    showLogin();
  }, 1000);
}

// ================================
// LOGIN
// ================================

function login() {
  const username = document.getElementById("loginUsername").value.trim();

  const password = document.getElementById("loginPassword").value;

  const saved = localStorage.getItem("lootRushUser");

  if (!saved) {
    showMessage("❌ Account not found!");

    return;
  }

  const user = JSON.parse(saved);

  if (username !== user.username || password !== user.password) {
    showMessage("❌ Wrong username or password!");

    return;
  }

  localStorage.setItem("lootRushLoggedIn", "true");

  showMessage("✅ Login successful!");

  setTimeout(function () {
    window.location.href = "index.html";
  }, 800);
}

// ================================
// MESSAGE
// ================================

function showMessage(text) {
  const message = document.getElementById("message");

  message.textContent = text;

  message.classList.add("show");

  setTimeout(function () {
    message.classList.remove("show");
  }, 2500);
}
