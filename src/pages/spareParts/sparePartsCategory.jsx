import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PopupAlert from "../../components/popupAlert/PopupAlert";
import "../bunker/bunker.css";
import "./sparePartsCategory.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ADMIN_ACCESS_TOKEN = localStorage.getItem("adminToken") || import.meta.env.VITE_ADMIN_ACCESS_TOKEN;

const Bunker = () => {
  const [bunkerName, setBunkerName] = useState("");
  const [bunkers, setBunkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({
    open: false,
    message: "",
    status: 200,
    loading: false,
  });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
  });

  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [editingCategory, setEditingCategory] = useState(null); // For editing category

  const navigate = useNavigate();

  // Fetch the list of bunkers with pagination
  const fetchBunkers = async () => {
    if (!ADMIN_ACCESS_TOKEN) {
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}admin/spare-parts-category`, {
        headers: {
          Authorization: `Bearer ${ADMIN_ACCESS_TOKEN}`,
        },
        params: {
          page: filters.page,
          limit: filters.limit,
        },
      });
      setBunkers(response.data.data); // Populate bunkers state
      setTotalPages(response.data.meta.totalPages); // Set total pages from response
      setTotalRecords(response.data.meta.totalRecords); // Set total records from response
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle bunker form submission
  const handleBunkerSubmit = async (e) => {
    e.preventDefault();
    if (!bunkerName) return;

    setPopup({
      open: true,
      message: "Adding spare parts category...",
      status: 200,
      loading: true,
    });

    try {
      await axios.post(
        `${API_BASE_URL}admin/spare-parts-category`,
        { name: bunkerName },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ADMIN_ACCESS_TOKEN}`,
          },
        }
      );
      setBunkerName(""); // Reset input field
      fetchBunkers(); // Refresh bunker list after adding a new one
      setPopup({
        open: true,
        message: "Spare parts category added successfully!",
        status: 200,
        loading: false,
      });
    } catch (error) {
      setPopup({
        open: true,
        message: error.response?.data?.message || "Error adding spare parts category.",
        status: 400,
        loading: false,
      });
    }
  };

  // Handle spare parts category deletion
  const handleDeleteSparePartsCategory = async (id) => {
    setPopup({
      open: true,
      message: "Deleting spare parts category...",
      status: 200,
      loading: true,
    });

    try {
      await axios.delete(`${API_BASE_URL}admin/spare-parts-category/${id}`, {
        headers: {
          Authorization: `Bearer ${ADMIN_ACCESS_TOKEN}`,
        },
      });
      fetchBunkers(); // Refresh bunker list after deletion
      setPopup({
        open: true,
        message: "Spare parts category deleted successfully.",
        status: 200,
        loading: false,
      });
    } catch (error) {
      setPopup({
        open: true,
        message: error.response?.data?.message || "Error deleting spare parts category.",
        status: 400,
        loading: false,
      });
    }
  };

  // Handle spare parts category update (name update)
  const handleUpdateSparePartsCategory = async () => {
    if (!editingCategory || !editingCategory.name) return;

    setPopup({
      open: true,
      message: "Updating spare parts category...",
      status: 200,
      loading: true,
    });

    try {
      await axios.put(
        `${API_BASE_URL}admin/spare-parts-category/${editingCategory._id}`,
        { name: editingCategory.name },
        {
          headers: {
            Authorization: `Bearer ${ADMIN_ACCESS_TOKEN}`,
          },
        }
      );
      setEditingCategory(null); // Close the modal after update
      fetchBunkers(); // Refresh bunker list after update
      setPopup({
        open: true,
        message: "Spare parts category updated successfully.",
        status: 200,
        loading: false,
      });
    } catch (error) {
      setPopup({
        open: true,
        message: error.response?.data?.message || "Error updating spare parts category.",
        status: 400,
        loading: false,
      });
    }
  };

  // Navigate to spare parts category details page
  const handleDetailsClick = (id) => {
    navigate(`/sparepartscategorydetails/${id}`);
  };

  // Handle page change (Next or Previous)
  const handlePageChange = (direction) => {
    setFilters((prevFilters) => {
      const newPage =
        direction === "next" ? prevFilters.page + 1 : prevFilters.page - 1;
      return { ...prevFilters, page: newPage };
    });
  };

  // Open Edit Modal
  const handleEditClick = (category) => {
    setEditingCategory({ ...category }); // Pre-fill the edit modal with category data
  };
  useEffect(() => {
    fetchBunkers();
  }, []);
  return (
    <div className="bunker-container">
      <h1>Spare Parts Categories</h1>

      {/* Form to add bunker */}
      <form onSubmit={handleBunkerSubmit} className="bunker-form">
        <input
          type="text"
          value={bunkerName}
          onChange={(e) => setBunkerName(e.target.value)}
          placeholder="Enter spare parts category name"
        />
        <button type="submit">Add Spare Parts Category</button>
      </form>

      {/* Loading state */}
      {loading ? (
        <p>Loading spare parts categories...</p>
      ) : (
        // Display the list of spare parts categories
        <ul className="bunker-list">
          {bunkers.length > 0 ? (
            bunkers.map((bunker) => (
              <li key={bunker._id}>
                <span>{bunker.name}</span>
                <div className="bunker-actions">
                  <button onClick={() => handleDetailsClick(bunker._id)}>
                    View Details
                  </button>
                  <button onClick={() => handleEditClick(bunker)}>
                    Update
                  </button>
                  <button onClick={() => handleDeleteSparePartsCategory(bunker._id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))
          ) : (
            <p>No spare parts categories available.</p>
          )}
        </ul>
      )}

      {/* Update Spare Parts Category Modal */}
      {editingCategory && (
        <div className="modal-overlay" onClick={() => setEditingCategory(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Spare Parts Category</h3>
            <input
              type="text"
              value={editingCategory.name}
              onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
              placeholder="Enter new category name"
            />
            <div className="modal-actions">
              <button onClick={() => setEditingCategory(null)}>Cancel</button>
              <button onClick={handleUpdateSparePartsCategory}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* PopupAlert to show success or error messages */}
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

export default Bunker;