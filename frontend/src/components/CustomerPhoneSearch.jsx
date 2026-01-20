import { useEffect, useState } from "react";

function CustomerPhoneSearch({ value, onSelect, onChange }) {
  const [list, setList] = useState([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (value.length < 3) {
      setList([]);
      return;
    }

    fetch(`http://127.0.0.1:8000/customers/search?q=${value}`)
      .then((res) => res.json())
      .then((data) => setList(data));
  }, [value]);

  function handleKey(e) {
    if (e.key === "ArrowDown")
      setActive((a) => Math.min(a + 1, list.length - 1));

    if (e.key === "ArrowUp")
      setActive((a) => Math.max(a - 1, 0));

    if (e.key === "Enter" && list[active]) {
      onSelect(list[active]);
      setList([]);
    }
  }

  return (
    <div className="relative z-10">
      <input
        className="w-full bg-white border border-gray-300 rounded px-3 py-2
                   focus:ring-2 focus:ring-blue-500"
        placeholder="Phone number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
      />

      {list.length > 0 && (
        <div
          className="absolute z-50 mt-1 w-full
                     bg-white border border-gray-300
                     rounded-lg shadow-xl
                     max-h-60 overflow-y-auto"
        >
          {list.map((c, i) => (
            <div
              key={c.id}
              className={`px-3 py-2 cursor-pointer transition-colors
                ${
                  i === active
                    ? "bg-blue-600 text-white"
                    : "hover:bg-blue-50"
                }`}
              onMouseEnter={() => setActive(i)}
              onClick={() => {
                onSelect(c);
                setList([]);
              }}
            >
              <div className="font-medium">{c.phone}</div>
              <div className="text-xs text-gray-500">{c.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomerPhoneSearch;
