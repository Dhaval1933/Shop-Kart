import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CreditCard,
  ShieldCheck,
  Truck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShoppingBag,
  MapPin,
  Lock,
  Phone,
  User,
  Home,
  Building,
  Navigation,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { createPaymentOrder, verifyPayment } from "../services/api";
import { loadRazorpayScript } from "../utils/razorpay";

export default function Checkout({ user }) {
  const { cartItems, cartCount, subtotal, clearCartState } = useCart();
  const navigate = useNavigate();

  // Shipping form state
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Validation error state
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState("");

  // Test Mode Simulator state (in case Razorpay standard popup is blocked or uses test offline keys)
  const [testModalData, setTestModalData] = useState(null);

  // Auto-fill user name/phone if available
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.fullName || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  // Format currency
  const formatPrice = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Helper for computing test HMAC-SHA256 signature natively using Web Crypto API
  const computeHmacSha256 = async (message, secret) => {
    const enc = new TextEncoder();
    const key = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = await window.crypto.subtle.sign("HMAC", key, enc.encode(message));
    return Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  // Task 3: Client-side Validation Rules
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName || !formData.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }

    const trimmedPhone = (formData.phone || "").trim().replace(/[\s-]/g, "");
    if (!trimmedPhone) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(trimmedPhone)) {
      newErrors.phone = "Phone number must be a valid 10-digit number.";
    }

    if (!formData.addressLine1 || !formData.addressLine1.trim()) {
      newErrors.addressLine1 = "Street address line is required.";
    }

    if (!formData.city || !formData.city.trim()) {
      newErrors.city = "City is required.";
    }

    if (!formData.state || !formData.state.trim()) {
      newErrors.state = "State is required.";
    }

    const trimmedPin = (formData.pincode || "").trim();
    if (!trimmedPin) {
      newErrors.pincode = "Pincode is required.";
    } else if (!/^\d{6}$/.test(trimmedPin)) {
      newErrors.pincode = "Pincode must contain 6 digits.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for field being edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (serverError) {
      setServerError("");
    }
  };

  // Handle Razorpay Checkout or Fallback
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setServerError("");

    // 1. Client-side validation check
    if (!validateForm()) {
      return;
    }

    // 2. Prevent ordering if cart is empty
    if (!cartItems || cartItems.length === 0) {
      setServerError("Your cart is empty. Add products before placing an order.");
      return;
    }

    setIsProcessing(true);
    setProcessingStage("Verifying stock & creating order on server...");

    try {
      // 3. Call backend POST /orders/create-payment-order
      const orderPayload = {
        shippingAddress: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          addressLine1: formData.addressLine1.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        },
      };

      const orderData = await createPaymentOrder(orderPayload.shippingAddress);

      if (!orderData || !orderData.success) {
        throw new Error(orderData?.message || "Failed to create order on server.");
      }

      setProcessingStage("Initializing Razorpay Test Checkout...");

      // 4. Load Razorpay Checkout SDK
      const isScriptLoaded = await loadRazorpayScript();

      // Check if we can open real Razorpay checkout popup (only if real keys configured)
      let openedPopup = false;
      if (!orderData.isSimulated && isScriptLoaded && window.Razorpay) {
        try {
          const options = {
            key: orderData.key,
            amount: orderData.amount,
            currency: orderData.currency || "INR",
            name: "ShopKart",
            description: "ShopKart Order Payment (Test Mode)",
            order_id: orderData.razorpayOrderId,
            handler: async function (response) {
              await handleVerifyPaymentSignature({
                shopKartOrderId: orderData.shopKartOrderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
            },
            prefill: {
              name: formData.fullName,
              contact: formData.phone,
              email: user?.email || "",
            },
            theme: {
              color: "#6366f1",
            },
            modal: {
              ondismiss: function () {
                setIsProcessing(false);
                setProcessingStage("");
              },
            },
          };

          const rzp = new window.Razorpay(options);

          rzp.on("payment.failed", function (response) {
            console.error("Razorpay payment failed:", response.error);
            setServerError(
              `Payment failed: ${response.error?.description || "Transaction declined"}. Your cart has not been cleared. Please try again.`
            );
            setIsProcessing(false);
            setProcessingStage("");
          });

          rzp.open();
          openedPopup = true;
        } catch (popupErr) {
          console.warn("Could not launch Razorpay popup:", popupErr);
        }
      }

      // If simulated or if live Razorpay keys are not active,
      // launch the sleek Test Mode Assistant modal directly so testing proceeds smoothly
      if (!openedPopup) {
        setIsProcessing(false);
        setTestModalData(orderData);
      }
    } catch (err) {
      console.error("Order creation error:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Could not place order. Please review your details and try again.";
      setServerError(msg);
      setIsProcessing(false);
      setProcessingStage("");
    }
  };

  // Step 11 & 12 & 13: Verify Signature via POST /orders/verify-payment
  const handleVerifyPaymentSignature = async (paymentPayload) => {
    try {
      setIsProcessing(true);
      setProcessingStage("Verifying payment signature with backend...");

      const verifyRes = await verifyPayment(paymentPayload);

      if (verifyRes && verifyRes.success) {
        // Step 13 & 14: Clear cart state ONLY after verified payment
        clearCartState();
        // Step 14: Navigate to Order Success page
        navigate(`/order-success/${paymentPayload.shopKartOrderId}`, {
          state: { order: verifyRes.order },
        });
      } else {
        throw new Error(verifyRes?.message || "Signature verification failed.");
      }
    } catch (err) {
      console.error("Payment verification failed:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Payment verification failed. Your cart has been preserved.";
      setServerError(msg);
      setIsProcessing(false);
      setProcessingStage("");
    }
  };

  // Test Mode Simulator: Simulate successful payment
  const handleSimulateTestSuccess = async () => {
    if (!testModalData) return;
    try {
      setIsProcessing(true);
      setProcessingStage("Generating valid HMAC-SHA256 signature...");

      const fakePaymentId = "pay_test_" + Math.random().toString(36).substring(2, 10);
      const testSecret = "shopkart_razorpay_secret_2026";
      const payloadString = `${testModalData.razorpayOrderId}|${fakePaymentId}`;
      const validSignature = await computeHmacSha256(payloadString, testSecret);

      setTestModalData(null);

      await handleVerifyPaymentSignature({
        shopKartOrderId: testModalData.shopKartOrderId,
        razorpay_order_id: testModalData.razorpayOrderId,
        razorpay_payment_id: fakePaymentId,
        razorpay_signature: validSignature,
      });
    } catch (err) {
      console.error("Simulation error:", err);
      setServerError("Simulation failed: " + err.message);
      setIsProcessing(false);
    }
  };

  // Test Mode Simulator: Simulate failed payment / invalid signature
  const handleSimulateTestFailure = async () => {
    if (!testModalData) return;
    try {
      setIsProcessing(true);
      setProcessingStage("Testing invalid signature rejection on server...");

      const fakePaymentId = "pay_test_failed_" + Math.random().toString(36).substring(2, 10);
      const invalidSignature = "invalid_tampered_signature_1234567890abcdef";

      setTestModalData(null);

      await handleVerifyPaymentSignature({
        shopKartOrderId: testModalData.shopKartOrderId,
        razorpay_order_id: testModalData.razorpayOrderId,
        razorpay_payment_id: fakePaymentId,
        razorpay_signature: invalidSignature,
      });
    } catch (err) {
      setIsProcessing(false);
    }
  };

  // State 0: Empty Cart
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="cart-page" id="checkout-empty-page">
        <div className="cart-container">
          <div className="empty-state-container">
            <div className="empty-icon-wrap">
              <ShoppingBag size={48} className="cart-empty-icon" />
            </div>
            <h2 className="empty-title">Your cart is empty</h2>
            <p className="empty-description">
              Please add items to your cart before proceeding to checkout.
            </p>
            <Link to="/products" className="btn-empty-reset" id="btn-browse-from-checkout">
              <ShoppingBag size={16} />
              <span>Browse Catalogue</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page" id="shopkart-checkout-page">
      {/* Header Banner */}
      <section className="cart-hero">
        <div className="cart-hero-content">
          <div className="cart-hero-badge">
            <CreditCard size={15} />
            <span>Secure Checkout</span>
          </div>
          <h1 className="cart-hero-title">Shipping & Order Review</h1>
          <p className="cart-hero-subtitle">
            Complete your shipping address and finalize your payment via Razorpay Test Mode.
          </p>
        </div>
      </section>

      <div className="cart-container">
        {/* Navigation Breadcrumb */}
        <div className="checkout-nav-bar">
          <Link to="/cart" className="cart-continue-link" id="btn-back-to-cart">
            <ArrowLeft size={16} />
            <span>Return to Shopping Cart</span>
          </Link>
          <div className="checkout-security-tag">
            <Lock size={14} />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="checkout-error-banner" id="checkout-server-error">
            <AlertCircle size={20} />
            <div>
              <strong>Checkout Alert</strong>
              <p>{serverError}</p>
            </div>
          </div>
        )}

        <div className="checkout-grid-layout">
          {/* Left Column: Shipping Details Form */}
          <section className="checkout-form-card" id="shipping-details-section">
            <div className="checkout-card-header">
              <div className="step-badge">1</div>
              <div>
                <h2>Shipping Details</h2>
                <p>Enter the delivery address where your products will be shipped.</p>
              </div>
            </div>

            <form onSubmit={handlePlaceOrder} id="checkout-shipping-form" noValidate>
              <div className="form-group-row">
                <div className={`form-field ${errors.fullName ? "field-error" : ""}`}>
                  <label htmlFor="fullName">
                    Full Name <span className="req">*</span>
                  </label>
                  <div className="input-with-icon">
                    <User size={16} className="input-icon" />
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g. Aarav Sharma"
                      disabled={isProcessing}
                    />
                  </div>
                  {errors.fullName && <span className="error-hint" id="error-fullName">{errors.fullName}</span>}
                </div>

                <div className={`form-field ${errors.phone ? "field-error" : ""}`}>
                  <label htmlFor="phone">
                    Phone Number <span className="req">*</span>
                  </label>
                  <div className="input-with-icon">
                    <Phone size={16} className="input-icon" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. 9876543210"
                      disabled={isProcessing}
                    />
                  </div>
                  {errors.phone && <span className="error-hint" id="error-phone">{errors.phone}</span>}
                </div>
              </div>

              <div className={`form-field ${errors.addressLine1 ? "field-error" : ""}`}>
                <label htmlFor="addressLine1">
                  Street Address / Flat / Building <span className="req">*</span>
                </label>
                <div className="input-with-icon">
                  <Home size={16} className="input-icon" />
                  <input
                    type="text"
                    id="addressLine1"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    placeholder="e.g. Flat 402, Sunshine Heights, MG Road"
                    disabled={isProcessing}
                  />
                </div>
                {errors.addressLine1 && <span className="error-hint" id="error-addressLine1">{errors.addressLine1}</span>}
              </div>

              <div className="form-group-row-three">
                <div className={`form-field ${errors.city ? "field-error" : ""}`}>
                  <label htmlFor="city">
                    City <span className="req">*</span>
                  </label>
                  <div className="input-with-icon">
                    <Building size={16} className="input-icon" />
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Bengaluru"
                      disabled={isProcessing}
                    />
                  </div>
                  {errors.city && <span className="error-hint" id="error-city">{errors.city}</span>}
                </div>

                <div className={`form-field ${errors.state ? "field-error" : ""}`}>
                  <label htmlFor="state">
                    State <span className="req">*</span>
                  </label>
                  <div className="input-with-icon">
                    <Navigation size={16} className="input-icon" />
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="e.g. Karnataka"
                      disabled={isProcessing}
                    />
                  </div>
                  {errors.state && <span className="error-hint" id="error-state">{errors.state}</span>}
                </div>

                <div className={`form-field ${errors.pincode ? "field-error" : ""}`}>
                  <label htmlFor="pincode">
                    Pincode (6 digits) <span className="req">*</span>
                  </label>
                  <div className="input-with-icon">
                    <MapPin size={16} className="input-icon" />
                    <input
                      type="text"
                      id="pincode"
                      name="pincode"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="e.g. 560001"
                      disabled={isProcessing}
                    />
                  </div>
                  {errors.pincode && <span className="error-hint" id="error-pincode">{errors.pincode}</span>}
                </div>
              </div>

              {/* Payment Gateway Notice */}
              <div className="razorpay-notice-box">
                <div className="razorpay-logo-badge">
                  <CreditCard size={18} />
                  <span>Razorpay Payment Gateway</span>
                </div>
                <p>
                  Transactions are powered by Razorpay in <strong>Test Mode</strong>. No actual money will be charged.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="btn-place-order"
                id="btn-place-order"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={18} className="spinner" />
                    <span>{processingStage || "Processing Order..."}</span>
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    <span>Pay {formatPrice(subtotal)} with Razorpay</span>
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Right Column: Order Summary */}
          <aside className="checkout-summary-card" id="order-summary-section">
            <div className="checkout-card-header">
              <div className="step-badge">2</div>
              <div>
                <h2>Order Summary</h2>
                <p>{cartCount} items ready for dispatch</p>
              </div>
            </div>

            {/* Items list preview */}
            <div className="checkout-items-list" id="checkout-items-list">
              {cartItems.map((item) => {
                const prod = item.product || {};
                const itemTotal = (prod.price || 0) * (item.quantity || 1);
                return (
                  <div key={prod._id || item._id} className="checkout-item-row">
                    <img
                      src={prod.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200"}
                      alt={prod.name}
                      className="checkout-item-thumb"
                    />
                    <div className="checkout-item-info">
                      <h4 className="checkout-item-title">{prod.name}</h4>
                      <div className="checkout-item-calc">
                        {formatPrice(prod.price)} × {item.quantity}
                      </div>
                    </div>
                    <div className="checkout-item-total">
                      {formatPrice(itemTotal)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cart-summary-divider" />

            {/* Calculations */}
            <div className="cart-summary-row">
              <span>Items Total ({cartCount} units)</span>
              <span id="checkout-subtotal">{formatPrice(subtotal)}</span>
            </div>

            <div className="cart-summary-row">
              <span>Express Delivery</span>
              <span className="summary-free-badge">FREE</span>
            </div>

            <div className="cart-summary-divider" />

            <div className="cart-summary-row cart-summary-total">
              <span>Total Payable</span>
              <span className="summary-total-price" id="checkout-total-price">
                {formatPrice(subtotal)}
              </span>
            </div>

            {/* Trust Perks */}
            <div className="cart-summary-perks">
              <div className="summary-perk-item">
                <ShieldCheck size={16} />
                <span>HMAC SHA-256 Verified Payment Security</span>
              </div>
              <div className="summary-perk-item">
                <Truck size={16} />
                <span>Contactless Delivery across India</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Razorpay Test Mode Assistant Modal (Fallback & Evaluation Tool) */}
      {testModalData && (
        <div className="test-modal-overlay">
          <div className="test-modal-box" id="razorpay-test-modal">
            <div className="test-modal-header">
              <div className="test-modal-badge">
                <CreditCard size={18} />
                <span>Razorpay Checkout (Test Mode)</span>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setTestModalData(null)}
              >
                ✕
              </button>
            </div>

            <div className="test-modal-body">
              <div className="test-modal-summary-banner">
                <div className="test-summary-left">
                  <span className="test-brand">ShopKart Order</span>
                  <span className="test-order-id">#{testModalData.shopKartOrderId}</span>
                </div>
                <div className="test-summary-right">
                  <span className="test-total-amount">
                    {formatPrice(testModalData.amount / 100)}
                  </span>
                  <span className="test-paise-tag">({testModalData.amount} paise)</span>
                </div>
              </div>

              <div className="test-mode-info-alert">
                <ShieldCheck size={16} />
                <div>
                  <strong>Test Mode Simulation Active</strong>
                  <p>
                    Live Razorpay popup requires active keys in <code>backend/.env</code>.
                    Use the buttons below to test server-side HMAC-SHA256 signature verification, stock decrement, and cart clearing.
                  </p>
                </div>
              </div>

              <div className="test-modal-actions">
                <button
                  type="button"
                  onClick={handleSimulateTestSuccess}
                  className="btn-simulate-success"
                  id="btn-simulate-test-success"
                >
                  <CheckCircle2 size={18} />
                  <span>Pay {formatPrice(testModalData.amount / 100)} (Test Payment Success)</span>
                </button>

                <button
                  type="button"
                  onClick={handleSimulateTestFailure}
                  className="btn-simulate-failure"
                  id="btn-simulate-test-failure"
                >
                  <AlertCircle size={18} />
                  <span>Simulate Payment Failure (Invalid Signature)</span>
                </button>
              </div>

              <div className="test-modal-keys-note">
                💡 <em>To use the live Razorpay popup, add your test keys from Razorpay Dashboard into <code>backend/.env</code>.</em>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
