// Client-side store logic
const grid = document.getElementById("grid");
const cartDrawer = document.getElementById("cartDrawer");
const openCartBtn = document.getElementById("openCartBtn");
const closeCartBtn = document.getElementById("closeCartBtn");
const cartItemsEl = document.getElementById("cartItems");
const subtotalEl = document.getElementById("subtotal");
const cartCountEl = document.getElementById("cartCount");
const search = document.getElementById("search");
const sort = document.getElementById("sort");
const checkoutBtn = document.getElementById("checkoutBtn");

let products = [];
let cart = JSON.parse(localStorage.getItem("cart") || "[]");

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

function renderGrid(list) {
  grid.innerHTML = "";
  list.forEach(p => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <div class="content">
        <h3>${p.name}</h3>
        <p class="badge">${p.category}</p>
        <div class="price">
          <strong>${formatINR(p.price)}</strong>
          <button class="icon" data-id="${p.id}">Add</button>
        </div>
      </div>
    `;
    card.querySelector("button").addEventListener("click", () => addToCart(p.id));
    grid.appendChild(card);
  });
}

function addToCart(id) {
  const item = cart.find(i => i.id === id);
  if (item) item.quantity += 1;
  else {
    const p = products.find(x => x.id === id);
    cart.push({ id: p.id, name: p.name, price: p.price, currency: "INR", quantity: 1, image: p.image });
  }
  saveCart();
  cartDrawer.classList.add("open");
}

function changeQty(id, delta) {
  const idx = cart.findIndex(i => i.id === id);
  if (idx > -1) {
    cart[idx].quantity += delta;
    if (cart[idx].quantity <= 0) cart.splice(idx, 1);
    saveCart();
  }
}

function renderCart() {
  cartItemsEl.innerHTML = "";
  let subtotal = 0;
  cart.forEach(item => {
    subtotal += item.price * item.quantity;
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div>
        <div><strong>${item.name}</strong></div>
        <div class="qty">
          <button aria-label="decrease">-</button>
          <span>${item.quantity}</span>
          <button aria-label="increase">+</button>
        </div>
      </div>
      <div>${formatINR(item.price * item.quantity)}</div>
    `;
    const [decBtn, , incBtn] = row.querySelectorAll("button");
    decBtn.addEventListener("click", () => changeQty(item.id, -1));
    incBtn.addEventListener("click", () => changeQty(item.id, +1));
    cartItemsEl.appendChild(row);
  });
  subtotalEl.textContent = formatINR(subtotal);
  const count = cart.reduce((a, b) => a + b.quantity, 0);
  cartCountEl.textContent = count;
}

openCartBtn.addEventListener("click", () => cartDrawer.classList.add("open"));
closeCartBtn.addEventListener("click", () => cartDrawer.classList.remove("open"));

search.addEventListener("input", () => {
  const q = search.value.toLowerCase();
  const filtered = products.filter(p => p.name.toLowerCase().includes(q));
  renderGrid(applySort(filtered));
});

function applySort(list) {
  const v = sort.value;
  const arr = [...list];
  if (v === "price-asc") arr.sort((a, b) => a.price - b.price);
  if (v === "price-desc") arr.sort((a, b) => b.price - a.price);
  if (v === "name-asc") arr.sort((a, b) => a.name.localeCompare(b.name));
  if (v === "name-desc") arr.sort((a, b) => b.name.localeCompare(a.name));
  return arr;
}
sort.addEventListener("change", () => {
  const q = search.value.toLowerCase();
  const filtered = products.filter(p => p.name.toLowerCase().includes(q));
  renderGrid(applySort(filtered));
});

// Checkout via Stripe
checkoutBtn.addEventListener("click", async () => {
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }
  try {
    const res = await fetch("/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cart }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
      localStorage.removeItem("cart");
    } else {
      alert("Checkout failed.");
    }
  } catch (e) {
    console.error(e);
    alert("Checkout error.");
  }
});

// Load products and init
async function init() {
  const res = await fetch("products.json");
  products = await res.json();
  renderGrid(applySort(products));
  renderCart();
}
init();
