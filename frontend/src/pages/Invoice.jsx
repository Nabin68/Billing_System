import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";


const BASE_URL = "http://127.0.0.1:8000";

function Invoice() {
  const { billId } = useParams();
  const [bill, setBill] = useState(null);


  useEffect(() => {
    fetch(`${BASE_URL}/sales/${billId}`)
      .then((res) => res.json())
      .then((data) => setBill(data));
  }, [billId]);

  if (!bill) return <p>Loading invoice...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Bibek & Nabin Traders</h2>
      <p>Bill No: {bill.bill_id}</p>
      <p>Date: {new Date(bill.date).toLocaleString()}</p>

      <table border="1" width="100%">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Final Price</th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((i, idx) => (
            <tr key={idx}>
              <td>{i.item_id}</td>
              <td>{i.quantity}</td>
              <td>₹{i.final_price}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Total: ₹{bill.final_amount}</h3>

      <button onClick={() => window.print()}>
        Print Bill
      </button>
    </div>
  );
}

export default Invoice;
