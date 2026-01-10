import React, { useEffect, useState } from "react";
import axios from "axios";
import PopupAlert from "../../components/popupAlert/PopupAlert";
import "./totalSales.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ADMIN_ACCESS_TOKEN =
  localStorage.getItem("adminToken") ||
  import.meta.env.VITE_ADMIN_ACCESS_TOKEN;

const TotalSales = () => {
  /* ===================== STATES ===================== */
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    limit: 10,
    keyword: "",
    billNo: "",
    paymentStatus: "all",
    date: "",
  });

  const [updateModal, setUpdateModal] = useState({
    open: false,
    id: null,
    amountPaid: "",
  });

  const [popup, setPopup] = useState({
    open: false,
    message: "",
    status: 200,
    loading: false,
  });

  /* ===================== FETCH SUMMARY ===================== */
  const fetchSummary = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}admin/sale/summary`, {
        headers: { Authorization: `Bearer ${ADMIN_ACCESS_TOKEN}` },
      });
      setSummary(res.data.data);
    } catch (error) {
      console.error("Summary error", error);
    }
  };

  /* ===================== FETCH SALES ===================== */
  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}admin/sale`, {
        params: {
          ...filters,
          paymentStatus:
            filters.paymentStatus === "all"
              ? undefined
              : filters.paymentStatus,
        },
        headers: { Authorization: `Bearer ${ADMIN_ACCESS_TOKEN}` },
      });
      setSales(res.data.data || []);
    } catch (error) {
      console.error("Sales fetch error", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSales();
    fetchSummary();
  }, [filters]);

  /* ===================== UPDATE SALE ===================== */
  const submitUpdate = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}admin/sale/${updateModal.id}`,
        { amountPaid: Number(updateModal.amountPaid) },
        { headers: { Authorization: `Bearer ${ADMIN_ACCESS_TOKEN}` } }
      );

      setPopup({
        open: true,
        message: "Payment updated successfully",
        status: 200,
        loading: false,
      });

      setUpdateModal({ open: false, id: null, amountPaid: "" });
      fetchSales();
      fetchSummary();
    } catch (error) {
      setPopup({
        open: true,
        message: error.response?.data?.message || "Update failed",
        status: 500,
        loading: false,
      });
    }
  };

  /* ===================== DELETE SALE ===================== */
  const deleteSale = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sale?")) return;

    try {
      await axios.delete(`${API_BASE_URL}admin/sale/${id}`, {
        headers: { Authorization: `Bearer ${ADMIN_ACCESS_TOKEN}` },
      });

      setPopup({
        open: true,
        message: "Sale deleted successfully",
        status: 200,
        loading: false,
      });

      fetchSales();
      fetchSummary();
    } catch (error) {
      setPopup({
        open: true,
        message: "Delete failed",
        status: 500,
        loading: false,
      });
    }
  };

  /* ===================== UI ===================== */
  return (
    <div className="total-sales-page">
      {/* ===== SUMMARY ===== */}
      <div className="summary-cards">
        <div>KGs Sold <span>{summary?.totalKgsSold || 0}</span></div>
        <div>Discount <span>{summary?.totalDiscountGiven || 0}</span></div>
        <div>Received <span>{summary?.totalAmountReceived || 0}</span></div>
        <div>Remaining <span>{summary?.totalAmountRemaining || 0}</span></div>
      </div>

      {/* ===== FILTERS ===== */}
      <div className="filters">
        <input
          placeholder="Keyword"
          value={filters.keyword}
          onChange={(e) =>
            setFilters({ ...filters, keyword: e.target.value })
          }
        />

        <input
          placeholder="Bill No"
          type="number"
          value={filters.billNo}
          onChange={(e) =>
            setFilters({ ...filters, billNo: e.target.value })
          }
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
          type="date"
          value={filters.date}
          onChange={(e) =>
            setFilters({ ...filters, date: e.target.value })
          }
        />

        <input
          type="number"
          value={filters.limit}
          onChange={(e) =>
            setFilters({ ...filters, limit: e.target.value })
          }
        />
      </div>

      {/* ===== TABLE ===== */}
      <table className="sales-table">
        <thead>
          <tr>
            <th>Bill</th>
            <th>Client</th>
            <th>Total</th>
            <th>Paid</th>
            <th>Remaining</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {!loading && sales.map((row) => (
            <tr key={row._id}>
              <td>{row.billNo}</td>
              <td>{row.clientName}</td>
              <td>{row.totalAmount}</td>
              <td>{row.amountPaid}</td>
              <td>{row.remainingAmount}</td>
              <td className={row.remainingAmount === 0 ? "paid" : "unpaid"}>
                {row.remainingAmount === 0 ? "Paid" : "Unpaid"}
              </td>
              <td>
                <button
                  onClick={() =>
                    setUpdateModal({
                      open: true,
                      id: row._id,
                      amountPaid: "",
                    })
                  }
                >
                  Update
                </button>
                <button onClick={() => deleteSale(row._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ===== UPDATE MODAL ===== */}
      {updateModal.open && (
        <div className="modal">
          <div className="modal-box">
            <h3>Update Payment</h3>
            <input
              type="number"
              placeholder="Amount Paid"
              value={updateModal.amountPaid}
              onChange={(e) =>
                setUpdateModal({ ...updateModal, amountPaid: e.target.value })
              }
            />
            <button onClick={submitUpdate}>Submit</button>
            <button onClick={() => setUpdateModal({ open: false })}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ===== POPUP ===== */}
      <PopupAlert
        open={popup.open}
        message={popup.message}
        status={popup.status}
        loading={popup.loading}
        onClose={() => setPopup({ ...popup, open: false })}
      />
    </div>
  );
};

export default TotalSales;
