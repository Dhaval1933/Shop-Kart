import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, LogIn, ArrowRight, Loader2 } from "lucide-react";
import { loginCustomer } from "../services/api";

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Controlled component states
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successNotice, setSuccessNotice] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pick up flash message or prefilled email from registration/logout
  useEffect(() => {
    if (location.state?.message) {
      setSuccessNotice(location.state.message);
    }
    if (location.state?.registeredEmail) {
      setFormData((prev) => ({ ...prev, email: location.state.registeredEmail }));
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage("");
    if (successNotice) setSuccessNotice("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Basic client validation
    if (!formData.email.trim() || !formData.password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      /**
       * Calls POST /customers/login with withCredentials: true.
       * The backend sets an HttpOnly cookie named "token".
       */
      const data = await loginCustomer({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (data.success) {
        if (onLoginSuccess) {
          await onLoginSuccess();
        }
        // Navigate to /home on successful login
        navigate("/home", { replace: true });
      } else {
        // Requirement: Show "Invalid Credentials" on failure
        setErrorMessage(data.message || "Invalid Credentials");
      }
    } catch (err) {
      // 401 response from backend
      if (err.response?.status === 401) {
        setErrorMessage("Invalid Credentials");
      } else if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage("Unable to connect to server. Please check your network.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-badge">Welcome Back</span>
          <h1 className="auth-title">Customer Login</h1>
          <p className="auth-subtitle">
            Sign in to access your ShopKart account, orders, and personalized profile.
          </p>
        </div>

        {/* Success Notice from Register/Logout */}
        {successNotice && (
          <div className="alert alert-success" id="login-success-notice" role="alert">
            <CheckCircle2 size={18} className="alert-icon" />
            <div>{successNotice}</div>
          </div>
        )}

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="alert alert-error" id="login-error-alert" role="alert">
            <AlertCircle size={18} className="alert-icon" />
            <div>
              <strong>Login Failed:</strong> {errorMessage}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">
              <span>Email Address</span>
            </label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                id="login-email"
                name="email"
                placeholder="customer@example.com"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errorMessage ? "is-invalid" : ""}`}
                autoComplete="email"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="login-password" className="form-label">
              <span>Password</span>
            </label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                id="login-password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errorMessage ? "is-invalid" : ""}`}
                autoComplete="current-password"
                disabled={isSubmitting}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="input-action-btn"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="btn-primary"
            id="btn-login-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="spinner" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>Log In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Don't have a ShopKart account?
          <Link to="/register" id="link-to-register">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
}
