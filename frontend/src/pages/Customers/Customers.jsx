import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

function Customers() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // search & sort
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recent"); 
  // recent | name_asc | name_desc | credit_high | credit_low

  // ✅ Ref for keyboard shortcut
  const searchInputRef = useRef(null);

  useEffect(() => {
    async function loadCustomers() {
      try {
        const res = await api.get("/customers/summary");
        // ✅ FIX: Normalize data to use consistent property names
        setCustomers(
          (res.data || []).map(c => ({
            customer_id: c.customer_id,
            name: c.name,
            phone: c.phone,
            last_purchase_date: c.last_purchase_date,
            total_purchase: c.total_purchase,
            total_paid: c.total_paid,
            credit_left: c.total_credit,   // ✅ Map total_credit to credit_left
          }))
        );
      } catch (err) {
        console.error("Failed to load customers", err);
      } finally {
        setLoading(false);
      }
    }

    loadCustomers();
  }, []);

  // ✅ Keyboard shortcut: Press "/" to focus search
  useEffect(() => {
    function handleKeyPress(event) {
      if (event.key === "/" && document.activeElement !== searchInputRef.current) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, []);

  // 🔎 Search + Sort pipeline
  const filteredCustomers = useMemo(() => {
    let data = [...customers];

    // search
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q)
      );
    }

    // sort
    switch (sortBy) {
      case "name_asc":
        data.sort((a, b) => a.name.localeCompare(b.name));
        break;

      case "name_desc":
        data.sort((a, b) => b.name.localeCompare(a.name));
        break;

      case "credit_high":
        data.sort((a, b) => b.credit_left - a.credit_left);
        break;

      case "credit_low":
        data.sort((a, b) => a.credit_left - b.credit_left);
        break;

      case "recent":
      default:
        data.sort(
          (a, b) =>
            new Date(b.last_purchase_date) -
            new Date(a.last_purchase_date)
        );
    }

    return data;
  }, [customers, search, sortBy]);

  // Calculate summary stats
  const totalCustomers = filteredCustomers.length;
  const totalCreditOutstanding = filteredCustomers
    .reduce((sum, c) => sum + (c.credit_left > 0 ? c.credit_left : 0), 0);
  const customersWithCredit = filteredCustomers.filter(c => c.credit_left > 0).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Customers
        </h1>

        <div className="flex gap-2 flex-wrap items-center">
          {/* ✅ SalesHistory-style Search Box with Keyboard Shortcut */}
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search customer or press '/' ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         placeholder-gray-400 transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
              <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">
                /
              </kbd>
            </div>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-lg text-sm
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       bg-white"
          >
            <option value="recent">Most Recent</option>
            <option value="name_asc">Name (A–Z)</option>
            <option value="name_desc">Name (Z–A)</option>
            <option value="credit_high">Credit (High → Low)</option>
            <option value="credit_low">Credit (Low → High)</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Customers */}
          <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 font-medium">
              Total Customers
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {totalCustomers}
            </div>
          </div>

          {/* Total Credit Outstanding */}
          <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 font-medium">
              Total Credit Outstanding
            </div>
            <div className="text-2xl font-bold text-red-600 mt-1">
              ₹{totalCreditOutstanding.toFixed(2)}
            </div>
          </div>

          {/* Customers with Credit */}
          <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 font-medium">
              Customers with Credit
            </div>
            <div className="text-2xl font-bold text-orange-600 mt-1">
              {customersWithCredit}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="border border-gray-300 rounded-lg bg-white overflow-x-auto shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left font-semibold text-gray-700">Date</th>
              <th className="p-3 text-left font-semibold text-gray-700">Customer Name</th>
              <th className="p-3 text-left font-semibold text-gray-700">Phone</th>
              <th className="p-3 text-right font-semibold text-gray-700">Total Purchase</th>
              <th className="p-3 text-right font-semibold text-gray-700">Paid</th>
              <th className="p-3 text-right font-semibold text-gray-700">Credit Left</th>
              <th className="p-3 text-center font-semibold text-gray-700">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    <span>Loading customers...</span>
                  </div>
                </td>
              </tr>
            )}

            {!loading && filteredCustomers.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center">
                  <div className="text-gray-400 text-4xl mb-2">👥</div>
                  <div className="text-gray-600 font-medium">No customers found</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Try searching by name or phone number
                  </div>
                </td>
              </tr>
            )}

            {filteredCustomers.map((c) => (
              <tr
                key={c.customer_id}
                className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td className="p-3 text-gray-700">
                  <div className="font-medium">
                    {c.last_purchase_date
                      ? new Date(c.last_purchase_date).toLocaleDateString('en-US', {
                          month: 'numeric',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : "—"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {c.last_purchase_date
                      ? new Date(c.last_purchase_date).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })
                      : ""}
                  </div>
                </td>

                <td className="p-3 text-gray-700 font-medium">
                  <button
                    onClick={() => navigate(`/customers/${c.customer_id}`)}
                    className="hover:underline text-left hover:text-blue-600 transition-colors"
                  >
                    {c.name}
                  </button>
                </td>

                <td className="p-3 text-gray-600 text-sm">
                  {c.phone}
                </td>

                <td className="p-3 text-right font-bold text-gray-900">
                  ₹{Number(c.total_purchase).toFixed(2)}
                </td>

                <td className="p-3 text-right">
                  <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                    ₹{Number(c.total_paid).toFixed(2)}
                  </span>
                </td>

                <td className="p-3 text-right">
                  {c.credit_left > 0 ? (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                      ₹{Number(c.credit_left).toFixed(2)}
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                      ₹0.00
                    </span>
                  )}
                </td>

                <td className="p-3 text-center">
                  <button
                    onClick={() =>
                      navigate(`/customers/${c.customer_id}`)
                    }
                    className="text-blue-600 hover:text-blue-800 font-medium hover:underline
                               transition-colors px-3 py-1 rounded hover:bg-blue-50"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Customers;