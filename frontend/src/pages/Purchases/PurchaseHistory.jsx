import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPurchaseHistory } from "../../api/purchases";

function PurchaseHistory() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getPurchaseHistory()
      .then(setPurchases)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="p-6">Loading purchase history...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">📦 Purchase History</h1>

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2 text-left">Date</th>
            <th className="border px-3 py-2 text-left">Supplier</th>
            <th className="border px-3 py-2 text-left">Phone</th>
            <th className="border px-3 py-2 text-right">Amount</th>
            <th className="border px-3 py-2 text-center">View</th>
          </tr>
        </thead>

        <tbody>
          {purchases.map((p) => (
            <tr
              key={p.id}
              className="hover:bg-gray-50 cursor-pointer"
            >
              <td className="border px-3 py-2">
                {new Date(p.created_at).toLocaleDateString()}
              </td>

              <td className="border px-3 py-2">
                {p.supplier_name || "—"}
              </td>

              <td className="border px-3 py-2">
                {p.supplier_phone || "—"}
              </td>

              <td className="border px-3 py-2 text-right">
                ₹{p.total_amount}
              </td>

              <td className="border px-3 py-2 text-center">
                <button
                  onClick={() => navigate(`/purchase-invoice/${p.id}`)}
                  className="text-blue-600 hover:underline"
                >
                  👁️ View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PurchaseHistory;
