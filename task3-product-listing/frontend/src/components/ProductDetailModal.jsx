import { useState } from "react";
import { useCart } from "../context/CartContext";

const fmt = (p) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

export default function ProductDetailModal({ product, onClose }) {
  const { addItem } = useCart();
  const [selectedImg, setSelectedImg] = useState("main");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "");
  const [added, setAdded] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const [sizeErr, setSizeErr] = useState(false);

  const imgSrc = imgErr
    ? `https://placehold.co/600x750/f3f4f6/9ca3af?text=${encodeURIComponent(product.name)}`
    : selectedImg === "alt" && product.image2
      ? product.image2
      : product.image;

  const handleAddToCart = () => {
    if (product.sizes?.length && !selectedSize) {
      setSizeErr(true);
      return;
    }
    addItem(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const savings = product.mrp - product.price;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-950 w-full sm:max-w-3xl lg:max-w-4xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        style={{ animation: "slideUp 0.3s ease" }}>

        {/* Close */}
        <button onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="overflow-y-auto flex-1">
          <div className="flex flex-col sm:flex-row">

            {/* ── LEFT: Images ── */}
            <div className="sm:w-[45%] shrink-0 bg-gray-50 dark:bg-gray-900">
              {/* Main image */}
              <div className="relative" style={{ aspectRatio: "4/5" }}>
                <img
                  src={imgSrc}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={() => setImgErr(true)}
                />
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  {product.discount > 0 && (
                    <span className="bg-green-500 text-white text-xs font-black px-2 py-0.5 rounded-md">{product.discount}% OFF</span>
                  )}
                  {product.isTrending && (
                    <span className="bg-orange-500 text-white text-xs font-black px-2 py-0.5 rounded-md">🔥 TRENDING</span>
                  )}
                  {product.isSale && (
                    <span className="bg-pink-500 text-white text-xs font-black px-2 py-0.5 rounded-md">SALE</span>
                  )}
                  {!product.inStock && (
                    <span className="bg-gray-700 text-white text-xs font-bold px-2 py-0.5 rounded-md">SOLD OUT</span>
                  )}
                </div>
              </div>

              {/* Thumbnail toggle */}
              {product.image2 && (
                <div className="flex gap-2 px-3 py-2">
                  {[["main", product.image], ["alt", product.image2]].map(([key, src]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedImg(key)}
                      className={`w-14 h-16 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${selectedImg === key ? "border-orange-500" : "border-transparent opacity-60 hover:opacity-100"}`}
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" onError={() => {}} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── RIGHT: Details ── */}
            <div className="flex-1 px-5 py-5 space-y-4 overflow-y-auto">

              {/* Brand + Category */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-orange-500 bg-orange-50 dark:bg-orange-500/10 px-2.5 py-1 rounded-full uppercase tracking-wide">
                  {product.brand}
                </span>
                <span className="text-xs text-gray-400">{product.subCategory}</span>
              </div>

              {/* Name */}
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-gray-100 leading-snug">
                {product.name}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                  <span>{product.rating?.toFixed(1)}</span><span>★</span>
                </div>
                <span className="text-xs text-gray-400">({product.reviewCount?.toLocaleString()} ratings)</span>
              </div>

              {/* Price */}
              <div className="pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">{fmt(product.price)}</span>
                  {product.mrp > product.price && (
                    <span className="text-sm text-gray-400 line-through">{fmt(product.mrp)}</span>
                  )}
                  {product.discount > 0 && (
                    <span className="text-sm font-bold text-green-600">({product.discount}% off)</span>
                  )}
                </div>
                {savings > 0 && (
                  <p className="text-sm text-green-600 font-semibold mt-1">You save {fmt(savings)} on this order</p>
                )}
                {product.freeShipping && (
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold mt-1">✓ Free Delivery</p>
                )}
              </div>

              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Color — <span className="text-gray-700 dark:text-gray-300 normal-case">{selectedColor}</span>
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {product.colors.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedColor(c)}
                        className={`w-8 h-8 rounded-full border-2 cursor-pointer transition-all hover:scale-110 ${selectedColor === c ? "border-orange-500 scale-110 shadow-md" : "border-gray-200 dark:border-gray-700"}`}
                        style={{ background: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wide mb-2 ${sizeErr ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}>
                    {sizeErr ? "⚠ Please select a size" : "Select Size"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => { setSelectedSize(s); setSizeErr(false); }}
                        className={`px-3 py-1.5 text-sm font-semibold border rounded-xl cursor-pointer transition-all
                          ${selectedSize === s
                            ? "border-orange-500 bg-orange-500 text-white"
                            : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-orange-400 hover:text-orange-500"
                          }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Description</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{product.description}</p>
              </div>

              {/* Add to Cart */}
              <div className="flex gap-3 pt-1 pb-2">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`flex-1 py-3.5 rounded-2xl text-sm font-extrabold transition-all cursor-pointer shadow-lg active:scale-95
                    ${added
                      ? "bg-green-500 text-white shadow-green-500/25"
                      : !product.inStock
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-orange-500/25"
                    }`}
                >
                  {added ? "✓ Added to Cart!" : !product.inStock ? "Out of Stock" : "Add to Cart"}
                </button>

                <button
                  onClick={onClose}
                  className="px-5 py-3.5 rounded-2xl text-sm font-bold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-orange-400 hover:text-orange-500 cursor-pointer transition-all"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
