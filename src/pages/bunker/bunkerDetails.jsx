import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./bunkerDetails.css";
import PopupAlert from "../../components/popupAlert/PopupAlert";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ADMIN_ACCESS_TOKEN =
  localStorage.getItem("adminToken") || import.meta.env.VITE_ADMIN_ACCESS_TOKEN;




const BunkerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [popup, setPopup] = useState({
    open: false,
    message: "",
    status: 200,
    loading: false,
  });

  /* ================= STATE ================= */
  const [expenses, setExpenses] = useState([]);
  const [buys, setBuys] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingBuy, setEditingBuy] = useState(null);
  const [editingSale, setEditingSale] = useState(null);
  const [sellCalc, setSellCalc] = useState({
    qty: 0,
    price: 0,
    discount: 0,
  });

  const sellTotal = Math.max(
    Number(
      (sellCalc.qty * sellCalc.price - sellCalc.discount).toFixed(2)
    ),
    0
  );
  const [buyCalc, setBuyCalc] = useState({
    qty: 0,
    price: 0,
    discount: 0,
  });

  const buyTotal = Math.max(
    Number(
      (buyCalc.qty * buyCalc.price - buyCalc.discount).toFixed(2)
    ),
    0
  );
  const updateBuyPaid = async () => {
    if (!editingBuy) return;
    setPopup({ open: true, message: "Updating...", status: 200, loading: true });

    try {
      const res = await axios.put(
        `${API_BASE_URL}admin/bunker-add-silage/${editingBuy._id}`,
        { amountPaid: editPaid },
        { headers }
      );
      setPopup({ open: true, message: res.data.message, status: res.status, loading: false });
      setEditingBuy(null);
      fetchAll();
    } catch (err) {
      setPopup({
      open: true,
      message: err.response?.data?.message || "Delete failed",
      status: err.response?.status || 500,
      loading: false,
    });
      console.error("Update buy failed", err);
    }
  };
  const deleteBuy = async (id) => {
    if (!window.confirm("Delete this purchase?")) return;
    setPopup({ open: true, message: "Updating...", status: 200, loading: true });

    try {
     const res= await axios.delete(
        `${API_BASE_URL}admin/bunker-add-silage/${id}`,
        { headers }
      );
      setPopup({ open: true, message: res.data.message, status: res.status, loading: false });
      fetchAll();
    } catch (err) {
      setPopup({
      open: true,
      message: err.response?.data?.message || "Delete failed",
      status: err.response?.status || 500,
      loading: false,
    });
      console.error("Delete buy failed", err);
    }
  };
  const updateSalePaid = async () => {
    if (!editingSale) return;
    setPopup({ open: true, message: "Updating...", status: 200, loading: true });

    try {
      const res = await axios.put(
        `${API_BASE_URL}admin/bunker-sale/${editingSale._id}`,
        { amountPaid: editPaid },
        { headers }
      );

      setPopup({ open: true, message: res.data.message, status: res.status, loading: false });

      setEditingSale(null);
      fetchAll();
    } catch (err) {
      setPopup({
      open: true,
      message: err.response?.data?.message || "Delete failed",
      status: err.response?.status || 500,
      loading: false,
    });
      console.error("Update sale failed", err);
    }
  };

  const deleteSale = async (id) => {
    if (!window.confirm("Delete this sale?")) return;
    setPopup({ open: true, message: "Updating...", status: 200, loading: true });

    try {
      const res = await axios.delete(
        `${API_BASE_URL}admin/bunker-sale/${id}`,
        { headers }
      );
      setPopup({ open: true, message: res.data.message, status: res.status, loading: false });
      fetchAll();
    } catch (err) {
      setPopup({
      open: true,
      message: err.response?.data?.message || "Delete failed",
      status: err.response?.status || 500,
      loading: false,
    });
      console.error("Delete sale failed", err);
    }
  };


  const [editingExpense, setEditingExpense] = useState(null);
  const [editPaid, setEditPaid] = useState("");
  const updateExpensePaid = async () => {
    try {
      setPopup({ open: true, message: "Updating...", status: 200, loading: true });

     const res = await axios.put(
        `${API_BASE_URL}admin/bunker-expense/${editingExpense._id}`,
        { amountPaid: editPaid },
        { headers }
      );

      setPopup({ open: true, message: res.data.message, status: res.status, loading: false });
      setEditingExpense(null);
      fetchAll();
    } catch (err) {
      setPopup({
        open: true,
        message: err.response?.data?.message || "Update failed",
        status: 500,
        loading: false,
      });
    }
  };
  const deleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;

    try {
      setPopup({ open: true, message: "Deleting...", status: 200, loading: true });

     const res = await axios.delete(
        `${API_BASE_URL}admin/bunker-expense/${id}`,
        { headers }
      );

      setPopup({ open: true, message: res.data.message, status: res.status, loading: false });
      fetchAll();
    } catch (err) {
      setPopup({
        open: true,
        message: err.response?.data?.message || "Delete failed",
        status: 500,
        loading: false,
      });
    }
  };

  // filters
  const [keyword, setKeyword] = useState("");
  const [date, setDate] = useState("");
  const [limit, setLimit] = useState(10);
  const [paymentStatus, setPaymentStatus] = useState("");

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${ADMIN_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    }),
    []
  );

  /* ================= HELPERS ================= */
  const remaining = (total, paid) =>
    Math.max(Number(total) - Number(paid), 0);

  const gross = (qty, price) => Number(qty) * Number(price);



  /* ================= FETCH ================= */
  const fetchAll = async () => {
    if (!ADMIN_ACCESS_TOKEN) return navigate("/login");

    setLoading(true);
    try {
      const params = {
        bunker: id,
        limit,
        ...(keyword && { keyword }),
        ...(date && { date }),
        ...(paymentStatus && { paymentStatus }),
      };

      const [e, b, s] = await Promise.all([
        axios.get(`${API_BASE_URL}admin/bunker-expense`, { headers, params }),
        axios.get(`${API_BASE_URL}admin/bunker-add-silage`, { headers, params }),
        axios.get(`${API_BASE_URL}admin/bunker-sale`, { headers, params }),
      ]);



      setExpenses(e.data.data || []);
      setBuys(b.data.data || []);
      setSales(s.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [id]);

  /* ================= SUBMIT ================= */
  const submit = async (e, url, payload) => {
    e.preventDefault();

    setPopup({
      open: true,
      message: "Processing...",
      status: 200,
      loading: true,
    });

    try {
      await axios.post(url, payload, { headers });

      setPopup({
        open: true,
        message: "Saved successfully",
        status: 200,
        loading: false,
      });

      e.target.reset();
      fetchAll();
    } catch (err) {
      setPopup({
        open: true,
        message: err.response?.data?.message || "Something went wrong",
        status: err.response?.status || 500,
        loading: false,
      });
    }
  };

  /* ================= UI ================= */
  return (
    <div className="bunker-details-container">
      <PopupAlert
        open={popup.open}
        message={popup.message}
        status={popup.status}
        loading={popup.loading}
        onClose={() => setPopup({ ...popup, open: false })}
      />


      {/* ========== FILTER BAR ========== */}
      <div className="filter-bar">
        <input placeholder="Search keyword" value={keyword} onChange={e => setKeyword(e.target.value)} />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <select value={limit} onChange={e => setLimit(e.target.value)}>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)}>
          <option value="">All</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>
        <button onClick={fetchAll}>Apply</button>
      </div>

      {/* ========== ADD FORMS ========== */}
      <div className="top-forms">

        {/* ADD EXPENSE */}
        <FormCard title="Add Expense" onSubmit={(e) =>
          submit(e, `${API_BASE_URL}admin/bunker-expense`, {
            bunker: id,
            name: e.target.name.value,
            amount: e.target.amount.value,
            amountPaid: e.target.amountPaid.value,
          })
        }>
          <input name="name" placeholder="Expense name" loading={popup.loading} required />
          <input name="amount" type="number" placeholder="Amount" required />
          <input name="amountPaid" type="number" placeholder="Paid" required />
        </FormCard>

        {/* BUY SILAGE */}
        <FormCard
          title="Buy Silage"
          loading={popup.loading}
          onSubmit={(e) => {
            e.preventDefault();

            submit(e, `${API_BASE_URL}admin/bunker-add-silage`, {
              bunker: id,
              quantity: buyCalc.qty,
              price: buyCalc.price,
              discount: buyCalc.discount,
              totalAmount: buyTotal, // ✅ AUTO TOTAL
              amountPaid: parseFloat(e.target.amountPaid.value),
            });

            // reset
            setBuyCalc({ qty: 0, price: 0, discount: 0 });
            e.target.reset();
          }}
        >
          <input
            name="quantity"
            type="number"
            step="0.01"
            inputMode="decimal"
            placeholder="Quantity"
            required
            onChange={(e) =>
              setBuyCalc({
                ...buyCalc,
                qty: parseFloat(e.target.value) || 0,
              })
            }
          />

          <input
            name="price"
            type="number"
            step="0.01"
            inputMode="decimal"
            placeholder="Price"
            required
            onChange={(e) =>
              setBuyCalc({
                ...buyCalc,
                price: parseFloat(e.target.value) || 0,
              })
            }
          />

          <input
            name="discount"
            type="number"
            step="0.01"
            inputMode="decimal"
            placeholder="Discount"
            onChange={(e) =>
              setBuyCalc({
                ...buyCalc,
                discount: parseFloat(e.target.value) || 0,
              })
            }
          />

          {/* ✅ AUTO TOTAL (NOT EDITABLE) */}
          <input
            value={buyTotal.toFixed(2)}
            disabled
            className="auto-total"
          />

          <input
            name="amountPaid"
            type="number"
            step="0.01"
            inputMode="decimal"
            placeholder="Paid"
            max={buyTotal}
            required
          />
        </FormCard>


        {/* SELL SILAGE */}
        <FormCard
          title="Sell Silage"
          loading={popup.loading}
          onSubmit={(e) => {
            e.preventDefault();

            submit(e, `${API_BASE_URL}admin/bunker-sale`, {
              bunker: id,
              customerName: e.target.customerName.value,
              kgsSold: sellCalc.qty,
              price: sellCalc.price,
              discount: sellCalc.discount,
              totalAmount: sellTotal, // ✅ already rounded
              amountPaid: parseFloat(e.target.amountPaid.value),
            });

            // reset
            setSellCalc({ qty: 0, price: 0, discount: 0 });
            e.target.reset();
          }}
        >
          <input name="customerName" placeholder="Customer" required />

          <input
            name="kgsSold"
            type="number"
            step="0.01"
            inputMode="decimal"
            placeholder="KG Sold"
            required
            onChange={(e) =>
              setSellCalc({
                ...sellCalc,
                qty: parseFloat(e.target.value) || 0,
              })
            }
          />

          <input
            name="price"
            type="number"
            step="0.01"
            inputMode="decimal"
            placeholder="Price"
            required
            onChange={(e) =>
              setSellCalc({
                ...sellCalc,
                price: parseFloat(e.target.value) || 0,
              })
            }
          />

          <input
            name="discount"
            type="number"
            step="0.01"
            inputMode="decimal"
            placeholder="Discount"
            onChange={(e) =>
              setSellCalc({
                ...sellCalc,
                discount: parseFloat(e.target.value) || 0,
              })
            }
          />

          {/* ✅ AUTO TOTAL (2 DECIMALS) */}
          <input
            value={sellTotal.toFixed(2)}
            disabled
            className="auto-total"
          />

          <input
            name="amountPaid"
            type="number"
            step="0.01"
            inputMode="decimal"
            placeholder="Paid"
            max={sellTotal}
            required
          />
        </FormCard>


      </div>

      <h2>Expenses</h2>

      <div className="table-wrapper">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Amount</th>
              <th>Paid</th>
              <th>Remaining</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="no-data">No records found</td>
              </tr>
            ) : (
              expenses.map(e => {
                const amount = Number(e.amount) || 0;
                const paid = Number(e.amountPaid) || 0;
                const remainingAmount = Math.max(amount - paid, 0);

                return (
                  <tr
                    key={e._id}

                  >
                    <td className={remainingAmount > 0 ? "pending-cell" : ""}>
                      {e.name}
                    </td>


                    <td>{amount.toFixed(2)}</td>
                    <td>{paid.toFixed(2)}</td>
                    <td>{remainingAmount.toFixed(2)}</td>
                    <td>{new Date(e.date || e.createdAt).toLocaleString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-edit" onClick={() => {
                          setEditingExpense(e);
                          setEditPaid(paid);
                        }}>
                          Edit
                        </button>
                        <button className="btn-delete" onClick={() => deleteExpense(e._id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>

                );
              })
            )}
          </tbody>
        </table>
      </div>



      <h2>Silage Purchases</h2>

      <div className="table-wrapper">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Qty</th>
              <th>Gross</th>
              <th>Discount</th>
              <th>Net</th>
              <th>Paid</th>
              <th>Remaining</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {buys.length === 0 ? (
              <tr>
                <td colSpan={8} className="no-data">No records found</td>
              </tr>
            ) : (
              buys.map(b => {
                const grossAmount = b.quantity * b.price;
                const paid = Number(b.amountPaid) || 0;
                const remainingAmount = Math.max(b.totalAmount - paid, 0);

                return (
                  <tr
                    key={b._id}

                  >
                    <td className={remainingAmount > 0 ? "pending-cell" : ""}>
                      {b.quantity}
                    </td>

                    <td>{grossAmount.toFixed(2)}</td>
                    <td>{(b.discount || 0).toFixed(2)}</td>
                    <td>{b.totalAmount.toFixed(2)}</td>
                    <td>{paid.toFixed(2)}</td>
                    <td>{remainingAmount.toFixed(2)}</td>
                    <td>{new Date(b.createdAt).toLocaleString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-edit"
                          onClick={() => {
                            setEditingBuy(b);
                            setEditPaid(paid);
                          }}
                        >
                          Edit
                        </button>
                        <button className="btn-delete" onClick={() => deleteBuy(b._id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <h2>Silage Sales</h2>

      <div className="table-wrapper">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>KG</th>
              <th>Price</th>
              <th>Net</th>
              <th>Paid</th>
              <th>Remaining</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {sales.length === 0 ? (
              <tr>
                <td colSpan={8} className="no-data">No records found</td>
              </tr>
            ) : (
              sales.map(s => {
                const paid = Number(s.amountPaid) || 0;
                const remainingAmount = Math.max(s.totalAmount - paid, 0);

                return (
                  <tr
                    key={s._id}

                  >
                    <td className={remainingAmount > 0 ? "pending-cell" : ""}>{s.customerName}</td>
                    <td>{s.kgsSold}</td>
                    <td>{s.price.toFixed(2)}</td>
                    <td>{s.totalAmount.toFixed(2)}</td>
                    <td>{paid.toFixed(2)}</td>
                    <td>{remainingAmount.toFixed(2)}</td>
                    <td>{new Date(s.createdAt).toLocaleString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-edit"
                          onClick={() => {
                            setEditingSale(s);
                            setEditPaid(paid);
                          }}
                        >
                          Edit
                        </button>
                        <button className="btn-delete" onClick={() => deleteSale(s._id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>


      {loading && <p className="no-data">Loading...</p>}
      {(editingExpense || editingBuy || editingSale) && (
        <div className="modal-overlay" onClick={() => {
          setEditingExpense(null);
          setEditingBuy(null);
          setEditingSale(null);
        }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Edit Paid Amount</h3>

            <label className="modal-label">Paid Amount</label>
            <input
              type="number"
              step="0.01"
              value={editPaid}
              onChange={(e) => setEditPaid(e.target.value)}
              className="modal-input"
            />

            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => {
                  setEditingExpense(null);
                  setEditingBuy(null);
                  setEditingSale(null);
                }}
              >
                Cancel
              </button>

              <button
                className="btn-save"
                onClick={() => {
                  if (editingExpense) updateExpensePaid();
                  if (editingBuy) updateBuyPaid();
                  if (editingSale) updateSalePaid();
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}



    </div>
  );
};

/* ================= COMPONENTS ================= */

const FormCard = ({ title, children, onSubmit, loading }) => (
  <section className="form-card">
    <h2>{title}</h2>
    <form className="form-grid" onSubmit={onSubmit}>
      {children}
      <button type="submit" disabled={loading}>
        {loading ? "Please wait..." : "Submit"}
      </button>
    </form>
  </section>
);





export default BunkerDetails;
