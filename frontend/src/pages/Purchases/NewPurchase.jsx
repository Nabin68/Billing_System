import { useState, useRef } from "react";
import SupplierSearch from "../../components/SupplierSearch";
import ItemSearchDropdown from "../../components/ItemSearchDropdown";
import { createPurchase } from "../../api/purchases";

function NewPurchase() {
  const itemRefs = useRef([]);
  const inputRefs = useRef([]);

  const [supplier, setSupplier] = useState({
    name: "",
    phone: "",
    address: "",
  });

  // ✅ FACTORY FUNCTION (NO SHARED REFERENCES)
  const createEmptyItem = () => ({
    item_id: null,
    name: "",
    quantity: 0,
    cost_price: 0,
    margin_percent: 0,
    selling_price: 0,
  });

  const [items, setItems] = useState([createEmptyItem()]);

  function updateItem(idx, field, value) {
    const copy = [...items];
    copy[idx] = { ...copy[idx], [field]: value };

    // auto-calc selling price
    if (field === "cost_price" || field === "margin_percent") {
      const cost = Number(copy[idx].cost_price || 0);
      const margin = Number(copy[idx].margin_percent || 0);
      copy[idx].selling_price = cost + (cost * margin) / 100;
    }

    setItems(copy);
  }

  async function savePurchase() {
    const validItems = items.filter(
      (i) =>
        i.name.trim() !== "" &&
        Number(i.quantity) > 0 &&
        Number(i.cost_price) > 0
    );

    if (!supplier.phone || validItems.length === 0) {
      alert("Supplier and items required");
      return;
    }

    await createPurchase({
      supplier_name: supplier.name,
      supplier_phone: supplier.phone,
      supplier_address: supplier.address,
      items: validItems.map((i) => ({
        item_id: i.item_id,
        item_name: i.name,
        quantity: Number(i.quantity),
        cost_price: Number(i.cost_price),
        margin_percent: Number(i.margin_percent),
        selling_price: Number(i.selling_price),
      })),
    });

    alert("Purchase saved");

    setSupplier({ name: "", phone: "", address: "" });
    setItems([createEmptyItem()]);
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">New Purchase</h1>

        {/* SUPPLIER INFO */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-6 pb-3 border-b">
            Supplier Information
          </h2>

          {/* Name and Phone in same row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier Name
              </label>
              <SupplierSearch
                value={supplier.name}
                onChange={(name) =>
                  setSupplier((prev) => ({ ...prev, name }))
                }
                onSelect={(s) =>
                  setSupplier({
                    name: s.name,
                    phone: s.phone,
                    address: s.address,
                  })
                }
              />

            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                placeholder="Enter phone number"
                value={supplier.phone}
                onChange={(e) =>
                  setSupplier({ ...supplier, phone: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              placeholder="Enter supplier address"
              value={supplier.address}
              onChange={(e) =>
                setSupplier({ ...supplier, address: e.target.value })
              }
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
            />
          </div>
        </div>

        {/* ITEMS TABLE */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-700">Purchase Items</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-16">
                    S.No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[300px]">
                    Item Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-28">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                    Cost Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                    Margin %
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                    Selling Price
                  </th>
                  <th className="px-4 py-3 text-center w-16"></th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((row, idx) => {
                  if (!inputRefs.current[idx]) inputRefs.current[idx] = {};

                  return (
                    <tr key={idx} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {idx + 1}
                      </td>

                      <td className="px-4 py-3">
                        <ItemSearchDropdown
                          ref={(el) => (itemRefs.current[idx] = el)}
                          value={row.name}
                          onChange={(value) => updateItem(idx, "name", value)}
                          onSelect={(item) => {
                            updateItem(idx, "item_id", item.id);
                            updateItem(idx, "name", item.name);
                            setTimeout(() => inputRefs.current[idx].qty?.focus(), 0);
                          }}
                          onEnter={() => {
                            setTimeout(() => inputRefs.current[idx].qty?.focus(), 0);
                          }}
                          allowCustom
                        />
                      </td>

                      <td className="px-4 py-3">
                        <input
                          type="number"
                          ref={(el) => (inputRefs.current[idx].qty = el)}
                          value={row.quantity}
                          onChange={(e) =>
                            updateItem(idx, "quantity", e.target.value)
                          }
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            inputRefs.current[idx].cost?.focus()
                          }
                          className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                        />
                      </td>

                      <td className="px-4 py-3">
                        <input
                          type="number"
                          ref={(el) => (inputRefs.current[idx].cost = el)}
                          value={row.cost_price}
                          onChange={(e) =>
                            updateItem(idx, "cost_price", e.target.value)
                          }
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            inputRefs.current[idx].margin?.focus()
                          }
                          className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                      </td>

                      <td className="px-4 py-3">
                        <input
                          type="number"
                          ref={(el) => (inputRefs.current[idx].margin = el)}
                          value={row.margin_percent}
                          onChange={(e) =>
                            updateItem(idx, "margin_percent", e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              setItems([...items, createEmptyItem()]);
                              setTimeout(
                                () => itemRefs.current[idx + 1]?.focus(),
                                0
                              );
                            }
                          }}
                          className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                        />
                      </td>

                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={row.selling_price}
                          onChange={(e) =>
                            updateItem(idx, "selling_price", e.target.value)
                          }
                          className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                      </td>

                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() =>
                            setItems(items.filter((_, i) => i !== idx))
                          }
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-1 transition"
                          title="Remove item"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Add New Item Button */}
          <div className="px-6 py-4 bg-gray-50 border-t">
            <button
              onClick={() => setItems([...items, createEmptyItem()])}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-2 transition"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Another Item
            </button>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => {
              setSupplier({ name: "", phone: "", address: "" });
              setItems([createEmptyItem()]);
            }}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={savePurchase}
            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105"
          >
            Save Purchase
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewPurchase;