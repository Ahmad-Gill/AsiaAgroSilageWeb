import { useState, useEffect } from "react";
import "./stockIn.css";
import axios from "axios";
import PopupAlert from "../../components/popupAlert/PopupAlert";


function StockIn() {
  const [form, setForm] = useState({
    clientName: "",
    description: "",
    category: "",
    weightPerKg: "",
    pricePerKg: "",
    discount: "",
    grossTotal: 0,
    netTotal: 0,
    amountPaid: "",
    remainingAmount: 0,
    driverName: "",
    vehicleNumber: "",
    scheduledDate: new Date().toISOString().split("T")[0],
  });

const [popup, setPopup] = useState({
  open: false,
  message: "",
  status: 200,
});


const toTwoDecimals = (value) => {
  const num = Number(value);
  return isNaN(num) ? "" : num.toFixed(2);
};


  const [errors, setErrors] = useState({});

  // ===============================
  // CALCULATIONS + VALIDATIONS
  // ===============================
  useEffect(() => {
    const newErrors = {};

    const weight = Number(form.weightPerKg);
    const price = Number(form.pricePerKg);
    const discountInput = Number(form.discount);
    const paidInput = Number(form.amountPaid);

    // Required
    if (!form.clientName.trim()) newErrors.clientName = "Client name is required";
    if (!form.category) newErrors.category = "Category is required";
    if (!form.scheduledDate) newErrors.scheduledDate = "Date is required";

    // Numeric rules
    if (weight < 0) newErrors.weightPerKg = "Weight cannot be negative";
    if (price < 0) newErrors.pricePerKg = "Price cannot be negative";
    if (discountInput < 0) newErrors.discount = "Discount cannot be negative";
    if (paidInput < 0) newErrors.amountPaid = "Amount paid cannot be negative";

    const safeWeight = Math.max(weight || 0, 0);
    const safePrice = Math.max(price || 0, 0);
    const gross = safeWeight * safePrice;

    if (discountInput > gross) {
      newErrors.discount = "Discount cannot exceed gross total";
    }

    const discount = Math.min(Math.max(discountInput || 0, 0), gross);
    const net = gross - discount;

    if (paidInput > net) {
      newErrors.amountPaid = "Amount paid cannot exceed net total";
    }

    const paid = Math.min(Math.max(paidInput || 0, 0), net);

    setErrors(newErrors);

setForm(prev => ({
  ...prev,
  discount: toTwoDecimals(discount),
  amountPaid: toTwoDecimals(paid),
  grossTotal: toTwoDecimals(gross),
  netTotal: toTwoDecimals(net),
  remainingAmount: toTwoDecimals(net - paid),
}));

  }, [
    form.clientName,
    form.category,
    form.weightPerKg,
    form.pricePerKg,
    form.discount,
    form.amountPaid,
    form.scheduledDate,
  ]);

  // ===============================
  // INPUT HANDLER (UPPERCASE FORCE)
  // ===============================
  const handleChange = e => {
    const { name, value } = e.target;

    // Block negatives
if (
  ["weightPerKg", "pricePerKg", "discount", "amountPaid"].includes(name)
) {
  // allow only numbers + decimals
  if (!/^\d*\.?\d*$/.test(value)) return;

  setForm(prev => ({
    ...prev,
    [name]: value,
  }));
  return;
}


    // FORCE UPPERCASE TEXT FIELDS
    const uppercaseFields = [
      "clientName",
      "description",
      "driverName",
      "vehicleNumber",
    ];

    setForm(prev => ({
      ...prev,
      [name]: uppercaseFields.includes(name)
        ? value.toUpperCase()
        : value,
    }));
  };

const handleSubmit = async e => {
  e.preventDefault();

  if (Object.keys(errors).length > 0) {
    setPopup({
      open: true,
      message: "Please fix validation errors.",
      status: 400,
      loading: false,
    });
    return;
  }

  const adminToken = localStorage.getItem("adminToken");

  if (!adminToken) {
    setPopup({
      open: true,
      message: "Session expired. Please login again.",
      status: 401,
      loading: false,
    });
    return;
  }

  const payload = {
    clientName: form.clientName.toUpperCase(),
    driverName: form.driverName.toUpperCase(),
    vehicleNumber: form.vehicleNumber.toUpperCase(),
    description: form.description.toUpperCase(),
    category: form.category,
    pricePerKg: Number(form.pricePerKg),
    weightPerKg: Number(form.weightPerKg),
    discount: Number(form.discount),
    amountPaid: Number(form.amountPaid),
    scheduledDate: form.scheduledDate,
  };

  // 🔄 SHOW LOADING POPUP
  setPopup({
    open: true,
    message: "",
    status: 200,
    loading: true,
  });

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}admin/stock`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    setPopup({
      open: true,
      message: "Stock In saved successfully",
      status: response.status,
      loading: false,
    });

  } catch (error) {
    setPopup({
      open: true,
      message:
        error.response?.data?.message ||
        "Failed to save stock. Please try again.",
      status: error.response?.status || 500,
      loading: false,
    });
  }
};





  const hasErrors = Object.keys(errors).length > 0;

  return (
    
    <div className="stockin-container">
      <h2>Stock In</h2>

      <form onSubmit={handleSubmit} className="stockin-form">

        {/* ================= Purchase Details ================= */}
        <div className="section">
          <h4>Purchase Details</h4>

          <div className={`field ${errors.clientName ? "error" : ""}`}>
            <label>Client Name</label>
            <input name="clientName" onChange={handleChange} />
            {errors.clientName && <small>{errors.clientName}</small>}
          </div>

          <div className="field full-width">
            <label>Description</label>
            <input name="description" onChange={handleChange} />
          </div>

          <div className={`field ${errors.category ? "error" : ""}`}>
            <label>Category</label>
            <select name="category" onChange={handleChange}>
              <option value="">Select Category</option>
              <option value="silage">Silage</option>
              <option value="silageFilm">Silage Film</option>
              <option value="stretch">Stretch</option>
              <option value="giftoNaturalRoll">Gifto Natural Roll</option>
            </select>
            {errors.category && <small>{errors.category}</small>}
          </div>
        </div>

        {/* ================= Pricing ================= */}
        <div className="section">
          <h4>Pricing</h4>

          <div className={`field ${errors.weightPerKg ? "error" : ""}`}>
            <label>Weight (Kg)</label>
            <input step="0.01" type="number" name="weightPerKg" onChange={handleChange} />
          </div>

          <div className={`field ${errors.pricePerKg ? "error" : ""}`}>
            <label>Price per Kg</label>
            <input step="0.01" type="number" name="pricePerKg" onChange={handleChange} />
          </div>

          <div className={`field ${errors.discount ? "error" : ""}`}>
            <label>Discount</label>
            <input step="0.01"   type="number" name="discount" value={form.discount} onChange={handleChange} />
          </div>

          <div className="field">
            <label>Gross Total</label>
            <input value={form.grossTotal} disabled />
          </div>

          <div className="field">
            <label>Net Total</label>
            <input value={form.netTotal} disabled />
          </div>

          <div className={`field ${errors.amountPaid ? "error" : ""}`}>
            <label>Amount Paid</label>
            <input step="0.01"   type="number" name="amountPaid" value={form.amountPaid} onChange={handleChange} />
          </div>

          <div className="field">
            <label>Remaining Amount</label>
            <input value={form.remainingAmount} disabled />
          </div>
        </div>

        {/* ================= Logistics ================= */}
        <div className="section">
          <h4>Logistics</h4>

          <div className="field">
            <label>Driver Name</label>
            <input name="driverName" onChange={handleChange} />
          </div>

          <div className="field">
            <label>Vehicle Number</label>
            <input name="vehicleNumber" onChange={handleChange} />
          </div>

          <div className={`field ${errors.scheduledDate ? "error" : ""}`}>
            <label>Date</label>
            <input
              type="date"
              name="scheduledDate"
              value={form.scheduledDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="submit-row">
<button type="submit">
  Save Stock In
</button>

        </div>

      </form>
<PopupAlert
  open={popup.open}
  message={popup.message}
  status={popup.status}
  loading={popup.loading}
  onClose={() =>
    setPopup(prev => ({ ...prev, open: false }))
  }
/>


    </div>
  );
}

export default StockIn;
