import { useEffect, useState } from "react";
import { getCredits, payCredit } from "../../api/api";

function CreditList() {
  const [credits, setCredits] = useState([]);
  const [payAmount, setPayAmount] = useState({});

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await getCredits();
    setCredits(data);
  }

  async function handlePay(saleId) {
    const amount = Number(payAmount[saleId]);
    if (!amount) return;

    await payCredit(saleId, amount);
    alert("Payment updated");
    load();
  }

  return (
    <div className="max-w-6xl bg-white rounded shadow p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">
        Credit List
      </h2>

      <table className="w-full border border-gray-200 rounded overflow-hidden bg-white">
        <thead className="bg-gray-100 text-sm text-gray-700">
          <tr>
            <th className="px-3 py-2 text-left border-b">
              Customer
            </th>
            <th className="px-3 py-2 text-left border-b">
              Phone
            </th>
            <th className="px-3 py-2 text-left border-b">
              Total
            </th>
            <th className="px-3 py-2 text-left border-b">
              Paid
            </th>
            <th className="px-3 py-2 text-left border-b">
              Due
            </th>
            <th className="px-3 py-2 text-left border-b">
              Pay
            </th>
          </tr>
        </thead>

        <tbody className="text-sm">
          {credits.map((c) => (
            <tr key={c.sale_id} className="hover:bg-gray-50">
              <td className="px-3 py-2 border-b">
                {c.customer_name}
              </td>

              <td className="px-3 py-2 border-b">
                {c.customer_phone}
              </td>

              <td className="px-3 py-2 border-b">
                ₹{c.total}
              </td>

              <td className="px-3 py-2 border-b">
                ₹{c.paid}
              </td>

              <td className="px-3 py-2 border-b font-medium">
                ₹{c.due}
              </td>

              <td className="px-3 py-2 border-b">
                <div className="flex items-center">
                  <input
                    type="number"
                    placeholder="Amount"
                    className="border rounded px-2 py-1 w-24 focus:ring-1 focus:ring-blue-500"
                    onChange={(e) =>
                      setPayAmount({
                        ...payAmount,
                        [c.sale_id]: e.target.value,
                      })
                    }
                  />

                  <button
                    onClick={() => handlePay(c.sale_id)}
                    className="ml-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Pay
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {credits.length === 0 && (
            <tr>
              <td
                colSpan="6"
                className="text-center text-gray-500 py-6"
              >
                No pending credits 🎉
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CreditList;
