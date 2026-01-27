import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { previewSale, createSale } from "../../api/api";
import ItemSearchDropdown from "../../components/ItemSearchDropdown";
import CustomerPhoneSearch from "../../components/CustomerPhoneSearch";

function NewSale() {
  const navigate = useNavigate();
  
  // 🔧 HYDRATION GUARD: Prevents overwriting draft on mount
  const hasLoadedDraft = useRef(false);

  // ✅ NEW: Refs for table-first entry
  const itemRefs = useRef([]);
  const inputRefs = useRef([]);

  // customer
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  // billing - ✅ CHANGED: Start with one empty row with empty strings for clean typing
  const [items, setItems] = useState([
    { item_id: null, name: "", quantity: "", price: 0, discount_percent: "" }
  ]);
  const [preview, setPreview] = useState(null);

  // payment
  const [paymentMode, setPaymentMode] = useState("cash");
  const [amountPaid, setAmountPaid] = useState("");

  // loading states
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  // Real-time calculation
  const [totals, setTotals] = useState({
    subtotal: 0,
    discount: 0,
    final: 0
  });

  // 🔧 STEP 1: Load draft when component mounts
  useEffect(() => {
    try {
      const draft = localStorage.getItem("draft_sale");
      if (draft) {
        const data = JSON.parse(draft);
        setCustomerPhone(data.customerPhone || "");
        setCustomerName(data.customerName || "");
        setCustomerAddress(data.customerAddress || "");
        // ✅ Ensure at least one row exists
        setItems(data.items && data.items.length > 0 ? data.items : [
          { item_id: null, name: "", quantity: "", price: 0, discount_percent: "" }
        ]);
        setPaymentMode(data.paymentMode || "cash");
        setAmountPaid(data.amountPaid || "");
      }
    } catch (error) {
      console.error("Failed to load draft:", error);
      localStorage.removeItem("draft_sale");
    }
    
    hasLoadedDraft.current = true;
  }, []);

  // 🔧 STEP 2: Save draft on every change (ONLY after initial load)
  useEffect(() => {
    if (!hasLoadedDraft.current) return;
    
    try {
      const draft = {
        customerPhone,
        customerName,
        customerAddress,
        items,
        paymentMode,
        amountPaid,
      };

      localStorage.setItem("draft_sale", JSON.stringify(draft));
    } catch (error) {
      console.error("Failed to save draft:", error);
    }
  }, [customerPhone, customerName, customerAddress, items, paymentMode, amountPaid]);

  // Calculate totals whenever items change - ✅ Filter out empty rows
  useEffect(() => {
    const validItems = items.filter(i => i.item_id && Number(i.quantity) > 0);
    
    if (validItems.length === 0) {
      setTotals({ subtotal: 0, discount: 0, final: 0 });
      return;
    }

    const subtotal = validItems.reduce((sum, item) => {
      return sum + (item.price * Number(item.quantity || 0));
    }, 0);

    const discountAmount = validItems.reduce((sum, item) => {
      return sum + ((item.price * Number(item.quantity || 0) * Number(item.discount_percent || 0)) / 100);
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
    // ✅ Filter out empty rows
    const validItems = items.filter(i => i.item_id && Number(i.quantity) > 0);
    
    if (validItems.length === 0) {
      alert("Please add at least one item");
      return;
    }

    setIsPreviewLoading(true);

    try {
      const payload = {
        sale_type: "normal",
        customer_name: customerName || null,
        customer_phone: customerPhone || null,
        customer_address: customerAddress || null,
        payment_mode: paymentMode,
        amount_paid: paymentMode === "credit" ? 0 : (amountPaid || 0),
        items: validItems.map((i) => ({
          item_id: i.item_id,
          quantity: Number(i.quantity),
          discount_percent: Number(i.discount_percent) || 0,
        })),
      };

      const data = await previewSale(payload);
      setPreview(data);
    } catch (error) {
      console.error("Preview failed:", error);
      alert("Failed to generate preview. Please try again.");
    } finally {
      setIsPreviewLoading(false);
    }
  }

  // ---------------- RESET FORM ----------------
  function handleNewSale() {
    const validItems = items.filter(i => i.item_id && Number(i.quantity) > 0);
    
    if (validItems.length > 0) {
      const confirmed = window.confirm(
        "Are you sure you want to clear this sale? All unsaved data will be lost."
      );
      if (!confirmed) return;
    }

    localStorage.removeItem("draft_sale");
    
    setCustomerPhone("");
    setCustomerName("");
    setCustomerAddress("");
    setItems([
      { item_id: null, name: "", quantity: "", price: 0, discount_percent: "" }
    ]);
    setPaymentMode("cash");
    setAmountPaid("");
    setPreview(null);
  }

  // ---------------- CONFIRM ----------------
  async function handleConfirm() {
    if (!preview) {
      alert("Please preview the bill first");
      return;
    }

    // ✅ Filter out empty rows
    const validItems = items.filter(i => i.item_id && Number(i.quantity) > 0);

    setIsConfirmLoading(true);

    try {
      const payload = {
        sale_type: "normal",
        customer_phone: customerPhone || null,
        customer_name: customerName || null,
        customer_address: customerAddress || null,
        payment_mode: paymentMode,
        amount_paid: paymentMode === "credit" ? 0 : (amountPaid || 0),
        items: validItems.map((i) => ({
          item_id: i.item_id,
          quantity: Number(i.quantity),
          discount_percent: Number(i.discount_percent) || 0,
        })),
      };

      const res = await createSale(payload);

      if (!res || !res.bill_id) {
        throw new Error("Invalid response from server");
      }

      localStorage.removeItem("draft_sale");

      navigate(`/invoice/${res.bill_id}`, {
        state: { from: "new-sale" },
        replace: true
      });

    } catch (error) {
      console.error("Failed to create sale:", error);
      alert("Failed to create sale. Please try again.");
      setIsConfirmLoading(false);
    }
  }

  // ✅ Helper function to add new row and focus next item
  function addNewRowAndFocusNext(currentIdx) {
    const next = [...items];
    next.push({
      item_id: null,
      name: "",
      quantity: "",
      price: 0,
      discount_percent: "",
    });
    setItems(next);
    
    // ✅ Focus next row's item search
    setTimeout(() => {
      itemRefs.current[currentIdx + 1]?.focus();
    }, 0);
  }

  return (
    <div className="w-full min-h-full bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">New Sale</h2>
          <div className="flex gap-3">
            <button
              onClick={handleNewSale}
              className="bg-yellow-500 text-white font-semibold px-5 py-2 rounded-lg 
                         hover:bg-yellow-600 transition-all shadow-md hover:shadow-lg text-sm"
            >
              🔄 New Sale
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* CUSTOMER SECTION */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Customer Details
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name
                </label>
                <input
                  className="w-full bg-white border border-gray-300 text-gray-900
                             placeholder-gray-400 rounded-lg px-4 py-2.5
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             transition-all"
                  placeholder="Customer Name (Optional)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                className="w-full bg-white border border-gray-300 text-gray-900
                           placeholder-gray-400 rounded-lg px-4 py-2.5
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           transition-all resize-none"
                placeholder="Address (Optional)"
                rows="2"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ✅ TABLE WITH TABLE-FIRST ENTRY */}
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white">
              <thead className="bg-gray-100 text-gray-900 text-sm font-semibold">
                <tr>
                  <th className="px-3 py-3 text-center border-b-2 border-gray-300">
                    S.No
                  </th>
                  <th className="px-4 py-3 text-left border-b-2 border-gray-300">
                    Item
                  </th>
                  <th className="px-4 py-3 text-left border-b-2 border-gray-300">
                    Price
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
                {items.map((item, idx) => {
                  // ✅ Initialize refs for this row
                  if (!inputRefs.current[idx]) inputRefs.current[idx] = {};
                  
                  const lineTotal = item.price * Number(item.quantity || 0) - (item.price * Number(item.quantity || 0) * Number(item.discount_percent || 0)) / 100;
                  
                  return (
                    <tr
                      key={idx}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      {/* ✅ S.NO */}
                      <td className="px-3 py-3 text-center font-medium text-gray-800">
                        {idx + 1}
                      </td>

                      {/* ✅ ITEM SEARCH */}
                      <td className="px-4 py-3">
                        <ItemSearchDropdown
                          ref={(el) => (itemRefs.current[idx] = el)}
                          value={item.name}
                          onSelect={(selected) => {
                            const copy = [...items];
                            copy[idx] = {
                              ...copy[idx],
                              item_id: selected.id,
                              name: selected.name,
                              price: selected.selling_price,
                            };
                            setItems(copy);
                            
                            // ✅ Focus quantity after selection
                            setTimeout(() => {
                              inputRefs.current[idx]?.qty?.focus();
                            }, 0);
                          }}
                          onClear={() => {
                            const copy = [...items];
                            copy[idx].name = "";
                            setItems(copy);
                          }}
                        />
                      </td>

                      {/* ✅ PRICE (READ ONLY) */}
                      <td className="px-4 py-3 text-gray-800">
                        ₹{item.price.toFixed(2)}
                      </td>

                      {/* ✅ QTY */}
                      <td className="px-4 py-3 text-gray-800">
                        <input
                          ref={(el) => (inputRefs.current[idx].qty = el)}
                          type="number"
                          min="0"
                          className="w-20 bg-white border border-gray-300 text-gray-900
                                     rounded-lg px-3 py-1.5 text-center
                                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                     transition-all"
                          value={item.quantity}
                          onChange={(e) => {
                            const copy = [...items];
                            copy[idx].quantity = e.target.value;
                            setItems(copy);
                          }}
                          onBlur={() => {
                            const copy = [...items];
                            if (copy[idx].quantity === "" || Number(copy[idx].quantity) <= 0) {
                              copy[idx].quantity = 1;
                            }
                            setItems(copy);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              inputRefs.current[idx]?.discount?.focus();
                            }
                          }}
                        />
                      </td>

                      {/* ✅ DISCOUNT */}
                      <td className="px-4 py-3 text-gray-800">
                        <input
                          ref={(el) => (inputRefs.current[idx].discount = el)}
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          className="w-20 bg-white border border-gray-300 text-gray-900
                                     rounded-lg px-3 py-1.5 text-center
                                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                     transition-all"
                          value={item.discount_percent}
                          onChange={(e) => {
                            const copy = [...items];
                            copy[idx].discount_percent = e.target.value;
                            setItems(copy);
                          }}
                          onBlur={() => {
                            const copy = [...items];
                            if (copy[idx].discount_percent === "") {
                              copy[idx].discount_percent = 0;
                            }
                            setItems(copy);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              addNewRowAndFocusNext(idx);
                            }
                          }}
                        />
                      </td>

                      {/* ✅ TOTAL */}
                      <td className="px-4 py-3 text-gray-800 text-right font-medium">
                        ₹{lineTotal.toFixed(2)}
                      </td>

                      {/* ✅ REMOVE */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() =>
                            setItems(items.filter((_, i) => i !== idx))
                          }
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 
                                     rounded-full p-1.5 transition-all"
                          title="Remove item"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* TOTALS SECTION */}
          {items.filter(i => i.item_id).length > 0 && (
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Mode
              </label>
              <select
                className="w-full bg-white border border-gray-300 text-gray-900
                           rounded-lg px-4 py-2.5
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           transition-all"
                value={paymentMode}
                onChange={(e) => {
                  setPaymentMode(e.target.value);
                  if (e.target.value === "credit") {
                    setAmountPaid("");
                  }
                }}
              >
                <option value="cash">Cash</option>
                <option value="online">Online</option>
                <option value="credit">Credit (No Payment)</option>
              </select>
            </div>

            {paymentMode !== "credit" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount Paid
                </label>
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
              </div>
            )}
          </div>

          {paymentMode !== "credit" && amountPaid && (
            <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Due Amount:</span>
                <span className={`font-semibold ${
                  Number(totals.final) - Number(amountPaid) > 0 
                    ? "text-red-600" 
                    : "text-green-600"
                }`}>
                  ₹{Math.max(0, Number(totals.final) - Number(amountPaid)).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex flex-wrap gap-4 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-300 text-gray-800 font-semibold px-6 py-2.5 rounded-lg 
                       hover:bg-gray-400 transition-all shadow-md hover:shadow-lg"
          >
            ← Cancel
          </button>

          <button
            onClick={handlePreview}
            disabled={items.filter(i => i.item_id).length === 0 || isPreviewLoading}
            className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-lg 
                       hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                       transition-all shadow-md hover:shadow-lg"
          >
            {isPreviewLoading ? "Loading..." : "👁️ Preview Bill"}
          </button>

          {preview && (
            <button
              onClick={handleConfirm}
              disabled={isConfirmLoading}
              className="bg-green-600 text-white font-semibold px-6 py-2.5 rounded-lg 
                         hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                         transition-all shadow-md hover:shadow-lg"
            >
              {isConfirmLoading ? "Processing..." : "✓ Confirm & Print"}
            </button>
          )}
        </div>

        {/* PREVIEW CONFIRMATION */}
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
                      ₹{Number(preview.total_amount || totals.subtotal).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-800">
                    <span className="font-medium">Discount:</span>
                    <span className="font-semibold text-red-600">
                      -₹{Number(preview.total_discount || totals.discount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t-2 border-gray-300">
                    <span className="font-bold text-lg text-gray-900">Final Amount:</span>
                    <span className="font-bold text-xl text-green-700">
                      ₹{Number(preview.final_amount || totals.final).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-800">
                    <span className="font-medium">Amount Paid:</span>
                    <span className="font-semibold">
                      ₹{Number(preview.amount_paid || amountPaid || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-800">
                    <span className="font-medium">Due Amount:</span>
                    <span className={`font-semibold ${
                      Number(preview.due_amount || 0) > 0 ? "text-red-600" : "text-green-600"
                    }`}>
                      ₹{Number(preview.due_amount || 0).toFixed(2)}
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