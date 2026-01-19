import { useState } from "react";
import { createPurchaseBatch } from "../../api/api";

function NewPurchase() {
  const [dealer, setDealer] = useState("");
  const [items, setItems] = useState([]);

  function addRow() {
    setItems([
      ...items,
      {
        item_id: "",
        quantity: "",
        cost_price: "",
        margin_percent: "",
      },
    ]);
  }

  function updateItem(index, field, value) {
    const copy = [...items];
    copy[index][field] = value;
    setItems(copy);
  }

  async function savePurchase() {
    if (!dealer || items.length === 0) {
      alert("Dealer name and items are required");
      return;
    }

    const payload = {
      dealer_name: dealer,
      items: items.map((i) => ({
        item_id: Number(i.item_id),
        quantity: Number(i.quantity),
        cost_price: Number(i.cost_price),
        margin_percent: Number(i.margin_percent),
      })),
    };

    await createPurchaseBatch(payload);
    alert("Purchase saved successfully");

    setDealer("");
    setItems([]);
  }

  return (
    <div>
      <h2>New Purchase</h2>

      <label>Dealer Name</label>
      <br />
      <input
        value={dealer}
        onChange={(e) => setDealer(e.target.value)}
        placeholder="Dealer name"
      />

      <h3>Products</h3>

      <table border="1" width="100%" cellPadding="6">
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Qty</th>
            <th>Cost Price</th>
            <th>Margin %</th>
          </tr>
        </thead>

        <tbody>
          {items.map((row, idx) => (
            <tr key={idx}>
              <td>
                <input
                  value={row.item_id}
                  onChange={(e) =>
                    updateItem(idx, "item_id", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  value={row.quantity}
                  onChange={(e) =>
                    updateItem(idx, "quantity", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  value={row.cost_price}
                  onChange={(e) =>
                    updateItem(idx, "cost_price", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  value={row.margin_percent}
                  onChange={(e) =>
                    updateItem(idx, "margin_percent", e.target.value)
                  }
                />
              </td>
            </tr>
          ))}

          {items.length === 0 && (
            <tr>
              <td colSpan="4">No products added</td>
            </tr>
          )}
        </tbody>
      </table>

      <br />
      <button onClick={addRow}>➕ Add Product</button>
      <br /><br />
      <button onClick={savePurchase}>💾 Save Purchase</button>
    </div>
  );
}

export default NewPurchase;
