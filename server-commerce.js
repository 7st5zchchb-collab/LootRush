// =====================================================
// LOOTRUSH SERVER COMMERCE
// Stripe creates the checkout; the webhook is the ONLY place
// that credits Diamonds. The browser never credits Diamonds.
// =====================================================
(function () {
  "use strict";
  const SERVER = String(window.LOOTRUSH_API_URL || "https://lootrush-2.onrender.com").replace(/\/$/, "");

  window.buyWithStripe = async function (item) {
    const token = localStorage.getItem("lootRushToken");
    if (!token) { if (typeof showMessage === "function") showMessage("❌ Please login first."); return; }
    if (!item?.productId) { if (typeof showMessage === "function") showMessage("❌ Invalid product."); return; }
    try {
      showMessage("⏳ Opening secure Stripe Checkout...");
      const response = await fetch(`${SERVER}/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId: item.productId }),
        cache: "no-store"
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.url) throw new Error(data.error || "Stripe Checkout could not be started.");
      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      showMessage(`❌ ${error.message || "Payment could not be started."}`);
    }
  };

  window.checkStripePayment = async function () {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    if (payment === "cancel") {
      showMessage("❌ Payment cancelled.");
      history.replaceState({}, document.title, location.pathname);
      return;
    }
    if (payment !== "success") return;

    showMessage("⏳ Confirming your Diamonds...");
    const token = localStorage.getItem("lootRushToken");
    if (!token) { showMessage("❌ Please login again to see the balance."); return; }

    try {
      let confirmed = false;
      for (let i = 0; i < 8; i++) {
        const r = await fetch(`${SERVER}/me`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
        if (r.ok) {
          const data = await r.json().catch(() => ({}));
          if (data.success && data.user && typeof applyServerUser === "function") applyServerUser(data.user);
          confirmed = Boolean(data.success && data.user);
          if (confirmed) break;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      showMessage(confirmed ? "✅ Payment received. Your balance is updated." : "⏳ Payment received; balance will update shortly.");
    } catch (e) {
      console.error(e);
      showMessage("⏳ Payment received; balance will update shortly.");
    } finally {
      history.replaceState({}, document.title, location.pathname);
    }
  };
})();
