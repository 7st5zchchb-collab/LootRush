/* =====================================================
   LOOTRUSH - SHOP SKINS ONLY
   Isolated from game loot/items and Rewards.
===================================================== */
(function () {
  const SKINS = [
    { name: "Crimson", icon: "❤️", price: 800, css: "skin-crimson" },
    { name: "Shadow", icon: "🖤", price: 1200, css: "skin-shadow" },
    { name: "Electric", icon: "⚡", price: 1600, css: "skin-electric" },
    { name: "Galaxy", icon: "🌌", price: 2200, css: "skin-galaxy" },
    { name: "Royal", icon: "👑", price: 3000, css: "skin-royal" },
    { name: "Toxic", icon: "☢️", price: 3500, css: "skin-toxic" },
    { name: "Frost", icon: "❄️", price: 4200, css: "skin-frost" },
    { name: "Inferno", icon: "🌋", price: 5000, css: "skin-inferno" },
    { name: "Ocean", icon: "🌊", price: 5800, css: "skin-ocean" },
    { name: "Solar", icon: "☀️", price: 6500, css: "skin-solar" },
    { name: "Void", icon: "🌀", price: 7500, css: "skin-void" },
    { name: "Diamond", icon: "💠", price: 9000, css: "skin-diamond" }
  ];
  window.LootRushShopSkins = SKINS;
  function ownedSkins(){try{return JSON.parse(localStorage.getItem("lootRushShopSkins")||"[]")}catch(e){return[]}}
  function buyLootRushSkin(name){
    const s=SKINS.find(x=>x.name===name); if(!s)return false;
    let coins=Number(localStorage.getItem("coins"))||0, owned=ownedSkins();
    if(owned.includes(s.name)){localStorage.setItem("currentSkin",s.name);renderShopSkins();return true}
    if(coins<s.price){alert(`Not enough 🪙 Coins! You need ${s.price.toLocaleString()} coins.`);return false}
    coins-=s.price;owned.push(s.name);
    localStorage.setItem("coins",String(coins));localStorage.setItem("lootRushShopSkins",JSON.stringify(owned));localStorage.setItem("currentSkin",s.name);
    window.dispatchEvent(new CustomEvent("skinChanged",{detail:s}));window.updateAllUI?.();renderShopSkins();return true;
  }
  function renderShopSkins(){
    const box=document.getElementById("coinShopItems");if(!box)return;const owned=ownedSkins();
    box.innerHTML=SKINS.map(s=>`<div class="shop-item skin-shop-item"><div class="shop-item-icon">${s.icon}</div><h3>${s.name}</h3><p>Limited player skin</p><strong>${s.price.toLocaleString()} 🪙</strong><button class="main-button skin-buy-btn" data-shop-skin="${s.name}">${owned.includes(s.name)?"EQUIP":"BUY"}</button></div>`).join("");
    box.querySelectorAll("[data-shop-skin]").forEach(b=>b.onclick=()=>buyLootRushSkin(b.dataset.shopSkin));
  }
  window.buyLootRushSkin=buyLootRushSkin;window.renderLootRushShopSkins=renderShopSkins;
  document.addEventListener("DOMContentLoaded",renderShopSkins);
})();
