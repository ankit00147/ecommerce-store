// server.js
// Minimal Express server with Stripe Checkout
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ Missing STRIPE_SECRET_KEY in .env");
  process.exit(1);
}

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Create a Checkout Session from items in the cart
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { items } = req.body; // [{id, name, price, currency, quantity}]
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty." });
    }

    // Validate & map to Stripe line_items
    const line_items = items.map((item) => ({
      quantity: item.quantity || 1,
      price_data: {
        currency: (item.currency || "inr").toLowerCase(),
        product_data: { name: item.name || "Item" },
        // Stripe expects amount in the smallest currency unit (e.g. paise for INR)
        unit_amount: Math.round(Number(item.price || 0) * 100),
      },
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "upi", "netbanking", "wallet"],
      line_items,
      success_url: `${req.protocol}://${req.get("host")}/success.html`,
      cancel_url: `${req.protocol}://${req.get("host")}/cancel.html`,
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe session error:", err);
    return res.status(500).json({ error: "Failed to create checkout session." });
  }
});

const PORT = process.env.PORT || 5173;
app.listen(PORT, () => {
  console.log(`✅ Server running: http://localhost:${PORT}`);
});
