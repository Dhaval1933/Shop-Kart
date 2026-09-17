import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProductById } from "../services/api";
import {
  ArrowLeft,
  ShoppingBag,
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Truck,
  ShieldCheck,
  RotateCcw,
  Tag,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartFeedback, setCartFeedback] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchDetail = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getProductById(id);
        if (isMounted) {
          if (data && data.product) {
            setProduct(data.product);
          } else {
            setError("Product not found");
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error loading product details:", err);
          if (err.response && err.response.status === 404) {
            setError("Product not found. It may have been removed.");
          } else if (err.response && err.response.status === 400) {
            setError("Invalid product ID format.");
          } else {
            setError("Something went wrong while loading the product details.");
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Handle Add to Cart button (UI only for Lab-03)
  const handleAddToCart = () => {
    setCartFeedback(true);
    setTimeout(() => {
      setCartFeedback(false);
    }, 4000);
  };

  // Loading State
  if (loading) {
    return (
      <div className="product-details-page" id="product-details-loading">
        <div className="details-container">
          <div className="loading-state-container">
            <div className="loading-spinner-large" />
            <p className="loading-text">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error State (e.g. 404 Not Found or 400 Invalid ID)
  if (error || !product) {
    return (
      <div className="product-details-page" id="product-details-error">
        <div className="details-container">
          <div className="error-state-container">
            <div className="error-icon-wrap">
              <AlertCircle size={42} />
            </div>
            <h2 className="error-title">Product Unavailable</h2>
            <p className="error-description">{error || "Product not found"}</p>
            <Link to="/products" className="btn-retry" id="btn-back-to-products-error">
              <ArrowLeft size={16} />
              <span>Back to Products</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Format Price
  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(product.price);

  // Stock status logic
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="product-details-page" id={`product-details-${product._id}`}>
      <div className="details-container">
        {/* Navigation Breadcrumbs & Back Button */}
        <div className="details-nav-bar">
          <button
            onClick={() => navigate(-1)}
            className="btn-back-nav"
            id="btn-back-nav"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <div className="breadcrumbs">
            <Link to="/home">Home</Link>
            <span className="breadcrumb-separator">/</span>
            <Link to="/products">Products</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{product.category}</span>
          </div>
        </div>

        {/* Add to Cart Toast Notification */}
        {cartFeedback && (
          <div className="cart-feedback-toast" id="cart-feedback-toast">
            <div className="toast-content">
              <CheckCircle2 size={18} className="toast-icon" />
              <div>
                <strong>{product.name}</strong> added to cart!
                <div className="toast-subtext">
                  Cart management & checkout will be available in Lab-04.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Details Grid */}
        <div className="product-details-card">
          {/* Left Column: Large Product Image */}
          <div className="product-details-image-section">
            <div className="large-image-wrapper">
              <img
                src={product.image}
                alt={product.name}
                id="product-detail-image"
                className="product-detail-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80";
                }}
              />
              <span className="category-floating-badge" id="product-detail-category">
                <Tag size={13} />
                <span>{product.category}</span>
              </span>
            </div>
          </div>

          {/* Right Column: Product Information & Purchase Section */}
          <div className="product-details-info-section">
            <div className="product-header">
              <div className="product-badge-tier">
                <Sparkles size={14} />
                <span>ShopKart Verified Item</span>
              </div>
              <h1 className="product-detail-title" id="product-detail-name">
                {product.name}
              </h1>
            </div>

            {/* Price Section */}
            <div className="product-pricing-box">
              <div className="price-display" id="product-detail-price">
                {formattedPrice}
              </div>
              <span className="price-tax-label">Inclusive of all taxes</span>
            </div>

            {/* Stock Status */}
            <div className="stock-status-row" id="product-detail-stock">
              {isOutOfStock ? (
                <div className="stock-alert stock-danger">
                  <XCircle size={16} />
                  <span>Out of Stock — Currently unavailable</span>
                </div>
              ) : isLowStock ? (
                <div className="stock-alert stock-warning">
                  <AlertTriangle size={16} />
                  <span>Hurry! Only {product.stock} units left in stock</span>
                </div>
              ) : (
                <div className="stock-alert stock-success">
                  <CheckCircle2 size={16} />
                  <span>In Stock — {product.stock} units available</span>
                </div>
              )}
            </div>

            {/* Product Description */}
            <div className="product-description-block">
              <h3 className="section-subtitle">About this item</h3>
              <p className="product-detail-description" id="product-detail-description">
                {product.description}
              </p>
            </div>

            {/* Inline Cart Feedback */}
            {cartFeedback && (
              <div className="inline-cart-feedback" id="inline-cart-feedback">
                <CheckCircle2 size={18} />
                <span>
                  <strong>{product.name}</strong> added to cart! Cart checkout will arrive in Lab-04.
                </span>
              </div>
            )}

            {/* Add to Cart Action */}
            <div className="product-actions-block">
              <button
                type="button"
                className="btn-add-to-cart"
                id="btn-add-to-cart"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
              >
                <ShoppingCart size={20} />
                <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
              </button>

              <Link
                to="/products"
                className="btn-secondary-continue"
                id="btn-continue-shopping"
              >
                <ShoppingBag size={18} />
                <span>Continue Shopping</span>
              </Link>
            </div>

            {/* Delivery & Security Perks */}
            <div className="product-perks-row">
              <div className="perk-mini">
                <Truck size={18} />
                <div>
                  <div className="perk-mini-title">Fast Delivery</div>
                  <div className="perk-mini-sub">2-3 business days</div>
                </div>
              </div>
              <div className="perk-mini">
                <RotateCcw size={18} />
                <div>
                  <div className="perk-mini-title">30-Day Return</div>
                  <div className="perk-mini-sub">Hassle-free guarantee</div>
                </div>
              </div>
              <div className="perk-mini">
                <ShieldCheck size={18} />
                <div>
                  <div className="perk-mini-title">Authentic Product</div>
                  <div className="perk-mini-sub">100% Genuine ShopKart</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
