/* =====================================================
   LOOTRUSH - SHOP SKINS ONLY
   Isolated from game loot/items.
===================================================== */
(function () {
  const SKINS = [
    { name: "Inferno", icon: "🌋", price: 2000, css: "skin-inferno" },
    { name: "Electric", icon: "⚡", price: 2500, css: "skin-electric" },
    { name: "Galaxy", icon: "🌌", price: 3000, css: "skin-galaxy" },
    { name: "Royal", icon: "👑", price: 3500, css: "skin-royal" },
    { name: "Emerald", icon: "💚", price: 4000, css: "skin-emerald" },
    { name: "Frost", icon: "🧊", price: 4500, css: "skin-frost" },
    { name: "Crimson", icon: "❤️", price: 5000, css: "skin-crimson" },
    { name: "Shadow", icon: "🌑", price: 5500, css: "skin-shadow" }
  ];

  window.LootRushShopSkins = SKINS;

  window.buyLootRushSkin = function (skinName) {
    const skin = SKINS.find(s => s.name === skinName);
    if (!skin) return false;

    let coins = Number(localStorage.getItem("coins")) || 0;
    let owned = JSON.parse(localStorage.getItem("lootRushShopSkins") || "[]");

    if (owned.includes(skin.name)) {
      localStorage.setItem("currentSkin", skin.name);
      window.dispatchEvent(new CustomEvent("skinChanged", { detail: skin }));
      return true;
    }

    if (coins < skin.price) {
      alert(`Not enough 🪙 Coins! You need ${skin.price.toLocaleString()} coins.`);
      return false;
    }

    coins -= skin.price;
    owned.push(skin.name);
    localStorage.setItem("coins", String(coins));
    localStorage.setItem("lootRushShopSkins", JSON.stringify(owned));
    localStorage.setItem("currentSkin", skin.name);
    window.dispatchEvent(new CustomEvent("skinChanged", { detail: skin }));
    window.updateAllUI?.();
    return true;
  };
})();
