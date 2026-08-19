require("dotenv").config();
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const cors = require("cors");
const path = require("path");
const fs = require('fs');

const app = express();

// Թույլատրում ենք կապը ֆրոնտենդի (խաղի) հետ
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

// Ստատիկ ֆայլերի (CSS/JS) միացում երկու տարբերակով էլ
app.use(express.static(path.join(__dirname, "../")));
app.use(express.static(path.join(__dirname, "./")));

// index.html-ի ավտոմատ որոնում և բացում
app.get("/", (req, res) => {
  const rootPath = path.join(__dirname, "../", "index.html");
  const serverPath = path.join(__dirname, "./", "index.html");
  
  if (fs.existsSync(rootPath)) {
    res.sendFile(rootPath);
  } else if (fs.existsSync(serverPath)) {
    res.sendFile(serverPath);
  } else {
    res.status(404).send("index.html file not found in root or server directory!");
  }
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

// Սերվերի միացում Render-ի համար
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`LootRush server running on port ${PORT}`);
});

