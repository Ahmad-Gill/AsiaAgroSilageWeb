import React, { useEffect, useState } from "react";
import axios from "axios";
import "./spareParts.css";
import PopupAlert from "../../components/popupAlert/PopupAlert";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const TOKEN = localStorage.getItem("adminToken");

const SpareParts = () => {
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editQuantity, setEditQuantity] = useState("");
    const updateQuantity = async () => {
        try {
            setPopup({ open: true, loading: true, message: "Updating..." });

           const res= await axios.put(
                `${API_BASE_URL}admin/spare-parts/${editPart._id}`,
                { quantity: Number(editQuantity) },
                { headers }
            );










            
            setPopup({
                open: true,
                message:res.data.message|| "Quantity updated successfully",
                status: 200,
                loading: false,
            });

            setEditPart(null);
            fetchParts();
        } catch (err) {
            setPopup({
                open: true,
                message: "Update failed",
                status: 400,
                loading: false,
            });
        }
    };

    const deleteSparePart = async (id) => {
        if (!window.confirm("Are you sure you want to delete this spare part?")) {
            return;
        }

        try {
            setPopup({
                open: true,
                message: "Deleting...",
                status: 200,
                loading: true,
            });

            await axios.delete(
                `${API_BASE_URL}admin/spare-parts/${id}`,
                { headers }
            );

            setPopup({
                open: true,
                message: "Spare part deleted successfully",
                status: 200,
                loading: false,
            });

            fetchParts(); // 🔄 refresh list
        } catch (err) {
            setPopup({
                open: true,
                message:
                    err.response?.data?.message || "Delete failed. Please try again.",
                status: err.response?.status || 500,
                loading: false,
            });
        }
    };


    const [filters, setFilters] = useState({
        keyword: "",
        limit: 10,
    });

    const [form, setForm] = useState({
        name: "",
        quantity: "",
    });

    const [editPart, setEditPart] = useState(null);

    const [popup, setPopup] = useState({
        open: false,
        message: "",
        status: 200,
        loading: false,
    });

    const headers = {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
    };

    /* ================= FETCH ================= */
    const fetchParts = async () => {
        try {
            setLoading(true);

            const res = await axios.get(
                `${API_BASE_URL}admin/spare-parts`,
                {
                    params: {
                        ...(filters.keyword && { keyword: filters.keyword }),
                        ...(filters.limit && { limit: filters.limit }),
                    },
                    headers,
                }
            );

            setParts(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchParts();
    }, []);

    /* ================= CREATE ================= */
    const handleCreate = async (e) => {
        e.preventDefault();

        try {
            setPopup({ open: true, loading: true, message: "Saving..." });

            await axios.post(
                `${API_BASE_URL}admin/spare-parts`,
                {
                    name: form.name,
                    quantity: Number(form.quantity),
                },
                { headers }
            );

            setPopup({
                open: true,
                message: "Spare part created successfully",
                status: 200,
                loading: false,
            });

            setForm({ name: "", quantity: "" });
            fetchParts();
        } catch (err) {
            setPopup({
                open: true,
                message: err.response?.data?.message || "Create failed",
                status: 400,
                loading: false,
            });
        }
    };

    /* ================= UPDATE ================= */
    const handleUpdate = async () => {
        try {
            setPopup({ open: true, loading: true, message: "Updating..." });

            await axios.put(
                `${API_BASE_URL}admin/spare-parts/${editPart._id}`,
                { quantity: Number(editPart.quantity) },
                { headers }
            );

            setPopup({
                open: true,
                message: "Spare part updated successfully",
                status: 200,
                loading: false,
            });

            setEditPart(null);
            fetchParts();
        } catch (err) {
            setPopup({
                open: true,
                message: "Update failed",
                status: 400,
                loading: false,
            });
        }
    };

    /* ================= DELETE ================= */
    const handleDelete = async (id) => {
        if (!window.confirm("Delete this spare part?")) return;

        try {
            setPopup({ open: true, loading: true, message: "Deleting..." });

            await axios.delete(
                `${API_BASE_URL}admin/spare-parts/${id}`,
                { headers }
            );

            setPopup({
                open: true,
                message: "Spare part deleted successfully",
                status: 200,
                loading: false,
            });

            fetchParts();
        } catch (err) {
            setPopup({
                open: true,
                message: "Delete failed",
                status: 400,
                loading: false,
            });
        }
    };

    return (
        <div className="spare-parts-page">
            <h1>Spare Parts</h1>

            {/* ===== Filters ===== */}
            <div className="filters">
                <input
                    placeholder="Search keyword"
                    value={filters.keyword}
                    onChange={(e) =>
                        setFilters({ ...filters, keyword: e.target.value })
                    }
                />

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

                <button onClick={fetchParts}>Apply</button>
            </div>

            {/* ===== Create Form ===== */}
            <form className="create-form" onSubmit={handleCreate}>
                <input
                    placeholder="Spare part name"
                    value={form.name}
                    required
                    onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                    }
                />

                <input
                    type="number"
                    placeholder="Quantity"
                    value={form.quantity}
                    required
                    onChange={(e) =>
                        setForm({ ...form, quantity: e.target.value })
                    }
                />

                <button type="submit">Add</button>
            </form>

            {/* ===== Table ===== */}
            <div className="table-wrapper">
                <table className="spare-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Quantity</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {parts.map((p) => {
                            const dateObj = new Date(p.date);

                            return (
                                <tr key={p._id}>
                                    <td>{p.name}</td>
                                    <td>{p.quantity}</td>

                                    {/* DATE */}
                                    <td>{dateObj.toLocaleDateString()}</td>

                                    {/* TIME */}
                                    <td>{dateObj.toLocaleTimeString()}</td>

                                    <td className="actions">
                                        <button
                                            className="btn-edit"
                                            onClick={() => {
                                                setEditPart(p);
                                                setEditQuantity(p.quantity);
                                            }}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="btn-delete"
                                            onClick={() => deleteSparePart(p._id)}
                                        >
                                            Delete
                                        </button>

                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>

                </table>
            </div>

            {/* ===== Edit Modal ===== */}
            {editPart && (
                <div className="modal-overlay" onClick={() => setEditPart(null)}>
                    <div
                        className="modal-card"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3>Edit Quantity</h3>

                        <input
                            type="number"
                            value={editPart.quantity}
                            onChange={(e) =>
                                setEditPart({
                                    ...editPart,
                                    quantity: e.target.value,
                                })
                            }
                        />

                        <div className="modal-actions">
                            <button onClick={() => setEditPart(null)}>Cancel</button>
                            <button onClick={handleUpdate}>Save</button>
                        </div>
                    </div>
                </div>
            )}

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

export default SpareParts;
