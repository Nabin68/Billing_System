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
    <div>
      <h2>Credit List</h2>

      <table border="1" width="100%" cellPadding="6">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Phone</th>
            <th>Total</th>
            <th>Paid</th>
            <th>Due</th>
            <th>Pay</th>
          </tr>
        </thead>
        <tbody>
          {credits.map((c) => (
            <tr key={c.sale_id}>
              <td>{c.customer_name}</td>
              <td>{c.customer_phone}</td>
              <td>₹{c.total}</td>
              <td>₹{c.paid}</td>
              <td>₹{c.due}</td>
              <td>
                <input
                  type="number"
                  placeholder="Amount"
                  onChange={(e) =>
                    setPayAmount({
                      ...payAmount,
                      [c.sale_id]: e.target.value,
                    })
                  }
                />
                <button onClick={() => handlePay(c.sale_id)}>
                  Pay
                </button>
              </td>
            </tr>
          ))}
          {credits.length === 0 && (
            <tr>
              <td colSpan="6">No pending credits 🎉</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CreditList;
