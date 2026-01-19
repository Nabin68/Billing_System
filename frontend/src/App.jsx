
import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";

import Dashboard from "./pages/Dashboard";
import NewSale from "./pages/Sales/NewSale";
import ManualSale from "./pages/Sales/ManualSale";
import Invoice from "./pages/Sales/Invoice";

import NewPurchase from "./pages/Purchases/NewPurchase";
import DealerHistory from "./pages/Purchases/DealerHistory";

import Products from "./pages/Products/Products";
import CustomerDetails from "./pages/Customers/CustomerDetails";
import CreditList from "./pages/Credit/CreditList";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Sales */}
        <Route path="/sales/new" element={<NewSale />} />
        <Route path="/sales/manual" element={<ManualSale />} />
        <Route path="/sales/invoice/:id" element={<Invoice />} />

        {/* Purchases */}
        <Route path="/purchases/new" element={<NewPurchase />} />
        <Route path="/purchases/history" element={<DealerHistory />} />

        {/* Others */}
        <Route path="/products" element={<Products />} />
        <Route path="/customers" element={<CustomerDetails />} />
        <Route path="/credit" element={<CreditList />} />
      </Route>
    </Routes>
  );
}

export default App;



// import { Routes, Route, Navigate } from "react-router-dom";
// import AppLayout from "./layouts/AppLayout";
// import Dashboard from "./pages/Dashboard";

// function App() {
//   return (
//     <Routes>
//       <Route element={<AppLayout />}>
//         <Route path="/" element={<Navigate to="/dashboard" />} />
//         <Route path="/dashboard" element={<Dashboard />} />
//       </Route>
//     </Routes>
//   );
// }

// export default App;


