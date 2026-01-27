import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

function SalesHistory() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ Customer search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1); // ✅ Keyboard navigation
  
  // ✅ Refs for outside click detection
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    async function loadSales() {
      try {
        const [normalRes, randomRes] = await Promise.all([
          api.get("/sales/history"),
          api.get("/sales/random-history")
        ]);

        const normalSales = normalRes.data.map(s => ({
          id: s.id,
          date: s.created_at,
          type: s.sale_type,
          customer: s.customer_name || "Walk-in",
          customerPhone: s.customer_phone || "",
          amount: s.rounded_final_amount,
          payment: s.payment_mode
        }));

        const randomSales = randomRes.data.map(s => ({
          id: s.id,
          date: s.created_at,
          type: "random",
          customer: "—",
          customerPhone: "",
          amount: s.rounded_final_amount,
          payment: s.payment_mode
        }));

        const merged = [...normalSales, ...randomSales].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        setSales(merged);
      } catch (err) {
        console.error("Failed to load sales history", err);
      } finally {
        setLoading(false);
      }
    }

    loadSales();
  }, []);

  // ✅ Customer search handler with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      // ✅ Show recent 5 sales when search is empty
      const recentSales = sales.slice(0, 5);
      setSearchResults(recentSales);
      return;
    }

    const delaySearch = setTimeout(() => {
      setIsSearching(true);
      
      // Search in sales data
      const query = searchQuery.toLowerCase();
      const results = sales.filter(sale => {
        const nameMatch = sale.customer.toLowerCase().includes(query);
        const phoneMatch = sale.customerPhone.includes(query);
        return nameMatch || phoneMatch;
      }).slice(0, 10); // Limit to 10 results

      setSearchResults(results);
      setIsSearching(false);
    }, 300); // Debounce search

    return () => clearTimeout(delaySearch);
  }, [searchQuery, sales]);

  // ✅ Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  // Combined type + date filtering
  const now = new Date();

  const filteredSales = sales.filter((s) => {
    // type filter
    if (filter !== "all" && s.type !== filter) return false;

    // date filter
    if (dateRange === "all") return true;

    const saleDate = new Date(s.date);
    const diffDays = (now - saleDate) / (1000 * 60 * 60 * 24);

    if (dateRange === "today") return diffDays < 1;
    if (dateRange === "7") return diffDays <= 7;
    if (dateRange === "30") return diffDays <= 30;

    return true;
  });

  function badge(type) {
    if (type === "normal")
      return "bg-blue-100 text-blue-700";
    if (type === "manual")
      return "bg-yellow-100 text-yellow-700";
    return "bg-gray-200 text-gray-700";
  }

  function paymentBadge(payment) {
    if (payment === "cash")
      return "bg-green-100 text-green-700";
    if (payment === "online")
      return "bg-purple-100 text-purple-700";
    if (payment === "credit")
      return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  }

  // ✅ Handle search result click
  function handleSearchSelect(saleId) {
    setSearchQuery("");
    setShowSearchDropdown(false);
    setSelectedIndex(-1);
    navigate(`/invoice/${saleId}`, {
      state: { from: "sales-history" }
    });
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Sales History
        </h1>

        <div className="flex gap-2 flex-wrap items-center">
          {/* ✅ Customer Search Box with Keyboard Navigation */}
          <div className="relative" ref={searchContainerRef}>
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search customer or press '/' ..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(-1);
                }}
                onKeyDown={(e) => {
                  if (!showSearchDropdown || searchResults.length === 0) return;

                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setSelectedIndex((prev) =>
                      prev < searchResults.length - 1 ? prev + 1 : prev
                    );
                  }

                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
                  }

                  if (e.key === "Enter" && selectedIndex >= 0) {
                    e.preventDefault();
                    handleSearchSelect(searchResults[selectedIndex].id);
                  }

                  if (e.key === "Escape") {
                    setShowSearchDropdown(false);
                    setSearchQuery("");
                  }
                }}
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowSearchDropdown(true);
                  }
                }}
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
            
            {/* Search Dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute top-full mt-1 w-96 bg-white border border-gray-300 
                              rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                {/* ✅ Header showing what's being displayed */}
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-600 font-medium">
                  {searchQuery.trim() ? `Search results for "${searchQuery}"` : "Recent Sales"}
                </div>

                {searchResults.map((sale, index) => (
                  <div
                    key={sale.id}
                    onClick={() => handleSearchSelect(sale.id)}
                    className={`p-3 cursor-pointer border-b last:border-b-0 transition-colors
                      ${index === selectedIndex ? "bg-blue-50 border-l-4 border-l-blue-500" : "hover:bg-gray-50"}`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {sale.customer}
                        </div>
                        {sale.customerPhone && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            📞 {sale.customerPhone}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs text-gray-500">
                            {new Date(sale.date).toLocaleDateString()}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs font-medium ${badge(sale.type)}`}
                          >
                            {sale.type.toUpperCase()}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs font-medium capitalize ${paymentBadge(sale.payment)}`}
                          >
                            {sale.payment}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-bold text-gray-900">
                          ₹{Number(sale.amount).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* ✅ Keyboard hint at bottom */}
                <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between">
                  <span>Use ↑↓ to navigate, Enter to select</span>
                  <span>ESC to close</span>
                </div>
              </div>
            )}

            {/* No Results Message */}
            {showSearchDropdown && searchQuery.trim() && searchResults.length === 0 && !isSearching && (
              <div className="absolute top-full mt-1 w-96 bg-white border border-gray-300 
                              rounded-lg shadow-lg p-4 text-center z-50">
                <div className="text-gray-400 text-4xl mb-2">🔍</div>
                <div className="text-gray-600 font-medium">No sales found</div>
                <div className="text-xs text-gray-500 mt-1">
                  Try searching by customer name or phone number
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {isSearching && (
              <div className="absolute top-full mt-1 w-96 bg-white border border-gray-300 
                              rounded-lg shadow-lg p-4 text-center z-50">
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  <span className="text-sm">Searching...</span>
                </div>
              </div>
            )}
          </div>

          {/* Type filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-lg text-sm
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       bg-white"
          >
            <option value="all">All Sales</option>
            <option value="normal">Normal</option>
            <option value="manual">Manual</option>
            <option value="random">Random</option>
          </select>

          {/* Date filter */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-lg text-sm
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       bg-white"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 font-medium">Total Sales</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {filteredSales.length}
          </div>
        </div>
        <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 font-medium">Total Amount</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            ₹{filteredSales.reduce((sum, s) => sum + Number(s.amount), 0).toFixed(2)}
          </div>
        </div>
        <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 font-medium">Normal Sales</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {filteredSales.filter(s => s.type === "normal").length}
          </div>
        </div>
        <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 font-medium">Manual Sales</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">
            {filteredSales.filter(s => s.type === "manual").length}
          </div>
        </div>
      </div>

      <div className="border border-gray-300 rounded-lg bg-white overflow-x-auto shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left font-semibold text-gray-700">Date</th>
              <th className="p-3 text-left font-semibold text-gray-700">Type</th>
              <th className="p-3 text-left font-semibold text-gray-700">Customer Name</th>
              <th className="p-3 text-left font-semibold text-gray-700">Phone</th>
              <th className="p-3 text-right font-semibold text-gray-700">Amount</th>
              <th className="p-3 text-left font-semibold text-gray-700">Payment</th>
              <th className="p-3 text-center font-semibold text-gray-700">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    <span>Loading sales...</span>
                  </div>
                </td>
              </tr>
            )}

            {!loading && filteredSales.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center">
                  <div className="text-gray-400 text-4xl mb-2">📊</div>
                  <div className="text-gray-600 font-medium">No sales found</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Try adjusting your filters
                  </div>
                </td>
              </tr>
            )}

            {filteredSales.map(sale => (
              <tr key={sale.id} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                <td className="p-3 text-gray-700">
                  <div className="font-medium">
                    {new Date(sale.date).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(sale.date).toLocaleTimeString()}
                  </div>
                </td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${badge(sale.type)}`}
                  >
                    {sale.type.toUpperCase()}
                  </span>
                </td>

                <td className="p-3 text-gray-700 font-medium">{sale.customer}</td>

                <td className="p-3 text-gray-600 text-sm">
                  {sale.customerPhone || "—"}
                </td>

                <td className="p-3 text-right font-bold text-gray-900">
                  ₹{Number(sale.amount).toFixed(2)}
                </td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium capitalize ${paymentBadge(sale.payment)}`}
                  >
                    {sale.payment}
                  </span>
                </td>

                <td className="p-3 text-center">
                  <button
                    onClick={() =>
                      navigate(`/invoice/${sale.id}`, {
                        state: { from: "sales-history" }
                      })
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

export default SalesHistory;