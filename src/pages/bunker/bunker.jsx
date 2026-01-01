import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 
import PopupAlert from "../../components/popupAlert/PopupAlert"; // Import the PopupAlert component
import "./Bunker.css";

// Get API base URL and access token from environment or localStorage
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
  const navigate = useNavigate(); // useNavigate for programmatic navigation

  // Fetch the list of bunkers
  const fetchBunkers = async () => {
    if (!ADMIN_ACCESS_TOKEN) {
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}admin/bunker`, {
        headers: {
          Authorization: `Bearer ${ADMIN_ACCESS_TOKEN}`,
        },
      });
      setBunkers(response.data.data); // Populate bunkers state
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBunkers(); // Fetch bunkers when the component mounts
  }, []);

  // Handle bunker form submission
  const handleBunkerSubmit = async (e) => {
    e.preventDefault();
    if (!bunkerName) return;

    setPopup({
      open: true,
      message: "Adding bunker...",
      status: 200,
      loading: true,
    });

    try {
      await axios.post(
        `${API_BASE_URL}admin/bunker`,
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
        message: "Bunker added successfully!",
        status: 200,
        loading: false,
      });
    } catch (error) {
      setPopup({
        open: true,
        message: error.response?.data?.message || "Error adding bunker.",
        status: 400,
        loading: false,
      });
    }
  };

  // Handle bunker deletion
  const handleDeleteBunker = async (id) => {
    setPopup({
      open: true,
      message: "Deleting bunker...",
      status: 200,
      loading: true,
    });

    try {
      await axios.delete(`${API_BASE_URL}admin/bunker/${id}`, {
        headers: {
          Authorization: `Bearer ${ADMIN_ACCESS_TOKEN}`,
        },
      });
      fetchBunkers(); // Refresh bunker list after deletion
      setPopup({
        open: true,
        message: "Bunker deleted successfully.",
        status: 200,
        loading: false,
      });
    } catch (error) {
      setPopup({
        open: true,
        message: error.response?.data?.message || "Error deleting bunker.",
        status: 400,
        loading: false,
      });
    }
  };

  // Navigate to bunker details page
  const handleDetailsClick = (id) => {
    navigate(`/bunkerdetails/${id}`);
  };

  return (
    <div className="bunker-container">
      <h1>Bunkers</h1>

      {/* Form to add bunker */}
      <form onSubmit={handleBunkerSubmit} className="bunker-form">
        <input
          type="text"
          value={bunkerName}
          onChange={(e) => setBunkerName(e.target.value)}
          placeholder="Enter bunker name"
        />
        <button type="submit">Add Bunker</button>
      </form>

      {/* Loading state */}
      {loading ? (
        <p>Loading bunkers...</p>
      ) : (
        // Display the list of bunkers
        <ul className="bunker-list">
          {bunkers.length > 0 ? (
            bunkers.map((bunker) => (
              <li key={bunker._id}>
                <span>{bunker.name}</span>
                <div className="bunker-actions">
                  <button onClick={() => handleDetailsClick(bunker._id)}>
                    View Details
                  </button>
                  <button onClick={() => handleDeleteBunker(bunker._id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))
          ) : (
            <p>No bunkers available.</p>
          )}
        </ul>
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
