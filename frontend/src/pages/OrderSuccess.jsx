import React, { useEffect, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Package,
  ShoppingBag,
  ArrowRight,
  MapPin,
  Calendar,
  CreditCard,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { getOrderById } from "../services/api";

export default function OrderSuccess({ user }) {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [error, setError] = useState("");

  const formatPrice = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Just now";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    if (!order && id) {
      const fetchOrder = async () => {
        setLoading(true);
        try {
          const res = await getOrderById(id);
          if (res && res.order) {
            setOrder(res.order);
          } else {
            setError("Could not load order details.");
          }
        } catch (err) {
          setError(err.response?.data?.message || "Failed to load order.");
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [id, order]);

  if (loading) {
    return (
      <div className="cart-page">
        <div className="loading-state-container">
          <Loader2 size={40} className="spinner" />
          <p className="loading-text">Loading your order confirmation...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="cart-page">
        <div className="error-state-container">
          <AlertCircle size={44} />
          <h3 className="error-title">Order Not Found</h3>
          <p className="error-description">{error || "Unable to display order."}</p>
          <button onClick={() => navigate("/products")} className="btn-retry">
            <ShoppingBag size={16} />
            <span>Continue Shopping</span>
          </button>
        </div>
      </div>
    );
  }

  const { items = [], shippingAddress = {}, totalAmount = 0 } = order;

  return (
    <div className="order-success-page" id="shopkart-order-success-page">
      <div className="cart-container">
        <div className="order-success-card" id="order-success-card">
          {/* Top Success Badge */}
          <div className="order-success-banner">
            <div className="success-icon-wrap">
              <CheckCircle2 size={56} className="success-icon" />
            </div>
            <h1 className="success-title">Order Placed Successfully!</h1>
            <p className="success-subtitle">
              Thank you for shopping with ShopKart. Your payment has been verified and your order is confirmed.
            </p>
          </div>

          {/* Quick Details Bar */}
          <div className="order-quick-bar">
            <div className="quick-item">
              <span className="quick-label">Order ID</span>
              <span className="quick-value" id="order-confirm-id">
                #{order._id}
              </span>
            </div>

            <div className="quick-item">
              <span className="quick-label">Date</span>
              <span className="quick-value">
                <Calendar size={14} />
                {formatDate(order.createdAt)}
              </span>
            </div>

            <div className="quick-item">
              <span className="quick-label">Order Status</span>
              <span className="order-status-badge badge-placed" id="order-confirm-status">
                {order.status || "PLACED"}
              </span>
            </div>

            <div className="quick-item">
              <span className="quick-label">Payment Status</span>
              <span className="order-status-badge badge-paid" id="order-confirm-payment">
                <ShieldCheck size={14} />
                {order.paymentStatus || "PAID"}
              </span>
            </div>
          </div>

          {/* Split Details: Shipping Address + Items */}
          <div className="order-success-grid">
            {/* Items Ordered Snapshot */}
            <div className="order-items-column">
              <h3 className="section-small-title">
                <Package size={17} />
                <span>Purchased Items ({items.length})</span>
              </h3>

              <div className="order-items-box" id="order-items-summary">
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
                  <span>Total Paid</span>
                  <span id="order-confirm-total">{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Delivery & Payment Details */}
            <div className="order-meta-column">
              <div className="delivery-details-card">
                <h3 className="section-small-title">
                  <MapPin size={17} />
                  <span>Delivery Address</span>
                </h3>
                <div className="address-display" id="order-confirm-address">
                  <p className="address-name"><strong>{shippingAddress.fullName}</strong></p>
                  <p>{shippingAddress.addressLine1}</p>
                  <p>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}</p>
                  <p className="address-phone">Phone: {shippingAddress.phone}</p>
                </div>
              </div>

              <div className="payment-details-card">
                <h3 className="section-small-title">
                  <CreditCard size={17} />
                  <span>Payment Information</span>
                </h3>
                <p><strong>Gateway:</strong> Razorpay Test Mode</p>
                {order.razorpayPaymentId && (
                  <p><strong>Payment ID:</strong> <code>{order.razorpayPaymentId}</code></p>
                )}
                {order.razorpayOrderId && (
                  <p><strong>Razorpay Order ID:</strong> <code>{order.razorpayOrderId}</code></p>
                )}
              </div>
            </div>
          </div>

          {/* Action Navigation Buttons */}
          <div className="order-success-actions">
            <Link to="/orders" className="btn-primary-action" id="btn-view-my-orders">
              <Package size={17} />
              <span>View My Orders</span>
            </Link>

            <Link to="/products" className="btn-secondary-action" id="btn-continue-shopping">
              <ShoppingBag size={17} />
              <span>Continue Shopping</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
