/* =====================================================
   LOOTRUSH BOMBER - 5x5 BOARD
   Bomb selector: 3 through 24.
   Diamond balance + bet are used for every round.
===================================================== */
(function () {
  let board = [];
  let bombs = 3;
  let active = false;
  let multiplier = 1;
  let safeCount = 0;
  let currentBet = 1;
  let roundStake = 0;

  const MULTIPLIERS = [1.14, 1.28, 1.56];
  const $ = id => document.getElementById(id);

  function getMultiplier(count) {
    if (count <= 0) return 1;
    if (count <= MULTIPLIERS.length) return MULTIPLIERS[count - 1];
    return MULTIPLIERS[2] * Math.pow(2, count - 3);
  }

  function getDiamondBalance() {
    return typeof diamonds === "number" && Number.isFinite(diamonds)
      ? diamonds
      : 0;
  }

  function updateUI() {
    const bombCount = $("bombCount");
    const safe = $("safeCount");
    const mult = $("bomberMultiplier");
    const status = $("bomberStatus");
    const start = $("bomberStartButton");
    const cash = $("bomberCashoutButton");
    const balance = $("bomberDiamondBalance");
    const bet = $("bomberBet");

    if (bombCount) bombCount.textContent = bombs;
    if (safe) safe.textContent = safeCount;
    if (mult) mult.textContent = multiplier.toFixed(2) + "x";
    if (balance) balance.textContent = Math.floor(getDiamondBalance());
    if (bet && !active) bet.value = currentBet;
    if (start) {
      start.disabled = active || getDiamondBalance() < currentBet;
      start.textContent = `💎 START — ${currentBet} 💎`;
    }
    if (cash) {
      cash.disabled = !active || safeCount === 0;
    }
    if (status && !active && safeCount === 0) status.textContent = "READY";
  }

  function createBoard() {
    const container = $("bomberBoard");
    if (!container) return;

    container.innerHTML = "";
    board = [];

    const bombPositions = new Set();
    while (bombPositions.size < bombs) {
      bombPositions.add(Math.floor(Math.random() * 25));
    }

    for (let i = 0; i < 25; i++) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "bomber-cell";
      cell.textContent = "?";
      cell.dataset.index = i;
      cell.dataset.bomb = bombPositions.has(i) ? "1" : "0";
      cell.addEventListener("click", () => openCell(i, cell));
      container.appendChild(cell);
      board.push(cell);
    }
  }

  function resetBoard() {
    active = false;
    safeCount = 0;
    multiplier = 1;
    roundStake = 0;
    createBoard();
    updateUI();
  }

  function updateBomberBetUI() {
    if (active) return;
    const input = $("bomberBet");
    let value = input ? Math.floor(Number(input.value)) : 1;
    if (!Number.isInteger(value) || value < 1) value = 1;
    currentBet = value;
    if (input) input.value = currentBet;
    updateUI();
  }

  function startBomberGame() {
    if (active) return;

    updateBomberBetUI();

    const balance = getDiamondBalance();
    if (currentBet > balance) {
      if (typeof showMessage === "function") showMessage("❌ Not enough diamonds!");
      return;
    }

    roundStake = currentBet;
    diamonds = Math.max(0, balance - roundStake);
    safeCount = 0;
    multiplier = 1;
    active = true;

    if (typeof saveGame === "function") saveGame();
    if (typeof updateAllUI === "function") updateAllUI();

    createBoard();
    updateUI();
  }

  function openCell(index, cell) {
    if (!active || cell.disabled) return;
    cell.disabled = true;

    if (cell.dataset.bomb === "1") {
      cell.textContent = "💣";
      cell.classList.add("bomb");
      active = false;

      board.forEach(c => {
        c.disabled = true;
        if (c.dataset.bomb === "1") c.textContent = "💣";
      });

      const status = $("bomberStatus");
      if (status) status.textContent = "💥 BOMB! BET LOST";

      roundStake = 0;
      updateUI();
      if (typeof saveGame === "function") saveGame();
      if (typeof updateAllUI === "function") updateAllUI();
      return;
    }

    safeCount++;
    multiplier = getMultiplier(safeCount);
    cell.textContent = "💎";
    cell.classList.add("safe");
    updateUI();

    if (safeCount >= 25 - bombs) cashOutBomber();
  }

  function cashOutBomber() {
    if (!active || safeCount < 1 || roundStake < 1) return;

    const reward = roundStake * multiplier;
    diamonds += reward;
    active = false;

    board.forEach(c => {
      c.disabled = true;
      if (c.dataset.bomb === "1") c.textContent = "💣";
    });

    const status = $("bomberStatus");
    if (status) status.textContent = `CASHED OUT +${reward.toFixed(2)} 💎`;

    roundStake = 0;
    updateUI();
    if (typeof saveGame === "function") saveGame();
    if (typeof updateAllUI === "function") updateAllUI();
  }

  function changeBomberBombs() {
    if (active) return;
    const selector = $("bomberBombSelector");
    let value = selector ? Number(selector.value) : 3;
    if (!Number.isInteger(value) || value < 3 || value > 24) value = 3;
    bombs = value;
    if (selector) selector.value = String(bombs);
    resetBoard();
  }

  window.startBomberGame = startBomberGame;
  window.cashOutBomber = cashOutBomber;
  window.changeBomberBombs = changeBomberBombs;
  window.updateBomberBetUI = updateBomberBetUI;
  window.initBomber = resetBoard;

  document.addEventListener("DOMContentLoaded", () => {
    const selector = $("bomberBombSelector");
    if (selector) {
      selector.innerHTML = "";
      for (let i = 3; i <= 24; i++) {
        const option = document.createElement("option");
        option.value = String(i);
        option.textContent = `${i} Bombs`;
        if (i === 3) option.selected = true;
        selector.appendChild(option);
      }
      bombs = 3;
    }
    resetBoard();
  });
})();
