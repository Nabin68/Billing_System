import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BASE_URL = "http://127.0.0.1:8000";

function Invoice() {
  const params = useParams();
  const billId = params.billId;
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    if (!billId) return;

    fetch(`${BASE_URL}/sales/${billId}`)
      .then((res) => res.json())
      .then((data) => setInvoice(data));
  }, [billId]);

  if (!invoice) {
    return (
      <div className="flex justify-center p-6">
        <p className="text-gray-900">Loading invoice...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center bg-gray-100 p-6 text-gray-900 print:bg-white">
      <div className="w-full max-w-3xl">
        {/* BACK BUTTON - Above the invoice card */}
        <button
          onClick={() => navigate("/sales/new", { replace: true })}
          className="mb-4 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 print:hidden"
        >
          ← Back
        </button>

        {/* INVOICE CARD */}
        <div className="bg-white border border-gray-300 rounded p-6 text-gray-900">
          {/* SHOP HEADER */}
          <div className="flex justify-between items-start border-b pb-4 mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Bibek & Nabin Traders
              </h1>
              <p className="text-sm text-gray-700">
                Hardware & Sanitary Store
              </p>
            </div>

            <div className="text-sm text-gray-800 text-right">
              <p>
                <b>Date:</b>{" "}
                {new Date(invoice.created_at || invoice.date).toLocaleDateString()}
              </p>
              <p>
                <b>Time:</b>{" "}
                {new Date(invoice.created_at || invoice.date).toLocaleTimeString()}
              </p>
              <p>
                <b>Bill No:</b> #{invoice.id || invoice.bill_id}
              </p>
            </div>
          </div>

          {/* CUSTOMER DETAILS */}
          <div className="mb-4 text-gray-900">
            <p className="text-sm">
              <b>Customer:</b>{" "}
              {invoice.customer_name || "Walk-in"}
            </p>

            {invoice.customer_phone && (
              <p className="text-sm">
                <b>Phone:</b> {invoice.customer_phone}
              </p>
            )}

            {invoice.customer_address && (
              <p className="text-sm">
                <b>Address:</b> {invoice.customer_address}
              </p>
            )}
          </div>

          {/* ITEMS TABLE */}
          <table className="w-full border border-gray-300 text-sm text-gray-900">
            <thead className="bg-gray-200 text-gray-900">
              <tr>
                <th className="px-3 py-2 text-left">Item</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2 text-right">Price</th>
                <th className="px-3 py-2 text-right">Discount</th>
                <th className="px-3 py-2 text-right">Total</th>
              </tr>
            </thead>

            <tbody className="text-gray-900">
              {(invoice.items || []).map((i, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-3 py-2">
                    {i.item_name}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {i.quantity}
                  </td>
                  <td className="px-3 py-2 text-right">
                    ₹{i.price}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {i.discount_percent}%
                  </td>
                  <td className="px-3 py-2 text-right">
                    ₹{Number(i.final_price).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* TOTALS SECTION */}
          <div className="flex justify-end mt-4">
            <div className="w-64 text-sm space-y-1 text-gray-900">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{invoice.total_amount}</span>
              </div>

              <div className="flex justify-between">
                <span>Discount</span>
                <span>₹{invoice.total_discount}</span>
              </div>

              <div className="flex justify-between font-semibold text-base border-t pt-2">
                <span>Final Amount</span>
                <span>₹{invoice.rounded_final_amount || invoice.final_amount}</span>
              </div>

              <div className="flex justify-between">
                <span>Paid</span>
                <span>₹{invoice.amount_paid}</span>
              </div>

              <div className="flex justify-between text-red-600 font-medium">
                <span>Due</span>
                <span>₹{invoice.due_amount}</span>
              </div>
            </div>
          </div>

          {/* PRINT BUTTON */}
          <div className="mt-6 text-center print:hidden">
            <button
              onClick={() => window.print()}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Print Bill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Invoice;