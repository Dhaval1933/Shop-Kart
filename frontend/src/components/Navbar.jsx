import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  LogIn,
  UserPlus,
  LogOut,
  Home,
  User,
  Loader2,
  Heart,
  ShoppingCart,
} from "lucide-react";
import { logoutCustomer, getWishlistCount } from "../services/api";
import { useCart } from "../context/CartContext";

export default function Navbar({ user, onLogoutSuccess }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const { cartCount } = useCart();
  const navigate = useNavigate();

  // Fetch Wishlist count from backend when authenticated
  const fetchCount = async () => {
    if (!user) {
      setWishlistCount(0);
      return;
    }
    try {
      const data = await getWishlistCount();
      if (data && typeof data.count === "number") {
        setWishlistCount(data.count);
      }
    } catch {
      // Gracefully ignore error on count fetch
    }
  };

  useEffect(() => {
    fetchCount();

    // Listen for custom wishlist update events dispatched across the app
    const handleWishlistUpdated = () => {
      fetchCount();
    };

    window.addEventListener("wishlistUpdated", handleWishlistUpdated);
    return () => {
      window.removeEventListener("wishlistUpdated", handleWishlistUpdated);
    };
  }, [user]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutCustomer();
    } catch (err) {
      console.error("Logout request failed (clearing state anyway):", err);
    } finally {
      setIsLoggingOut(false);
      setWishlistCount(0);
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
        <Link
          to={user ? "/home" : "/products"}
          className="nav-brand"
          id="nav-brand-link"
        >
          <div className="brand-icon-wrapper">
            <ShoppingBag size={20} />
          </div>
          <span>
            <span className="brand-name">Shop</span>
            <span className="brand-accent">Kart</span>
          </span>
        </Link>

        {/* Nav items: Home | Products | Wishlist | Logout */}
        <nav className="nav-links">
          {user && (
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
          )}

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

          {/* Section 8 & Bonus Task 24: Wishlist Link with dynamic backend count */}
          <NavLink
            to="/wishlist"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
            id="nav-link-wishlist"
          >
            <Heart size={17} />
            <span>Wishlist</span>
            {wishlistCount > 0 && (
              <span className="nav-badge-count" id="nav-wishlist-count">
                {wishlistCount}
              </span>
            )}
          </NavLink>

          {/* Lab 05 Task 16: Cart Link with dynamic derived total quantity */}
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
            id="nav-link-cart"
          >
            <ShoppingCart size={17} />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="nav-badge-count nav-cart-badge" id="nav-cart-count">
                {cartCount}
              </span>
            )}
          </NavLink>

          {user ? (
            <>
              <div
                className="nav-user-badge"
                id="nav-user-profile"
                title={user.email}
              >
                <div className="nav-avatar-mini">
                  {user.fullName ? (
                    user.fullName.charAt(0).toUpperCase()
                  ) : (
                    <User size={14} />
                  )}
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
