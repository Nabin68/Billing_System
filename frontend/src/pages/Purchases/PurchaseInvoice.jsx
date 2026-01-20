import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BASE_URL = "http://127.0.0.1:8000";

function PurchaseInvoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/purchases/${id}`)
      .then(res => res.json())
      .then(data => setInvoice(data));
  }, [id]);

  if (!invoice) {
    return <p className="p-6 text-gray-900">Loading purchase invoice...</p>;
  }

  return (
    <div className="flex justify-center bg-gray-100 p-6 print:bg-white text-gray-900">
      <div className="w-full max-w-3xl">
        {/* BACK BUTTON - Above the invoice card */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 print:hidden"
        >
          ← Back
        </button>

        {/* INVOICE CARD */}
        <div className="bg-white border p-6 text-gray-900">
          {/* HEADER */}
          <div className="flex justify-between border-b pb-4 mb-4">
            <div>
              <h1 className="text-xl font-bold">Purchase Invoice</h1>
              <p className="text-sm text-gray-700">Bibek & Nabin Traders</p>
            </div>

            <div className="text-sm text-right text-gray-800">
              <p>
                <b>Date:</b>{" "}
                {new Date(invoice.created_at).toLocaleDateString()}
              </p>
              <p>
                <b>Invoice #</b> {invoice.id}
              </p>
            </div>
          </div>

          {/* SUPPLIER */}
          <div className="mb-4 text-sm text-gray-900">
            <p><b>Supplier:</b> {invoice.supplier_name}</p>
            <p><b>Phone:</b> {invoice.supplier_phone}</p>
            <p><b>Address:</b> {invoice.supplier_address}</p>
          </div>

          {/* ITEMS */}
          <table className="w-full border text-sm text-gray-900">
            <thead className="bg-gray-100 text-gray-900">
              <tr>
                <th className="p-2 border">Item</th>
                <th className="p-2 border text-right">Qty</th>
                <th className="p-2 border text-right">Cost</th>
                <th className="p-2 border text-right">Margin %</th>
                <th className="p-2 border text-right">Total</th>
              </tr>
            </thead>

            <tbody>
              {invoice.items.map((i, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2 border">{i.item_name}</td>
                  <td className="p-2 border text-right">{i.quantity}</td>
                  <td className="p-2 border text-right">₹{i.cost_price}</td>
                  <td className="p-2 border text-right">{i.margin_percent}%</td>
                  <td className="p-2 border text-right">₹{i.line_total}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* TOTAL */}
          <div className="text-right mt-4 font-semibold text-gray-900">
            Total: ₹{invoice.total_amount}
          </div>

          {/* PRINT */}
          <div className="mt-6 text-center print:hidden">
            <button
              onClick={() => window.print()}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Print Purchase Bill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PurchaseInvoice;