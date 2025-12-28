import { useState, useMemo } from "react";
import axios from "axios";
import "./stockEditModal.css";
import PopupAlert from "../../components/popupAlert/PopupAlert";

function StockEditModal({ stock, onClose, onUpdated }) {
  const [form, setForm] = useState({
    clientName: stock.clientName,
    description: stock.description,
    addPayment: "",
  });

  const [popup, setPopup] = useState({
    open: false,
    message: "",
    status: 200,
    loading: false,
  });

  const token = localStorage.getItem("adminToken");

  // ===============================
  // DERIVED VALUES (PREVIEW)
  // ===============================
  const currentPaid = Number(stock.amountPaid || 0);
  const netTotal = Number(stock.netTotal || 0);
  const addPayment = Number(form.addPayment || 0);

  const newPaidTotal = currentPaid + addPayment;
  const newRemaining = Math.max(netTotal - newPaidTotal, 0);

  const isOverPayment = newPaidTotal > netTotal;

  // ===============================
  // HANDLERS
  // ===============================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    const trimmedClient = form.clientName.trim();
    const trimmedDesc = form.description.trim();
    const addPayment = Number(form.addPayment || 0);

    const payload = {};

    // ✅ Only include if changed AND not empty
    if (
      trimmedClient &&
      trimmedClient.toUpperCase() !== stock.clientName.toUpperCase()
    ) {
      payload.clientName = trimmedClient.toUpperCase();
    }

    if (
      trimmedDesc &&
      trimmedDesc.toUpperCase() !== stock.description.toUpperCase()
    ) {
      payload.description = trimmedDesc.toUpperCase();
    }

    // ✅ Payment logic
    if (addPayment > 0) {
      const newTotalPaid = Number(stock.amountPaid) + addPayment;

      if (newTotalPaid > Number(stock.netTotal)) {
        setPopup({
          open: true,
          message: "Payment exceeds remaining amount.",
          status: 400,
          loading: false,
        });
        return;
      }

      payload.amountPaid = addPayment;
    }

    // 🚫 Nothing valid to update
    if (Object.keys(payload).length === 0) {
      setPopup({
        open: true,
        message: "No valid changes detected.",
        status: 400,
        loading: false,
      });
      return;
    }

    // Show loading popup
    setPopup({
      open: true,
      message: "Processing payment update...",
      status: 200,
      loading: true,
    });

    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}admin/stock/${stock._id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPopup({
        open: true,
        message: "Payment updated successfully",
        status: 200,
        loading: false,
      });

      onUpdated();
    } catch (error) {
      setPopup({
        open: true,
        message:
          error.response?.data?.message || "Update failed. Please try again.",
        status: error.response?.status || 500,
        loading: false,
      });
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-alert info stock-edit-modal">
        {/* ===== Header ===== */}
        <h3>Update Payment</h3>
        <p className="modal-subtitle">
          Use this screen only when a client makes a payment.
          The entered amount will be <strong>added</strong> to existing payments.
        </p>

        {/* ===== READ-ONLY SUMMARY ===== */}
        <div className="modal-readonly">
          <div>
            <span>Total Bill</span>
            <strong>{netTotal.toFixed(2)}</strong>
          </div>
          <div>
            <span>Already Paid</span>
            <strong>{currentPaid.toFixed(2)}</strong>
          </div>
          <div>
            <span>Remaining</span>
            <strong className="pending">
              {(netTotal - currentPaid).toFixed(2)}
            </strong>
          </div>
        </div>

        {/* ===== EDITABLE FIELDS ===== */}
        <div className="modal-field">
          <label>Client Name</label>
          <input
            name="clientName"
            value={form.clientName}
            onChange={handleChange}
          />
        </div>

        <div className="modal-field">
          <label>Description</label>
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <div className="modal-field">
          <label>Add Payment Amount</label>
          <input
            type="number"
            step="0.01"
            name="addPayment"
            value={form.addPayment}
            onChange={handleChange}
          />
          <small>
            This amount will be added to the existing payment.
          </small>
        </div>

        {/* ===== LIVE PREVIEW ===== */}
        <div className="modal-preview">
          <div>
            <span>New Total Paid</span>
            <strong>{newPaidTotal.toFixed(2)}</strong>
          </div>
          <div>
            <span>New Remaining</span>
            <strong className={isOverPayment ? "error" : "paid"}>
              {newRemaining.toFixed(2)}
            </strong>
          </div>
        </div>

        {/* ===== ACTIONS ===== */}
        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="save-btn"
            onClick={handleUpdate}
            disabled={isOverPayment}
          >
            Confirm Payment
          </button>
        </div>
      </div>

      {/* ===== Popup Alert ===== */}
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

export default StockEditModal;
