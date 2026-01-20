import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createSale } from "../../api/api";
import ItemSearchDropdown from "../../components/ItemSearchDropdown";

function RandomSale() {
  const navigate = useNavigate();
  const inputRefs = useRef([]);
  const itemRefs = useRef([]); // 🔥 NEW: separate refs for item dropdowns

  const [items, setItems] = useState([
    { item_id: null, name: "", quantity: 1, price: "", discount: 0 }
  ]);

  function updateItem(index, field, value) {
    const copy = [...items];
    copy[index][field] = value;
    setItems(copy);
  }

  function addRow() {
    setItems([
      ...items,
      { item_id: null, name: "", quantity: 1, price: "", discount: 0 }
    ]);
  }

  function removeRow(index) {
    setItems(items.filter((_, i) => i !== index));
  }

  function calculateTotal(item) {
    const base = item.quantity * item.price;
    const discount = (base * item.discount) / 100;
    return base - discount;
  }

  async function handleSave() {
    try {
      // Filter out empty rows
      const validItems = items.filter(i => i.item_id && i.quantity > 0);

      if (validItems.length === 0) {
        alert("Please add at least one item");
        return;
      }

      const payload = {
        sale_type: "random",
        payment_mode: "cash",
        amount_paid: validItems.reduce(
          (sum, i) => sum + calculateTotal(i),
          0
        ),
        items: validItems.map(i => ({
          item_id: i.item_id,
          quantity: Number(i.quantity),
          price: Number(i.price),
          discount_percent: Number(i.discount)
        }))
      };

      const res = await createSale(payload);

      alert("Random sale saved successfully");
      navigate(`/invoice/${res.bill_id}`);
    } catch (err) {
      alert("Error saving random sale");
      console.error(err);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Random Sale
      </h1>

      <table className="w-full border border-gray-300 bg-white">
        <thead className="bg-gray-100 text-sm">
          <tr>
            <th className="p-2 text-left">Item</th>
            <th className="p-2 text-right">Qty</th>
            <th className="p-2 text-right">Price</th>
            <th className="p-2 text-right">Discount %</th>
            <th className="p-2 text-right">Total</th>
            <th />
          </tr>
        </thead>

        <tbody>
          {items.map((item, idx) => {
            // Register refs for this row
            if (!inputRefs.current[idx]) {
              inputRefs.current[idx] = {};
            }

            return (
              <tr key={idx} className="border-t hover:bg-gray-50">
                <td className="p-2">
                  <ItemSearchDropdown
                    ref={(el) => (itemRefs.current[idx] = el)}
                    onSelect={(selectedItem) => {
                      updateItem(idx, "item_id", selectedItem.id);
                      updateItem(idx, "name", selectedItem.name);
                      updateItem(idx, "price", selectedItem.selling_price);
                    }}
                    onEnterSelect={() => {
                      setTimeout(() => {
                        inputRefs.current[idx]?.qty?.focus();
                      }, 0);
                    }}
                  />
                </td>

                <td className="p-2 text-right">
                  <input
                    ref={(el) => (inputRefs.current[idx].qty = el)}
                    type="number"
                    min="1"
                    className="w-20 border px-2 py-1 text-right"
                    value={item.quantity}
                    onChange={e => updateItem(idx, "quantity", e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        inputRefs.current[idx].price?.focus();
                      }
                    }}
                  />
                </td>

                <td className="p-2 text-right">
                  <input
                    ref={(el) => (inputRefs.current[idx].price = el)}
                    type="number"
                    className="w-24 border px-2 py-1 text-right"
                    value={item.price}
                    onChange={e => updateItem(idx, "price", e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        inputRefs.current[idx].discount?.focus();
                      }
                    }}
                  />
                </td>

                <td className="p-2 text-right">
                  <input
                    ref={(el) => (inputRefs.current[idx].discount = el)}
                    type="number"
                    min="0"
                    max="100"
                    className="w-20 border px-2 py-1 text-right"
                    value={item.discount}
                    onChange={e => updateItem(idx, "discount", e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        // Go to next row or add one
                        if (idx === items.length - 1) {
                          addRow();
                          setTimeout(() => {
                            itemRefs.current[idx + 1]?.focus(); // 🔥 THIS FIXES EVERYTHING
                          }, 0);
                        } else {
                          itemRefs.current[idx + 1]?.focus();
                        }
                      }
                    }}
                  />
                </td>

                <td className="p-2 text-right font-semibold">
                  ₹{calculateTotal(item).toFixed(2)}
                </td>

                <td className="p-2">
                  <button
                    onClick={() => removeRow(idx)}
                    className="text-red-600"
                  >
                    ❌
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex gap-4">
        <button
          onClick={addRow}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Add Item
        </button>

        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-6 py-2 rounded"
        >
          Save Random Sale
        </button>

        <button
          onClick={() => navigate(-1)}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default RandomSale;