const BASE = "http://127.0.0.1:8000";

export const fetchProducts = async () => {
  const res = await fetch(`${BASE}/items`);
  return res.json();
};

export const updateProduct = async (id, payload) => {
  const res = await fetch(`${BASE}/items/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
};
