import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { previewSale, createSale } from "../../api/api";
import ItemSearchDropdown from "../../components/ItemSearchDropdown";
import CustomerPhoneSearch from "../../components/CustomerPhoneSearch";

function NewSale() {
  const navigate = useNavigate();
  
  // 🔧 HYDRATION GUARD: Prevents overwriting draft on mount
  const hasLoadedDraft = useRef(false);

  // customer
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  // billing
  const [items, setItems] = useState([]);
  const [preview, setPreview] = useState(null);

  // payment
  const [paymentMode, setPaymentMode] = useState("cash");
  const [amountPaid, setAmountPaid] = useState("");

  // Real-time calculation
  const [totals, setTotals] = useState({
    subtotal: 0,
    discount: 0,
    final: 0
  });

  // 🔧 STEP 2: Load draft when component mounts
  useEffect(() => {
    const draft = localStorage.getItem("draft_sale");
    if (draft) {
      const data = JSON.parse(draft);
      setCustomerPhone(data.customerPhone || "");
      setCustomerName(data.customerName || "");
      setCustomerAddress(data.customerAddress || "");
      setItems(data.items || []);
      setPaymentMode(data.paymentMode || "cash");
      setAmountPaid(data.amountPaid || "");
    }
    
    // Mark that draft has been loaded
    hasLoadedDraft.current = true;
  }, []);

  // 🔧 STEP 1: Save draft on every change (ONLY after initial load)
  useEffect(() => {
    // Don't save until draft has been loaded once
    if (!hasLoadedDraft.current) return;
    
    const draft = {
      customerPhone,
      customerName,
      customerAddress,
      items,
      paymentMode,
      amountPaid,
    };

    localStorage.setItem("draft_sale", JSON.stringify(draft));
  }, [customerPhone, customerName, customerAddress, items, paymentMode, amountPaid]);

  // Calculate totals whenever items change
  useEffect(() => {
    if (items.length === 0) {
      setTotals({ subtotal: 0, discount: 0, final: 0 });
      return;
    }

    const subtotal = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    const discountAmount = items.reduce((sum, item) => {
      return sum + ((item.price * item.quantity * item.discount_percent) / 100);
    }, 0);

    const final = subtotal - discountAmount;

    setTotals({
      subtotal: subtotal.toFixed(2),
      discount: discountAmount.toFixed(2),
      final: final.toFixed(2)
    });
  }, [items]);

  // ---------------- PREVIEW ----------------
  async function handlePreview() {
    const payload = {
      customer_name: customerName || null,
      customer_phone: customerPhone || null,
      customer_address: customerAddress || null,
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

  // ---------------- RESET FORM ----------------
  function handleNewSale() {
    // Clear localStorage
    localStorage.removeItem("draft_sale");
    
    // Reset all states
    setCustomerPhone("");
    setCustomerName("");
    setCustomerAddress("");
    setItems([]);
    setPaymentMode("cash");
    setAmountPaid("");
    setPreview(null);
  }

  // ---------------- CONFIRM ----------------
  async function handleConfirm() {
    const payload = {
      customer_phone: customerPhone,
      customer_name: customerName || null,
      customer_address: customerAddress || null,
      payment_mode: paymentMode,
      amount_paid: amountPaid || 0,
      items: items.map((i) => ({
        item_id: i.item_id,
        quantity: i.quantity,
        discount_percent: i.discount_percent,
      })),
    };

    const res = await createSale(payload);

    // ✅ Sale is FINAL — clear draft
    localStorage.removeItem("draft_sale");

    navigate(`/invoice/${res.bill_id}`);
  }

  return (
    <div className="w-full min-h-full bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">
          New Sale
        </h2>

        {/* CUSTOMER SECTION */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Customer Details
          </h3>

          <div className="space-y-4">
            {/* Phone and Name in same row */}
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

              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name
                </label>
                <input
                  className="w-full bg-white border border-gray-300 text-gray-900
                             placeholder-gray-400 rounded-lg px-4 py-2.5
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             transition-all"
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
            </div>

            {/* Address Input - Full width below */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                className="w-full bg-white border border-gray-300 text-gray-900
                           placeholder-gray-400 rounded-lg px-4 py-2.5
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           transition-all resize-none"
                placeholder="Address"
                rows="2"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ITEM SEARCH */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Add Items
          </h3>

          <div className="relative z-10">
            <ItemSearchDropdown
              onSelect={(item) => {
                setItems([
                  ...items,
                  {
                    item_id: item.id,
                    name: item.name,
                    price: item.selling_price,
                    quantity: 1,
                    discount_percent: 0,
                  },
                ]);
              }}
            />
          </div>
        </div>

        {/* TABLE WITH TOTALS */}
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white">
              <thead className="bg-gray-100 text-gray-900 text-sm font-semibold">
                <tr>
                  <th className="px-4 py-3 text-left border-b-2 border-gray-300">
                    Item
                  </th>
                  <th className="px-4 py-3 text-left border-b-2 border-gray-300">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-left border-b-2 border-gray-300">
                    Discount %
                  </th>
                  <th className="px-4 py-3 text-right border-b-2 border-gray-300">
                    Line Total
                  </th>
                  <th className="px-4 py-3 text-center border-b-2 border-gray-300">
                    Remove
                  </th>
                </tr>
              </thead>

              <tbody className="text-sm">
                {items.map((i, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-800 font-medium">
                      {i.name}
                    </td>

                    <td className="px-4 py-3 text-gray-800">
                      <input
                        type="number"
                        min="1"
                        className="w-20 bg-white border border-gray-300 text-gray-900
                                   rounded-lg px-3 py-1.5 text-center
                                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                   transition-all"
                        value={i.quantity}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 1;
                          const copy = [...items];
                          copy[idx].quantity = Math.max(1, value);
                          setItems(copy);
                        }}
                      />
                    </td>

                    <td className="px-4 py-3 text-gray-800">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="w-20 bg-white border border-gray-300 text-gray-900
                                   rounded-lg px-3 py-1.5 text-center
                                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                   transition-all"
                        value={i.discount_percent}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          const copy = [...items];
                          copy[idx].discount_percent = Math.max(0, Math.min(100, value));
                          setItems(copy);
                        }}
                      />
                    </td>

                    <td className="px-4 py-3 text-gray-800 text-right font-medium">
                      ₹{(
                        i.price * i.quantity -
                        (i.price * i.quantity * i.discount_percent) / 100
                      ).toFixed(2)}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() =>
                          setItems(items.filter((_, j) => j !== idx))
                        }
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 
                                   rounded-full p-1.5 transition-all"
                        title="Remove item"
                      >
                        ❌
                      </button>
                    </td>
                  </tr>
                ))}

                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-12 text-center text-gray-500 italic"
                    >
                      No items added yet. Search and add items above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* TOTALS SECTION - Below table, right aligned */}
          {items.length > 0 && (
            <div className="bg-gray-50 border-t-2 border-gray-300 p-4">
              <div className="flex justify-end">
                <div className="w-full md:w-80 space-y-2">
                  <div className="flex justify-between items-center text-gray-700">
                    <span className="font-medium">Subtotal:</span>
                    <span className="text-lg">₹{totals.subtotal}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-700">
                    <span className="font-medium">Discount:</span>
                    <span className="text-lg text-red-600">-₹{totals.discount}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t-2 border-gray-300">
                    <span className="font-bold text-gray-900 text-lg">Final Amount:</span>
                    <span className="font-bold text-gray-900 text-xl">₹{totals.final}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PAYMENT SECTION */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Payment
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              className="w-full bg-white border border-gray-300 text-gray-900
                         rounded-lg px-4 py-2.5
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         transition-all"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="online">Online</option>
              <option value="credit">Credit</option>
            </select>

            {paymentMode !== "credit" && (
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full bg-white border border-gray-300 text-gray-900
                           placeholder-gray-400 rounded-lg px-4 py-2.5
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           transition-all"
                placeholder="Amount Paid"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
              />
            )}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-wrap gap-4 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-300 text-gray-800 font-semibold px-6 py-2.5 rounded-lg 
                       hover:bg-gray-400 transition-all shadow-md hover:shadow-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleNewSale}
            className="bg-yellow-500 text-white font-semibold px-6 py-2.5 rounded-lg 
                       hover:bg-yellow-600 transition-all shadow-md hover:shadow-lg"
          >
            New Sale
          </button>

          <button
            onClick={handlePreview}
            disabled={items.length === 0}
            className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-lg 
                       hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                       transition-all shadow-md hover:shadow-lg"
          >
            Preview Bill
          </button>

          {preview && (
            <button
              onClick={handleConfirm}
              className="bg-green-600 text-white font-semibold px-6 py-2.5 rounded-lg 
                         hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
            >
              Confirm & Print
            </button>
          )}
        </div>

        {/* PREVIEW CONFIRMATION - Shows after Preview Bill is clicked */}
        {preview && (
          <div className="bg-green-50 border-2 border-green-400 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-green-600 text-2xl">✓</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-900 mb-2">
                  Bill Preview Confirmed
                </h3>
                <p className="text-gray-700 text-sm mb-3">
                  Review the details above and click "Confirm & Print" to complete the sale.
                </p>
                <div className="bg-white rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-gray-800">
                    <span className="font-medium">Subtotal:</span>
                    <span className="font-semibold">
                      ₹{typeof preview.total_amount !== 'undefined' ? preview.total_amount : totals.subtotal}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-800">
                    <span className="font-medium">Discount:</span>
                    <span className="font-semibold text-red-600">
                      -₹{typeof preview.total_discount !== 'undefined' ? preview.total_discount : totals.discount}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t-2 border-gray-300">
                    <span className="font-bold text-lg text-gray-900">Final Amount:</span>
                    <span className="font-bold text-xl text-green-700">
                      ₹{typeof preview.final_amount !== 'undefined' ? preview.final_amount : totals.final}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NewSale;