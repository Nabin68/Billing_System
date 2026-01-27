import api from "./axios";

const BASE_URL = "http://127.0.0.1:8000";

export async function createPurchase(data) {
  const res = await fetch(`${BASE_URL}/purchases/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create purchase");
  }

  return res.json();
}

export async function getPurchaseHistory() {
  const res = await fetch(`${BASE_URL}/purchases/`);
  if (!res.ok) throw new Error("Failed to fetch purchase history");
  return res.json();
}

export async function getPurchaseDetails(id) {
  const res = await fetch(`${BASE_URL}/purchases/${id}`);
  if (!res.ok) throw new Error("Failed to fetch purchase details");
  return res.json();
}

export async function searchSuppliers(query) {
  const res = await fetch(
    `http://127.0.0.1:8000/suppliers/search?q=${encodeURIComponent(query)}`
  );

  if (!res.ok) {
    throw new Error("Failed to search suppliers");
  }

  return res.json();
}
