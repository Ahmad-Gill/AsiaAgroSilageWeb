import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./navbar.css";
import NavbarMenu from "./navbarMenu";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [active, setActive] = useState("HOME");
  const [dropdown, setDropdown] = useState(null);

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
          <strong>AAS</strong>
          <span>Asia Agro Silage</span>
        </div>

        <ul className="nav-links">
          <li
            className={active === "HOME" ? "active" : ""}
            onClick={() => handleNavClick("HOME", "/")}
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

          {/* STOCK */}
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
        { label: "SALES", path: "/sales" },
        { label: "TOTAL SALES", path: "/sales/total" },
        { label: "CLIENT LEDGER", path: "/sales/ledger" },
      ]}
      onSelect={() => setDropdown(null)}
    />
  )}
</li>


          <li className="logout" onClick={() => navigate("/logout")}>
            LOGOUT
          </li>
        </ul>
      </div>

      {/* RIGHT */}
      <div className="nav-right">
        <div className="user">👤 Ahmad</div>
        <div className="name-badge">Muhammad Ahmad Gill</div>
      </div>
    </header>
  );
}

export default Navbar;
