import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  ShoppingBag,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  LogIn,
} from "lucide-react";
import { getWishlist } from "../services/api";
import WishlistCard from "../components/WishlistCard";

export default function Wishlist({ user }) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch Wishlist from backend
  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getWishlist();
      if (data && Array.isArray(data.wishlist)) {
        setWishlist(data.wishlist);
      } else {
        setWishlist([]);
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      const status = err.response ? err.response.status : null;
      if (status === 401) {
        setError("Please log in to view your wishlist.");
      } else {
        setError("We couldn't load your wishlist.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Remove item handler for instant optimistic UI update
  const handleRemoveItem = (removedId) => {
    setWishlist((prev) => prev.filter((item) => item._id !== removedId));
  };

  // If user is definitely not logged in and got a 401
  if (!loading && error === "Please log in to view your wishlist.") {
    return (
      <div className="wishlist-page" id="wishlist-unauth-page">
        <div className="wishlist-container">
          <div className="empty-state-container" id="wishlist-unauth-state">
            <div className="empty-icon-wrap heart-pulse">
              <Heart size={48} className="wishlist-empty-heart" />
            </div>
            <h2 className="empty-title">Log in to view your wishlist</h2>
            <p className="empty-description">
              Sign in to ShopKart to access your saved items from any device.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="btn-empty-reset"
              id="btn-login-wishlist"
            >
              <LogIn size={16} />
              <span>Log In to Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page" id="shopkart-wishlist-page">
      {/* Header Banner */}
      <section className="wishlist-hero">
        <div className="wishlist-hero-content">
          <div className="wishlist-hero-badge">
            <Heart size={15} fill="currentColor" />
            <span>Saved Favorites</span>
          </div>
          <h1 className="wishlist-hero-title">My Wishlist</h1>
          <p className="wishlist-hero-subtitle" id="wishlist-subtitle-count">
            {loading
              ? "Loading saved products..."
              : `${wishlist.length} ${
                  wishlist.length === 1 ? "product" : "products"
                } saved`}
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="wishlist-container">
        {/* Navigation / Action bar */}
        <div className="wishlist-top-bar">
          <div className="wishlist-count-indicator">
            <Sparkles size={16} />
            <span>
              {wishlist.length} {wishlist.length === 1 ? "Item" : "Items"} in
              Wishlist
            </span>
          </div>
          <Link
            to="/products"
            className="btn-continue-shopping-link"
            id="btn-wishlist-continue-shopping"
          >
            <span>Continue Shopping</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* State 1: Loading State (Section 10) */}
        {loading && (
          <div className="loading-state-container" id="wishlist-loading-state">
            <div className="loading-spinner-large" />
            <p className="loading-text" id="loading-wishlist-text">
              Loading your wishlist...
            </p>
            <div className="products-skeleton-grid">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="skeleton-card">
                  <div className="skeleton-image" />
                  <div className="skeleton-line skeleton-title" />
                  <div className="skeleton-line skeleton-meta" />
                  <div className="skeleton-line skeleton-btn" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* State 2: Error State (Section 11) */}
        {!loading && error && (
          <div className="error-state-container" id="wishlist-error-state">
            <div className="error-icon-wrap">
              <AlertCircle size={44} />
            </div>
            <h3 className="error-title">Something went wrong.</h3>
            <p className="error-description" id="wishlist-error-text">
              {error}
            </p>
            <button
              onClick={fetchWishlist}
              className="btn-retry"
              id="btn-retry-wishlist"
            >
              <RefreshCw size={16} />
              <span>Try Again</span>
            </button>
          </div>
        )}

        {/* State 3: Empty State (Section 9) */}
        {!loading && !error && wishlist.length === 0 && (
          <div className="empty-state-container" id="wishlist-empty-state">
            <div className="empty-icon-wrap heart-pulse">
              <Heart size={52} className="wishlist-empty-heart" />
            </div>
            <h2 className="empty-title">Your wishlist is empty ❤️</h2>
            <p className="empty-description">
              Save products you love and find them here later.
            </p>
            <Link
              to="/products"
              className="btn-empty-reset"
              id="btn-browse-products"
            >
              <ShoppingBag size={17} />
              <span>Browse Products</span>
            </Link>
          </div>
        )}

        {/* State 4: Populated Wishlist Grid */}
        {!loading && !error && wishlist.length > 0 && (
          <div className="wishlist-grid" id="wishlist-grid">
            {wishlist.map((product) => (
              <WishlistCard
                key={product._id}
                product={product}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
