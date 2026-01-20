import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createSale } from "../../api/api";
import ItemSearchDropdown from "../../components/ItemSearchDropdown";
import CustomerPhoneSearch from "../../components/CustomerPhoneSearch";

function ManualSaleEntry() {
  const navigate = useNavigate();
  const inputRefs = useRef([]);
  const itemRefs = useRef([]);

  const [saleDate, setSaleDate] = useState(
    new Date().toISOString().slice(0, 16)
  );

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  const [items, setItems] = useState([
    { item_id: null, name: "", quantity: 1, price: "", discount_percent: 0 }
  ]);

  const [paymentMode, setPaymentMode] = useState("cash");
  const [amountPaid, setAmountPaid] = useState("");

  const [totals, setTotals] = useState({
    subtotal: 0,
    discount: 0,
    final: 0,
  });

  function updateItem(index, field, value) {
    const copy = [...items];
    copy[index][field] = value;
    setItems(copy);
  }

  function addRow() {
    setItems([
      ...items,
      { item_id: null, name: "", quantity: 1, price: "", discount_percent: 0 }
    ]);
  }

  function removeRow(index) {
    setItems(items.filter((_, i) => i !== index));
  }

  // Calculate totals
  useEffect(() => {
    const subtotal = items.reduce(
      (s, i) => s + (i.price * i.quantity || 0), 0
    );
    const discount = items.reduce(
      (s, i) => s + ((i.price * i.quantity * i.discount_percent) / 100 || 0), 0
    );
    setTotals({
      subtotal,
      discount,
      final: subtotal - discount,
    });
  }, [items]);

  async function handleSave() {
    try {
      // Filter out empty rows
      const validItems = items.filter(i => i.item_id && i.quantity > 0);

      if (validItems.length === 0) {
        alert("Please add at least one item");
        return;
      }

      const payload = {
        sale_type: "manual",
        manual_date: saleDate,
        customer_name: customerName || null,
        customer_phone: customerPhone || null,
        customer_address: customerAddress || null,
        payment_mode: paymentMode,
        amount_paid: Number(amountPaid) || 0,
        items: validItems.map(i => ({
          item_id: i.item_id,
          quantity: Number(i.quantity),
          discount_percent: Number(i.discount_percent)
        }))
      };

      const res = await createSale(payload);

      alert("Manual sale saved successfully");
      navigate("/sales");
    } catch (err) {
      alert("Error saving manual sale");
      console.error(err);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Manual Bill Entry</h1>
      <p className="text-gray-600">
        Enter old handwritten bills with custom date & time
      </p>

      {/* Date & Time Field */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sale Date & Time
        </label>
        <input
          type="datetime-local"
          value={saleDate}
          onChange={(e) => setSaleDate(e.target.value)}
          className="border px-3 py-2 rounded w-64"
        />
      </div>

      {/* CUSTOMER SECTION */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Customer Details
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Phone Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <CustomerPhoneSearch
                value={customerPhone}
                onChange={setCustomerPhone}
                onSelect={(c) => {
                  setCustomerPhone(c.phone);
                  setCustomerName(c.name);
                  setCustomerAddress(c.address || "");
                }}
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name
              </label>
              <input
                className="w-full border px-3 py-2 rounded"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer Name"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              className="w-full border px-3 py-2 rounded"
              rows="2"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="Address"
            />
          </div>
        </div>
      </div>

      {/* Items Table */}
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

            const itemTotal = (item.price * item.quantity) - ((item.price * item.quantity * item.discount_percent) / 100);

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
                    value={item.discount_percent}
                    onChange={e => updateItem(idx, "discount_percent", e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (idx === items.length - 1) {
                          addRow();
                          setTimeout(() => {
                            itemRefs.current[idx + 1]?.focus();
                          }, 0);
                        } else {
                          itemRefs.current[idx + 1]?.focus();
                        }
                      }
                    }}
                  />
                </td>

                <td className="p-2 text-right font-semibold">
                  ₹{itemTotal.toFixed(2)}
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

      {/* Totals Section */}
      <div className="bg-gray-50 p-4 rounded border">
        <div className="flex justify-end space-y-2 flex-col items-end">
          <div className="flex gap-4">
            <span className="text-gray-700">Subtotal:</span>
            <span className="font-semibold">₹{totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex gap-4">
            <span className="text-gray-700">Discount:</span>
            <span className="font-semibold text-red-600">-₹{totals.discount.toFixed(2)}</span>
          </div>
          <div className="flex gap-4 text-lg">
            <span className="text-gray-900 font-bold">Final Total:</span>
            <span className="font-bold text-green-600">₹{totals.final.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Section */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Mode
          </label>
          <select
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="cash">Cash</option>
            <option value="online">Online</option>
            <option value="credit">Credit</option>
          </select>
        </div>

        {paymentMode !== "credit" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount Paid
            </label>
            <input
              type="number"
              placeholder="Amount Paid"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              className="border px-3 py-2 rounded w-full"
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
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
          Save Manual Sale
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

export default ManualSaleEntry;