import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";

const fmt = (p) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

export default function SearchBar({ onSearch }) {
  const [query, setQuery]           = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [show, setShow]             = useState(false);
  const [loading, setLoading]       = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef  = useRef(null);

  useEffect(() => {
    const fn = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setShow(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const fetchSugg = useCallback(async (val) => {
    if (!val.trim()) { setSuggestions([]); return; }
    setLoading(true);
    try {
      const res = await axios.get("/api/products/search-suggestions", { params: { q: val } });
      setSuggestions(res.data.suggestions);
    } catch { setSuggestions([]); }
    finally { setLoading(false); }
  }, []);

  const onChange = (e) => {
    const v = e.target.value;
    setQuery(v);
    setShow(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { fetchSugg(v); onSearch(v); }, 300);
  };

  const pick = (name) => { setQuery(name); setShow(false); onSearch(name); };
  const clear = () => { setQuery(""); setSuggestions([]); setShow(false); onSearch(""); };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="flex items-center h-10 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 gap-2.5 focus-within:bg-white dark:focus-within:bg-gray-700 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-400/20 transition-all duration-200">
        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text" value={query} onChange={onChange}
          onFocus={() => query && setShow(true)}
          onKeyDown={(e) => { if (e.key === "Escape") setShow(false); }}
          placeholder="Search for clothes, brands..."
          autoComplete="off"
          className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        />
        {loading && <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-orange-500 rounded-full animate-spin shrink-0" />}
        {query && !loading && (
          <button onClick={clear} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 shrink-0 cursor-pointer text-sm leading-none">✕</button>
        )}
      </div>

      {show && (suggestions.length > 0 || (query && !loading)) && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden" style={{ animation: "slideDown 0.18s ease" }}>
          {suggestions.length > 0 ? (
            <>
              <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-gray-800">Suggestions</p>
              {suggestions.map((s) => (
                <div key={s._id} onClick={() => pick(s.name)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 dark:hover:bg-gray-800 cursor-pointer transition-colors border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                    <img src={s.image} alt={s.name} className="w-full h-full object-cover img-zoom" onError={(e) => e.target.src = "https://via.placeholder.com/48"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.brand} · {s.category}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{fmt(s.price)}</p>
                    {s.discount > 0 && <p className="text-xs text-green-600 font-semibold">{s.discount}% off</p>}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <p className="px-4 py-4 text-sm text-center text-gray-400">No results for "{query}"</p>
          )}
        </div>
      )}
    </div>
  );
}
