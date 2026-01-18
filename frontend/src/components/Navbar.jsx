import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <div style={navStyle}>
      <h3 style={{ margin: 0 }}>Bibek & Nabin Traders</h3>

      <div style={{ display: "flex", gap: 15 }}>
        <NavLink to="/dashboard" style={linkStyle}>
          Dashboard
        </NavLink>

        <NavLink to="/" style={linkStyle}>
          Billing
        </NavLink>
      </div>
    </div>
  );
}

const navStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 20px",
  borderBottom: "1px solid #ccc",
};

const linkStyle = ({ isActive }) => ({
  textDecoration: "none",
  fontWeight: isActive ? "bold" : "normal",
  color: "black",
});

export default Navbar;
