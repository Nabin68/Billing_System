import { Routes, Route } from "react-router-dom";
import Billing from "./pages/Billing";
import Invoice from "./pages/Invoice";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Billing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/invoice/:billId" element={<Invoice />} />
      </Routes>
    </>
  );
}

export default App;
