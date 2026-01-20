import { useEffect, useState } from "react";

function Dashboard() {
  const [today, setToday] = useState(null);
  const [trend, setTrend] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const todayRes = await fetch(
      "http://127.0.0.1:8000/reports/dashboard/today"
    );
    const trendRes = await fetch(
      "http://127.0.0.1:8000/reports/dashboard/last-7-days"
    );

    setToday(await todayRes.json());
    setTrend(await trendRes.json());
  }

  if (!today) return null;

  // 🟢 STEP S1.3.2 — safe max for scaling
  const maxSale = Math.max(...trend.map((d) => d.total), 0);

  return (
    // 🟢 STEP S1.3.5 — layout spacing
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-gray-800">
        Dashboard
      </h1>

      {/* 🟢 STEP S1.3.1 — SUMMARY CARDS */}
      <div className="grid grid-cols-4 gap-4">
        <Card title="Today Sales" value={`₹ ${today.total_sales}`} />
        <Card title="Bills Today" value={today.bill_count} />
        <Card title="Customers Today" value={today.customers_count} />
        <Card title="Credit Today" value={`₹ ${today.total_credit}`} />
      </div>

      {/* 🟢 STEP S1.3.3 — SALES TREND SECTION */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <h2 className="font-medium text-gray-800 text-base">
          Last 7 Days Sales
        </h2>


        <p className="text-xs text-gray-500 mb-3">
          Total sales per day (last 7 days)
        </p>

        {/* 🟢 STEP S1.3.4 — NO DATA MESSAGE */}
        {trend.length === 0 && (
          <div className="text-sm text-gray-500">
            No sales data yet.
          </div>
        )}
        {trend.length > 0 && (
        <div className="flex items-end justify-between gap-4 h-48 px-4 border-t pt-4">
          {trend.map((d, i) => (
            <div key={i} className="flex flex-col items-center flex-1">
              {/* BAR */}
              <div
                className="bg-blue-500 rounded-t w-6"
                style={{
                  height: maxSale
                    ? `${(d.total / maxSale) * 160}px`
                    : "5px",
                }}
                title={`₹ ${d.total}`}
              />

              {/* DATE LABEL */}
              <div className="text-xs mt-2 text-gray-600">
                {d.date}
              </div>
            </div>
          ))}
        </div>
      )}

      </div>
    </div>
  );
}

function Card({ title, value }) {
  // 🟢 STEP S1.3.1 — improved card hierarchy
  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <div className="text-sm text-gray-500">
        {title}
      </div>
      <div className="text-2xl font-bold text-gray-900 mt-1">
        {value}
      </div>
    </div>
  );
}

export default Dashboard;
