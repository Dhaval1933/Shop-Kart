import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Phone, Eye, EyeOff, AlertCircle, CheckCircle2, UserPlus, ArrowRight, Loader2 } from "lucide-react";
import { registerCustomer } from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  // Controlled component form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Controlled input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (serverError) {
      setServerError("");
    }
  };

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full Name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    const phoneRegex = /^[0-9+()\- ]{7,15}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = "Please enter a valid phone number (7-15 digits)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
      };

      const data = await registerCustomer(payload);

      if (data.success) {
        // Redirect to Login page with success state
        navigate("/login", {
          state: {
            message: "Account created successfully! Please log in with your credentials.",
            registeredEmail: formData.email.trim().toLowerCase(),
          },
        });
      } else {
        setServerError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "An error occurred while connecting to the server. Please try again.";
      setServerError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-badge">Join ShopKart</span>
          <h1 className="auth-title">Create an Account</h1>
          <p className="auth-subtitle">
            Sign up to explore exclusive deals, fast checkout, and personalized recommendations.
          </p>
        </div>

        {/* Global Server Error Alert */}
        {serverError && (
          <div className="alert alert-error" id="register-server-error" role="alert">
            <AlertCircle size={18} className="alert-icon" />
            <div>
              <strong>Registration Error:</strong> {serverError}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Full Name Field */}
          <div className="form-group">
            <label htmlFor="fullName" className="form-label">
              <span>Full Name</span>
            </label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                className={`form-input ${errors.fullName ? "is-invalid" : ""}`}
                autoComplete="name"
                disabled={isSubmitting}
              />
            </div>
            {errors.fullName && (
              <span className="field-error-text" id="fullName-error">
                <AlertCircle size={13} /> {errors.fullName}
              </span>
            )}
          </div>

          {/* Email Address Field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <span>Email Address</span>
            </label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? "is-invalid" : ""}`}
                autoComplete="email"
                disabled={isSubmitting}
              />
            </div>
            {errors.email && (
              <span className="field-error-text" id="email-error">
                <AlertCircle size={13} /> {errors.email}
              </span>
            )}
          </div>

          {/* Phone Number Field */}
          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              <span>Phone Number</span>
            </label>
            <div className="input-wrapper">
              <Phone size={18} className="input-icon" />
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="+1 555 123 4567"
                value={formData.phone}
                onChange={handleChange}
                className={`form-input ${errors.phone ? "is-invalid" : ""}`}
                autoComplete="tel"
                disabled={isSubmitting}
              />
            </div>
            {errors.phone && (
              <span className="field-error-text" id="phone-error">
                <AlertCircle size={13} /> {errors.phone}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <span>Password</span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-light)", fontWeight: 400 }}>
                Min 6 chars
              </span>
            </label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? "is-invalid" : ""}`}
                autoComplete="new-password"
                disabled={isSubmitting}
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
            {errors.password && (
              <span className="field-error-text" id="password-error">
                <AlertCircle size={13} /> {errors.password}
              </span>
            )}
          </div>

          {/* Create Account Button */}
          <button
            type="submit"
            className="btn-primary"
            id="btn-create-account"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="spinner" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Create Account</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have a ShopKart account?
          <Link to="/login" id="link-to-login">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
}
