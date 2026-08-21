// =====================================================
// LOOTRUSH SECURE STRIPE CLIENT
// Server is authoritative for account + Diamonds.
// This file NEVER changes the Diamonds balance itself.
// =====================================================
(function () {
  "use strict";

  const SERVER = "https://lootrush-2.onrender.com";

  function token() {
    return localStorage.getItem("lootRushToken") || "";
  }

  function authHeaders() {
    const t = token();
    return t ? { "Content-Type": "application/json", Authorization: `Bearer ${t}` } : { "Content-Type": "application/json" };
  }

  function message(text) {
    if (typeof showMessage === "function") showMessage(text);
  }

  async function refreshAccount() {
    const t = token();
    if (!t) return false;
    const r = await fetch(`${SERVER}/me`, { headers: { Authorization: `Bearer ${t}` }, cache: "no-store" });
    if (!r.ok) return false;
    const data = await r.json();
    if (typeof applyServerUser === "function") applyServerUser(data.user);
    else {
      localStorage.setItem("lootRushUser", JSON.stringify(data.user));
      localStorage.setItem("diamonds", String(data.user.diamonds));
    }
    return true;
  }

  // Override the old client-only checkout request with an authenticated request.
  window.buyWithStripe = async function (item) {
    try {
      if (!token()) {
        message("❌ Please log in first.");
        return;
      }
      if (!item || !item.productId) {
        message("❌ Product ID is missing.");
        return;
      }

      message("⏳ Opening secure Stripe Checkout...");
      const response = await fetch(`${SERVER}/create-checkout-session`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ productId: item.productId })
      });
      const data = await response.json();
      if (!response.ok || !data.url) throw new Error(data.error || "Stripe Checkout error.");
      window.location.href = data.url;
    } catch (error) {
      console.error("Stripe error:", error);
      message(`❌ ${error.message || "Stripe payment could not be started."}`);
    }
  };

  // Payment success is read-only. The webhook adds Diamonds server-side.
  window.checkStripePayment = async function () {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const sessionId = params.get("session_id");

    if (payment === "cancel") {
      message("❌ Payment cancelled.");
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }
    if (payment !== "success" || !sessionId) return;

    try {
      message("⏳ Confirming your Stripe payment...");
      const headers = { Authorization: `Bearer ${token()}` };
      let paid = false;

      for (let attempt = 0; attempt < 10; attempt++) {
        const statusResponse = await fetch(`${SERVER}/payment-status?session_id=${encodeURIComponent(sessionId)}`, { headers, cache: "no-store" });
        if (statusResponse.ok) {
          const status = await statusResponse.json();
          paid = status.paid === true;
          if (paid) break;
        }
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      if (!paid) {
        message("⏳ Payment received or still processing. Your Diamonds will appear automatically after Stripe confirms it.");
      } else {
        // Wait for webhook transaction, then read the authoritative balance.
        let refreshed = false;
        for (let attempt = 0; attempt < 10; attempt++) {
          refreshed = await refreshAccount();
          if (refreshed) break;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        message(refreshed ? "✅ Payment confirmed! Your Diamonds are in your account." : "✅ Payment confirmed. Refresh shortly to see your Diamonds.");
      }
    } catch (error) {
      console.error("Payment confirmation error:", error);
      message("⏳ Payment was submitted. Your Diamonds will be added after Stripe webhook confirmation.");
    } finally {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  window.addEventListener("load", () => {
    window.checkStripePayment();
  });
})();
