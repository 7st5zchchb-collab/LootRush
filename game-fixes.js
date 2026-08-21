// =====================================================
// LOOTRUSH GAME FIXES
// =====================================================

(function () {
  "use strict";

  // BOMBER: start a fresh round every time Start is pressed.
  window.startBomberGame = function () {
    if (typeof bomberGameActive !== "undefined" && bomberGameActive) return;

    const bet = 1;
    if (typeof diamonds === "undefined" || diamonds < bet) {
      if (typeof showMessage === "function") showMessage("❌ You need 1 💎.");
      return;
    }

    diamonds -= bet;
    bomberGameActive = true;
    bomberMultiplier = 1;
    bomberSafeCount = 0;

    const bombCount = Math.max(1, Math.min(24, Number(bomberBombs) || 3));
    bomberBoard = Array.from({ length: 25 }, () => ({ bomb: false, opened: false }));

    let placed = 0;
    while (placed < bombCount) {
      const index = Math.floor(Math.random() * bomberBoard.length);
      if (!bomberBoard[index].bomb) {
        bomberBoard[index].bomb = true;
        placed++;
      }
    }

    const board = document.getElementById("bomberBoard");
    if (board) {
      board.innerHTML = "";
      bomberBoard.forEach((cellData, index) => {
        const button = document.createElement("button");
        button.className = "bomber-cell";
        button.textContent = "❓";
        button.disabled = false;
        button.onclick = () => openBomberCell(index);
        board.appendChild(button);
      });
    }

    updateBomberControls();
    updateAllUI();
    if (typeof updateBomberUI === "function") updateBomberUI();
    saveGame();
  };

  // BOMBER: Cash Out immediately adds the winnings and unlocks a new round.
  window.cashOutBomber = function () {
    if (!bomberGameActive || bomberSafeCount <= 0) return;

    const win = Math.max(1, Math.floor(Number(bomberMultiplier) || 1));
    bomberGameActive = false;
    diamonds += win;

    // Do not leave the board in a locked state.
    if (typeof revealBomberBoard === "function") revealBomberBoard();
    updateBomberControls();
    updateAllUI();
    if (typeof updateBomberUI === "function") updateBomberUI();
    saveGame();

    if (typeof showMessage === "function") showMessage(`💰 Cash Out +${win} 💎 — Balance updated!`);
  };

  function updateBomberControls() {
    const start = document.getElementById("bomberStartButton");
    const cashout = document.getElementById("bomberCashoutButton");

    // Start is available whenever no round is active.
    if (start) {
      start.disabled = !!bomberGameActive;
      start.textContent = "💎 START — 1 💎";
    }

    // Cash Out is available only after at least one safe cell.
    if (cashout) {
      cashout.disabled = !bomberGameActive || bomberSafeCount <= 0;
    }
  }

  // Save a lost Bomber round immediately.
  const originalOpenBomberCell = window.openBomberCell;
  if (typeof originalOpenBomberCell === "function") {
    window.openBomberCell = function (index) {
      const before = bomberGameActive;
      originalOpenBomberCell(index);
      if (before && !bomberGameActive) {
        updateBomberControls();
        saveGame();
      } else {
        updateBomberControls();
      }
    };
  }

  // ROLL COST: exactly 100 coins.
  window.rollLoot = function () {
    const cost = 100;

    if (coins < cost) {
      showMessage("❌ Not enough coins! You need 100 💵.");
      return;
    }

    coins -= cost;
    totalRolls++;
    const item = getRandomLoot();

    if (["RARE", "EPIC", "LEGENDARY", "MYTHIC"].includes(item.rarity)) {
      rareItems++;
      streak++;
      if (streak > bestStreak) bestStreak = streak;
    } else {
      streak = 0;
    }

    if (item.type === "coins") coins += item.reward;
    if (item.type === "diamonds") diamonds += item.reward;
    addInventoryItem(item);

    const rarity = document.getElementById("rarity");
    const icon = document.getElementById("lootIcon");
    const name = document.getElementById("lootName");
    const description = document.getElementById("lootDescription");
    const reward = document.getElementById("reward");

    if (rarity) rarity.textContent = item.rarity;
    if (icon) icon.textContent = item.icon;
    if (name) name.textContent = item.name;
    if (description) description.textContent = item.description;
    if (reward) reward.textContent = item.type === "coins" ? `+${item.reward} 💵` : `+${item.reward} 💎`;

    updateAllUI();
    renderInventory();
    saveGame();
    showMessage(`🎉 You won ${item.name}!`);
  };

  document.addEventListener("DOMContentLoaded", () => {
    const rollButton = document.querySelector("#game .main-button[onclick*='rollLoot']");
    if (rollButton) rollButton.textContent = "🎲 ROLL — 100 💵";
    updateBomberControls();
  });
})();
