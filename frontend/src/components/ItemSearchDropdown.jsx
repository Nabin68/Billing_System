import { searchItems } from "../api/api";
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { createPortal } from "react-dom";

const ItemSearchDropdown = forwardRef(({ onSelect, onEnterSelect, allowCustom = false }, ref) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selected, setSelected] = useState(false);
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // 🔥 expose focus() to parent
  useImperativeHandle(ref, () => ({
    focus() {
      setSelected(false);
      setQuery("");
      inputRef.current?.focus();
    }
  }));

  // 🔧 Compute dropdown position
  useEffect(() => {
    if (show && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [show, query]);

  useEffect(() => {
    if (selected) return;
    if (query.length < 2) {
      setResults([]);
      setShow(false);
      return;
    }

    const load = async () => {
      const data = await searchItems(query);
      setResults(data);
      setActiveIndex(0);
      setShow(data.length > 0);
    };

    load();
  }, [query, selected]);

  function handleKeyDown(e) {
    if (selected) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(p => Math.min(p + 1, results.length - 1));
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(p => Math.max(p - 1, 0));
    }

    if (e.key === "Enter") {
      e.preventDefault();

      // If suggestion exists → select it
      if (results[activeIndex]) {
        handleSelect(results[activeIndex]);
        return;
      }

      // ✅ CUSTOM ITEM ENTRY
      if (allowCustom && query.trim()) {
        onSelect({
          id: null,
          name: query.trim(),
          selling_price: 0,
        });
        setSelected(true);
        setShow(false);
        onEnterSelect?.();
      }
    }

    if (e.key === "Escape") {
      setShow(false);
    }
  }

  function handleSelect(item) {
    setQuery(item.name);
    setSelected(true);
    setShow(false);
    setResults([]);
    onSelect(item);
    onEnterSelect?.();
  }

  return (
    <>
      {/* Input stays in table */}
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

      {/* Dropdown rendered via PORTAL */}
      {show && results.length > 0 &&
        createPortal(
          <div
            ref={dropdownRef}
            className="bg-white border border-gray-300 rounded shadow-lg z-[9999]"
            style={{
              position: "absolute",
              top: pos.top,
              left: pos.left,
              width: pos.width,
              maxHeight: 240,
              overflowY: "auto"
            }}
          >
            {results.map((item, i) => (
              <div
                key={item.id}
                className={`px-3 py-2 cursor-pointer transition-colors ${
                  i === activeIndex ? "bg-blue-50" : "hover:bg-gray-50"
                }`}
                onMouseDown={() => handleSelect(item)}
                onMouseEnter={() => setActiveIndex(i)}
              >
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-medium">{item.name}</span>
                  <span className="text-gray-600">₹{item.selling_price}</span>
                </div>
              </div>
            ))}
          </div>,
          document.body
        )}
    </>
  );
});

export default ItemSearchDropdown;

// import { searchItems } from "../api/api";
// import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
// import { createPortal } from "react-dom";

// const ItemSearchDropdown = forwardRef(({ onSelect, onEnterSelect }, ref) => {
//   const [query, setQuery] = useState("");
//   const [results, setResults] = useState([]);
//   const [activeIndex, setActiveIndex] = useState(0);
//   const [selected, setSelected] = useState(false);
//   const [show, setShow] = useState(false);
//   const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  
//   const inputRef = useRef(null);
//   const dropdownRef = useRef(null);

//   // 🔥 expose focus() to parent
//   useImperativeHandle(ref, () => ({
//     focus() {
//       setSelected(false);
//       setQuery("");
//       inputRef.current?.focus();
//     }
//   }));

//   // 🔧 Compute dropdown position
//   useEffect(() => {
//     if (show && inputRef.current) {
//       const rect = inputRef.current.getBoundingClientRect();
//       setPos({
//         top: rect.bottom + window.scrollY,
//         left: rect.left + window.scrollX,
//         width: rect.width
//       });
//     }
//   }, [show, query]);

//   useEffect(() => {
//     if (selected) return;
//     if (query.length < 2) {
//       setResults([]);
//       setShow(false);
//       return;
//     }

//     const load = async () => {
//       const data = await searchItems(query);
//       setResults(data);
//       setActiveIndex(0);
//       setShow(data.length > 0);
//     };

//     load();
//   }, [query, selected]);

//   function handleKeyDown(e) {
//     if (selected) return;

//     if (e.key === "ArrowDown") {
//       e.preventDefault();
//       setActiveIndex(p => Math.min(p + 1, results.length - 1));
//     }

//     if (e.key === "ArrowUp") {
//       e.preventDefault();
//       setActiveIndex(p => Math.max(p - 1, 0));
//     }

//     if (e.key === "Enter" && results[activeIndex]) {
//       e.preventDefault();
//       handleSelect(results[activeIndex]);
//     }

//     if (e.key === "Escape") {
//       setShow(false);
//     }
//   }

//   function handleSelect(item) {
//     setQuery(item.name);
//     setSelected(true);
//     setShow(false);
//     setResults([]);
//     onSelect(item);
//     onEnterSelect?.();
//   }

//   return (
//     <>
//       {/* Input stays in table */}
//       <input
//         ref={inputRef}
//         value={query}
//         placeholder="Search product..."
//         className="w-full bg-white border border-gray-300 text-gray-900
//                    placeholder-gray-400 rounded px-3 py-2
//                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//         onChange={(e) => {
//           setQuery(e.target.value);
//           setSelected(false);
//         }}
//         onKeyDown={handleKeyDown}
//       />

//       {/* Dropdown rendered via PORTAL */}
//       {show && results.length > 0 &&
//         createPortal(
//           <div
//             ref={dropdownRef}
//             className="bg-white border border-gray-300 rounded shadow-lg z-[9999]"
//             style={{
//               position: "absolute",
//               top: pos.top,
//               left: pos.left,
//               width: pos.width,
//               maxHeight: 240,
//               overflowY: "auto"
//             }}
//           >
//             {results.map((item, i) => (
//               <div
//                 key={item.id}
//                 className={`px-3 py-2 cursor-pointer transition-colors ${
//                   i === activeIndex ? "bg-blue-50" : "hover:bg-gray-50"
//                 }`}
//                 onMouseDown={() => handleSelect(item)}
//                 onMouseEnter={() => setActiveIndex(i)}
//               >
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-900 font-medium">{item.name}</span>
//                   <span className="text-gray-600">₹{item.selling_price}</span>
//                 </div>
//               </div>
//             ))}
//           </div>,
//           document.body
//         )}
//     </>
//   );
// });

// export default ItemSearchDropdown;