import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingBag, LogIn, UserPlus, LogOut, Home, User, Loader2 } from "lucide-react";
import { logoutCustomer } from "../services/api";

export default function Navbar({ user, onLogoutSuccess }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutCustomer();
    } catch (err) {
      console.error("Logout request failed (clearing state anyway):", err);
    } finally {
      setIsLoggingOut(false);
      if (onLogoutSuccess) {
        onLogoutSuccess();
      }
      navigate("/login", {
        replace: true,
        state: { message: "You have been logged out successfully." },
      });
    }
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        {/* Brand Logo */}
        <Link to={user ? "/home" : "/login"} className="nav-brand" id="nav-brand-link">
          <div className="brand-icon-wrapper">
            <ShoppingBag size={20} />
          </div>
          <span>
            <span className="brand-name">Shop</span>
            <span className="brand-accent">Kart</span>
          </span>
        </Link>

        {/* Nav items */}
        <nav className="nav-links">
          <NavLink
            to="/products"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
            id="nav-link-products"
          >
            <ShoppingBag size={17} />
            <span>Products</span>
          </NavLink>

          {user ? (
            <>
              <NavLink
                to="/home"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
                id="nav-link-home"
              >
                <Home size={17} />
                <span>Home</span>
              </NavLink>

              <div className="nav-user-badge" id="nav-user-profile" title={user.email}>
                <div className="nav-avatar-mini">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : <User size={14} />}
                </div>
                <span>{user.fullName || "Customer"}</span>
              </div>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="btn-nav-logout"
                id="btn-logout-navbar"
                title="Logout from ShopKart"
              >
                {isLoggingOut ? (
                  <Loader2 size={16} className="spinner" />
                ) : (
                  <LogOut size={16} />
                )}
                <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
                id="nav-link-login"
              >
                <LogIn size={17} />
                <span>Login</span>
              </NavLink>

              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
                id="nav-link-register"
              >
                <UserPlus size={17} />
                <span>Register</span>
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
