import { useEffect, useState, useRef } from "react";
import { searchSuppliers } from "../api/purchases";

function SupplierSearch({ value, onChange, onSelect }) {
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!value.trim()) {
      setResults([]);
      return;
    }

    searchSuppliers(value).then(setResults).catch(console.error);
  }, [value]);

  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value); // ✅ KEY FIX
          setOpen(true);
        }}
        placeholder="Search or enter supplier name"
        className="w-full border rounded px-3 py-2"
      />

      {open && results.length > 0 && (
        <div className="absolute z-50 w-full bg-white border rounded shadow mt-1">
          {results.map((s) => (
            <div
              key={s.phone}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onSelect(s);
                setOpen(false);
              }}
            >
              <div className="font-medium">{s.name}</div>
              <div className="text-xs text-gray-500">{s.phone}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SupplierSearch;
