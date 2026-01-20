const BASE_URL = "http://127.0.0.1:8000";

export async function getPurchaseHistory() {
  const res = await fetch(`${BASE_URL}/purchases/`);
  if (!res.ok) {
    throw new Error("Failed to fetch purchase history");
  }
  return res.json();
}
