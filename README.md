# Mini E‑commerce Store (Node + Stripe)

Features: Product catalog, search & sort, shopping cart (localStorage), and Stripe Checkout (cards, UPI, netbanking, wallets in test mode).

## 1) Requirements
- Node.js 18+
- A Stripe account (test mode is fine)

## 2) Setup
```bash
cd ecommerce-store
npm install
# Add your Stripe Secret Key in .env
echo "STRIPE_SECRET_KEY=sk_test_..." > .env
npm start
```
Open http://localhost:5173

## 3) Test Payments
- Use Stripe test card: 4242 4242 4242 4242, any future date, any 3-digit CVC
- For UPI/netbanking/wallets, Stripe provides test flows in Checkout

## 4) Customize Products
Edit `public/products.json` (prices are in INR). Images can be any URL.

## 5) Deploy (optional)
- Render, Railway, Fly.io, or any Node host.
- Set environment variable `STRIPE_SECRET_KEY` on the server.
- Make sure `success_url` and `cancel_url` in `server.js` are allowed domains.
