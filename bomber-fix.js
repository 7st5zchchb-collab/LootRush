/* =====================================================
   LOOTRUSH BOMBER - RESTORE VISIBLE BOARD
   Keeps the original 5x5 Bomber appearance and START/CASH OUT flow.
===================================================== */
(function () {
  let board = [];
  let bombs = 3;
  let active = false;
  let multiplier = 1;
  let safeCount = 0;

  const $ = id => document.getElementById(id);

  function updateUI() {
    const bombCount = $("bombCount");
    const safe = $("safeCount");
    const mult = $("bomberMultiplier");
    const status = $("bomberStatus");
    const start = $("bomberStartButton");
    const cash = $("bomberCashoutButton");

    if (bombCount) bombCount.textContent = bombs;
    if (safe) safe.textContent = safeCount;
    if (mult) mult.textContent = multiplier.toFixed(2) + "x";
    if (status) status.textContent = active ? "PLAYING" : "READY";

    if (start) {
      start.disabled = active;
      start.style.display = "block";
    }
    if (cash) {
      cash.disabled = !active || safeCount === 0;
      cash.style.display = "block";
    }
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

    container.style.visibility = "visible";
    container.style.opacity = "1";
  }

  function resetBoard() {
    active = false;
    safeCount = 0;
    multiplier = 1;
    createBoard();
    updateUI();
  }

  function startBomberGame() {
    if (active) return;
    if (typeof diamonds === "undefined" || Number(diamonds) < 1) {
      if (typeof showMessage === "function") showMessage("❌ Not enough diamonds!");
      return;
    }

    diamonds -= 1;
    if (typeof saveGame === "function") saveGame();
    if (typeof updateAllUI === "function") updateAllUI();

    active = true;
    safeCount = 0;
    multiplier = 1;

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
      if (status) status.textContent = "💥 BOMB!";
      updateUI();
      if (typeof saveGame === "function") saveGame();
      if (typeof updateAllUI === "function") updateAllUI();
      return;
    }

    safeCount++;
    multiplier = 1 + safeCount * 0.15;
    cell.textContent = "💎";
    cell.classList.add("safe");
    updateUI();

    if (safeCount >= 25 - bombs) {
      cashOutBomber();
    }
  }

  function cashOutBomber() {
    if (!active || safeCount < 1) return;

    const reward = Math.max(1, Math.floor(safeCount * multiplier));
    diamonds += reward;
    active = false;

    board.forEach(c => {
      c.disabled = true;
      if (c.dataset.bomb === "1") c.textContent = "💣";
    });

    const status = $("bomberStatus");
    if (status) status.textContent = `CASHED OUT +${reward} 💎`;

    updateUI();
    if (typeof saveGame === "function") saveGame();
    if (typeof updateAllUI === "function") updateAllUI();

    setTimeout(() => {
      const start = $("bomberStartButton");
      const cash = $("bomberCashoutButton");
      if (start) {
        start.disabled = false;
        start.style.display = "block";
      }
      if (cash) cash.disabled = true;
    }, 0);
  }

  function changeBomberBombs() {
    const selector = $("bomberBombSelector");
    if (active) return;
    bombs = selector ? Number(selector.value) || 3 : 3;
    resetBoard();
  }

  window.startBomberGame = startBomberGame;
  window.cashOutBomber = cashOutBomber;
  window.changeBomberBombs = changeBomberBombs;
  window.initBomber = resetBoard;
  window.bomberGameActive = false;

  document.addEventListener("DOMContentLoaded", () => {
    const selector = $("bomberBombSelector");
    if (selector) bombs = Number(selector.value) || 3;
    resetBoard();
  });

  // Keep the board ready whenever the Bomber page is opened.
  const originalShowPage = window.showPage;
  if (typeof originalShowPage === "function") {
    window.showPage = function (pageId) {
      originalShowPage.apply(this, arguments);
      if (pageId === "bomber") setTimeout(resetBoard, 0);
    };
  }
})();
