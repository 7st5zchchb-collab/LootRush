// =====================================================
// LOOTRUSH CRASH + WALLET FIXES
// Loaded after game.js and before auth.js.
// =====================================================
(function () {
  "use strict";

  // Prevent a running Crash game from paying twice and make the
  // bet/payout state explicit.
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
      showMessage("❌ Not enough diamonds.");
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

  // Wallet: never allow negative/decimal diamond withdrawal and do not
  // store full card numbers. Only the last four digits are retained.
  window.createWithdrawalRequest = function () {
    const amount = Math.floor(Number(document.getElementById("withdrawDiamonds")?.value) || 0);
    const name = document.getElementById("withdrawName")?.value.trim() || "";
    const card = document.getElementById("withdrawCard")?.value.trim() || "";
    const clean = card.replace(/\D/g, "");

    if (amount < 1) {
      showMessage("❌ Enter a valid whole-number amount.");
      return;
    }
    if (amount > diamonds) {
      showMessage("❌ Not enough diamonds.");
      return;
    }
    if (!name) {
      showMessage("❌ Enter your name.");
      return;
    }
    if (clean.length !== 16) {
      showMessage("❌ Enter a valid 16-digit card number.");
      return;
    }

    diamonds -= amount;

    let requests = [];
    try {
      requests = JSON.parse(localStorage.getItem("withdrawals")) || [];
      if (!Array.isArray(requests)) requests = [];
    } catch {
      requests = [];
    }

    requests.push({
      amount,
      name,
      card: "**** **** **** " + clean.slice(-4),
      status: "Pending",
      date: new Date().toLocaleString()
    });

    localStorage.setItem("withdrawals", JSON.stringify(requests));
    updateAllUI();
    saveGame();
    showMessage("📤 Withdrawal request sent.");
  };
})();
