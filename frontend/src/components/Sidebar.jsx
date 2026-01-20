import { NavLink } from "react-router-dom";

const navItem =
  "block rounded px-3 py-2 text-sm font-medium hover:bg-blue-100";
const activeItem =
  "bg-blue-600 text-white hover:bg-blue-600";

function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r shadow-sm">
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold text-blue-600">
          Bibek & Nabin
        </h2>
        <p className="text-xs text-gray-500">
          Traders POS
        </p>
      </div>

      <nav className="p-4 space-y-1">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${navItem} ${isActive ? activeItem : "text-gray-700"}`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/sales/new"
          className={({ isActive }) =>
            `${navItem} ${isActive ? activeItem : "text-gray-700"}`
          }
        >
          New Sale
        </NavLink>

        <NavLink
          to="/sales/manual"
          className={({ isActive }) =>
            `${navItem} ${isActive ? activeItem : "text-gray-700"}`
          }
        >
          Manual Sale
        </NavLink>

        <NavLink
          to="/purchases/new"
          className={({ isActive }) =>
            `${navItem} ${isActive ? activeItem : "text-gray-700"}`
          }
        >
          New Purchase
        </NavLink>

        <NavLink
          to="/products"
          className={({ isActive }) =>
            `${navItem} ${isActive ? activeItem : "text-gray-700"}`
          }
        >
          Products
        </NavLink>

        <NavLink
          to="/customers"
          className={({ isActive }) =>
            `${navItem} ${isActive ? activeItem : "text-gray-700"}`
          }
        >
          Customers
        </NavLink>

        <NavLink
          to="/credit"
          className={({ isActive }) =>
            `${navItem} ${isActive ? activeItem : "text-gray-700"}`
          }
        >
          Credit
        </NavLink>

        <NavLink
          to="/purchase-history"
          className={({ isActive }) =>
            `${navItem} ${isActive ? activeItem : "text-gray-700"}`
          }
        >
          📦 Purchase History
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;
