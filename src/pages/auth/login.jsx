import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (!form.email || !form.password) {
    setError("Email and password are required");
    return;
  }

  const payload = {
    email: form.email,
    password: form.password,
    deviceType: "android",
    deviceId: "123",
    timezone: "Asia/Karachi",
    userType: "admin",
  };

  try {
    setLoading(true);

    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-access-token": import.meta.env.VITE_ADMIN_ACCESS_TOKEN,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    // ✅ SAVE TOKEN CORRECTLY
    localStorage.setItem("adminToken", data.data.token);
    localStorage.setItem(
      "adminUser",
      JSON.stringify(data.data.basicInfo)
    );

    navigate("/stock/in");
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Asia Agro Silage</h2>
        <p className="subtitle">Admin Login</p>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error">{error}</div>}

          <div className="field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="admin@asiaagro.com"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="field password-field">
            <label>Password</label>

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                disabled={loading}
                autoComplete="current-password"
              />

              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="footer-text">
          © {new Date().getFullYear()} Asia Agro Silage
        </p>
      </div>
    </div>
  );
}

export default Login;
