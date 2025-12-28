import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/mainLayout";

import Login from "./pages/auth/login";
import StockIn from "./pages/stock/stockIn";
import StockOut from "./pages/stock/stockOut";
import TotalStock from "./pages/stock/TotalStock";


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
      </Route>

    </Routes>
  );
}

export default App;
