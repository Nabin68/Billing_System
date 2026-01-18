import { useEffect, useState } from "react";
import { getTodayReport, getLowStockItems } from "../api/api";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [report, setReport] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      const reportData = await getTodayReport();
      const lowStockData = await getLowStockItems();

      setReport(reportData);
      setLowStock(lowStockData);
    }

    loadData();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Dashboard</h2>

      {/* Summary Cards */}
      {report && (
        <div style={{ display: "flex", gap: 20 }}>
          <div style={cardStyle}>
            <h4>Total Bills</h4>
            <p>{report.total_bills}</p>
          </div>

          <div style={cardStyle}>
            <h4>Total Sales</h4>
            <p>₹ {report.total_sales_amount}</p>
          </div>

          <div style={cardStyle}>
            <h4>Total Discount</h4>
            <p>₹ {report.total_discount}</p>
          </div>
        </div>
      )}

      {/* Low Stock Table */}
      <h3 style={{ marginTop: 30 }}>Low Stock Items</h3>

      <table border="1" width="100%" cellPadding="8">
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Quantity Left</th>
            <th>Selling Price</th>
          </tr>
        </thead>
        <tbody>
          {lowStock.length === 0 && (
            <tr>
              <td colSpan="3">No low stock items 🎉</td>
            </tr>
          )}

          {lowStock.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>₹ {item.selling_price}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Go to Billing */}
      <button
        style={{ marginTop: 30 }}
        onClick={() => navigate("/")}
      >
        Go to Billing
      </button>
    </div>
  );
}

const cardStyle = {
  border: "1px solid #ccc",
  padding: 15,
  width: 200,
  textAlign: "center",
};

export default Dashboard;
