import React, { useState, useEffect } from "react";
import axios from "axios";
import PopupAlert from "../../components/popupAlert/PopupAlert"; // Import PopupAlert component
import "./expenses.css"; // Import your stylesheet

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ADMIN_ACCESS_TOKEN =
  localStorage.getItem("adminToken") || import.meta.env.VITE_ADMIN_ACCESS_TOKEN;

const Expenses = () => {
  const [categoryName, setCategoryName] = useState("");
  const [totalPages, settotalPages] = useState(0);
  const [totalRecords, settotalRecords] = useState(0);
  // Handle Expense Deletion
const handleDeleteExpense = async (expenseId) => {
  try {
    setLoading(true); // Set loading state to true while making the request

    const response = await axios.delete(
      `${API_BASE_URL}admin/expences/${expenseId}`, // API endpoint to delete the expense
      {
        headers: { Authorization: `Bearer ${ADMIN_ACCESS_TOKEN}` },
      }
    );

    // Check if the deletion was successful (status code 200-299)
    if (response.status >= 200 && response.status < 300) {
      setPopup({
        open: true,
        message: "Expense deleted successfully!", // Success message
        status: response.status,
        loading: false,
      });

      fetchExpenses(); // Refresh the expenses list after deletion
    } else {
      setPopup({
        open: true,
        message: "Failed to delete expense.", // Error message for failure
        status: response.status,
        loading: false,
      });
    }
  } catch (error) {
    // Handle any errors that occur during the delete operation
    console.error("Error deleting expense:", error);
    setPopup({
      open: true,
      message: error.response?.data?.message || "Error deleting expense.",
      status: error.response?.status || 400,
      loading: false,
    });
  } finally {
    setLoading(false); // Reset loading state after the API request
  }
};
  // State for category input
  const [categories, setCategories] = useState([]); // State for categories list
  const [selectedCategory, setSelectedCategory] = useState(""); // State for selected category ID
  const [expenseData, setExpenseData] = useState({
    description: "",
    amount: 0,
    amountPaid: 0,
    discount: 0,
  });

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({
    open: false,
    message: "",
    status: 200,
    loading: false,
  });

  const [filters, setFilters] = useState({
    keyword: "",
    date: "",
    limit: 10,
    paymentStatus: "all", // paid | unpaid | all
    page: 1, // Current page number
  });

  const [summary, setSummary] = useState(null);

  const [editPopupOpen, setEditPopupOpen] = useState(false); // Controls the new popup
  const [amountPaid, setAmountPaid] = useState(""); // For holding the updated "Amount Paid" value
  const [selectedExpense, setSelectedExpense] = useState(null); // To store the selected expense for editing

  // Handle Edit (Open New Popup)
  const handleEditExpense = (expense) => {
    setSelectedExpense(expense); // Set the selected expense to edit
    setAmountPaid(expense.amountPaid); // Set the current amount paid value in the input field
    setEditPopupOpen(true); // Open the new popup
  };

  const handleUpdateExpense = async () => {
    if (!amountPaid) return;

    try {
      const updatedExpense = {
        ...selectedExpense,
        amountPaid: parseFloat(amountPaid),
      };
      const res = await axios.put(
        `${API_BASE_URL}admin/expences/${selectedExpense._id}`,
        updatedExpense,
        { headers: { Authorization: `Bearer ${ADMIN_ACCESS_TOKEN}` } },
      );

      // Reset and fetch updated expenses
      setAmountPaid("");
      fetchExpenses(); // Refresh the expense list

      // Handling the response message from API
      setPopup({
        open: true,
        message: res.data.message || "Expense updated successfully!", // Default message
        status: res.status || 200,
        loading: false,
      });

      setEditPopupOpen(false); // Close the edit popup automatically after success
    } catch (error) {
      // Handle error response properly
      const errorMessage =
        error.response?.data?.message || "Error updating expense."; // Checking for error message
      setPopup({
        open: true,
        message: errorMessage,
        status: error.response?.status || 400,
        loading: false,
      });

      setEditPopupOpen(false); // Close the edit popup automatically after error
    }
  };

  // Fetch Categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}admin/epence-categories`,
        {
          headers: { Authorization: `Bearer ${ADMIN_ACCESS_TOKEN}` },
        },
      );
      setCategories(response.data.data); // Populate the categories list
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination Page Change Logic
  const handlePageChange = (direction) => {
    setFilters((prevFilters) => {
      const newPage =
        direction === "next" ? prevFilters.page + 1 : prevFilters.page - 1;
      return { ...prevFilters, page: newPage };
    });
  };

  // Fetch Expenses with Pagination
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params = {
        limit: filters.limit,
        page: filters.page, // Send current page and limit to backend
        ...(filters.keyword && { keyword: filters.keyword }),
        ...(filters.date && { date: filters.date }),
        ...(filters.paymentStatus !== "all" && {
          paymentStatus: filters.paymentStatus,
        }),
      };

      const response = await axios.get(`${API_BASE_URL}admin/expences`, {
        params,
        headers: { Authorization: `Bearer ${ADMIN_ACCESS_TOKEN}` },
      });
      settotalPages(response.data.meta.totalPages);
      settotalRecords(response.data.meta.totalRecords);
      // Set expenses and pagination metadata
      setExpenses(response.data.data || []);
      setFilters((prevFilters) => ({
        ...prevFilters,
        totalPages: response.data.meta.totalPages, // Set totalPages from API response
      }));
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenseSummary = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}admin/expences/summary`,
        {
          headers: { Authorization: `Bearer ${ADMIN_ACCESS_TOKEN}` },
        },
      );
      setSummary(response.data.data);
    } catch (error) {
      console.error("Error fetching expense summary:", error);
    }
  };

  // Handle Category Submit (For adding new categories)
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryName) return;
    try {
      await axios.post(
        `${API_BASE_URL}admin/epence-categories`,
        { name: categoryName },
        { headers: { Authorization: `Bearer ${ADMIN_ACCESS_TOKEN}` } },
      );
      setCategoryName(""); // Reset input field
      fetchCategories(); // Refresh categories list
      setPopup({
        open: true,
        message: "Category added successfully!",
        status: 200,
        loading: false,
      });
    } catch (error) {
      setPopup({
        open: true,
        message: "Error adding category.",
        status: 400,
        loading: false,
      });
    }
  };

  // Handle Delete Category
  const handleDeleteCategory = async (categoryId) => {
    try {
      setLoading(true);
      const response = await axios.delete(
        `${API_BASE_URL}admin/epence-categories/${categoryId}`, // Added a slash before categoryId
        {
          headers: {
            Authorization: `Bearer ${ADMIN_ACCESS_TOKEN}`,
          },
        },
      );

      if (response.status >= 200 && response.status < 300) {
        setPopup({
          open: true,
          message: "Category deleted successfully!",
          status: response.status,
          loading: false,
        });
        fetchCategories(); // Refresh categories list after deletion
      } else {
        setPopup({
          open: true,
          message: "Failed to delete category.",
          status: response.status,
          loading: false,
        });
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      setPopup({
        open: true,
        message: error.response?.data?.message || "Error deleting category.",
        status: error.response?.status || 400,
        loading: false,
      });
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  // Handle Expense Submit
  const handleExpenseSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCategory || !expenseData.description || !expenseData.amount) {
      return;
    }

    const expensePayload = {
      expence: selectedCategory, // Selected category ID
      description: expenseData.description,
      amount: expenseData.amount,
      amountPaid: expenseData.amountPaid,
      discount: expenseData.discount,
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}admin/expences`,
        expensePayload,
        { headers: { Authorization: `Bearer ${ADMIN_ACCESS_TOKEN}` } },
      );

      // Reset form fields after successful submission
      setExpenseData({
        description: "",
        amount: 0,
        amountPaid: 0,
        discount: 0,
      });
      setSelectedCategory(""); // Reset selected category
      fetchExpenses(); // Refresh expense list

      setPopup({
        open: true,
        message: "Expense added successfully!",
        status: 200,
        loading: false,
      });
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "Error adding expense.";

      setPopup({
        open: true,
        message: errorMessage,
        status: 400,
        loading: false,
      });
    }
  };

  // Fetch categories only once when the component mounts
  useEffect(() => {
    fetchCategories();
  }, []); // Empty dependency array ensures fetchCategories is only called once

  // Fetch expense summary only once when the component mounts
  useEffect(() => {
    fetchExpenseSummary();
  }, []); // Empty dependency array ensures fetchExpenseSummary is only called once

  // Fetch expenses when filters change (page, date, keyword, etc.)
  useEffect(() => {
    fetchExpenses(); // Fetch when filters change, including page number
  }, [filters.page, filters.keyword, filters.date, filters.paymentStatus]); // Track specific filter changes
  return (
    <div className="bunker-details-container">
      <h1>Category Management</h1>

      {/* Form to add Category */}
      <form onSubmit={handleCategorySubmit} className="category-form">
        <h3>Enter New Category</h3>
        <input
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="Enter category name"
        />
        <button type="submit">Add Category</button>
      </form>

      {/* Category Table */}
      <div className="table-wrapper">
        <h2>Categories</h2>
        <table className="modern-table">
          <thead>
            <tr>
              <th>Category Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category._id}>
                <td>{category.name}</td>
                <td>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteCategory(category._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h1>Expense Management</h1>

      {/* Form to add Expense */}
      <form onSubmit={handleExpenseSubmit} className="expense-form">
        <h3>Enter New Expense</h3>

        <label htmlFor="category">Select Expense Category</label>
        <select
          id="category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          required
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>

        <label htmlFor="description">Expense Description</label>
        <input
          id="description"
          type="text"
          value={expenseData.description}
          onChange={(e) =>
            setExpenseData({ ...expenseData, description: e.target.value })
          }
          placeholder="Enter expense description"
          required
        />

        <label htmlFor="amount">Amount</label>
        <input
          id="amount"
          type="number"
          value={expenseData.amount}
          onChange={(e) =>
            setExpenseData({ ...expenseData, amount: e.target.value })
          }
          placeholder="Enter amount"
          required
        />

        <label htmlFor="discount">Discount</label>
        <input
          id="discount"
          type="number"
          value={expenseData.discount}
          onChange={(e) =>
            setExpenseData({ ...expenseData, discount: e.target.value })
          }
          placeholder="Enter discount (optional)"
        />

        <label htmlFor="amountPaid">Amount Paid</label>
        <input
          id="amountPaid"
          type="number"
          value={expenseData.amountPaid}
          onChange={(e) =>
            setExpenseData({ ...expenseData, amountPaid: e.target.value })
          }
          placeholder="Amount Paid"
        />

        <button type="submit">Add Expense</button>
      </form>

      {summary && (
        <>
          <div className="table-wrapper">
            {loading && (
              <div className="table-loader">
                <div className="loader-animation">
                  <div className="tractor"></div>
                  <div className="soil"></div>
                  <div className="plant"></div>
                  <div className="sun"></div>
                </div>
              </div>
            )}
            <h2>Expense Summary</h2>
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Total Spent</th>
                  <th>Total Discount</th>
                  <th>Total Paid</th>
                  <th>Total Remaining</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{summary.totalAmountSpent}</td>
                  <td>{summary.totalDiscount}</td>
                  <td>{summary.totalAmountPaid}</td>
                  <td>{summary.totalRemainingAmount}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="filters">
        <input
          type="text"
          placeholder="Search Category"
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

        <button onClick={fetchExpenses}>Apply</button>
      </div>

      {/* Expense Table */}
      <div className="table-wrapper">
        {loading && (
          <div className="table-loader">
            <div className="loader-animation">
              <div className="tractor"></div>
              <div className="soil"></div>
              <div className="plant"></div>
              <div className="sun"></div>
            </div>
          </div>
        )}
        <h2>Expenses</h2>
        <table className="modern-table">
          <thead>
            <tr>
              <th>Created By</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Discount</th>
              <th>Amount Paid</th>
              <th>Remaining Amount</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense._id}>
                <td>{expense.userData?.username || "N/A"}</td>
                <td>{expense.categoryData?.name || "N/A"}</td>
                <td>{expense.description}</td>
                <td>{expense.amount}</td>
                <td>{expense.discount}</td>

                <td>{expense.amountPaid}</td>
                <td>{expense.totalRemainingAmount}</td>

                <td>
                  {new Date(expense.date || expense.createdAt).toLocaleString()}
                </td>
                <td>
                  <button
                    className="btn-edit"
                    onClick={() => handleEditExpense(expense)}
                    style={{ marginRight: "8px" }}
                  >
                    Update
                  </button>

                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteExpense(expense._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination-buttons">
        <button
          disabled={filters.page <= 1}
          onClick={() => handlePageChange("previous")}
          className="pagination-btn previous"
        >
          Previous
        </button>

        <div className="pagination-info">
          <span className="page-info">
            Current Page: <strong>{filters.page}</strong> | Total Pages:{" "}
            <strong>{totalPages}</strong> | Total Records:{" "}
            <strong>{totalRecords}</strong>
          </span>
        </div>

        <button
          disabled={filters.page >= filters.totalPages}
          onClick={() => handlePageChange("next")}
          className="pagination-btn next"
        >
          Next
        </button>
      </div>
      {/* PopupAlert to show success or error messages */}
      <PopupAlert
        open={popup.open}
        message={popup.message}
        status={popup.status}
        loading={popup.loading}
        onClose={() => setPopup({ ...popup, open: false })}
      />
      {/* Edit Expense Popup */}
      {editPopupOpen && selectedExpense && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Edit Expense</h3>
            <label htmlFor="amountPaid">Amount Paid</label>
            <input
              type="number"
              id="amountPaid"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)} // Handle input change
              placeholder="Enter Amount Paid"
            />
            <div className="popup-actions">
              <button onClick={handleUpdateExpense}>Update</button>
              <button onClick={() => setEditPopupOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
