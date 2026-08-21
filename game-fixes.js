// =====================================================
// LOOTRUSH GAME FIXES
// Loaded after game.js through auth.js.
// =====================================================

(function () {
  "use strict";

  window.startBomberGame = function () {
    if (typeof bomberGameActive !== "undefined" && bomberGameActive) return;
    const bet = Number(window.bomberBet) || 1;
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
    const start = document.getElementById("bomberStartButton");
    const cashout = document.getElementById("bomberCashoutButton");
    if (start) start.disabled = true;
    if (cashout) cashout.disabled = true;
    if (typeof updateAllUI === "function") updateAllUI();
    if (typeof updateBomberUI === "function") updateBomberUI();
    if (typeof saveGame === "function") saveGame();
  };

  window.cashOutBomber = function () {
    if (!bomberGameActive || bomberSafeCount <= 0) return;
    const win = Math.max(1, Math.floor(Number(bomberMultiplier) || 1));
    bomberGameActive = false;
    diamonds += win;
    if (typeof revealBomberBoard === "function") revealBomberBoard();
    if (typeof updateAllUI === "function") updateAllUI();
    if (typeof updateBomberUI === "function") updateBomberUI();
    if (typeof saveGame === "function") saveGame();
    if (typeof showMessage === "function") showMessage(`💰 Cash Out +${win} 💎`);
  };

  const originalOpenBomberCell = window.openBomberCell;
  if (typeof originalOpenBomberCell === "function") {
    window.openBomberCell = function (index) {
      const before = bomberGameActive;
      originalOpenBomberCell(index);
      if (before && !bomberGameActive && typeof saveGame === "function") saveGame();
    };
  }

  // =====================================================
  // ROLL COST FIX
  // =====================================================
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

  // =====================================================
  // GAME INFO / ODDS PANEL
  // Uses the real loot[] chance values from game.js.
  // Current odds: 45% + 25% + 15% + 8% + 5% + 2% = 100%.
  // =====================================================
  function renderGameOdds() {
    const gameSection = document.getElementById("game");
    if (!gameSection || typeof loot === "undefined" || !Array.isArray(loot)) return;

    let panel = document.getElementById("gameOddsInfo");
    if (!panel) {
      const rollButton = gameSection.querySelector(".main-button[onclick*='rollLoot']");
      if (!rollButton) return;
      panel = document.createElement("div");
      panel.id = "gameOddsInfo";
      rollButton.insertAdjacentElement("afterend", panel);
    }

    const totalChance = loot.reduce((sum, item) => sum + Number(item.chance || 0), 0) || 1;
    const rows = loot.map(item => {
      const chance = Number(item.chance || 0) / totalChance * 100;
      const rewardText = item.type === "coins"
        ? `+${item.reward} 💵`
        : `+${item.reward} 💎`;
      return `<div class="odds-row">
        <span class="odds-item"><span class="odds-icon">${item.icon}</span><span>${item.name}</span></span>
        <strong>${rewardText}</strong>
        <span class="odds-chance">${chance.toFixed(0)}%</span>
      </div>`;
    }).join("");

    panel.innerHTML = `
      <div class="odds-header">
        <div><span class="odds-title">ℹ️ Roll Info</span><span class="odds-subtitle">Each Roll costs 100 💵</span></div>
        <span class="odds-total">100% total</span>
      </div>
      <div class="odds-table-head"><span>Reward</span><span>Win</span><span>Chance</span></div>
      <div class="odds-rows">${rows}</div>
    `;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const rollButton = document.querySelector("#game .main-button[onclick*='rollLoot']");
    if (rollButton) rollButton.textContent = "🎲 ROLL — 100 💵";
    renderGameOdds();
  });
})();
