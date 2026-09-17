import React, { useState, useEffect, useCallback } from "react";
import { getProducts } from "../services/api";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import {
  PackageOpen,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [sort, setSort] = useState("default");

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch products from backend whenever filters change
  const fetchProductsList = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getProducts({
        search: debouncedSearch,
        category: category,
        sort: sort,
      });

      if (data && Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Something went wrong while loading products.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, sort]);

  useEffect(() => {
    fetchProductsList();
  }, [fetchProductsList]);

  // Handle clearing all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setCategory("All Categories");
    setSort("default");
  };

  return (
    <div className="products-page" id="shopkart-products-page">
      {/* Header Banner */}
      <section className="products-hero">
        <div className="products-hero-content">
          <div className="products-hero-badge">
            <Sparkles size={15} />
            <span>Discover ShopKart</span>
          </div>
          <h1 className="products-hero-title">Product Catalog</h1>
          <p className="products-hero-subtitle">
            Explore our curated collection of high-quality electronics, apparel,
            bestselling books, and home essentials.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="products-container">
        {/* Search & Filter Toolbar */}
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          category={category}
          onCategoryChange={setCategory}
          sort={sort}
          onSortChange={setSort}
          onClearFilters={handleClearFilters}
        />

        {/* Results Bar */}
        <div className="products-results-header">
          <div className="products-count-badge">
            <SlidersHorizontal size={15} />
            <span>
              {loading
                ? "Loading products..."
                : `${products.length} product${products.length === 1 ? "" : "s"} found`}
            </span>
          </div>
          {(searchTerm || (category && category !== "All Categories") || sort !== "default") && (
            <div className="active-filter-tags">
              {searchTerm && (
                <span className="filter-pill">
                  Search: "{searchTerm}"
                </span>
              )}
              {category !== "All Categories" && (
                <span className="filter-pill">Category: {category}</span>
              )}
              {sort !== "default" && (
                <span className="filter-pill">
                  Sort: {sort === "price_asc" ? "Price: Low to High" : "Price: High to Low"}
                </span>
              )}
            </div>
          )}
        </div>

        {/* State 1: Loading State */}
        {loading && (
          <div className="loading-state-container" id="products-loading-state">
            <div className="loading-spinner-large" />
            <p className="loading-text" id="loading-products-text">
              Loading products...
            </p>
            <div className="products-skeleton-grid">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="skeleton-card">
                  <div className="skeleton-image" />
                  <div className="skeleton-line skeleton-title" />
                  <div className="skeleton-line skeleton-meta" />
                  <div className="skeleton-line skeleton-btn" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* State 2: Error State */}
        {!loading && error && (
          <div className="error-state-container" id="products-error-state">
            <div className="error-icon-wrap">
              <AlertCircle size={42} />
            </div>
            <h3 className="error-title">Unable to Load Catalog</h3>
            <p className="error-description" id="error-message-text">
              {error}
            </p>
            <button
              onClick={fetchProductsList}
              className="btn-retry"
              id="btn-retry-fetch"
            >
              <RefreshCw size={16} />
              <span>Retry Request</span>
            </button>
          </div>
        )}

        {/* State 3: Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="empty-state-container" id="products-empty-state">
            <div className="empty-icon-wrap">
              <PackageOpen size={48} />
            </div>
            <h3 className="empty-title">No products found.</h3>
            <p className="empty-description">
              We couldn't find any products matching your search criteria. Try
              adjusting your search terms or clearing your category filters.
            </p>
            <button
              onClick={handleClearFilters}
              className="btn-empty-reset"
              id="btn-empty-reset"
            >
              <ShoppingBag size={16} />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}

        {/* State 4: Products Grid (Dynamic Data via .map()) */}
        {!loading && !error && products.length > 0 && (
          <div className="products-grid" id="products-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
