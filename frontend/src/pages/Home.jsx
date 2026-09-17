import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  Package,
  Heart,
  Gift,
  MapPin,
  LogOut,
  Truck,
  Headphones,
  RefreshCw,
  CreditCard,
  Loader2,
  ShoppingBag,
  ArrowRight
} from "lucide-react";
import { getCustomerProfile, logoutCustomer } from "../services/api";

export default function Home({ user, setUser, onLogoutSuccess }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(user || null);
  const [isLoading, setIsLoading] = useState(!user);
  const [error, setError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchCustomer = async () => {
      try {
        setIsLoading(true);
        /**
         * Task 3 requirement:
         * Protected Home Page fetches the logged-in customer using GET /customers/me.
         * If the HttpOnly cookie is missing or invalid, backend returns 401.
         */
        const data = await getCustomerProfile();
        if (isMounted) {
          setProfile(data);
          if (setUser) {
            setUser(data);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.warn("Unauthorized or session expired:", err);
          // Requirement: If Not Logged In → Automatically redirect to /login
          if (setUser) {
            setUser(null);
          }
          navigate("/login", {
            replace: true,
            state: { message: "Please log in to access your ShopKart account." },
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCustomer();

    return () => {
      isMounted = false;
    };
  }, [navigate, setUser]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutCustomer();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsLoggingOut(false);
      if (setUser) setUser(null);
      if (onLogoutSuccess) onLogoutSuccess();
      navigate("/login", {
        replace: true,
        state: { message: "You have been logged out successfully." },
      });
    }
  };

  // Loading state while verifying token
  if (isLoading) {
    return (
      <div className="loading-screen" id="home-loading-state">
        <div className="loading-spinner-large" />
        <p className="loading-text">Authenticating your ShopKart session...</p>
      </div>
    );
  }

  // Fallback if profile not loaded yet
  if (!profile) {
    return null;
  }

  const joinDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Member since 2026";

  return (
    <div className="home-page" id="shopkart-home-page">
      {/* Hero Welcome Banner */}
      <section className="home-hero">
        <div className="hero-content">
          <div className="hero-user-info">
            <div className="hero-avatar" id="customer-avatar">
              {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : "C"}
            </div>
            <div>
              <div className="hero-welcome-badge">
                <ShieldCheck size={14} />
                <span>Verified Customer</span>
              </div>
              <h1 className="hero-title" id="welcome-message">
                Welcome back, {profile.fullName}!
              </h1>
              <p className="hero-subtitle">
                Welcome to your ShopKart customer portal. Your account is active and protected.
              </p>
            </div>
          </div>

          <div className="hero-actions">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="btn-hero-logout"
              id="btn-hero-logout"
            >
              {isLoggingOut ? (
                <Loader2 size={16} className="spinner" />
              ) : (
                <LogOut size={16} />
              )}
              <span>{isLoggingOut ? "Signing Out..." : "Sign Out"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Lab 03: Product Catalog Discovery Callout Banner */}
      <section className="catalog-callout-banner">
        <div className="catalog-callout-content">
          <div className="catalog-callout-icon">
            <ShoppingBag size={28} />
          </div>
          <div className="catalog-callout-text">
            <span className="catalog-tag">New in ShopKart</span>
            <h3>Explore Our Product Catalog</h3>
            <p>
              Browse live inventory across electronics, fashion, books, and home essentials with instant search and filtering.
            </p>
          </div>
        </div>
        <Link to="/products" className="btn-browse-catalog" id="btn-browse-catalog-home">
          <span>Start Shopping</span>
          <ArrowRight size={18} />
        </Link>
      </section>

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Customer Information Card */}
        <div className="dash-card" id="customer-profile-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">
              <User size={20} style={{ color: "var(--primary-600)" }} />
              <span>Customer Information</span>
            </h2>
            <span className="pill-badge pill-success">Authenticated</span>
          </div>

          <div className="info-list">
            <div className="info-item">
              <div className="info-item-label">
                <User size={16} />
                <span>Full Name</span>
              </div>
              <div className="info-item-value" id="display-customer-name">
                {profile.fullName}
              </div>
            </div>

            <div className="info-item">
              <div className="info-item-label">
                <Mail size={16} />
                <span>Email Address</span>
              </div>
              <div className="info-item-value" id="display-customer-email">
                {profile.email}
              </div>
            </div>

            <div className="info-item">
              <div className="info-item-label">
                <Phone size={16} />
                <span>Phone Number</span>
              </div>
              <div className="info-item-value" id="display-customer-phone">
                {profile.phone}
              </div>
            </div>

            <div className="info-item">
              <div className="info-item-label">
                <Calendar size={16} />
                <span>Member Since</span>
              </div>
              <div className="info-item-value" id="display-customer-joined">
                {joinDate}
              </div>
            </div>

            {profile._id && (
              <div className="info-item">
                <div className="info-item-label">
                  <ShieldCheck size={16} />
                  <span>Customer ID</span>
                </div>
                <div className="info-item-value" style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {profile._id}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ShopKart Account Overview Card */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">
              <Package size={20} style={{ color: "var(--primary-600)" }} />
              <span>ShopKart Activity</span>
            </h2>
            <span className="pill-badge pill-primary">Customer Tier: Gold</span>
          </div>

          <div className="info-list">
            <div className="info-item">
              <div className="info-item-label">
                <Package size={16} />
                <span>Active Orders</span>
              </div>
              <div className="info-item-value">0 items processing</div>
            </div>

            <div className="info-item">
              <div className="info-item-label">
                <Heart size={16} />
                <span>Saved Wishlist</span>
              </div>
              <div className="info-item-value">4 items saved</div>
            </div>

            <div className="info-item">
              <div className="info-item-label">
                <Gift size={16} />
                <span>ShopKart Rewards</span>
              </div>
              <div className="info-item-value" style={{ color: "var(--primary-600)" }}>
                150 Bonus Points
              </div>
            </div>

            <div className="info-item">
              <div className="info-item-label">
                <MapPin size={16} />
                <span>Shipping Address</span>
              </div>
              <div className="info-item-value">Default delivery address saved</div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Perks & Benefits */}
      <h3 style={{ fontSize: "1.15rem", marginBottom: "1rem" }}>ShopKart Benefits</h3>
      <div className="perks-grid">
        <div className="perk-card">
          <div className="perk-icon-wrap">
            <Truck size={22} />
          </div>
          <div>
            <div className="perk-title">Free Express Shipping</div>
            <div className="perk-desc">On all orders over $49</div>
          </div>
        </div>

        <div className="perk-card">
          <div className="perk-icon-wrap">
            <RefreshCw size={22} />
          </div>
          <div>
            <div className="perk-title">30-Day Easy Returns</div>
            <div className="perk-desc">Hassle-free return policy</div>
          </div>
        </div>

        <div className="perk-card">
          <div className="perk-icon-wrap">
            <CreditCard size={22} />
          </div>
          <div>
            <div className="perk-title">Secure Payments</div>
            <div className="perk-desc">Encrypted with 256-bit SSL</div>
          </div>
        </div>

        <div className="perk-card">
          <div className="perk-icon-wrap">
            <Headphones size={22} />
          </div>
          <div>
            <div className="perk-title">24/7 Support</div>
            <div className="perk-desc">Dedicated customer assistance</div>
          </div>
        </div>
      </div>
    </div>
  );
}
