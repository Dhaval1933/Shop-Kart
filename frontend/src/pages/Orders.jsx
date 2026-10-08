import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  ShoppingBag,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Sliders,
} from "lucide-react";
import { getOrders, updateOrderStatus } from "../services/api";

export default function Orders({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await getOrders();
      if (data && Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.response?.data?.message || "Failed to load your orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

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

  // Bonus Task 26: Advance status
  const handleAdvanceStatus = async (orderId, currentStatus) => {
    const statusOrder = ["PENDING_PAYMENT", "PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];
    let nextIdx = statusOrder.indexOf(currentStatus) + 1;
    if (nextIdx >= statusOrder.length || nextIdx <= 1) {
      nextIdx = 1; // loop back to PLACED
    }
    const nextStatus = statusOrder[nextIdx];

    setUpdatingId(orderId);
    try {
      const res = await updateOrderStatus(orderId, nextStatus);
      if (res && res.order) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: res.order.status } : o))
        );
      }
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "DELIVERED":
        return "badge-delivered";
      case "SHIPPED":
        return "badge-shipped";
      case "CONFIRMED":
        return "badge-confirmed";
      case "PLACED":
        return "badge-placed";
      default:
        return "badge-pending";
    }
  };

  // State 0: Unauthenticated
  if (!user) {
    return (
      <div className="cart-page" id="orders-unauth-page">
        <div className="cart-container">
          <div className="empty-state-container">
            <div className="empty-icon-wrap">
              <Package size={48} className="cart-empty-icon" />
            </div>
            <h2 className="empty-title">Log in to view your orders</h2>
            <p className="empty-description">
              Sign in to ShopKart to access your complete purchase history.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="btn-empty-reset"
              id="btn-login-orders"
            >
              <span>Log In to Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page" id="shopkart-orders-page">
      {/* Header Banner */}
      <section className="cart-hero">
        <div className="cart-hero-content">
          <div className="cart-hero-badge">
            <Package size={15} />
            <span>Order History</span>
          </div>
          <h1 className="cart-hero-title">My Orders</h1>
          <p className="cart-hero-subtitle">
            Track your shipments, view past purchases and review historical receipts.
          </p>
        </div>
      </section>

      <div className="cart-container">
        {/* Loading State */}
        {loading && (
          <div className="loading-state-container" id="orders-loading-state">
            <div className="loading-spinner-large" />
            <p className="loading-text">Loading your orders...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="error-state-container" id="orders-error-state">
            <div className="error-icon-wrap">
              <AlertCircle size={44} />
            </div>
            <h3 className="error-title">Unable to load orders</h3>
            <p className="error-description">{error}</p>
            <button onClick={fetchOrders} className="btn-retry" id="btn-retry-orders">
              <RefreshCw size={16} />
              <span>Try Again</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <div className="empty-state-container" id="orders-empty-state">
            <div className="empty-icon-wrap">
              <Package size={52} className="cart-empty-icon" />
            </div>
            <h2 className="empty-title">You have not placed any orders yet.</h2>
            <p className="empty-description">
              Explore our catalogue and pick something you love.
            </p>
            <Link to="/products" className="btn-empty-reset" id="btn-start-shopping">
              <ShoppingBag size={17} />
              <span>Start Shopping</span>
            </Link>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && orders.length > 0 && (
          <div className="orders-list-layout" id="orders-list">
            <div className="orders-count-bar">
              <span>Showing {orders.length} {orders.length === 1 ? "order" : "orders"} (Newest first)</span>
            </div>

            {orders.map((ord) => {
              const { items = [], shippingAddress = {}, totalAmount = 0 } = ord;
              const isUpdating = updatingId === ord._id;

              return (
                <article key={ord._id} className="order-card" id={`order-card-${ord._id}`}>
                  {/* Order Card Header */}
                  <div className="order-card-header">
                    <div className="order-id-group">
                      <span className="order-tag">Order #{ord._id.slice(-8)}</span>
                      <span className="order-full-id">({ord._id})</span>
                    </div>

                    <div className="order-header-badges">
                      <span className={`order-status-badge ${getStatusBadgeClass(ord.status)}`}>
                        {ord.status}
                      </span>
                      <span className="order-status-badge badge-paid">
                        <ShieldCheck size={13} />
                        {ord.paymentStatus || "PAID"}
                      </span>
                    </div>
                  </div>

                  {/* Order Meta Bar */}
                  <div className="order-meta-bar">
                    <div className="meta-bar-item">
                      <Calendar size={14} />
                      <span>Placed on {formatDate(ord.createdAt)}</span>
                    </div>
                    {shippingAddress.city && (
                      <div className="meta-bar-item">
                        <MapPin size={14} />
                        <span>Deliver to: {shippingAddress.fullName} ({shippingAddress.city}, {shippingAddress.pincode})</span>
                      </div>
                    )}
                  </div>

                  {/* Order Items Preview */}
                  <div className="order-card-items">
                    {items.map((item, idx) => (
                      <div key={item._id || idx} className="order-card-item-row">
                        <img
                          src={item.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200"}
                          alt={item.name}
                          className="order-item-thumbnail"
                        />
                        <div className="order-card-item-details">
                          <h4 className="item-title">{item.name}</h4>
                          <span className="item-snapshot-price">
                            {formatPrice(item.price)} × {item.quantity}
                          </span>
                        </div>
                        <div className="item-row-total">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Status Progression Stepper */}
                  <div className="order-status-stepper">
                    <div className={`step-node ${["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"].includes(ord.status) ? "active" : ""}`}>
                      <div className="step-circle"><CheckCircle2 size={12} /></div>
                      <span>Placed</span>
                    </div>
                    <div className={`step-line ${["CONFIRMED", "SHIPPED", "DELIVERED"].includes(ord.status) ? "active" : ""}`} />
                    <div className={`step-node ${["CONFIRMED", "SHIPPED", "DELIVERED"].includes(ord.status) ? "active" : ""}`}>
                      <div className="step-circle"><Clock size={12} /></div>
                      <span>Confirmed</span>
                    </div>
                    <div className={`step-line ${["SHIPPED", "DELIVERED"].includes(ord.status) ? "active" : ""}`} />
                    <div className={`step-node ${["SHIPPED", "DELIVERED"].includes(ord.status) ? "active" : ""}`}>
                      <div className="step-circle"><Truck size={12} /></div>
                      <span>Shipped</span>
                    </div>
                    <div className={`step-line ${ord.status === "DELIVERED" ? "active" : ""}`} />
                    <div className={`step-node ${ord.status === "DELIVERED" ? "active" : ""}`}>
                      <div className="step-circle"><Package size={12} /></div>
                      <span>Delivered</span>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="order-card-footer">
                    <div className="order-grand-total">
                      <span className="total-label">Total Amount:</span>
                      <span className="total-val">{formatPrice(totalAmount)}</span>
                    </div>

                    <div className="order-actions-group">
                      {/* Bonus Status Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleAdvanceStatus(ord._id, ord.status)}
                        disabled={isUpdating}
                        className="btn-status-toggle"
                        title="Bonus Feature: Progress status through PLACED -> CONFIRMED -> SHIPPED -> DELIVERED"
                      >
                        <Sliders size={14} />
                        <span>{isUpdating ? "Updating..." : "Cycle Status (Bonus)"}</span>
                      </button>

                      <Link
                        to={`/orders/${ord._id}`}
                        className="btn-order-details"
                        id={`btn-view-details-${ord._id}`}
                      >
                        <span>View Details</span>
                        <ChevronRight size={15} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
