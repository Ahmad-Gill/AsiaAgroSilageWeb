import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./bunkerDetails.css";

// Fetch API base URL and token from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ADMIN_ACCESS_TOKEN = import.meta.env.ADMIN_ACCESS_TOKEN;

const BunkerDetails = () => {
  const { id } = useParams();
  const [bunkerDetails, setBunkerDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchBunkerDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}admin/bunker/${id}`, {
        headers: {
          "Content-Type": "application/json",
          "x-admin-access-token": import.meta.env.VITE_ADMIN_ACCESS_TOKEN,
        },
      });
      setBunkerDetails(response.data);
    } catch (error) {
      console.error("Error fetching bunker details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBunkerDetails();
  }, [id]);

  if (loading) {
    return <p>Loading bunker details...</p>;
  }

  if (!bunkerDetails) {
    return <p>No details available for this bunker.</p>;
  }

  return (
    <div className="bunker-details-container">
      <h1>{bunkerDetails.name}</h1>
      <div className="bunker-info">
        <p>Status: {bunkerDetails.status}</p>
        <p>Created At: {new Date(bunkerDetails.createdAt).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default BunkerDetails;
