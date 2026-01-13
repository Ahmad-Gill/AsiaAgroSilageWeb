import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios"; // Import axios for making API requests
import "./navbar.css";
import NavbarMenu from "./NavbarMenu";
import AASLogo from '../../../public/AAS.jpeg';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ADMIN_ACCESS_TOKEN =
  localStorage.getItem("adminToken") || import.meta.env.VITE_ADMIN_ACCESS_TOKEN;


function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [active, setActive] = useState("HOME");
  const [dropdown, setDropdown] = useState(null);
  const [user, setUser] = useState(null); // State to store the user data

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}admin/user`, {
          headers: { Authorization: `Bearer ${ADMIN_ACCESS_TOKEN}` },
        });
        setUser(response.data.data[0]); // Assuming the response has a 'data' field
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData(); // Fetch user data when the component mounts
  }, []);

  // Sync active menu with URL
  useEffect(() => {
    if (location.pathname.startsWith("/stock")) setActive("STOCK");
    else if (location.pathname.startsWith("/sales")) setActive("SALES");
    else if (location.pathname === "/") setActive("HOME");
  }, [location.pathname]);

  const handleNavClick = (item, path) => {
    setActive(item);
    navigate(path);
  };

  return (
    <header className="navbar">
      {/* LEFT */}
      <div className="nav-left">
        <div className="logo" onClick={() => navigate("/")}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <img
              src={AASLogo}
              alt="AAS Logo"
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          </div>

        </div>

        <ul className="nav-links">
          <li
            className={active === "HOME" ? "active" : ""}
            onClick={() => handleNavClick("HOME", "/home")}
          >
            HOME
          </li>

          <li
            className={active === "BUNKER" ? "active" : ""}
            onClick={() => handleNavClick("BUNKER", "/bunker")}
          >
            BUNKER
          </li>

          <li
            className={active === "EXPENSES" ? "active" : ""}
            onClick={() => handleNavClick("EXPENSES", "/expenses")}
          >
            EXPENSES
          </li>

          <li
            className={active === "SPARE PARTS" ? "active" : ""}
            onClick={() => handleNavClick("SPARE PARTS", "/spare-parts")}
          >
            SPARE PARTS
          </li>

          {/* STOCK */}
          <li
            className={`dropdown-wrapper ${active === "STOCK" ? "active" : ""}`}
            onMouseEnter={() => setDropdown("STOCK")}
            onMouseLeave={() => setDropdown(null)}
          >
            <span className="dropdown-trigger">STOCK ▾</span>
            {dropdown === "STOCK" && (
              <NavbarMenu
                items={[
                  { label: "TOTAL STOCK", path: "/stock" },
                  { label: "STOCK IN", path: "/stock/in" },
                  { label: "STOCK OUT", path: "/stock/out" },
                ]}
                onSelect={() => setDropdown(null)}
              />
            )}
          </li>

          {/* SALES */}
          <li
            className={`dropdown-wrapper ${active === "SALES" ? "active" : ""}`}
            onMouseEnter={() => setDropdown("SALES")}
            onMouseLeave={() => setDropdown(null)}
          >
            <span className="dropdown-trigger">SALES ▾</span>
            {dropdown === "SALES" && (
              <NavbarMenu
                items={[
                  { label: "SALES", path: "/sale" },
                  { label: "TOTAL SALES", path: "/total-sales" },
                  { label: "CLIENT LEDGER", path: "/client-ledger" },
                ]}
                onSelect={() => setDropdown(null)}
              />
            )}
          </li>

          <li className="logout" onClick={() => navigate("/")}>
            LOGOUT
          </li>
        </ul>
      </div>

      {/* RIGHT */}
      <div className="nav-right">
        {/* Show user name if available */}
        <div className="user">
          {user ? `👤 ${user.username}` : "👤 Loading..."}
        </div>
        <div className="name-badge">{user ? user.email : "Loading..."}</div>
      </div>
    </header>
  );
}

export default Navbar;
