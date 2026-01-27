import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { searchSales } from "../api/api";

function CustomerSaleSearch() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!q || q.length < 2) {
      setResults([]);
      return;
    }

    const t = setTimeout(async () => {
      const data = await searchSales(q);
      setResults(data);
    }, 300);

    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="relative w-96">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search customer name or phone..."
        className="w-full border rounded px-4 py-2"
      />

      {results.length > 0 && (
        <div className="absolute z-20 w-full bg-white border rounded mt-1 shadow-lg">
          {results.map((r) => (
            <div
              key={r.sale_id}
              onClick={() => navigate(`/invoice/${r.sale_id}`, {
                state: { from: "sales-history" }
              })}
              className="p-3 hover:bg-gray-100 cursor-pointer flex justify-between"
            >
              <div>
                <div className="font-medium">{r.customer_name}</div>
                <div className="text-xs text-gray-500">
                  {r.customer_phone}
                </div>
              </div>

              <div className="font-semibold text-gray-800">
                ₹{r.amount}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomerSaleSearch;
