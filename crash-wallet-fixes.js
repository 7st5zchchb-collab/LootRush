// =====================================================
// LOOTRUSH CRASH + WALLET FIXES
// =====================================================
(function () {
  "use strict";

  function showCrashInsufficientModal(required) {
    let m = document.getElementById("crashInsufficientModal");
    if (!m) {
      m = document.createElement("div");
      m.id = "crashInsufficientModal";
      m.innerHTML = `<div class="bomber-offer-backdrop"></div><div class="bomber-offer-modal"><div class="bomber-insufficient">⚠️ Բավարար Diamonds չկա<div class="bomber-balance-line">Պետք է՝ <b class="required">1</b> 💎 &nbsp;|&nbsp; Balance՝ <b class="current">0</b> 💎</div></div><div class="bomber-offer-content"><div class="bomber-ad-box">Advertisement</div><div class="bomber-diamond-box"><div class="bomber-diamond-icon">💎</div><b>Need more Diamonds?</b><span>Get Diamonds instantly</span><button type="button" class="bomber-buy-diamonds">GET DIAMONDS</button></div></div><button type="button" class="bomber-skip">Skip</button></div>`;
      document.body.appendChild(m);
      const close = () => m.classList.remove("show");
      m.querySelector(".bomber-buy-diamonds").onclick = () => { close(); if (typeof showPage === "function") showPage("shop"); };
      m.querySelector(".bomber-skip").onclick = close;
      m.querySelector(".bomber-offer-backdrop").onclick = close;
    }
    m.querySelector(".required").textContent = required;
    m.querySelector(".current").textContent = Math.floor(Number(diamonds) || 0);
    m.classList.add("show");
  }

  window.startCrashGame = function () {
    if (crashGameActive) return;
    const input = document.getElementById("crashBet");
    const requestedBet = Math.floor(Number(input && input.value) || 5);
    crashBet = Math.max(1, requestedBet);

    if (!Number.isFinite(crashBet) || crashBet <= 0) {
      showMessage("❌ Invalid bet.");
      return;
    }
    if (diamonds < crashBet) {
      showCrashInsufficientModal(crashBet);
      return;
    }

    diamonds -= crashBet;
    crashGameActive = true;
    crashMultiplier = 1;
    crashStep = 0;
    crashHistory = [];
    updateAllUI();
    updateCrashUI();
    saveGame();
    runCrashStep();
  };

  window.cashOutCrash = function () {
    if (!crashGameActive) return;
    const payout = Number((crashBet * crashMultiplier).toFixed(2));
    crashGameActive = false;
    diamonds += payout;
    crashWins++;
    crashTotalGames++;
    crashTotalWon += payout;
    saveGame();
    updateAllUI();
    updateCrashUI();
    renderCrashHistory();
    showMessage(`💰 CASH OUT +${payout.toFixed(2)} 💎`);
  };

  window.crashGameLose = function () {
    if (!crashGameActive) return;
    crashGameActive = false;
    crashLosses++;
    crashTotalGames++;
    saveGame();
    updateAllUI();
    updateCrashUI();
    renderCrashHistory();
    showMessage(`💥 CRASH at ${crashMultiplier.toFixed(2)}x`);
  };

  window.crashAutoWin = function () {
    if (!crashGameActive) return;
    const payout = Number((crashBet * crashMultiplier).toFixed(2));
    crashGameActive = false;
    diamonds += payout;
    crashWins++;
    crashTotalGames++;
    crashTotalWon += payout;
    saveGame();
    updateAllUI();
    updateCrashUI();
    renderCrashHistory();
    showMessage(`🏆 +${payout.toFixed(2)} 💎`);
  };

  window.createWithdrawalRequest = function () {
    const amount = Math.floor(Number(document.getElementById("withdrawDiamonds")?.value) || 0);
    const name = document.getElementById("withdrawName")?.value.trim() || "";
    const card = document.getElementById("withdrawCard")?.value.trim() || "";
    const clean = card.replace(/\D/g, "");
    if (amount < 1) { showMessage("❌ Enter a valid whole-number amount."); return; }
    if (amount > diamonds) { showMessage("❌ Not enough diamonds."); return; }
    if (!name) { showMessage("❌ Enter your name."); return; }
    if (clean.length !== 16) { showMessage("❌ Enter a valid 16-digit card number."); return; }
    diamonds -= amount;
    let requests = [];
    try { requests = JSON.parse(localStorage.getItem("withdrawals")) || []; if (!Array.isArray(requests)) requests = []; } catch { requests = []; }
    requests.push({ amount, name, card: "**** **** **** " + clean.slice(-4), status: "Pending", date: new Date().toLocaleString() });
    localStorage.setItem("withdrawals", JSON.stringify(requests));
    updateAllUI(); saveGame(); showMessage("📤 Withdrawal request sent.");
  };

  function cleanWalletValue(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = el.textContent.replace(/[⭐💎💵🪙🤑]/gu, "").trim();
  }
  function cleanWalletEmojis() {
    cleanWalletValue("walletPoints");
    cleanWalletValue("walletDiamonds");
    cleanWalletValue("walletDollarValue");
  }
  window.addEventListener("DOMContentLoaded", cleanWalletEmojis);
  setTimeout(cleanWalletEmojis, 0);
  setTimeout(cleanWalletEmojis, 100);
  setTimeout(cleanWalletEmojis, 500);
  setTimeout(cleanWalletEmojis, 1000);
  setInterval(cleanWalletEmojis, 500);
})();
