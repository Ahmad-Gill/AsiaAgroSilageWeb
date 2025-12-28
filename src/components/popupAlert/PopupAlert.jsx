import "./popupAlert.css";

function PopupAlert({ open, message, status, loading = false, onClose }) {
  if (!open) return null;

  let type = "info"; // Default type
  if (status >= 200 && status < 300) type = "success";
  else if (status >= 400) type = "error";

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className={`popup-alert ${type}`} onClick={(e) => e.stopPropagation()}>
        {loading ? (
          <div className="popup-loading">
            <div className="spinner"></div>
            <span>Please wait...</span>
          </div>
        ) : (
          <>
            <span className="popup-message">{message}</span>
            <button className="popup-close" onClick={onClose}>
              ✖
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default PopupAlert;
