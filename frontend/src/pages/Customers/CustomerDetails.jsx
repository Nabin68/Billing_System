import { useState } from "react";

function CustomerDetails() {
  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);

  async function search() {
    const res = await fetch(
      `http://127.0.0.1:8000/customers/search?q=${query}`
    );
    setCustomers(await res.json());
  }

  async function loadSales(id) {
    const res = await fetch(
      `http://127.0.0.1:8000/customers/${id}/sales`
    );
    setSales(await res.json());
  }

  return (
    <div>
      <h2>Customer Search</h2>

      <input
        placeholder="Name or phone"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={search}>Search</button>

      <ul>
        {customers.map((c) => (
          <li key={c.id} onClick={() => loadSales(c.id)}>
            {c.name} – {c.phone}
          </li>
        ))}
      </ul>

      <h3>Purchase History</h3>
      <ul>
        {sales.map((s) => (
          <li key={s.id}>
            Bill #{s.id} – ₹{s.rounded_final_amount} – Due ₹{s.due_amount}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CustomerDetails;
