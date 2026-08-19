require("dotenv").config();
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const cors = require("cors");

const app = express();

// Թույլատրում ենք կապը ֆրոնտենդի (խաղի) հետ
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

// Թեստային էջ ստուգման համար
app.get("/", (req, res) => {
  res.send("LootRush Stripe Server is running smoothly!");
});

// Վճարման սեսիայի ստեղծում (Checkout Session)
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { itemName, price, currencyType } = req.body;

    if (!itemName || !price) {
      return res.status(400).json({ error: "Missing product information" });
    }

    // Ստեղծում ենք վճարման էջը Stripe-ում
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: itemName,
              description: `Purchase for LootRush Game (${currencyType || "In-game item"})`,
            },
            unit_amount: Math.round(price * 100), // Stripe-ը գումարը ընդունում է ցենտերով (օր. $4.99 = 499)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}?payment=success&item=${encodeURIComponent(itemName)}`,
      cancel_url: `${process.env.CLIENT_URL}?payment=cancel`,
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Սերվերի միացում
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`LootRush server running on http://localhost:${PORT}`);
});
