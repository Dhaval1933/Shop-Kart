import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  RefreshCw,
  AlertCircle,
  LogIn,
  CheckCircle2,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import CartItem from "../components/CartItem";

export default function Cart({ user }) {
  const {
    cartItems,
    cartLoading,
    cartError,
    cartCount,
    subtotal,
    fetchCart,
  } = useCart();
  const navigate = useNavigate();

  const [checkoutFeedback, setCheckoutFeedback] = useState(false);

  // Format currency
  const formatPrice = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleProceedToCheckout = () => {
    navigate("/checkout");
  };

  // State 0: Unauthenticated user
  if (!user) {
    return (
      <div className="cart-page" id="cart-unauth-page">
        <div className="cart-container">
          <div className="empty-state-container" id="cart-unauth-state">
            <div className="empty-icon-wrap">
              <ShoppingCart size={48} className="cart-empty-icon" />
            </div>
            <h2 className="empty-title">Log in to view your cart</h2>
            <p className="empty-description">
              Sign in to ShopKart to access your shopping cart and complete your purchase.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="btn-empty-reset"
              id="btn-login-cart"
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
    <div className="cart-page" id="shopkart-cart-page">
      {/* Header Banner */}
      <section className="cart-hero">
        <div className="cart-hero-content">
          <div className="cart-hero-badge">
            <ShoppingCart size={15} />
            <span>Shopping Cart</span>
          </div>
          <h1 className="cart-hero-title">My Cart</h1>
          <p className="cart-hero-subtitle" id="cart-subtitle-count">
            {cartLoading
              ? "Loading your items..."
              : `${cartCount} ${cartCount === 1 ? "item" : "items"} in cart`}
          </p>
        </div>
      </section>

      <div className="cart-container">
        {/* State 1: Loading State (Section 17) */}
        {cartLoading && (
          <div className="loading-state-container" id="cart-loading-state">
            <div className="loading-spinner-large" />
            <p className="loading-text" id="loading-cart-text">
              Loading your cart...
            </p>
            <div className="cart-skeleton-list">
              {[1, 2, 3].map((n) => (
                <div key={n} className="cart-skeleton-item">
                  <div className="skeleton-image" style={{ width: 100, height: 100 }} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div className="skeleton-line" style={{ width: "60%", height: 18 }} />
                    <div className="skeleton-line" style={{ width: "30%", height: 14 }} />
                    <div className="skeleton-line" style={{ width: "40%", height: 28 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* State 2: Error State (Section 17) */}
        {!cartLoading && cartError && (
          <div className="error-state-container" id="cart-error-state">
            <div className="error-icon-wrap">
              <AlertCircle size={44} />
            </div>
            <h3 className="error-title">Unable to load your cart.</h3>
            <p className="error-description" id="cart-error-text">
              {cartError}
            </p>
            <button
              onClick={fetchCart}
              className="btn-retry"
              id="btn-retry-cart"
            >
              <RefreshCw size={16} />
              <span>Try Again</span>
            </button>
          </div>
        )}

        {/* State 3: Empty State (Section 17) */}
        {!cartLoading && !cartError && cartItems.length === 0 && (
          <div className="empty-state-container" id="cart-empty-state">
            <div className="empty-icon-wrap">
              <ShoppingCart size={52} className="cart-empty-icon" />
            </div>
            <h2 className="empty-title">Your cart is empty 🛒</h2>
            <p className="empty-description">
              Looks like you haven't added anything yet.
            </p>
            <Link
              to="/products"
              className="btn-empty-reset"
              id="btn-browse-products-cart"
            >
              <ShoppingBag size={17} />
              <span>Browse Products</span>
            </Link>
          </div>
        )}

        {/* State 4: Populated Cart & Order Summary */}
        {!cartLoading && !cartError && cartItems.length > 0 && (
          <div className="cart-content-layout">
            {/* Left Column: Cart Items List */}
            <div className="cart-items-section">
              <div className="cart-items-header">
                <h2>Cart Items ({cartItems.length} products, {cartCount} units)</h2>
                <Link to="/products" className="cart-continue-link">
                  <span>Continue Shopping</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div className="cart-items-list" id="cart-items-list">
                {cartItems.map((item) => (
                  <CartItem key={item.product?._id || item._id} item={item} />
                ))}
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <aside className="cart-summary-section">
              <div className="cart-summary-card" id="cart-order-summary">
                <h3 className="cart-summary-title">Order Summary</h3>

                {/* Checkout notification feedback */}
                {checkoutFeedback && (
                  <div className="checkout-preview-toast" id="checkout-preview-toast">
                    <CheckCircle2 size={16} />
                    <div>
                      <strong>Ready to Order!</strong>
                      <div>Checkout & Order Creation will arrive in Lab-06.</div>
                    </div>
                  </div>
                )}

                <div className="cart-summary-row">
                  <span>Total Items</span>
                  <span id="summary-items-count">{cartCount}</span>
                </div>

                <div className="cart-summary-row">
                  <span>Subtotal</span>
                  <span className="summary-price" id="summary-subtotal">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="cart-summary-row">
                  <span>Shipping</span>
                  <span className="summary-free-badge">FREE</span>
                </div>

                <div className="cart-summary-divider" />

                <div className="cart-summary-row cart-summary-total">
                  <span>Estimated Total</span>
                  <span className="summary-total-price" id="summary-total-price">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="cart-tax-notice">Inclusive of all applicable taxes</div>

                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="btn-proceed-checkout"
                  id="btn-proceed-to-checkout"
                >
                  <ShoppingCart size={18} />
                  <span>Proceed to Checkout</span>
                </button>

                {/* Trust Perks */}
                <div className="cart-summary-perks">
                  <div className="summary-perk-item">
                    <ShieldCheck size={16} />
                    <span>Secure SSL Encrypted Checkout</span>
                  </div>
                  <div className="summary-perk-item">
                    <Truck size={16} />
                    <span>Free Delivery across India</span>
                  </div>
                  <div className="summary-perk-item">
                    <RotateCcw size={16} />
                    <span>Easy 30-Day Returns</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
