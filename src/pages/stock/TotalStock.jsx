import { useEffect, useState } from "react";
import axios from "axios";
import StockEditModal from "./StockEditModal";
import PopupAlert from "../../components/popupAlert/PopupAlert"; // Ensure this is imported
import "./totalStock.css";

function TotalStock() {
  const [stocks, setStocks] = useState([]);
  const [stockOuts, setStockOuts] = useState([]); // State to hold stock-out data
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    keyword: "",
    date: "",
    paymentStatus: "all", // paid | unpaid | all
    limit: 10,
  });
const [stockSummary, setStockSummary] = useState([]);

// ================= FETCH STOCK SUMMARY =================
const fetchStockSummary = async () => {
  if (!token) return;

  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}admin/stock-summary`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setStockSummary(res.data.data || []);
  } catch (err) {
    console.error("Error fetching stock summary", err);
  }
};

  const [stockOutFilters, setStockOutFilters] = useState({
    keyword: "",
    date: "",
    limit: 10,
  });

  const [selectedStock, setSelectedStock] = useState(null);
  const [showEdit, setShowEdit] = useState(false);

  const [popup, setPopup] = useState({
    open: false,
    message: "",
    status: 200,
    loading: false,
  });

  const token = localStorage.getItem("adminToken");

  // ================= FETCH STOCKS =================
  const fetchStocks = async () => {
    if (!token) return;

    try {
      setLoading(true);

      const params = {
        limit: filters.limit,
        ...(filters.keyword && { keyword: filters.keyword }),
        ...(filters.date && { date: filters.date }),
        ...(filters.paymentStatus !== "all" && {
          paymentStatus: filters.paymentStatus,
        }),
      };


      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}admin/stock`,
        {
          params,
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setStocks(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH STOCK OUT =================
  const fetchStockOut = async () => {
    if (!token) return;

    try {
      setLoading(true);

      const params = {
        limit: stockOutFilters.limit,
        ...(stockOutFilters.keyword && { keyword: stockOutFilters.keyword }),
        ...(stockOutFilters.date && { date: stockOutFilters.date }),
      };

      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}admin/stockOut`,
        {
          params,
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setStockOuts(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
    fetchStockOut(); // Fetch stock-out data on initial load
    fetchStockSummary(); // Fetch stock summary on initial load
  }, [filters, stockOutFilters]);

  // ================= DELETE STOCK =================
  const handleDeleteStockIn = async (id) => {
    if (!window.confirm("Are you sure you want to delete this stock entry?")) return;

    // Show loading popup while waiting for delete response
    setPopup({
      open: true,
      message: "Deleting the stock entry...",
      status: 200,
      loading: true,
    });

    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}admin/stock/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPopup({
        open: true,
        message: res.data.message || "Stock entry deleted successfully",
        status: 200,
        loading: false,
      });

      fetchStocks(); // Refresh stock data
    } catch (err) {
      setPopup({
        open: true,
        message: err.response?.data?.message || "Delete failed. Please try again.",
        status: 400,
        loading: false,
      });
    }
  };

  // ================= DELETE STOCK OUT =================
  const handleDeleteStockOut = async (id) => {
    if (!window.confirm("Are you sure you want to delete this stock-out entry?")) return;

    // Show loading popup while waiting for delete response
    setPopup({
      open: true,
      message: "Deleting the stock-out entry...",
      status: 200,
      loading: true,
    });

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}admin/stockOut/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Show success popup and refresh stock-out list
      setPopup({
        open: true,
        message: "Stock-out entry deleted successfully",
        status: 200,
        loading: false,
      });

      fetchStockOut(); // Refresh stock-out data
    } catch (err) {
      // Show error popup on failure
      setPopup({
        open: true,
        message: "Delete failed. Please try again.",
        status: 400,
        loading: false,
      });
    }
  };

  // ================= UPDATE STOCK =================
  const handleUpdateStock = async (updatedStock) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}admin/stock/${updatedStock._id}`,
        updatedStock,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setShowEdit(false); // Close the modal
      fetchStocks(); // Refresh the stock list
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  return (
    <div className="total-stock-page">
<h1>Stock Summary</h1>

<div className="table-wrapper">
  <table className="modern-table">
    <thead>
      <tr>
        <th>Category</th>
        <th>Total KGs Bought</th>
        <th>Stock Out</th>
        <th>Remaining Stock</th>
        <th>Gross Total</th>
        <th>Discount</th>
        <th>Net Total</th>
        <th>Paid</th>
        <th>Remaining Amount</th>
      </tr>
    </thead>

    <tbody>
      {stockSummary.length === 0 ? (
        <tr>
          <td colSpan="9" className="empty">
            No summary data found
          </td>
        </tr>
      ) : (
        stockSummary.map((item) => (
          <tr key={item._id}>
            <td>{item.category}</td>
            <td>{Number(item.totalKgsBought).toFixed(2)}</td>
            <td>{item.stockOutQuantity || 0}</td>
            <td>{Number(item.remainingStock).toFixed(2)}</td>
            <td>{Number(item.totalGrossTotal).toFixed(2)}</td>
            <td>{Number(item.totalDiscount).toFixed(2)}</td>
            <td>{Number(item.totalNetTotal).toFixed(2)}</td>
            <td>{Number(item.totalAmountPaid).toFixed(2)}</td>
            <td
              className={
                Number(item.totalRemainingAmount) > 0
                  ? "pending"
                  : "paid"
              }
            >
              {Number(item.totalRemainingAmount).toFixed(2)}
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>






      <h1>Stock In</h1>

      {/* ========== Filters for Stock In ========== */}
      <div className="filters">
        <input
          placeholder="Search keyword"
          value={filters.keyword}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
        />

        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
        />
        <select
          value={filters.paymentStatus}
          onChange={(e) =>
            setFilters({ ...filters, paymentStatus: e.target.value })
          }
        >
          <option value="all">All</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>


        <input
          type="number"
          min={1}
          placeholder="Limit"
          value={filters.limit}
          onChange={(e) =>
            setFilters({
              ...filters,
              limit: Math.max(1, Number(e.target.value)),
            })
          }
        />

        <button onClick={fetchStocks}>Apply</button>
      </div>

      {/* ========== Stock In Table ========== */}
      <div className="table-wrapper">
        {loading && (
          <div className="table-loader">
            <div className="spinner"></div>
            <span>Loading stocks...</span>
          </div>
        )}

        <table className="modern-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Category</th>
              <th>Price / Kg</th>
              <th>Total KGs</th>
              <th>Gross</th>
              <th>Discount</th>
              <th>Net Total</th>
              <th>Paid</th>
              <th>Remaining</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {!loading && stocks.length === 0 ? (
              <tr>
                <td colSpan="11" className="empty">
                  No records found
                </td>
              </tr>
            ) : (
              stocks.map((stock) => (
                <tr key={stock._id}>
                  <td>{stock.clientName}</td>
                  <td>{stock.category}</td>
                  <td>{Number(stock.pricePerKg).toFixed(2)}</td>
                  <td>{Number(stock.weightPerKg).toFixed(2)}</td>
                  <td>{Number(stock.grossTotal).toFixed(2)}</td>
                  <td>{Number(stock.discount).toFixed(2)}</td>
                  <td>{Number(stock.netTotal).toFixed(2)}</td>
                  <td>{Number(stock.amountPaid).toFixed(2)}</td>
                  <td
                    className={Number(stock.remainingAmount) > 0 ? "pending" : "paid"}
                  >
                    {Number(stock.remainingAmount).toFixed(2)}
                  </td>
                  <td>{new Date(stock.scheduledDate).toLocaleDateString()}</td>

                  <td className="actions">
                    <button
                       className="btn-edit"
                      onClick={() => {
                        setSelectedStock(stock);
                        setShowEdit(true);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteStockIn(stock._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <br />
      <h1>Stock Out</h1>

      {/* ========== Filters for Stock Out ========== */}
      <div className="filters">
        <input
          placeholder="Search keyword"
          value={stockOutFilters.keyword}
          onChange={(e) =>
            setStockOutFilters({ ...stockOutFilters, keyword: e.target.value })
          }
        />

        <input
          type="date"
          value={stockOutFilters.date}
          onChange={(e) =>
            setStockOutFilters({ ...stockOutFilters, date: e.target.value })
          }
        />

        <input
          type="number"
          min={1}
          placeholder="Limit"
          value={stockOutFilters.limit}
          onChange={(e) =>
            setStockOutFilters({
              ...stockOutFilters,
              limit: Math.max(1, Number(e.target.value)),
            })
          }
        />

        <button onClick={fetchStockOut}>Apply</button>
      </div>

      {/* ========== Stock Out Table ========== */}
      <div className="table-wrapper">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Person Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {!loading && stockOuts.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty">
                  No stock out records found
                </td>
              </tr>
            ) : (
              stockOuts.map((stockOut) => (
                <tr key={stockOut._id}>
                  <td>{stockOut.personName}</td>
                  <td>{stockOut.category}</td>
                  <td>{stockOut.quantity}</td>
                  <td>{stockOut.status}</td>
                  <td>{new Date(stockOut.date).toLocaleDateString()}</td>
                  <td className="actions">
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteStockOut(stockOut._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ========== Edit Popup ========== */}
      {showEdit && (
        <StockEditModal
          stock={selectedStock}
          onClose={() => setShowEdit(false)}
          onUpdated={handleUpdateStock} // Call the update handler after successful update
        />
      )}

      {/* ========== Popup Alert ========== */}
      <PopupAlert
        open={popup.open}
        message={popup.message}
        status={popup.status}
        loading={popup.loading}
        onClose={() => setPopup({ ...popup, open: false })}
      />
    </div>
  );
}

export default TotalStock;
