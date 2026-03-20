import { useState, useEffect } from "react";
import api from "../api.js";

const ALL_SIZES = ["XS","S","M","L","XL","XXL","28","30","32","34","36","2Y","4Y","6Y","8Y"];
const DISCOUNT_OPTIONS = [10, 20, 30, 40, 50];
const RATING_OPTIONS   = [4, 3, 2];

export default function FilterPanel({
  priceRange, minPrice, maxPrice, onMinPriceChange, onMaxPriceChange,
  selectedSize, onSizeChange,
  selectedBrands, onBrandToggle,
  minDiscount, onMinDiscountChange,
  minRating, onMinRatingChange,
  selectedCategory,
}) {
  const [brands, setBrands] = useState([]);
  const [showAllBrands, setShowAllBrands] = useState(false);

  const fmt = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

  useEffect(() => {
    api.get("/api/products/filter-options", {
      params: { category: selectedCategory },
    }).then(res => setBrands(res.data.brands || [])).catch(() => {});
  }, [selectedCategory]);

  const handleReset = () => {
    onMinPriceChange(priceRange.min);
    onMaxPriceChange(priceRange.max);
    onSizeChange("");
    onMinDiscountChange(0);
    onMinRatingChange(0);
    selectedBrands.forEach(b => onBrandToggle(b)); // clear all
  };

  const activeFilterCount = [
    minPrice > priceRange.min || maxPrice < priceRange.max,
    selectedSize !== "",
    selectedBrands.length > 0,
    minDiscount > 0,
    minRating > 0,
  ].filter(Boolean).length;

  const visibleBrands = showAllBrands ? brands : brands.slice(0, 7);

  return (
    <aside className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden lg:sticky lg:top-[100px] transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
        <h2 className="font-semibold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 bg-orange-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </h2>
        <button onClick={handleReset} className="text-xs text-orange-500 font-semibold hover:text-orange-600 cursor-pointer transition-colors">
          Clear All
        </button>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-800">

        {/* Price Range */}
        <div className="px-4 py-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Price Range</h3>

          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{fmt(minPrice)}</span>
            <span className="text-xs text-gray-400">—</span>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{fmt(maxPrice)}</span>
          </div>

          <div className="space-y-2.5">
            <input type="range" min={priceRange.min} max={priceRange.max} value={minPrice} step={100}
              onChange={(e) => { const v = Number(e.target.value); if (v < maxPrice) onMinPriceChange(v); }} />
            <input type="range" min={priceRange.min} max={priceRange.max} value={maxPrice} step={100}
              onChange={(e) => { const v = Number(e.target.value); if (v > minPrice) onMaxPriceChange(v); }} />
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            {[["Min", minPrice, priceRange.min, maxPrice - 1, onMinPriceChange],
              ["Max", maxPrice, minPrice + 1, priceRange.max, onMaxPriceChange]].map(([lbl, val, mn, mx, fn]) => (
              <input key={lbl} type="number" value={val} min={mn} max={mx}
                onChange={(e) => fn(Number(e.target.value))}
                className="w-full text-xs px-2.5 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 outline-none focus:border-orange-400 transition-colors"
                placeholder={lbl}
              />
            ))}
          </div>
        </div>

        {/* Size */}
        <div className="px-4 py-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Size</h3>
          <div className="flex flex-wrap gap-1.5">
            {ALL_SIZES.map((s) => (
              <button key={s} onClick={() => onSizeChange(selectedSize === s ? "" : s)}
                className={`px-2.5 py-1.5 text-xs font-semibold border rounded-lg transition-all duration-150 cursor-pointer
                  ${selectedSize === s
                    ? "border-orange-500 bg-orange-500 text-white"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-orange-300 hover:text-orange-500"
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Brands — dynamic from DB */}
        {brands.length > 0 && (
          <div className="px-4 py-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Brands</h3>
            <div className="space-y-2">
              {visibleBrands.map((brand) => (
                <label key={brand} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => onBrandToggle(brand)}
                    className="w-3.5 h-3.5 accent-orange-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">{brand}</span>
                </label>
              ))}
            </div>
            {brands.length > 7 && (
              <button onClick={() => setShowAllBrands(!showAllBrands)}
                className="mt-2 text-xs text-orange-500 font-semibold hover:text-orange-600 cursor-pointer transition-colors">
                {showAllBrands ? "Show less" : `+${brands.length - 7} more`}
              </button>
            )}
          </div>
        )}

        {/* Discount */}
        <div className="px-4 py-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Discount</h3>
          <div className="space-y-2">
            {DISCOUNT_OPTIONS.map((d) => (
              <label key={d} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="discount"
                  checked={minDiscount === d}
                  onChange={() => onMinDiscountChange(minDiscount === d ? 0 : d)}
                  onClick={() => { if (minDiscount === d) onMinDiscountChange(0); }}
                  className="w-3.5 h-3.5 accent-orange-500 cursor-pointer"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                  {d}% and above
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div className="px-4 py-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Rating</h3>
          <div className="space-y-2">
            {RATING_OPTIONS.map((r) => (
              <label key={r} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="rating"
                  checked={minRating === r}
                  onChange={() => onMinRatingChange(minRating === r ? 0 : r)}
                  onClick={() => { if (minRating === r) onMinRatingChange(0); }}
                  className="w-3.5 h-3.5 accent-orange-500 cursor-pointer"
                />
                <span className="text-sm text-amber-500 font-medium">{r}★ & above</span>
              </label>
            ))}
          </div>
        </div>

      </div>
    </aside>
  );
}
