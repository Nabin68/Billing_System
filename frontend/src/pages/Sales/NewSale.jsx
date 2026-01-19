//NewSale.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchItems, previewSale, createSale } from "../../api/api";
import ItemSearchDropdown from "../../components/ItemSearchDropdown";


function NewSale() {
  const navigate = useNavigate();

  // customer
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // billing
  const [items, setItems] = useState([]);
  const [preview, setPreview] = useState(null);

  // payment
  const [paymentMode, setPaymentMode] = useState("cash");
  const [amountPaid, setAmountPaid] = useState("");



  // ---------------- PREVIEW ----------------
  async function handlePreview() {
    const payload = {
      customer_name: customerName || null,
      customer_phone: customerPhone || null,
      payment_mode: paymentMode,
      amount_paid: amountPaid || 0,
      items: items.map((i) => ({
        item_id: i.item_id,
        quantity: i.quantity,
        discount_percent: i.discount_percent,
      })),
    };

    const data = await previewSale(payload);
    setPreview(data);
  }

  // ---------------- CONFIRM ----------------
  async function handleConfirm() {
    const payload = {
      customer_name: customerName || null,
      customer_phone: customerPhone || null,
      payment_mode: paymentMode,
      amount_paid: amountPaid || 0,
      items: items.map((i) => ({
        item_id: i.item_id,
        quantity: i.quantity,
        discount_percent: i.discount_percent,
      })),
    };

    const res = await createSale(payload);
    navigate(`/invoice/${res.bill_id}`);
  }

  return (
    <div>
      <h2>New Sale</h2>

      {/* CUSTOMER SECTION */}
      <fieldset>
        <legend>Customer Details</legend>

        <input
          placeholder="Customer Name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />

        <input
          placeholder="Phone Number"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
        />
      </fieldset>

      {/* ITEM SEARCH */}
      <h3>Add Items</h3>
      <div style={{ position: "relative", zIndex: 9999 }}>
        <ItemSearchDropdown
          onSelect={(item) => {
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
          }}
        />
      </div>

      

      {/* ITEMS TABLE */}
      <table border="1" width="100%" cellPadding="6">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Discount %</th>
            <th>Line Total</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i, idx) => (
            <tr key={idx}>
              <td>{i.name}</td>
              <td>
                <input
                  type="number"
                  min="1"
                  value={i.quantity}
                  onChange={(e) => {
                    const copy = [...items];
                    copy[idx].quantity = Number(e.target.value);
                    setItems(copy);
                  }}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={i.discount_percent}
                  onChange={(e) => {
                    const copy = [...items];
                    copy[idx].discount_percent = Number(e.target.value);
                    setItems(copy);
                  }}
                />
              </td>
              <td>
                ₹
                {(
                  i.price * i.quantity -
                  (i.price * i.quantity * i.discount_percent) / 100
                ).toFixed(2)}
              </td>
              <td>
                <button
                  onClick={() =>
                    setItems(items.filter((_, j) => j !== idx))
                  }
                >
                  ❌
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PAYMENT */}
      <fieldset>
        <legend>Payment</legend>

        <select
          value={paymentMode}
          onChange={(e) => setPaymentMode(e.target.value)}
        >
          <option value="cash">Cash</option>
          <option value="online">Online</option>
          <option value="credit">Credit</option>
        </select>

        {paymentMode !== "credit" && (
          <input
            placeholder="Amount Paid"
            type="number"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
          />
        )}
      </fieldset>

      {/* ACTIONS */}
      <button onClick={handlePreview} disabled={items.length === 0}>
        Preview Bill
      </button>

      {preview && (
        <div>
          <p>Subtotal: ₹{preview.total_amount}</p>
          <p>Discount: ₹{preview.total_discount}</p>
          <h3>Final: ₹{preview.final_amount}</h3>

          <button onClick={handleConfirm}>Confirm & Print</button>
        </div>
      )}
    </div>
  );
}

export default NewSale;
