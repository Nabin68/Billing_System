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
    // 🟢 Full width, no max-w (same as NewSale)
    <div className="w-full min-h-full bg-white rounded shadow p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">
        New Purchase
      </h2>

      {/* 🟢 DEALER SECTION — with background separation */}
      <div className="bg-gray-50 border border-gray-200 rounded p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dealer Name
        </label>

        <input
          className="w-full bg-white border border-gray-300 text-gray-900
                     placeholder-gray-400 rounded px-3 py-2
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter dealer name"
          value={dealer}
          onChange={(e) => setDealer(e.target.value)}
        />
      </div>

      {/* 🟢 PRODUCTS SECTION — with background separation */}
      <div className="bg-gray-50 border border-gray-200 rounded p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Products
        </h3>

        {/* 🟢 TABLE WRAPPER — fixes faded look */}
        <div className="overflow-x-auto border border-gray-300 rounded">
          <table className="w-full border-collapse bg-white">
            <thead className="bg-gray-200 text-gray-900 text-sm font-semibold">
              <tr>
                <th className="px-4 py-3 text-left">
                  Product ID
                </th>
                <th className="px-4 py-3 text-left">
                  Qty
                </th>
                <th className="px-4 py-3 text-left">
                  Cost Price
                </th>
                <th className="px-4 py-3 text-left">
                  Margin %
                </th>
              </tr>
            </thead>

            <tbody className="text-sm">
              {items.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-t border-gray-300 hover:bg-gray-50"
                >
                  <td className="px-4 py-2 text-gray-800">
                    <input
                      className="w-full bg-white border border-gray-300 text-gray-900
                                 rounded px-2 py-1
                                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={row.item_id}
                      onChange={(e) =>
                        updateItem(idx, "item_id", e.target.value)
                      }
                    />
                  </td>

                  <td className="px-4 py-2 text-gray-800">
                    <input
                      type="number"
                      className="w-full bg-white border border-gray-300 text-gray-900
                                 rounded px-2 py-1
                                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={row.quantity}
                      onChange={(e) =>
                        updateItem(idx, "quantity", e.target.value)
                      }
                    />
                  </td>

                  <td className="px-4 py-2 text-gray-800">
                    <input
                      type="number"
                      className="w-full bg-white border border-gray-300 text-gray-900
                                 rounded px-2 py-1
                                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={row.cost_price}
                      onChange={(e) =>
                        updateItem(idx, "cost_price", e.target.value)
                      }
                    />
                  </td>

                  <td className="px-4 py-2 text-gray-800">
                    <input
                      type="number"
                      className="w-full bg-white border border-gray-300 text-gray-900
                                 rounded px-2 py-1
                                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  <td
                    colSpan="4"
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No products added
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🟢 ACTION BUTTONS */}
      <div className="flex gap-4">
        <button
          onClick={addRow}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ➕ Add Product
        </button>

        <button
          onClick={savePurchase}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          💾 Save Purchase
        </button>
      </div>
    </div>
  );
}

export default NewPurchase;
