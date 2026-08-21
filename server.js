require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL || "https://7st5zchchb-collab.github.io/LootRush";

if (!STRIPE_SECRET_KEY) {
  console.error("❌ STRIPE_SECRET_KEY is missing.");
  process.exit(1);
}

const stripe = Stripe(STRIPE_SECRET_KEY);

app.use(cors({
  origin: [
    "https://7st5zchchb-collab.github.io",
    "http://127.0.0.1:5500",
    "http://localhost:5500"
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

app.get("/", (req, res) => res.json({ success: true, service: "LootRush Stripe Server", status: "online" }));
app.get("/health", (req, res) => res.json({ success: true, status: "healthy" }));

const PRODUCTS = {
  diamonds_50: { name: "50 Diamonds", diamonds: 50, price: 39.99 },
  diamonds_100: { name: "100 Diamonds", diamonds: 100, price: 69.99 },
  diamonds_250: { name: "250 Diamonds", diamonds: 250, price: 149.99 },
  diamonds_500: { name: "500 Diamonds", diamonds: 500, price: 249.99 },
  diamonds_1000: { name: "1000 Diamonds", diamonds: 1000, price: 399.99 }
};

app.post("/create-checkout-session", async (req, res) => {
  try {
    const { productId } = req.body;
    const product = PRODUCTS[productId];
    if (!product) return res.status(400).json({ error: "Unknown product." });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            description: `${product.diamonds} LootRush Diamonds`
          },
          unit_amount: Math.round(product.price * 100)
        },
        quantity: 1
      }],
      success_url: `${FRONTEND_URL}/?payment=success&product=${encodeURIComponent(productId)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/?payment=cancel`,
      metadata: {
        productId,
        diamonds: String(product.diamonds)
      }
    });

    res.json({ success: true, url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("❌ Stripe Checkout Error:", error);
    res.status(500).json({ error: error.message || "Unable to create Stripe Checkout session." });
  }
});

app.get("/verify-payment", async (req, res) => {
  try {
    const sessionId = req.query.session_id;
    if (!sessionId) return res.status(400).json({ success: false, error: "session_id is required." });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === "paid";

    if (!paid) {
      return res.json({ success: false, paid: false, status: session.payment_status });
    }

    const productId = session.metadata?.productId;
    const product = productId ? PRODUCTS[productId] : null;
    if (!product) {
      return res.status(400).json({ success: false, paid: true, error: "Product information not found." });
    }

    // Durable idempotency: mark the Stripe PaymentIntent as delivered.
    // This prevents the same successful payment from granting Diamonds again
    // after a page refresh or a Render server restart.
    const paymentIntentId = typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

    if (!paymentIntentId) {
      return res.status(400).json({ success: false, paid: true, error: "PaymentIntent not found." });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.metadata?.lootRushDelivered === "true") {
      return res.json({
        success: false,
        paid: true,
        alreadyDelivered: true,
        productId,
        sessionId: session.id
      });
    }

    await stripe.paymentIntents.update(paymentIntentId, {
      metadata: {
        ...paymentIntent.metadata,
        lootRushDelivered: "true",
        lootRushProductId: productId,
        lootRushDiamonds: String(product.diamonds)
      }
    });

    return res.json({
      success: true,
      paid: true,
      productId,
      productName: product.name,
      diamonds: product.diamonds,
      sessionId: session.id
    });
  } catch (error) {
    console.error("❌ Payment verification error:", error);
    res.status(500).json({ success: false, error: "Unable to verify payment." });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("====================================");
  console.log("🚀 LootRush Stripe Server");
  console.log(`🌐 Port: ${PORT}`);
  console.log(`🔗 Frontend: ${FRONTEND_URL}`);
  console.log("💳 Stripe: READY");
  console.log("====================================");
});
