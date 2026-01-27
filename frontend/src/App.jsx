import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";

import Dashboard from "./pages/Dashboard";
import NewSale from "./pages/Sales/NewSale";
import ManualSale from "./pages/Sales/ManualSale";
import Invoice from "./pages/Sales/Invoice";

import NewPurchase from "./pages/Purchases/NewPurchase";
import Products from "./pages/Products/Products";
import CustomerDetails from "./pages/Customers/Customers";
import CreditList from "./pages/Credit/CreditList";
import PurchaseHistory from "./pages/Purchases/PurchaseHistory";
import PurchaseInvoice from "./pages/Purchases/PurchaseInvoice";
import RandomSale from "./pages/Sales/RandomSale";
import ManualSaleEntry from "./pages/Sales/ManualSaleEntry";
import SalesHistory from "./pages/sales/SalesHistory";
import CustomerDetail from "./pages/Customers/CustomerDetail";



function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Sales */}
        <Route path="/sales/new" element={<NewSale />} />
        <Route path="/sales/manual" element={<ManualSale />} />
        <Route path="/sales/manual/random" element={<RandomSale />} />
        <Route path="/sales/manual/entry" element={<ManualSaleEntry />} />
        <Route path="/sales/history" element={<SalesHistory />} />



        {/* Invoice */}
        <Route path="/invoice/:billId" element={<Invoice />} />

        {/* Purchases */}
        <Route path="/purchases/new" element={<NewPurchase />} />
        <Route path="/purchase-history" element={<PurchaseHistory />} />
        <Route path="/purchase-invoice/:id" element={<PurchaseInvoice />} />

        {/* Others */}
        <Route path="/products" element={<Products />} />
        <Route path="/customers" element={<CustomerDetails />} />
        <Route path="/customers/:customerId" element={<CustomerDetail />} />

        <Route path="/credit" element={<CreditList />} />
      </Route>
    </Routes>
  );
}

export default App;
