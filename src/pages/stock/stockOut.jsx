import { useState, useEffect } from "react";
import axios from "axios"; // Make sure axios is installed
import PopupAlert from "../../components/popupAlert/PopupAlert"; // Import the PopupAlert component
import "./stockOut.css";

function StockOut() {
  const [form, setForm] = useState({
    category: "",
    personName: "",
    quantity: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState({});
  const [popup, setPopup] = useState({
    open: false,
    message: "",
    status: 200,
    loading: false,
  });

  // ===============================
  // VALIDATIONS
  // ===============================
  useEffect(() => {
    const newErrors = {};

    if (!form.category) {
      newErrors.category = "Category is required";
    }

    if (!form.personName.trim()) {
      newErrors.personName = "Name is required";
    }

    const qty = Number(form.quantity);
    if (!form.quantity) {
      newErrors.quantity = "Quantity is required";
    } else if (qty <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }

    if (!form.date) {
      newErrors.date = "Date is required";
    }

    setErrors(newErrors);
  }, [form]);

  // ===============================
  // INPUT HANDLER
  // ===============================
  const handleChange = e => {
    const { name, value } = e.target;

    // Prevent negative numbers
    if (name === "quantity" && value !== "" && Number(value) < 0) {
      return;
    }

    // Force uppercase typing for text fields
    const uppercaseFields = ["personName"];

    if (uppercaseFields.includes(name)) {
      setForm(prev => ({ ...prev, [name]: value.toUpperCase() }));
      return;
    }

    setForm(prev => ({ ...prev, [name]: value }));
  };

  // ===============================
  // SUBMIT
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.keys(errors).length > 0) {
      alert("Please fix validation errors");
      return;
    }

    const stockOutData = {
      personName: form.personName,
      category: form.category,
      quantity: form.quantity,
      date: form.date,
    };

    // Show loading popup while waiting for the request
    setPopup({
      open: true,
      message: "Submitting stock out data...",
      status: 200,
      loading: true,
    });

    try {
      // POST request to submit stock-out data
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}admin/stockOut`, // Your API URL
        stockOutData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`, // Add authorization token if needed
          },
        }
      );

      if (response.status < 350) {
        // If the stock was created successfully
        setPopup({
          open: true,
          message: 'response.message',
          status: 200,
          loading: false, // Stop loading after success
        });

        // Reset form after successful submission
        setForm({
          category: "",
          personName: "",
          quantity: "",
          date: new Date().toISOString().split("T")[0],
        });
      }
    } catch (err) {
      console.error("Error submitting stock out:", err);

      // Handle the error response and show the message in the popup
      const errorMessage =
        err.response?.data?.message || "Failed to save stock out. Please try again.";
      
      setPopup({
        open: true,
        message: errorMessage,
        status: 400,
        loading: false, // Stop loading on error
      });
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="stockout-container">
      <h2>Stock Out</h2>

      <form className="stockout-form" onSubmit={handleSubmit}>

        {/* Category */}
        <div className={`field ${errors.category ? "error" : ""}`}>
          <label>Select Category</label>
          <select name="category" value={form.category} onChange={handleChange}>
            <option value="">Choose category...</option>
            <option value="silageFilm">Silage Film</option>
            <option value="stretch">Stretch</option>
            <option value="giftoNaturalRoll">Gifto Natural Roll</option>
          </select>
          {errors.category && <small className="error-text">{errors.category}</small>}
        </div>

        {/* Name */}
        <div className={`field ${errors.personName ? "error" : ""}`}>
          <label>Name of Person</label>
          <input
            name="personName"
            value={form.personName}
            className="uppercase"
            onChange={handleChange}
          />
          {errors.personName && <small className="error-text">{errors.personName}</small>}
        </div>

        {/* Quantity */}
        <div className={`field ${errors.quantity ? "error" : ""}`}>
          <label>Quantity (Kg)</label>
          <input
            type="number"
            name="quantity"
            value={form.quantity}
            min="0"
            onChange={handleChange}
          />
          {errors.quantity && <small className="error-text">{errors.quantity}</small>}
        </div>

        {/* Date + Submit */}
        <div className="date-submit">
          <div className={`field ${errors.date ? "error" : ""}`}>
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
            />
            {errors.date && <small className="error-text">{errors.date}</small>}
          </div>

          <button type="submit" disabled={hasErrors}>
            Submit
          </button>
        </div>

      </form>

      {/* Popup Alert */}
      <PopupAlert
        open={popup.open}
        message={popup.message}
        status={popup.status} // 200 for success, 400 for error
        loading={popup.loading} // true for loading spinner, false for message
        onClose={() => setPopup({ ...popup, open: false })} // Close popup on close
      />
    </div>
  );
}

export default StockOut;
