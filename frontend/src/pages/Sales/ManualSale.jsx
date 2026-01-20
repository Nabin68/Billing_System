import { useNavigate } from "react-router-dom";

function ManualSale() {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manual Sale</h1>
        <p className="text-gray-600 mt-1">
          Record sales that were not billed through the system
        </p>
      </div>

      {/* OPTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* RANDOM SALE */}
        <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm hover:shadow-md transition">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Random Sale
          </h2>

          <p className="text-sm text-gray-600 mb-4">
            Quick entry without customer details.  
            Ideal for rush-hour counter sales.
          </p>

          <button
            onClick={() => navigate("/sales/manual/random")}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Record Random Sale →
          </button>
        </div>

        {/* MANUAL BILL ENTRY */}
        <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm hover:shadow-md transition">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Manual Bill Entry
          </h2>

          <p className="text-sm text-gray-600 mb-4">
            Enter sales from handwritten bills.  
            Date & time can be modified.
          </p>

          <button
            onClick={() => navigate("/sales/manual/entry")}
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
          >
            Enter Manual Bill →
          </button>
        </div>

      </div>
    </div>
  );
}

export default ManualSale;
