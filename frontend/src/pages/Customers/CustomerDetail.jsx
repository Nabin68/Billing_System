import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

function CustomerDetail() {
  const { customerId } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [summary, setSummary] = useState(null);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDetails() {
      try {
        const res = await api.get(`/customers/${customerId}/details`);
        setCustomer(res.data.customer);
        setSummary(res.data.summary);
        setSales(res.data.sales);
      } catch (err) {
        console.error("Failed to load customer details", err);
      } finally {
        setLoading(false);
      }
    }

    loadDetails();
  }, [customerId]);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading customer details…
      </div>
    );
  }

  if (!customer || !summary) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load customer data.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="text-sm text-gray-500 mb-3">
        <span
          onClick={() => navigate("/customers")}
          className="cursor-pointer hover:underline text-blue-600"
        >
          Customers
        </span>
        <span className="mx-2">/</span>
        <span className="text-gray-700 font-medium">
          {customer.name}
        </span>
      </nav>

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <button
            onClick={() => navigate("/customers")}
            className="text-sm text-gray-500 hover:underline"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold mt-2">{customer.name}</h1>
          <div className="text-sm text-gray-600">{customer.phone}</div>
          <div className="text-sm text-gray-500">{customer.address}</div>
        </div>

        {/* Summary */}
        <div className="flex gap-4">
          <SummaryCard label="Total Purchase" value={summary.total_purchase} />
          <SummaryCard label="Total Paid" value={summary.total_paid} green />
          <SummaryCard label="Credit" value={summary.total_credit} red />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-right">Total</th>
              <th className="p-3 text-right">Paid</th>
              <th className="p-3 text-right">Credit</th>
              <th className="p-3 text-left">Payment</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {sales.map((s) => (
              <tr key={s.sale_id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  {new Date(s.date).toLocaleDateString()}
                </td>
                <td className="p-3 text-right">₹{s.total_amount.toFixed(2)}</td>
                <td className="p-3 text-right text-green-600">
                  ₹{s.paid.toFixed(2)}
                </td>
                <td className="p-3 text-right text-red-600">
                  ₹{s.credit.toFixed(2)}
                </td>
                <td className="p-3 capitalize">{s.payment_mode}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => navigate(`/invoice/${s.sale_id}`, {
                      state: {
                        from: "customer-details",
                        customerId: customer.id
                      }
                    })}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}

            {sales.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No bills found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, green, red }) {
  return (
    <div className="bg-white border rounded-lg px-4 py-3 min-w-[150px]">
      <div className="text-xs text-gray-500">{label}</div>
      <div
        className={`text-xl font-bold ${
          green ? "text-green-600" : red ? "text-red-600" : "text-gray-900"
        }`}
      >
        ₹{Number(value).toFixed(2)}
      </div>
    </div>
  );
}

export default CustomerDetail;