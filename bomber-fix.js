/* LootRush Bomber: balance-gated START -> inline offer flow. No Bet. */
(function () {
  let board = [];
  let bombs = 3;
  let active = false;
  let multiplier = 1;
  let safeCount = 0;
  const START_COST = 1;
  const MULTIPLIERS = [1.14, 1.28, 1.56];
  const $ = id => document.getElementById(id);

  function getMultiplier(count) {
    if (count <= 0) return 1;
    if (count <= 3) return MULTIPLIERS[count - 1];
    return MULTIPLIERS[2] * Math.pow(2, count - 3);
  }

  function getDiamondBalance() {
    return typeof diamonds === "number" && Number.isFinite(diamonds) ? diamonds : 0;
  }

  function persistBalance() {
    if (typeof saveGame === "function") saveGame();
    else localStorage.setItem("diamonds", diamonds);
  }

  function hideBomberOffer() {
    const offer = $("bomberOffer");
    if (!offer) return;
    offer.classList.remove("show");
    const msg = offer.querySelector(".lr-insufficient");
    if (msg) msg.remove();
  }

  function showBomberOffer(required) {
    const offer = $("bomberOffer");
    if (!offer) return;
    let msg = offer.querySelector(".lr-insufficient");
    if (!msg) {
      msg = document.createElement("div");
      msg.className = "lr-insufficient";
      offer.prepend(msg);
    }
    const balance = Math.floor(getDiamondBalance());
    msg.innerHTML = `⚠️ Բավարար Diamonds չկա<br><small>Պետք է՝ ${required} 💎 &nbsp;|&nbsp; Balance՝ ${balance} 💎</small>`;
    msg.classList.add("show");
    offer.classList.add("show");
  }

  function placeOfferAfterStart() {
    const start = $("bomberStartButton");
    const offer = $("bomberOffer");
    if (start && offer && start.parentElement) start.parentElement.insertBefore(offer, start.nextSibling);
  }

  function updateUI() {
    if ($("bombCount")) $("bombCount").textContent = bombs;
    if ($("safeCount")) $("safeCount").textContent = safeCount;
    if ($("bomberMultiplier")) $("bomberMultiplier").textContent = multiplier.toFixed(2) + "x";
    if ($("bomberDiamondBalance")) $("bomberDiamondBalance").textContent = Math.floor(getDiamondBalance());
    const start = $("bomberStartButton");
    const cash = $("bomberCashoutButton");
    if (start) { start.disabled = false; start.textContent = "▶ START"; }
    if (cash) cash.disabled = !active || safeCount === 0;
  }

  function createBoard() {
    const container = $("bomberBoard");
    if (!container) return;
    container.innerHTML = "";
    board = [];
    const bombPositions = new Set();
    while (bombPositions.size < bombs) bombPositions.add(Math.floor(Math.random() * 25));
    for (let i = 0; i < 25; i++) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "bomber-cell";
      cell.textContent = "?";
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
    createBoard();
    hideBomberOffer();
    updateUI();
  }

  function startBomberGame() {
    if (active) return;
    hideBomberOffer();

    if (getDiamondBalance() < START_COST) {
      showBomberOffer(START_COST);
      if ($("bomberStatus")) $("bomberStatus").textContent = "⚠️ NOT ENOUGH DIAMONDS";
      updateUI();
      return;
    }

    // Charge exactly 1 Diamond only when START actually starts a game.
    diamonds -= START_COST;
    persistBalance();
    safeCount = 0;
    multiplier = 1;
    active = true;
    createBoard();
    updateUI();
    if ($("bomberStatus")) $("bomberStatus").textContent = "READY";
  }

  function openCell(index, cell) {
    if (!active || cell.disabled) return;
    cell.disabled = true;
    if (cell.dataset.bomb === "1") {
      cell.textContent = "💣";
      cell.classList.add("bomb");
      active = false;
      board.forEach(c => { c.disabled = true; if (c.dataset.bomb === "1") c.textContent = "💣"; });
      if ($("bomberStatus")) $("bomberStatus").textContent = "💥 BOMB!";
      updateUI();
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
    if (!active || safeCount < 1) return;
    active = false;
    if ($("bomberStatus")) $("bomberStatus").textContent = `CASH OUT ${multiplier.toFixed(2)}x`;
    board.forEach(c => { c.disabled = true; if (c.dataset.bomb === "1") c.textContent = "💣"; });
    updateUI();
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
  window.updateBomberBetUI = function () {};
  window.initBomber = resetBoard;
  window.skipGameOffer = function (game) {
    if (game !== "bomber") return;
    hideBomberOffer();
    if ($("bomberStatus")) $("bomberStatus").textContent = "READY";
    updateUI();
  };

  document.addEventListener("DOMContentLoaded", () => {
    const selector = $("bomberBombSelector");
    if (selector) {
      selector.innerHTML = "";
      for (let i = 3; i <= 24; i++) {
        const option = document.createElement("option");
        option.value = String(i);
        option.textContent = `${i} Bombs`;
        selector.appendChild(option);
      }
      selector.value = "3";
    }
    placeOfferAfterStart();
    hideBomberOffer();
    resetBoard();
  });
})();
