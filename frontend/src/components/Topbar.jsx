function Topbar() {
  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-6 shadow-sm">
      <div className="text-sm text-gray-600">
        Welcome 👋
      </div>

      <div className="text-sm text-gray-500">
        {new Date().toLocaleString()}
      </div>
    </header>
  );
}

export default Topbar;
