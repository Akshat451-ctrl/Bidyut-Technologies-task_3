import { useState } from "react";

const fmt = (p) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

function WishlistBtn({ wished, onToggle }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer"
    >
      <svg className={`w-4 h-4 transition-colors ${wished ? "fill-red-500 text-red-500" : "fill-none text-gray-400"}`} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  );
}

export default function ProductCard({ product }) {
  const [wished, setWished] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [added, setAdded]   = useState(false);

  const handleAdd = (e) => {
    e.stopPropagation();
    if (!product.inStock || added) return;
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const imgSrc = imgErr
    ? `https://placehold.co/480x600/f3f4f6/9ca3af?text=${encodeURIComponent(product.name)}`
    : hovered && product.image2 ? product.image2 : product.image;

  return (
    <div
      className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image container - portrait ratio */}
      <div className="relative overflow-hidden bg-gray-50 dark:bg-gray-800" style={{ aspectRatio: "4/5" }}>
        <img
          src={imgSrc}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
          onError={() => setImgErr(true)}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.discount > 0 && (
            <span className="bg-green-500 text-white text-[11px] font-black px-2 py-0.5 rounded-md leading-tight">
              {product.discount}% OFF
            </span>
          )}
          {product.isTrending && (
            <span className="bg-orange-500 text-white text-[11px] font-black px-2 py-0.5 rounded-md leading-tight">
              🔥 TRENDING
            </span>
          )}
          {product.isSale && (
            <span className="bg-pink-500 text-white text-[11px] font-black px-2 py-0.5 rounded-md leading-tight">
              SALE
            </span>
          )}
          {!product.inStock && (
            <span className="bg-gray-700 text-white text-[11px] font-bold px-2 py-0.5 rounded-md leading-tight">
              SOLD OUT
            </span>
          )}
        </div>

        <WishlistBtn wished={wished} onToggle={() => setWished(!wished)} />

        {/* Color swatches */}
        {product.colors && product.colors.length > 0 && (
          <div className="absolute bottom-3 left-3 flex gap-1.5">
            {product.colors.slice(0, 4).map((c, i) => (
              <span key={i} className="w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"
                style={{ background: c }} title={c} />
            ))}
            {product.colors.length > 4 && (
              <span className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-600 border-2 border-white text-[8px] font-bold flex items-center justify-center text-gray-600 dark:text-gray-300">
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Quick add overlay */}
        <div className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${hovered && product.inStock ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"}`}>
          <button
            onClick={handleAdd}
            className={`w-full py-2.5 text-sm font-bold transition-all cursor-pointer
              ${added ? "bg-green-500 text-white" : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-orange-500 dark:hover:bg-orange-500 dark:hover:text-white"}`}
          >
            {added ? "✓ Added to Cart!" : "Quick Add"}
          </button>
        </div>
      </div>

      {/* Card body */}
      <div className="p-3">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">{product.brand}</p>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug mb-2">{product.name}</h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex items-center gap-0.5 bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-md leading-none">
            <span>{product.rating.toFixed(1)}</span>
            <span>★</span>
          </div>
          <span className="text-xs text-gray-400">({product.reviewCount?.toLocaleString()})</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-2.5">
          <span className="text-base font-extrabold text-gray-900 dark:text-gray-100">{fmt(product.price)}</span>
          {product.mrp > product.price && (
            <span className="text-xs text-gray-400 line-through">{fmt(product.mrp)}</span>
          )}
          {product.discount > 0 && (
            <span className="text-xs font-bold text-green-600">({product.discount}% off)</span>
          )}
        </div>

        {/* Sizes quick pick */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="flex gap-1 flex-wrap mb-2.5">
            {product.sizes.slice(0, 5).map((s) => (
              <span key={s} className="text-[10px] px-1.5 py-0.5 border border-gray-200 dark:border-gray-700 rounded text-gray-500 dark:text-gray-400">{s}</span>
            ))}
            {product.sizes.length > 5 && <span className="text-[10px] text-gray-400">+{product.sizes.length - 5}</span>}
          </div>
        )}

        {/* Free shipping */}
        {product.freeShipping && (
          <p className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">✓ Free Delivery</p>
        )}
      </div>
    </div>
  );
}
