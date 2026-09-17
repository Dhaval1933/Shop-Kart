import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, AlertTriangle, XCircle, Tag } from "lucide-react";

export default function ProductCard({ product }) {
  const { _id, name, price, category, image, stock } = product;

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
            e.target.src = "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=60";
          }}
        />
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

        {/* View Details Action */}
        <Link
          to={`/products/${_id}`}
          className="btn-view-details"
          id={`btn-view-details-${_id}`}
        >
          <span>View Details</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
