import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Trash2,
  HeartCrack,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Tag,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { removeFromWishlist } from "../services/api";

export default function WishlistCard({ product, onRemove }) {
  const { _id, name, price, category, image, stock } = product;

  const [isRemoving, setIsRemoving] = useState(false);
  const [removeError, setRemoveError] = useState("");

  const handleRemove = async (e) => {
    e.preventDefault();
    if (isRemoving) return;

    setIsRemoving(true);
    setRemoveError("");

    try {
      await removeFromWishlist(_id);
      if (onRemove) {
        onRemove(_id);
      }
      window.dispatchEvent(
        new CustomEvent("wishlistUpdated", {
          detail: { productId: _id, isWishlisted: false },
        })
      );
    } catch (err) {
      console.error("Failed to remove item from wishlist:", err);
      setRemoveError("Failed to remove. Please try again.");
      setIsRemoving(false);
    }
  };

  // Determine stock badge display
  let stockBadge;
  if (stock <= 0) {
    stockBadge = (
      <span className="stock-badge out-of-stock">
        <XCircle size={13} />
        <span>Out of Stock</span>
      </span>
    );
  } else if (stock <= 5) {
    stockBadge = (
      <span className="stock-badge low-stock">
        <AlertTriangle size={13} />
        <span>Only {stock} left!</span>
      </span>
    );
  } else {
    stockBadge = (
      <span className="stock-badge in-stock">
        <CheckCircle2 size={13} />
        <span>{stock} units left</span>
      </span>
    );
  }

  // Format price in Indian Rupee format
  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <div className="wishlist-card" id={`wishlist-card-${_id}`}>
      {/* Product Image & Category */}
      <div className="wishlist-card-image-wrap">
        <img
          src={image}
          alt={name}
          className="wishlist-card-image"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=60";
          }}
        />
        <span className="product-category-tag">
          <Tag size={12} />
          <span>{category}</span>
        </span>
      </div>

      {/* Product Information */}
      <div className="wishlist-card-body">
        <h3 className="wishlist-card-title" title={name}>
          {name}
        </h3>

        <div className="wishlist-card-meta">
          <div className="wishlist-card-price" id={`wishlist-price-${_id}`}>
            {formattedPrice}
          </div>
          <div className="wishlist-card-stock" id={`wishlist-stock-${_id}`}>
            {stockBadge}
          </div>
        </div>

        {/* Error notification if removal fails */}
        {removeError && (
          <div className="card-feedback-banner error" id={`remove-error-${_id}`}>
            <AlertCircle size={14} />
            <span>{removeError}</span>
          </div>
        )}

        {/* Actions: View Details and Remove from Wishlist */}
        <div className="wishlist-card-actions">
          <Link
            to={`/products/${_id}`}
            className="btn-view-details"
            id={`btn-wishlist-view-${_id}`}
          >
            <span>View Details</span>
            <ArrowRight size={15} />
          </Link>

          <button
            type="button"
            onClick={handleRemove}
            disabled={isRemoving}
            className="btn-remove-wishlist"
            id={`btn-remove-wishlist-${_id}`}
            title="Remove from Wishlist"
          >
            {isRemoving ? (
              <>
                <Loader2 size={15} className="spinner" />
                <span>Removing...</span>
              </>
            ) : (
              <>
                <Trash2 size={15} />
                <span>Remove ♥</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
