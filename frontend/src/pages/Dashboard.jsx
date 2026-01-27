import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [today, setToday] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const todayRes = await fetch(
        "http://127.0.0.1:8000/reports/dashboard/today"
      );
      const trendRes = await fetch(
        "http://127.0.0.1:8000/reports/dashboard/last-7-days"
      );

      setToday(await todayRes.json());
      setTrend(await trendRes.json());
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!today) return null;

  const maxSale = Math.max(...trend.map((d) => d.total), 1);
  const totalWeekSales = trend.reduce((sum, d) => sum + d.total, 0);
  const avgDailySales = trend.length > 0 ? totalWeekSales / trend.length : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Business overview and analytics</p>
          </div>
          
          <button
            onClick={() => load()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Today's Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            title="Today's Sales"
            value={`₹${Number(today.total_sales).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            subtitle="Total revenue today"
          />
          <MetricCard
            title="Bills Today"
            value={today.bill_count}
            subtitle="Transactions completed"
          />
          <MetricCard
            title="Customers"
            value={today.customers_count}
            subtitle="Unique customers today"
          />
          <MetricCard
            title="Credit Outstanding"
            value={`₹${Number(today.total_credit).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            subtitle="Pending payments"
            alert={Number(today.total_credit) > 0}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Trend Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Sales Trend</h2>
                <p className="text-sm text-gray-600 mt-1">Last 7 days</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total (7 days)</p>
                <p className="text-xl font-semibold text-gray-900">
                  ₹{totalWeekSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {trend.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="font-medium text-gray-900">No sales data available</p>
                <p className="text-sm mt-1">Sales data will appear here once transactions are recorded</p>
              </div>
            ) : (
              <div>
                {/* Chart */}
                <div className="flex items-end justify-between gap-2 h-64 border-b border-l border-gray-200 pb-0 pl-4 pr-4">
                  {trend.map((d, i) => {
                    const height = maxSale ? (d.total / maxSale) * 230 : 5;
                    const isToday = i === trend.length - 1;
                    
                    return (
                      <div key={i} className="flex flex-col items-center flex-1 group relative">
                        {/* Tooltip */}
                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          <div className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded shadow-lg whitespace-nowrap">
                            ₹{d.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                        
                        {/* Bar */}
                        <div
                          className={`w-full ${
                            isToday 
                              ? "bg-gray-900" 
                              : "bg-gray-400"
                          } hover:bg-gray-700 transition-colors cursor-pointer`}
                          style={{ height: `${height}px` }}
                        />

                        {/* Date Label */}
                        <div className={`text-xs mt-3 text-center ${isToday ? "font-semibold text-gray-900" : "text-gray-600"}`}>
                          {new Date(d.date).toLocaleDateString("en-IN", { 
                            month: "short", 
                            day: "numeric" 
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-4 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400"></div>
                    <span>Previous Days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-900"></div>
                    <span>Today</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Statistics Panel */}
          <div className="space-y-6">
            {/* Weekly Average */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Average Daily Sales</h3>
              <p className="text-2xl font-semibold text-gray-900">
                ₹{avgDailySales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500 mt-2">Based on last 7 days</p>
            </div>

            {/* Summary Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Weekly Summary</h3>
              <div className="space-y-4">
                <SummaryRow 
                  label="Best Sales Day" 
                  value={trend.length > 0 
                    ? new Date(trend.reduce((max, d) => d.total > max.total ? d : max, trend[0]).date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
                    : "N/A"
                  }
                />
                <SummaryRow 
                  label="Total Transactions" 
                  value={trend.reduce((sum, d) => sum + (d.bill_count || 0), 0)}
                />
                <SummaryRow 
                  label="Average Bill Value" 
                  value={today.bill_count > 0 
                    ? `₹${(today.total_sales / today.bill_count).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : "₹0.00"
                  }
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <ActionButton onClick={() => navigate("/sales/new")}>
                  New Sale
                </ActionButton>
                <ActionButton onClick={() => navigate("/purchases/new")}>
                  New Purchase
                </ActionButton>
                <ActionButton onClick={() => navigate("/products")}>
                  View Products
                </ActionButton>
                <ActionButton onClick={() => navigate("/customers")}>
                  View Customers
                </ActionButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, alert }) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${alert ? 'border-orange-200 bg-orange-50' : 'border-gray-200'}`}>
      <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-semibold text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}

function ActionButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-md transition"
    >
      {children}
    </button>
  );
}

export default Dashboard;