import { useState, useRef, useEffect, useCallback } from "react";
import api from "../api.js";
import mockProducts from "../mockProducts.js";

const fmt = (p) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

const STORAGE_KEY = "bi_recent_searches";
const POPULAR = ["T-Shirts", "Jeans", "Dresses", "Jackets", "Ethnic", "Hoodies", "Formal", "Nike", "Zara", "Levis"];

function highlight(text, query) {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-orange-100 dark:bg-orange-500/30 text-orange-600 dark:text-orange-400 rounded px-0.5 not-italic font-bold">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function getRecents() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveRecent(term) {
  if (!term.trim()) return;
  const prev = getRecents().filter(r => r.toLowerCase() !== term.toLowerCase());
  localStorage.setItem(STORAGE_KEY, JSON.stringify([term, ...prev].slice(0, 6)));
}
function removeRecent(term) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getRecents().filter(r => r !== term)));
}

// Search through mock products locally
function searchMock(q) {
  const q2 = q.toLowerCase();
  return mockProducts
    .filter(p =>
      p.name.toLowerCase().includes(q2) ||
      p.brand.toLowerCase().includes(q2) ||
      p.subCategory?.toLowerCase().includes(q2) ||
      p.category?.toLowerCase().includes(q2)
    )
    .slice(0, 6);
}

export default function SearchBar({ onSearch }) {
  const [query, setQuery]         = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [recents, setRecents]     = useState(getRecents);
  const [show, setShow]           = useState(false);
  const [loading, setLoading]     = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const debounceRef = useRef(null);
  const wrapperRef  = useRef(null);
  const inputRef    = useRef(null);

  // Close on outside click
  useEffect(() => {
    const fn = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setShow(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const fetchSugg = useCallback(async (val) => {
    if (!val.trim()) { setSuggestions([]); return; }
    setLoading(true);
    try {
      const res = await api.get("/api/products/search-suggestions", { params: { q: val } });
      const results = res.data.suggestions || [];
      // If API returns nothing, fallback to mock search
      setSuggestions(results.length ? results : searchMock(val));
    } catch {
      // API unavailable — search mock products
      setSuggestions(searchMock(val));
    } finally {
      setLoading(false);
    }
  }, []);

  const onChange = (e) => {
    const v = e.target.value;
    setQuery(v);
    setShow(true);
    setActiveIdx(-1);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSugg(v);
      onSearch(v);
    }, 250);
  };

  const pick = (name) => {
    setQuery(name);
    setShow(false);
    setActiveIdx(-1);
    saveRecent(name);
    setRecents(getRecents());
    onSearch(name);
  };

  const clear = () => {
    setQuery("");
    setSuggestions([]);
    setShow(false);
    setActiveIdx(-1);
    onSearch("");
    inputRef.current?.focus();
  };

  const deletRecent = (e, term) => {
    e.stopPropagation();
    removeRecent(term);
    setRecents(getRecents());
  };

  // Keyboard navigation
  const allItems = query.trim()
    ? suggestions
    : recents.map(r => ({ _id: r, name: r, isRecent: true }));

  const onKeyDown = (e) => {
    if (!show) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, allItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      if (activeIdx >= 0 && allItems[activeIdx]) {
        pick(allItems[activeIdx].name);
      } else if (query.trim()) {
        setShow(false);
        saveRecent(query.trim());
        setRecents(getRecents());
        onSearch(query.trim());
      }
    } else if (e.key === "Escape") {
      setShow(false);
      setActiveIdx(-1);
    }
  };

  const showDropdown = show && (query.trim() ? (suggestions.length > 0 || loading || query) : (recents.length > 0));

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {/* Input */}
      <div className="flex items-center h-10 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 gap-2.5 focus-within:bg-white dark:focus-within:bg-gray-700 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-400/20 transition-all duration-200">
        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={onChange}
          onFocus={() => setShow(true)}
          onKeyDown={onKeyDown}
          placeholder="Search clothes, brands, categories..."
          autoComplete="off"
          className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        />
        {loading && (
          <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-orange-500 rounded-full animate-spin shrink-0" />
        )}
        {query && !loading && (
          <button onClick={clear} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 shrink-0 cursor-pointer leading-none text-base">✕</button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-[60] overflow-hidden"
          style={{ animation: "slideDown 0.15s ease" }}
        >
          {/* ── Searching state ── */}
          {query.trim() && loading && (
            <div className="px-4 py-5 text-sm text-center text-gray-400 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin" />
              Searching...
            </div>
          )}

          {/* ── Search results ── */}
          {query.trim() && !loading && suggestions.length > 0 && (
            <>
              <div className="px-4 py-2 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Results</p>
                <span className="text-[10px] text-gray-400">{suggestions.length} found</span>
              </div>
              {suggestions.map((s, idx) => (
                <div
                  key={s._id}
                  onClick={() => pick(s.name)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-gray-50 dark:border-gray-800/50 last:border-0
                    ${activeIdx === idx ? "bg-orange-50 dark:bg-orange-500/10" : "hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                >
                  <div className="w-11 h-11 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                    <img
                      src={s.image}
                      alt={s.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = `https://placehold.co/44x44/f3f4f6/9ca3af?text=${encodeURIComponent(s.brand?.[0] || "?")}` }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {highlight(s.name, query)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {highlight(s.brand, query)}
                      {s.category && <span className="ml-1 text-gray-300 dark:text-gray-600">·</span>}
                      {s.category && <span className="ml-1">{s.category}</span>}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100">{fmt(s.price)}</p>
                    {s.discount > 0 && (
                      <p className="text-[11px] text-green-600 font-semibold">{s.discount}% off</p>
                    )}
                  </div>
                </div>
              ))}
              {/* View all results */}
              <button
                onClick={() => { setShow(false); saveRecent(query); setRecents(getRecents()); onSearch(query); }}
                className="w-full px-4 py-3 text-sm font-semibold text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 text-center transition-colors border-t border-gray-100 dark:border-gray-800 cursor-pointer"
              >
                View all results for &ldquo;{query}&rdquo; →
              </button>
            </>
          )}

          {/* ── No results ── */}
          {query.trim() && !loading && suggestions.length === 0 && (
            <div className="px-4 py-6 text-center">
              <p className="text-2xl mb-2">🔍</p>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No results for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-gray-400 mt-1">Try searching with a different keyword or brand name</p>
            </div>
          )}

          {/* ── Recent searches (when input is empty) ── */}
          {!query.trim() && recents.length > 0 && (
            <>
              <div className="px-4 py-2 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Recent Searches</p>
                <button
                  onClick={() => { localStorage.removeItem(STORAGE_KEY); setRecents([]); }}
                  className="text-[10px] text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                >
                  Clear all
                </button>
              </div>
              {recents.map((r, idx) => (
                <div
                  key={r}
                  onClick={() => pick(r)}
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors border-b border-gray-50 dark:border-gray-800/50 last:border-0
                    ${activeIdx === idx ? "bg-orange-50 dark:bg-orange-500/10" : "hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                >
                  <svg className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{r}</span>
                  <button
                    onClick={(e) => deletRecent(e, r)}
                    className="text-gray-300 hover:text-red-400 dark:text-gray-600 dark:hover:text-red-400 cursor-pointer text-xs transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </>
          )}

          {/* ── Popular searches (when empty and no recents) ── */}
          {!query.trim() && recents.length === 0 && (
            <>
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Popular Searches</p>
              </div>
              <div className="px-4 py-3 flex flex-wrap gap-2">
                {POPULAR.map(term => (
                  <button
                    key={term}
                    onClick={() => pick(term)}
                    className="px-3 py-1.5 text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full hover:bg-orange-100 dark:hover:bg-orange-500/20 hover:text-orange-600 dark:hover:text-orange-400 transition-all cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
