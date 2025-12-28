import { useNavigate } from "react-router-dom";
import "./navbar.css";

function NavbarMenu({ items, onSelect }) {
  const navigate = useNavigate();

  const handleClick = path => {
    onSelect?.();
    navigate(path);
  };

  return (
    <div className="dropdown-menu">
      {items.map(item => (
        <div
          key={item.label}
          className="dropdown-item"
          onClick={() => handleClick(item.path)}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
}

export default NavbarMenu;
