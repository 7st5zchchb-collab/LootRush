require("dotenv").config();
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const cors = require("cors");
const path = require("path");

const app = express();

// Թույլատրում ենք կապը ֆրոնտենդի (խաղի) հետ
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

// 1. Փոխեք ստատիկ ֆայլերի տողը (մոտավորապես 13-րդ տողում)
app.use(express.static(path.join(__dirname, "./..")));

// 2. Փոխեք index.html-ը բացելու տողը (մոտավորապես 17-րդ տողում)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./..", "index.html"));
});



// Վաճառքի սեսիայի ստեղծում (Checkout Session)
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { itemName, price, currencyType } = req.body;

    if (!itemName || !price) {
      return res.status(400).json({ error: "Missing product information" });
    }

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
            unit_amount: Math.round(price * 100),
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

// Սերվերի միացում Render-ի համար ճիշտ PORT-ով
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`LootRush server running on port ${PORT}`);
});

