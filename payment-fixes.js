// =====================================================
// LOOTRUSH PAYMENT FIXES
// Prevents the same Stripe Checkout session from granting
// Diamonds more than once on the client.
// =====================================================
(function () {
  "use strict";

  const SERVER = "https://lootrush-2.onrender.com";

  window.checkStripePayment = async function () {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const sessionId = params.get("session_id");

    if (payment === "cancel") {
      if (typeof showMessage === "function") showMessage("❌ Payment cancelled.");
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (payment !== "success" || !sessionId) return;

    const key = `lootRushStripeProcessed:${sessionId}`;
    if (localStorage.getItem(key) === "true") {
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    try {
      if (typeof showMessage === "function") showMessage("⏳ Verifying payment...");

      const response = await fetch(
        `${SERVER}/verify-payment?session_id=${encodeURIComponent(sessionId)}`,
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Payment verification failed.");
      }

      if (data.success === true && data.paid === true && Number(data.diamonds) > 0) {
        // The server marks a Stripe payment as delivered before this response
        // is returned. The local marker prevents refresh/double-credit on the UI.
        const amount = Number(data.diamonds);
        diamonds += amount;
        localStorage.setItem(key, "true");

        if (typeof updateAllUI === "function") updateAllUI();
        if (typeof saveGame === "function") saveGame();
        if (typeof showMessage === "function") {
          showMessage(`✅ Payment successful! +${amount} 💎 added.`);
        }
      } else if (data.alreadyDelivered) {
        localStorage.setItem(key, "true");
        if (typeof showMessage === "function") showMessage("ℹ️ This payment was already credited.");
      } else {
        if (typeof showMessage === "function") showMessage("❌ Payment was not completed.");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      if (typeof showMessage === "function") showMessage("❌ Could not verify Stripe payment.");
    } finally {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  // Remove a stale success query only after the page has had a chance to verify it.
  window.addEventListener("load", () => {
    if (typeof checkStripePayment === "function") checkStripePayment();
  });
})();
