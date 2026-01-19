import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <div style={{ width: 220, borderRight: "1px solid #ccc", padding: 15 }}>
      <h3>Bibek & Nabin</h3>

      <NavLink to="/dashboard">Dashboard</NavLink><br />
      <NavLink to="/sales/new">New Sale</NavLink><br />
      <NavLink to="/sales/manual">Manual Sale</NavLink><br />
      <NavLink to="/purchases/new">New Purchase</NavLink><br />
      <NavLink to="/products">Products</NavLink><br />
      <NavLink to="/customers">Customers</NavLink><br />
      <NavLink to="/credit">Credit</NavLink>
    </div>
  );
}

export default Sidebar;
