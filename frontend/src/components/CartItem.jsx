import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Minus, Trash2, Loader2, AlertTriangle, Tag } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function CartItem({ item }) {
  const { product, quantity } = item;
  const { updateQuantity, removeFromCart, actionLoadingId } = useCart();

  const [itemError, setItemError] = useState("");

  if (!product) return null;

  const isCurrentActionLoading = actionLoadingId === product._id;
  const isMaxStockReached = quantity >= product.stock;

  // Format currency
  const formatPrice = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleIncrement = async () => {
    if (isCurrentActionLoading) return;
    if (isMaxStockReached) {
      setItemError(`Only ${product.stock} units available in stock.`);
      setTimeout(() => setItemError(""), 3000);
      return;
    }
    setItemError("");
    const result = await updateQuantity(product._id, quantity + 1);
    if (!result.success) {
      setItemError(result.message);
      setTimeout(() => setItemError(""), 3500);
    }
  };

  const handleDecrement = async () => {
    if (isCurrentActionLoading) return;
    if (quantity <= 1) {
      return; // Section 14: For quantity = 1, use explicit Remove
    }
    setItemError("");
    const result = await updateQuantity(product._id, quantity - 1);
    if (!result.success) {
      setItemError(result.message);
      setTimeout(() => setItemError(""), 3500);
    }
  };

  const handleRemove = async () => {
    if (isCurrentActionLoading) return;
    setItemError("");
    const result = await removeFromCart(product._id);
    if (!result.success) {
      setItemError(result.message);
      setTimeout(() => setItemError(""), 3500);
    }
  };

  return (
    <div className="cart-item-card" id={`cart-item-${product._id}`}>
      {/* Product Image */}
      <Link to={`/products/${product._id}`} className="cart-item-image-wrap">
        <img
          src={product.image}
          alt={product.name}
          className="cart-item-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=60";
          }}
        />
      </Link>

      {/* Product Details & Meta */}
      <div className="cart-item-info">
        <div className="cart-item-header">
          <Link
            to={`/products/${product._id}`}
            className="cart-item-name"
            id={`cart-item-name-${product._id}`}
          >
            {product.name}
          </Link>
          <span className="cart-item-category">
            <Tag size={12} />
            <span>{product.category}</span>
          </span>
        </div>

        <div className="cart-item-unit-price">
          Unit Price: <strong>{formatPrice(product.price)}</strong>
        </div>

        {/* Stock Alert Warning if user hits max stock */}
        {isMaxStockReached && (
          <div className="cart-stock-warning">
            <AlertTriangle size={13} />
            <span>Max available stock reached ({product.stock} units)</span>
          </div>
        )}

        {/* Error message if action failed */}
        {itemError && (
          <div className="cart-item-error-msg" id={`cart-error-${product._id}`}>
            {itemError}
          </div>
        )}

        {/* Controls row: Quantity selector & Remove button */}
        <div className="cart-item-actions-row">
          <div className="cart-qty-selector" id={`cart-qty-controls-${product._id}`}>
            <button
              type="button"
              onClick={handleDecrement}
              disabled={quantity <= 1 || isCurrentActionLoading}
              className="btn-qty-control btn-qty-minus"
              id={`btn-cart-minus-${product._id}`}
              title={
                quantity <= 1
                  ? "Minimum quantity is 1 (use Remove button to delete)"
                  : "Decrease quantity"
              }
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>

            <span
              className="cart-qty-value"
              id={`cart-qty-val-${product._id}`}
              aria-live="polite"
            >
              {isCurrentActionLoading ? (
                <Loader2 size={13} className="spinner" />
              ) : (
                quantity
              )}
            </span>

            <button
              type="button"
              onClick={handleIncrement}
              disabled={isMaxStockReached || isCurrentActionLoading}
              className="btn-qty-control btn-qty-plus"
              id={`btn-cart-plus-${product._id}`}
              title={
                isMaxStockReached
                  ? `Cannot exceed available stock of ${product.stock}`
                  : "Increase quantity"
              }
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            disabled={isCurrentActionLoading}
            className="btn-cart-remove"
            id={`btn-cart-remove-${product._id}`}
            title="Remove from cart"
          >
            {isCurrentActionLoading ? (
              <Loader2 size={14} className="spinner" />
            ) : (
              <Trash2 size={14} />
            )}
            <span>Remove</span>
          </button>
        </div>
      </div>

      {/* Item Total (Price * Quantity) */}
      <div className="cart-item-total-col">
        <span className="cart-item-total-label">Total</span>
        <span
          className="cart-item-total-price"
          id={`cart-item-total-${product._id}`}
        >
          {formatPrice(product.price * quantity)}
        </span>
      </div>
    </div>
  );
}
