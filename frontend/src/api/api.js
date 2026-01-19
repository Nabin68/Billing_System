//frontend/src/api/api.js

const BASE_URL = "http://127.0.0.1:8000";

export async function searchItems(query) {
  const res = await fetch(`${BASE_URL}/items/search?q=${query}`);
  return res.json();
}

export async function previewSale(data) {
  const res = await fetch(`${BASE_URL}/sales/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function createSale(data) {
  const res = await fetch(`${BASE_URL}/sales`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getTodayReport() {
  const res = await fetch("http://127.0.0.1:8000/reports/today");
  return res.json();
}

export async function getLowStockItems() {
  const res = await fetch("http://127.0.0.1:8000/items/low-stock");
  return res.json();
}

export async function createPurchaseBatch(data) {
  const res = await fetch("http://127.0.0.1:8000/purchases/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res.json();
}

export async function getCredits() {
  const res = await fetch("http://127.0.0.1:8000/credit");
  return res.json();
}

export async function payCredit(saleId, amount) {
  const res = await fetch(
    `http://127.0.0.1:8000/credit/pay/${saleId}?amount=${amount}`,
    { method: "POST" }
  );
  return res.json();
}


