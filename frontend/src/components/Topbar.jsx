function Topbar() {
  return (
    <div style={{ borderBottom: "1px solid #ccc", padding: 10 }}>
      <b>Bibek & Nabin Traders</b>
      <span style={{ float: "right" }}>
        {new Date().toLocaleString()}
      </span>
    </div>
  );
}

export default Topbar;
