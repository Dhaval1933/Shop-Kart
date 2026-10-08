import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Calendar,
  MapPin,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import { getOrderById } from "../services/api";

export default function OrderDetails({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatPrice = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getOrderById(id);
        if (res && res.order) {
          setOrder(res.order);
        } else {
          setError("Order not found.");
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError(
          err.response?.data?.message ||
          "Could not retrieve this order. Please make sure you are logged into the right account."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="cart-page">
        <div className="loading-state-container">
          <Loader2 size={40} className="spinner" />
          <p className="loading-text">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="cart-page">
        <div className="error-state-container">
          <AlertCircle size={44} />
          <h3 className="error-title">Unable to access order</h3>
          <p className="error-description">{error || "Order not found."}</p>
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <Link to="/orders" className="btn-retry">
              <Package size={16} />
              <span>Back to My Orders</span>
            </Link>
            <Link to="/products" className="btn-retry" style={{ background: "transparent", color: "var(--text-main)" }}>
              <ShoppingBag size={16} />
              <span>Browse Products</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { items = [], shippingAddress = {}, totalAmount = 0 } = order;

  return (
    <div className="order-details-page" id="shopkart-order-details-page">
      <div className="cart-container">
        {/* Back Link */}
        <div className="checkout-nav-bar">
          <Link to="/orders" className="cart-continue-link" id="btn-back-to-orders">
            <ArrowLeft size={16} />
            <span>Back to All Orders</span>
          </Link>
        </div>

        <div className="order-details-card">
          {/* Header */}
          <div className="order-details-header">
            <div>
              <span className="order-tag">Order Details</span>
              <h1 className="order-details-title">Order #{order._id}</h1>
              <p className="order-details-date">
                <Calendar size={14} />
                <span>Placed on {formatDate(order.createdAt)}</span>
              </p>
            </div>

            <div className="order-header-badges">
              <span className={`order-status-badge badge-${(order.status || "placed").toLowerCase()}`}>
                {order.status}
              </span>
              <span className="order-status-badge badge-paid">
                <ShieldCheck size={14} />
                {order.paymentStatus || "PAID"}
              </span>
            </div>
          </div>

          {/* Stepper */}
          <div className="order-status-stepper" style={{ margin: "24px 0" }}>
            <div className={`step-node ${["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"].includes(order.status) ? "active" : ""}`}>
              <div className="step-circle"><CheckCircle2 size={12} /></div>
              <span>Placed</span>
            </div>
            <div className={`step-line ${["CONFIRMED", "SHIPPED", "DELIVERED"].includes(order.status) ? "active" : ""}`} />
            <div className={`step-node ${["CONFIRMED", "SHIPPED", "DELIVERED"].includes(order.status) ? "active" : ""}`}>
              <div className="step-circle"><Clock size={12} /></div>
              <span>Confirmed</span>
            </div>
            <div className={`step-line ${["SHIPPED", "DELIVERED"].includes(order.status) ? "active" : ""}`} />
            <div className={`step-node ${["SHIPPED", "DELIVERED"].includes(order.status) ? "active" : ""}`}>
              <div className="step-circle"><Truck size={12} /></div>
              <span>Shipped</span>
            </div>
            <div className={`step-line ${order.status === "DELIVERED" ? "active" : ""}`} />
            <div className={`step-node ${order.status === "DELIVERED" ? "active" : ""}`}>
              <div className="step-circle"><Package size={12} /></div>
              <span>Delivered</span>
            </div>
          </div>

          {/* Grid: Items + Delivery & Payment */}
          <div className="order-success-grid">
            {/* Items */}
            <div className="order-items-column">
              <h3 className="section-small-title">
                <Package size={17} />
                <span>Purchased Items ({items.length})</span>
              </h3>

              <div className="order-items-box">
                {items.map((item, idx) => (
                  <div key={item._id || idx} className="order-item-detail-row">
                    <img
                      src={item.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200"}
                      alt={item.name}
                      className="order-item-img"
                    />
                    <div className="order-item-meta">
                      <h4>{item.name}</h4>
                      <p className="order-item-qty">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <div className="order-item-subtotal">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-total-summary-box">
                <div className="total-summary-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
                <div className="total-summary-row">
                  <span>Shipping</span>
                  <span className="summary-free-badge">FREE</span>
                </div>
                <div className="total-summary-divider" />
                <div className="total-summary-row total-highlight">
                  <span>Grand Total</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Delivery & Payment Info */}
            <div className="order-meta-column">
              <div className="delivery-details-card">
                <h3 className="section-small-title">
                  <MapPin size={17} />
                  <span>Delivery Address</span>
                </h3>
                <div className="address-display">
                  <p className="address-name"><strong>{shippingAddress.fullName}</strong></p>
                  <p>{shippingAddress.addressLine1}</p>
                  <p>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}</p>
                  <p className="address-phone">Phone: {shippingAddress.phone}</p>
                </div>
              </div>

              <div className="payment-details-card">
                <h3 className="section-small-title">
                  <CreditCard size={17} />
                  <span>Payment Details</span>
                </h3>
                <p><strong>Gateway:</strong> Razorpay Standard Checkout (Test Mode)</p>
                <p><strong>Payment Status:</strong> {order.paymentStatus || "PAID"}</p>
                {order.razorpayPaymentId && (
                  <p><strong>Payment ID:</strong> <code>{order.razorpayPaymentId}</code></p>
                )}
                {order.razorpayOrderId && (
                  <p><strong>Razorpay Order ID:</strong> <code>{order.razorpayOrderId}</code></p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
