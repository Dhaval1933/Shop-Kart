import React from "react";
import { Search, X, Filter, ArrowUpDown } from "lucide-react";

export default function SearchBar({
  searchTerm,
  onSearchChange,
  category,
  onCategoryChange,
  sort,
  onSortChange,
  onClearFilters,
  categories = ["All Categories", "Electronics", "Fashion", "Books", "Home"],
}) {
  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    (category && category !== "All Categories" && category !== "All") ||
    (sort && sort !== "default");

  return (
    <div className="search-filter-container">
      {/* Search Input Box */}
      <div className="search-input-wrapper">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          id="search-input"
          className="search-input"
          placeholder="Search products by name..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchTerm && (
          <button
            type="button"
            className="search-clear-btn"
            id="clear-search-btn"
            onClick={() => onSearchChange("")}
            title="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filter Toolbar Controls */}
      <div className="filter-controls-wrapper">
        {/* Category Dropdown */}
        <div className="select-wrapper">
          <Filter size={16} className="select-icon" />
          <select
            id="category-select"
            className="filter-select"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Dropdown (Bonus Challenge) */}
        <div className="select-wrapper">
          <ArrowUpDown size={16} className="select-icon" />
          <select
            id="sort-select"
            className="filter-select"
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="default">Sort by: Featured</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            className="btn-clear-filters"
            id="btn-clear-filters"
            onClick={onClearFilters}
          >
            <X size={14} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
