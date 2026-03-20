import { useEffect, useState } from "react";
import axios from "axios";

const fmt = (p) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

export default function Recommendations({ category }) {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(false);

  const title = category && category !== "All" ? `Trending in ${category}` : "Trending This Week";

  useEffect(() => {
    setLoading(true);
    axios.get("/api/products/recommendations", {
      params: { category: category !== "All" ? category : undefined },
    })
      .then((r) => setItems(r.data.products))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [category]);

  if (loading || !items.length) return null;

  return (
    <section className="bg-gradient-to-r from-orange-50 to-pink-50 dark:from-gray-900 dark:to-gray-900 border border-orange-100 dark:border-gray-800 rounded-2xl p-4 transition-colors duration-300">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-bold text-base flex items-center gap-2">
          🔥 <span>{title}</span>
        </h2>
        <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/10 px-2.5 py-1 rounded-full">
          AI Picks
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((p) => (
          <div key={p._id} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
            <div className="overflow-hidden bg-gray-50 dark:bg-gray-700" style={{ aspectRatio: "1/1" }}>
              <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
                onError={(e) => e.target.src = `https://placehold.co/200x200/f9fafb/9ca3af?text=${encodeURIComponent(p.name)}`} />
            </div>
            <div className="p-2.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide truncate">{p.brand}</p>
              <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">{p.name}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-sm font-extrabold text-gray-900 dark:text-gray-100">{fmt(p.price)}</span>
                {p.discount > 0 && (
                  <span className="text-[11px] font-bold text-green-600">{p.discount}% off</span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded font-bold">{p.rating}★</span>
                <span className="text-[10px] text-gray-400">({p.reviewCount})</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
