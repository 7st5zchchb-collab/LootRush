// =====================================================
// LOOTRUSH PAYMENT UI
// Server webhook is the only authority for Diamonds.
// This file NEVER increments the Diamonds balance itself.
// =====================================================
(function () {
  "use strict";
  window.addEventListener("load", () => {
    if (typeof window.checkStripePayment === "function") window.checkStripePayment();
  });
})();
