import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./navbar.css";
import NavbarMenu from "./NavbarMenu";
import AASLogo from "../../../public/AAS.jpeg";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ADMIN_ACCESS_TOKEN =
  localStorage.getItem("adminToken") || import.meta.env.VITE_ADMIN_ACCESS_TOKEN;

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // separate refs
  const stockDropdownRef = useRef(null);
  const salesDropdownRef = useRef(null);

  const [active, setActive] = useState("HOME");
  const [dropdown, setDropdown] = useState(null);
  const [user, setUser] = useState(null);

  /*
  ========================
  CLICK OUTSIDE HANDLER
  ========================
  */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        stockDropdownRef.current &&
        !stockDropdownRef.current.contains(event.target) &&
        salesDropdownRef.current &&
        !salesDropdownRef.current.contains(event.target)
      ) {
        setDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /*
  ========================
  FETCH USER
  ========================
  */
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}admin/user`, {
          headers: { Authorization: `Bearer ${ADMIN_ACCESS_TOKEN}` },
        });

        setUser(response.data.data[0]);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  /*
  ========================
  ACTIVE MENU DETECTION
  ========================
  */
  useEffect(() => {
    const path = location.pathname;

    if (path.startsWith("/stock")) setActive("STOCK");
    else if (path.startsWith("/sale") || path.startsWith("/total-sales"))
      setActive("SALES");
    else if (path.startsWith("/bunker")) setActive("BUNKER");
    else if (path.startsWith("/expenses")) setActive("EXPENSES");
    else if (path.startsWith("/spare-parts")) setActive("SPARE PARTS");
    else if (path.startsWith("/home")) setActive("HOME");
  }, [location.pathname]);

  /*
  ========================
  NAVIGATION
  ========================
  */
  const handleNavClick = (item, path) => {
    setActive(item);
    navigate(path);
    setDropdown(null);
  };

  /*
  ========================
  LOGOUT
  ========================
  */
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/");
  };

  return (
    <header className="navbar">
      {/* LEFT SIDE */}
      <div className="nav-left">
        <div className="logo" onClick={() => navigate("/home")}>
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

          {/* STOCK DROPDOWN */}
          <li
            ref={stockDropdownRef}
            className={`dropdown-wrapper ${active === "STOCK" ? "active" : ""}`}
          >
            <span
              className="dropdown-trigger"
              onClick={() =>
                setDropdown(dropdown === "STOCK" ? null : "STOCK")
              }
            >
              STOCK ▾
            </span>

            {dropdown === "STOCK" && (
              <NavbarMenu
                items={[
                  { label: "TOTAL STOCK", path: "/stock" },
                  { label: "STOCK IN", path: "/stock/in" },
                  { label: "STOCK OUT", path: "/stock/out" },
                ]}
                onSelect={(path) => handleNavClick("STOCK", path)}
              />
            )}
          </li>

          {/* SALES DROPDOWN */}
          <li
            ref={salesDropdownRef}
            className={`dropdown-wrapper ${active === "SALES" ? "active" : ""}`}
          >
            <span
              className="dropdown-trigger"
              onClick={() =>
                setDropdown(dropdown === "SALES" ? null : "SALES")
              }
            >
              SALES ▾
            </span>

            {dropdown === "SALES" && (
              <NavbarMenu
                items={[
                  { label: "SALES", path: "/sale" },
                  { label: "TOTAL SALES", path: "/total-sales" },
                  { label: "CLIENT LEDGER", path: "/client-ledger" },
                ]}
                onSelect={(path) => handleNavClick("SALES", path)}
              />
            )}
          </li>

          <li className="logout" onClick={handleLogout}>
            LOGOUT
          </li>
        </ul>
      </div>

      {/* RIGHT SIDE */}
      <div className="nav-right">
        <div className="user">
          {user ? `👤 ${user.username}` : "👤 Loading..."}
        </div>

        <div className="name-badge">
          {user ? user.email : "Loading..."}
        </div>
      </div>
    </header>
  );
}

export default Navbar;