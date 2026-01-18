import { useState } from "react";
import { searchItems, previewSale, createSale } from "../api/api";
import { useNavigate } from "react-router-dom";
import { calculateLiveTotals } from "../utils/calculations";


function Billing() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [items, setItems] = useState([]);
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();
  const totals = calculateLiveTotals(
    items,
    Object.fromEntries(items.map(i => [i.item_id, i.price]))
  );



  async function handleConfirmSale() {
  const payload = {
    items: items.map((i) => ({
      item_id: i.item_id,
      quantity: i.quantity,
      discount_percent: i.discount_percent,
    })),
  };

  const result = await createSale(payload);

  // redirect to invoice page
  navigate(`/invoice/${result.bill_id}`);
}



  async function handleSearch(e) {
    const value = e.target.value;
    setQuery(value);

    if (value.length > 1) {
      const data = await searchItems(value);
      setResults(data);
    } else {
      setResults([]);
    }
  }

  function addItem(item) {
    setItems([
      ...items,
      {
        item_id: item.id,
        name: item.name,
        price: item.selling_price,
        quantity: 1,
        discount_percent: 20,
      },
    ]);
    setResults([]);
    setQuery("");
  }

  async function handlePreview() {
    const payload = {
      items: items.map((i) => ({
        item_id: i.item_id,
        quantity: i.quantity,
        discount_percent: i.discount_percent,
      })),
    };

    const data = await previewSale(payload);
    setPreview(data);
  }

  return (
      <div
        style={{ padding: 20 }}
        tabIndex="0"
        onKeyDown={(e) => {
          if (e.key === "Enter" && items.length > 0) {
            handlePreview();
          }
        }}
      >

      <h2>Billing</h2>

      <input
        placeholder="Search item..."
        value={query}
        onChange={handleSearch}
        onKeyDown={(e) => {
          if (e.key === "Enter" && results.length > 0) {
            addItem(results[0]); // add first match
          }
        }}
      />


      {results.map((r) => (
        <div key={r.id} onClick={() => addItem(r)}>
          {r.name} (₹{r.selling_price})
        </div>
      ))}

      <h3>Items</h3>
      <h3>Bill Items</h3>

      <table border="1" width="100%" cellPadding="6">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Discount %</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan="4">No items added</td>
            </tr>
          )}

          {items.map((i, idx) => (
            <tr key={idx}>
              <td>{i.name}</td>

              <td>
                <input
                  type="number"
                  min="1"
                  autoFocus={idx === items.length - 1}
                  value={i.quantity}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].quantity = Number(e.target.value);
                    setItems(newItems);
                  }}
                />

              </td>

              <td>
                <input
                  type="number"
                  min="0"
                  value={i.discount_percent}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].discount_percent = Number(e.target.value);
                    setItems(newItems);
                  }}
                />
              </td>

              <td>
                <button
                  onClick={() =>
                    setItems(items.filter((_, i2) => i2 !== idx))
                  }
                >
                  ❌
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 20, borderTop: "1px solid #ccc", paddingTop: 10 }}>
        <p>Subtotal: ₹ {totals.subtotal}</p>
        <p>Total Discount: ₹ {totals.discount}</p>
        <h3>Final Amount: ₹ {totals.final}</h3>
      </div>



      <button onClick={handlePreview} disabled={items.length === 0}>
        Preview Bill
      </button>


      {preview && (
        <div>
            <h3>Total: ₹{preview.final_amount}</h3>
            <button onClick={handleConfirmSale} disabled={!preview}>
              Confirm & Save Bill
            </button>

        </div>
        )}


    </div>
  );
}

export default Billing;
