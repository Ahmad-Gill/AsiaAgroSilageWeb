import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line, Bar } from "react-chartjs-2"; // Importing required chart types
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"; // Required imports for ChartJS
import "./home.css";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ADMIN_ACCESS_TOKEN = localStorage.getItem("adminToken") || import.meta.env.VITE_ADMIN_ACCESS_TOKEN;

const Home = () => {
  const [stockSummary, setStockSummary] = useState([]);
  const [salesSummary, setSalesSummary] = useState({});
  const [buyingSummary, setBuyingSummary] = useState([]);
  const [expenseSummary, setExpenseSummary] = useState({});

  useEffect(() => {
    fetchStockSummary();
    fetchSalesSummary();
    fetchBuyingSummary();
    fetchExpenseSummary();
  }, []);

  const fetchStockSummary = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}admin/available-stock`, {
        headers: { Authorization: `Bearer ${ADMIN_ACCESS_TOKEN}` },
      });
      setStockSummary(response.data.data);
    } catch (error) {
      console.error("Error fetching stock summary:", error);
    }
  };

  const fetchSalesSummary = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}admin/sale/summary`, {
        headers: { Authorization: `Bearer ${ADMIN_ACCESS_TOKEN}` },
      });
      setSalesSummary(response.data.data);
    } catch (error) {
      console.error("Error fetching sales summary:", error);
    }
  };

  const fetchBuyingSummary = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}admin/stock-summary`, {
        headers: { Authorization: `Bearer ${ADMIN_ACCESS_TOKEN}` },
      });
      setBuyingSummary(response.data.data);
    } catch (error) {
      console.error("Error fetching buying summary:", error);
    }
  };

  const fetchExpenseSummary = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}admin/expences/summary`, {
        headers: { Authorization: `Bearer ${ADMIN_ACCESS_TOKEN}` },
      });
      setExpenseSummary(response.data.data);
    } catch (error) {
      console.error("Error fetching expense summary:", error);
    }
  };

  // Chart Data Preparation for Stock Summary (Bar Chart)
  const stockChartData = {
    labels: stockSummary.map(item => item.category),
    datasets: [
      {
        label: 'Available Stock',
        data: stockSummary.map(item => item.totalStockAvailable),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Chart Data Preparation for Sales Summary (Line Chart)
  const salesChartData = {
    labels: ['Total Kgs Sold', 'Total Discount', 'Total Received', 'Remaining Amount'],
    datasets: [
      {
        label: 'Sales Data',
        data: [
          salesSummary.totalKgsSold,
          salesSummary.totalDiscountGiven,
          salesSummary.totalAmountReceived,
          salesSummary.totalAmountRemaining,
        ],
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1,
      },
    ],
  };

  // Chart Data Preparation for Buying Summary (Bar Chart)
  const buyingChartData = {
    labels: buyingSummary.map(item => item.category),
    datasets: [
      {
        label: 'Total Kgs Bought',
        data: buyingSummary.map(item => item.totalKgsBought),
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Chart Data Preparation for Expense Summary (Bar Chart)
  const expenseChartData = {
    labels: ['Total Spent', 'Total Discount', 'Total Remaining'],
    datasets: [
      {
        label: 'Expense Breakdown',
        data: [
          expenseSummary.totalAmountSpent,
          expenseSummary.totalDiscount,
          expenseSummary.totalRemainingAmount,
        ],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        borderColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="home-page">
<div class="heading-container">
  <h1>ASIA AGRO SILAGE</h1>
</div>



      <div className="content-grid">
        {/* Stock Summary Section */}
        <div className="section">
          <h2>Stock Summary</h2>
          <table className="summary-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Total Available Stock</th>
              </tr>
            </thead>
            <tbody>
              {stockSummary.map((item) => (
                <tr key={item._id}>
                  <td>{item.category}</td>
                  <td>{item.totalStockAvailable}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="chart">
            <Bar data={stockChartData} options={{ responsive: true }} />
          </div>
        </div>

        {/* Sales Summary Section */}
        <div className="section">
          <h2>Sales Summary</h2>
          <div className="chart">
            <Line data={salesChartData} options={{ responsive: true }} />
          </div>
          <table className="summary-table">
            <thead>
              <tr>
                <th>Total Kgs Sold</th>
                <th>Total Discount</th>
                <th>Total Received</th>
                <th>Remaining Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{salesSummary.totalKgsSold}</td>
                <td>{salesSummary.totalDiscountGiven}</td>
                <td>{salesSummary.totalAmountReceived}</td>
                <td>{salesSummary.totalAmountRemaining}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Buying Summary Section */}
        <div className="section">
          <h2>Buying Summary</h2>
          <div className="chart">
            <Bar data={buyingChartData} options={{ responsive: true }} />
          </div>
          <table className="summary-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Total Kgs Bought</th>
                <th>Total Amount Paid</th>
                <th>Total Remaining Amount</th>
              </tr>
            </thead>
            <tbody>
              {buyingSummary.map((item) => (
                <tr key={item._id}>
                  <td>{item.category}</td>
                  <td>{item.totalKgsBought}</td>
                  <td>{item.totalAmountPaid}</td>
                  <td>{item.totalRemainingAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Expense Summary Section */}
        <div className="section">
          <h2>Expense Summary</h2>
          <div className="chart">
            <Bar data={expenseChartData} options={{ responsive: true }} />
          </div>
          <table className="summary-table">
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
                <td>{expenseSummary.totalAmountSpent}</td>
                <td>{expenseSummary.totalDiscount}</td>
                <td>{expenseSummary.totalAmountPaid}</td>
                <td>{expenseSummary.totalRemainingAmount}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Home;
