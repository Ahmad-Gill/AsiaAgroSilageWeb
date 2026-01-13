import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/mainLayout";


import Login from "./pages/auth/login";
import StockIn from "./pages/stock/stockIn";
import StockOut from "./pages/stock/stockOut";
import TotalStock from "./pages/stock/TotalStock";
import BunkerDetails from "./pages/bunker/bunkerDetails";
import BUnker from "./pages/bunker/bunker";
import SpareParts from "./pages/spareParts/spareParts";
import Expenses from "./pages/epences/expenses";
import SalePage from "./pages/sale/sale";
import TotalSales from "./pages/sale/TotalSales";
import Home from "./pages/dashboard/Home";
import ClientLedger from "./pages/clientLedger/clientLedgerPage";


function App() {
  return (
    <Routes>

      {/* Public Route */}
      <Route path="/" element={<Login />} />

      {/* Protected App Routes */}
      <Route
        element={<MainLayout />}
      >
        <Route path="/stock/in" element={<StockIn />} />
        <Route path="/stock/out" element={<StockOut />} />
        <Route path="/stock" element={<TotalStock />} />
        <Route path="/client-ledger" element={<ClientLedger />} />
       <Route path="/bunker" element={<BUnker />} />
        <Route path="/spare-parts" element={<SpareParts />} />
        <Route path="/home" element={<Home />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/sale" element={<SalePage />} />
        <Route path="/total-sales" element={<TotalSales />} />
          <Route path="/bunkerdetails/:id" element={<BunkerDetails />} />
      </Route>

    </Routes>
  );
}

export default App;
