import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Tag,
  Heart,
  ShoppingCart,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { addToWishlist, removeFromWishlist } from "../services/api";
import { useCart } from "../context/CartContext";

export default function ProductCard({
  product,
  isWishlistedInitially = false,
  onWishlistToggle,
}) {
  const { _id, name, price, category, image, stock } = product;
  const navigate = useNavigate();

  const { addToCart, isProductInCart, actionLoadingId, getProductCartQuantity } =
    useCart();

  const [isWishlisted, setIsWishlisted] = useState(isWishlistedInitially);
  const [isSavingWishlist, setIsSavingWishlist] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error' | 'info', message: '', action: '' }

  const isAddingToCart = actionLoadingId === _id;
  const inCart = isProductInCart(_id);
  const cartQty = getProductCartQuantity(_id);
  const isOutOfStock = stock <= 0;

  // Handle Wishlist Toggle / Add
  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSavingWishlist) return; // Prevent duplicate requests while saving

    setIsSavingWishlist(true);
    setFeedback(null);

    try {
      if (isWishlisted) {
        await removeFromWishlist(_id);
        setIsWishlisted(false);
        setFeedback({ type: "info", message: "Removed from Wishlist" });
        if (onWishlistToggle) onWishlistToggle(_id, false);
      } else {
        await addToWishlist(_id);
        setIsWishlisted(true);
        setFeedback({ type: "success", message: "Added to Wishlist!" });
        if (onWishlistToggle) onWishlistToggle(_id, true);
      }

      window.dispatchEvent(
        new CustomEvent("wishlistUpdated", {
          detail: { productId: _id, isWishlisted: !isWishlisted },
        })
      );
    } catch (err) {
      console.error("Wishlist action failed:", err);
      const status = err.response ? err.response.status : null;

      if (status === 401) {
        setFeedback({
          type: "error",
          message: "Please log in to save to your wishlist.",
          action: "login",
        });
      } else if (status === 409) {
        setIsWishlisted(true);
        setFeedback({
          type: "info",
          message: "Product is already in your wishlist.",
        });
        window.dispatchEvent(new CustomEvent("wishlistUpdated"));
      } else {
        setFeedback({
          type: "error",
          message: "Unable to save product. Please try again.",
        });
      }
    } finally {
      setIsSavingWishlist(false);
      setTimeout(() => {
        setFeedback(null);
      }, 3500);
    }
  };

  // Lab 05: Handle Add to Cart
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAddingToCart || isOutOfStock) return;

    setFeedback(null);
    const result = await addToCart(_id);

    if (result.success) {
      setFeedback({
        type: "success",
        message: inCart ? `Updated cart quantity (${cartQty + 1})` : "Added to cart!",
      });
    } else {
      if (result.status === 401) {
        setFeedback({
          type: "error",
          message: "Please log in to add items to your cart.",
          action: "login",
        });
      } else {
        setFeedback({
          type: "error",
          message: result.message || "Could not add to cart.",
        });
      }
    }

    setTimeout(() => {
      setFeedback(null);
    }, 3500);
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
    <div className="product-card" id={`product-card-${_id}`}>
      {/* Product Image & Category Overlay */}
      <div className="product-card-image-wrap">
        <img
          src={image}
          alt={name}
          className="product-card-image"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=60";
          }}
        />

        {/* Floating Heart Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          disabled={isSavingWishlist}
          className={`btn-floating-heart ${isWishlisted ? "active" : ""}`}
          id={`btn-floating-heart-${_id}`}
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          {isSavingWishlist ? (
            <Loader2 size={16} className="spinner" />
          ) : (
            <Heart
              size={18}
              fill={isWishlisted ? "currentColor" : "none"}
              className={isWishlisted ? "heart-filled" : "heart-outline"}
            />
          )}
        </button>

        <span className="product-category-tag">
          <Tag size={12} />
          <span>{category}</span>
        </span>
      </div>

      {/* Card Body */}
      <div className="product-card-body">
        <h3 className="product-card-title" title={name}>
          {name}
        </h3>

        <div className="product-card-meta">
          <div className="product-card-price" id={`product-price-${_id}`}>
            {formattedPrice}
          </div>
          <div className="product-card-stock" id={`product-stock-${_id}`}>
            {stockBadge}
          </div>
        </div>

        {/* Inline Feedback / Failure Warning */}
        {feedback && (
          <div
            className={`card-feedback-banner ${feedback.type}`}
            id={`feedback-${_id}`}
          >
            {feedback.type === "error" ? (
              <AlertCircle size={14} />
            ) : (
              <CheckCircle2 size={14} />
            )}
            <span>{feedback.message}</span>
            {feedback.action === "login" && (
              <button
                type="button"
                className="btn-feedback-action"
                onClick={() => navigate("/login")}
              >
                Log In
              </button>
            )}
          </div>
        )}

        {/* Lab 05 Task 7 & 12: Add to Cart Primary Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isAddingToCart || isOutOfStock}
          className={`btn-card-add-to-cart ${isAddingToCart ? "adding" : ""} ${
            inCart ? "in-cart" : ""
          }`}
          id={`btn-add-to-cart-${_id}`}
        >
          {isAddingToCart ? (
            <>
              <Loader2 size={15} className="spinner" />
              <span>[ Adding... ]</span>
            </>
          ) : isOutOfStock ? (
            <span>[ Out of Stock ]</span>
          ) : inCart ? (
            <>
              <ShoppingCart size={15} />
              <span>[ Add Another ({cartQty}) ]</span>
            </>
          ) : (
            <>
              <ShoppingCart size={15} />
              <span>[ Add to Cart ]</span>
            </>
          )}
        </button>

        {/* Card Actions Row: View Details & Wishlist Button */}
        <div className="product-card-actions">
          <Link
            to={`/products/${_id}`}
            className="btn-view-details"
            id={`btn-view-details-${_id}`}
          >
            <span>View Details</span>
            <ArrowRight size={14} />
          </Link>

          <button
            type="button"
            onClick={handleWishlistClick}
            disabled={isSavingWishlist}
            className={`btn-wishlist-action ${isWishlisted ? "wishlisted" : ""} ${
              isSavingWishlist ? "saving" : ""
            }`}
            id={`btn-wishlist-${_id}`}
          >
            {isSavingWishlist ? (
              <>
                <Loader2 size={14} className="spinner" />
                <span>Saving...</span>
              </>
            ) : isWishlisted ? (
              <>
                <Heart size={14} fill="currentColor" className="heart-filled" />
                <span>♥ Wishlisted</span>
              </>
            ) : (
              <>
                <Heart size={14} />
                <span>♡ Wishlist</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
