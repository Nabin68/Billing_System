import { searchItems } from "../api/api";
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";

const ItemSearchDropdown = forwardRef(({ onSelect, onEnterSelect }, ref) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selected, setSelected] = useState(false);
  const inputRef = useRef(null);

  // 🔥 expose focus() to parent
  useImperativeHandle(ref, () => ({
    focus() {
      setSelected(false);
      setQuery("");
      inputRef.current?.focus();
    }
  }));

  useEffect(() => {
    if (selected) return;
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const load = async () => {
      const data = await searchItems(query);
      setResults(data);
      setActiveIndex(0);
    };

    load();
  }, [query, selected]);

  function handleKeyDown(e) {
    if (selected) return;

    if (e.key === "ArrowDown") {
      setActiveIndex(p => Math.min(p + 1, results.length - 1));
    }

    if (e.key === "ArrowUp") {
      setActiveIndex(p => Math.max(p - 1, 0));
    }

    if (e.key === "Enter" && results[activeIndex]) {
      const item = results[activeIndex];
      setQuery(item.name);
      setSelected(true);
      setResults([]);
      onSelect(item);
      onEnterSelect?.();
    }
  }

  return (
    <div style={{ position: "relative" }}>
      <input
        ref={inputRef}
        value={query}
        placeholder="Search product..."
        className="w-full bg-white border border-gray-300 text-gray-900
                   placeholder-gray-400 rounded px-3 py-2
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        onChange={(e) => {
          setQuery(e.target.value);
          setSelected(false);
        }}
        onKeyDown={handleKeyDown}
      />

      {!selected && results.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            background: "#1e1e1e",
            color: "#fff",
            border: "1px solid #555",
            maxHeight: 200,
            overflowY: "auto",
            width: "100%",
            zIndex: 99999,
          }}
        >
          {results.map((item, i) => (
            <div
              key={item.id}
              style={{
                padding: 6,
                cursor: "pointer",
                background: i === activeIndex ? "#333" : "transparent",
              }}
              onMouseDown={() => {
                setQuery(item.name);
                setSelected(true);
                setResults([]);
                onSelect(item);
                onEnterSelect?.();
              }}
            >
              {item.name} – ₹{item.selling_price}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default ItemSearchDropdown;