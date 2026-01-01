import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/mainLayout";


import Login from "./pages/auth/login";
import StockIn from "./pages/stock/stockIn";
import StockOut from "./pages/stock/stockOut";
import TotalStock from "./pages/stock/TotalStock";
import BunkerDetails from "./pages/bunker/bunkerDetails";
import BUnker from "./pages/bunker/bunker";


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
       <Route path="/bunker" element={<BUnker />} />
          <Route path="/bunkerdetails/:id" element={<BunkerDetails />} />
      </Route>

    </Routes>
  );
}

export default App;
