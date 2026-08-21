require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");
const crypto = require("crypto");
const { Pool } = require("pg");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || "https://7st5zchchb-collab.github.io/LootRush";

if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET || !SESSION_SECRET || !process.env.DATABASE_URL) {
  console.error("❌ Missing STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SESSION_SECRET or DATABASE_URL.");
  process.exit(1);
}

const stripe = Stripe(STRIPE_SECRET_KEY);
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const PRODUCTS = {
  diamonds_50: { name: "50 Diamonds", diamonds: 50, priceCents: 3999 },
  diamonds_100: { name: "100 Diamonds", diamonds: 100, priceCents: 6999 },
  diamonds_250: { name: "250 Diamonds", diamonds: 250, priceCents: 14999 },
  diamonds_500: { name: "500 Diamonds", diamonds: 500, priceCents: 24999 },
  diamonds_1000: { name: "1000 Diamonds", diamonds: 1000, priceCents: 39999 }
};

app.use(cors({
  origin: ["https://7st5zchchb-collab.github.io", "http://127.0.0.1:5500", "http://localhost:5500"],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Stripe-Signature"]
}));

// Stripe requires the raw body for signature verification.
app.post("/stripe-webhook", express.raw({ type: "application/json" }), async (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers["stripe-signature"], STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("❌ Invalid Stripe webhook signature:", err.message);
    return res.status(400).send("Invalid signature");
  }

  try {
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object;
      if (session.payment_status !== "paid") return res.json({ received: true });

      const accountId = session.metadata?.accountId;
      const productId = session.metadata?.productId;
      const product = PRODUCTS[productId];
      const paymentId = typeof session.payment_intent === "string" ? session.payment_intent : session.id;
      if (!accountId || !product || !paymentId) return res.status(400).send("Missing payment metadata");

      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const duplicate = await client.query("SELECT id FROM payments WHERE stripe_payment_id=$1 FOR UPDATE", [paymentId]);
        if (duplicate.rowCount === 0) {
          const user = await client.query("SELECT id FROM users WHERE id=$1 FOR UPDATE", [accountId]);
          if (user.rowCount !== 1) throw new Error("Account not found");
          await client.query("UPDATE users SET diamonds=diamonds+$1, updated_at=NOW() WHERE id=$2", [product.diamonds, accountId]);
          await client.query("INSERT INTO payments (stripe_payment_id,account_id,product_id,diamonds,amount_cents,currency) VALUES ($1,$2,$3,$4,$5,$6)", [paymentId, accountId, productId, product.diamonds, session.amount_total || product.priceCents, session.currency || "usd"]);
        }
        await client.query("COMMIT");
      } catch (e) {
        await client.query("ROLLBACK");
        throw e;
      } finally { client.release(); }
    }
    return res.json({ received: true });
  } catch (err) {
    console.error("❌ Webhook processing error:", err);
    return res.status(500).send("Webhook processing failed");
  }
});

app.use(express.json());

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  return new Promise((resolve, reject) => crypto.scrypt(password, salt, 64, (err, key) => err ? reject(err) : resolve(`${salt}:${key.toString("hex")}`)));
}
function verifyPassword(password, stored) {
  return new Promise((resolve, reject) => {
    const [salt, hash] = String(stored).split(":");
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) return reject(err);
      const a = Buffer.from(hash, "hex"), b = key;
      resolve(a.length === b.length && crypto.timingSafeEqual(a, b));
    });
  });
}
function signToken(accountId) {
  const payload = Buffer.from(JSON.stringify({ id: accountId, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString("base64url");
  const sig = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}
function getAccountId(req) {
  const token = String(req.headers.authorization || "").startsWith("Bearer ") ? req.headers.authorization.slice(7) : "";
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try { const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")); return data.exp > Date.now() ? data.id : null; } catch { return null; }
}

app.get("/", (req, res) => res.json({ success: true, service: "LootRush Stripe Server", status: "online" }));
app.get("/health", async (req, res) => {
  try { await pool.query("SELECT 1"); res.json({ success: true, status: "healthy", database: "connected", stripe: "configured" }); }
  catch { res.status(503).json({ success: false, status: "unhealthy" }); }
});

app.post("/register", async (req, res) => {
  try {
    const username = String(req.body.username || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    if (username.length < 3 || !email.includes("@") || password.length < 6) return res.status(400).json({ error: "Username, valid email and 6+ character password required." });
    const hash = await hashPassword(password);
    const r = await pool.query("INSERT INTO users (username,email,password_hash) VALUES ($1,$2,$3) RETURNING id,username,email,coins,diamonds,points", [username,email,hash]);
    res.json({ success: true, user: r.rows[0] });
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "Email already registered." });
    console.error(err); res.status(500).json({ error: "Registration failed." });
  }
});

app.post("/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const r = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (r.rowCount !== 1 || !(await verifyPassword(password, r.rows[0].password_hash))) return res.status(401).json({ error: "Wrong email or password." });
    const u = r.rows[0];
    res.json({ success: true, token: signToken(u.id), user: { id:u.id, username:u.username, email:u.email, coins:u.coins, diamonds:u.diamonds, points:u.points } });
  } catch (err) { console.error(err); res.status(500).json({ error: "Login failed." }); }
});

app.get("/me", async (req, res) => {
  const id = getAccountId(req);
  if (!id) return res.status(401).json({ error: "Unauthorized" });
  const r = await pool.query("SELECT id,username,email,coins,diamonds,points FROM users WHERE id=$1", [id]);
  if (r.rowCount !== 1) return res.status(401).json({ error: "Account not found" });
  res.json({ success:true, user:r.rows[0] });
});

app.post("/create-checkout-session", async (req, res) => {
  try {
    const accountId = getAccountId(req);
    if (!accountId) return res.status(401).json({ error: "Login required." });
    const productId = String(req.body.productId || "");
    const product = PRODUCTS[productId];
    if (!product) return res.status(400).json({ error: "Unknown product." });
    const session = await stripe.checkout.sessions.create({
      mode:"payment", payment_method_types:["card"],
      line_items:[{ price_data:{ currency:"usd", product_data:{name:product.name,description:`${product.diamonds} LootRush Diamonds`}, unit_amount:product.priceCents }, quantity:1 }],
      success_url:`${FRONTEND_URL}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:`${FRONTEND_URL}/?payment=cancel`,
      metadata:{ accountId:String(accountId), productId }
    });
    res.json({ success:true, url:session.url });
  } catch (err) { console.error(err); res.status(500).json({ error:"Unable to create checkout session." }); }
});

async function initDb() {
  await pool.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);
  await pool.query(`CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), username TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, coins INTEGER NOT NULL DEFAULT 150, diamonds INTEGER NOT NULL DEFAULT 0, points INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`);
  await pool.query(`CREATE TABLE IF NOT EXISTS payments (id BIGSERIAL PRIMARY KEY, stripe_payment_id TEXT UNIQUE NOT NULL, account_id UUID NOT NULL REFERENCES users(id), product_id TEXT NOT NULL, diamonds INTEGER NOT NULL, amount_cents INTEGER NOT NULL, currency TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW())`);
}

initDb().then(() => app.listen(PORT,"0.0.0.0",() => console.log(`🚀 LootRush server running on ${PORT}`))).catch(err => { console.error("❌ Database initialization failed:",err); process.exit(1); });
