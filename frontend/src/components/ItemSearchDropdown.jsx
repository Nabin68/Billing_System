import { searchItems } from "../api/api";
import { useEffect, useRef, useState } from "react";

function ItemSearchDropdown({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
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
  }, [query]);

  function handleKeyDown(e) {
    if (e.key === "ArrowDown") {
      setActiveIndex((prev) =>
        prev < results.length - 1 ? prev + 1 : prev
      );
    }

    if (e.key === "ArrowUp") {
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
    }

    if (e.key === "Enter" && results[activeIndex]) {
      onSelect(results[activeIndex]);
      setQuery("");
      setResults([]);
    }
  }

  return (
    <div style={{ position: "relative" }}>
      <input
        ref={inputRef}
        placeholder="Search product..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      {results.length > 0 && (
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
          {results.map((item, idx) => (
            <div
              key={item.id}
              style={{
                padding: 6,
                cursor: "pointer",
                background:
                  idx === activeIndex ? "#333" : "transparent",
              }}
              onClick={() => {
                onSelect(item);
                setQuery("");
                setResults([]);
              }}
            >
              {item.name} – ₹{item.selling_price}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ItemSearchDropdown;
