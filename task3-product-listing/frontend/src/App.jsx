import { useState, useEffect, useCallback, useRef } from "react";
import api from "./api.js";
import mockProducts from "./mockProducts.js";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider, useCart } from "./context/CartContext";

import FilterPanel from "./components/FilterPanel";
import ProductGrid from "./components/ProductGrid";
import SortBar from "./components/SortBar";
import SearchBar from "./components/SearchBar";
import Recommendations from "./components/Recommendations";
import ProfilePage from "./components/ProfilePage";
import ProductDetailModal from "./components/ProductDetailModal";
import CartPage from "./components/CartPage";
import MobileMenu from "./components/MobileMenu";
import AuthModal from "./components/AuthModal";

const NAV_ITEMS = [
  { label: "All",        type: "category",    value: "All" },
  { label: "Men",        type: "category",    value: "Men" },
  { label: "Women",      type: "category",    value: "Women" },
  { label: "Kids",       type: "category",    value: "Kids" },
  { label: "Sports",     type: "category",    value: "Sports" },
  { label: "Ethnic",     type: "subCategory", value: "Ethnic" },
  { label: "Jeans",      type: "subCategory", value: "Jeans" },
  { label: "Dresses",    type: "subCategory", value: "Dresses" },
  { label: "T-Shirts",   type: "subCategory", value: "T-Shirts" },
  { label: "Jackets",    type: "subCategory", value: "Jackets" },
  { label: "Formal",     type: "subCategory", value: "Formal" },
  { label: "Hoodies",    type: "subCategory", value: "Hoodies" },
  { label: "Sweaters",   type: "subCategory", value: "Sweaters" },
  { label: "🔥 Sale",   type: "sale",        value: "sale" },
];

function Header({ total, cartCount, onSearch, selectedNav, onNavChange, onProfileOpen, onCartOpen, setMobileMenuOpen }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-950 shadow-sm dark:border-b dark:border-gray-800 transition-colors duration-300">
      {/* Top bar */}
      <div className="border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-full mx-auto px-4 lg:px-6 h-14 flex items-center gap-3">

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer text-gray-600 dark:text-gray-300 shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo */}
          <a href="/" className="flex items-center gap-2 shrink-0 no-underline">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-md shadow-orange-300/40">B</div>
            <span className="font-display font-black text-xl tracking-tight text-gray-900 dark:text-white hidden sm:block">
              Bidyut<span className="text-orange-500"> Innovation Store</span>
            </span>
          </a>

          {/* Search */}
          <div className="flex-1 max-w-2xl mx-auto">
            <SearchBar onSearch={onSearch} />
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="hidden lg:block text-xs text-gray-500 dark:text-gray-400 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full mr-1">
              {total} items
            </span>

            {/* Wishlist */}
            <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300 cursor-pointer hidden sm:flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>

            {/* Cart */}
            <button onClick={onCartOpen} className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300 cursor-pointer flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>

            {/* Profile */}
            <button onClick={onProfileOpen} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300 cursor-pointer flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>

            {/* Theme toggle */}
            <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300 cursor-pointer hidden sm:flex items-center justify-center" title="Toggle theme">
              {theme === "dark"
                ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              }
            </button>
          </div>
        </div>
      </div>

      {/* Category nav — desktop only */}
      <div className="hidden lg:block max-w-full mx-auto px-6 overflow-x-auto">
        <nav className="flex items-center gap-0.5 h-10 min-w-max">
          {NAV_ITEMS.map((item) => {
            const isActive = selectedNav === item.value;
            const isSaleBtn = item.type === "sale";
            return (
              <button
                key={item.value}
                onClick={() => onNavChange(item)}
                className={`shrink-0 px-3.5 h-full text-sm font-semibold border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap
                  ${isSaleBtn
                    ? isActive
                      ? "border-pink-500 text-pink-600 dark:text-pink-400"
                      : "border-transparent text-pink-500 dark:text-pink-400 hover:text-pink-600"
                    : isActive
                      ? "border-orange-500 text-orange-600 dark:text-orange-400"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const { count: cartCount }   = useCart();
  const [products, setProducts]     = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [loading, setLoading]       = useState(false);
  const [total, setTotal]           = useState(0);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [isSaleFilter, setIsSaleFilter] = useState(false);
  const [minPrice, setMinPrice]     = useState(0);
  const [maxPrice, setMaxPrice]     = useState(10000);
  const [sortBy, setSortBy]         = useState("");
  const [search, setSearch]         = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [minDiscount, setMinDiscount]       = useState(0);
  const [minRating, setMinRating]           = useState(0);
  const [page, setPage]     = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const LIMIT = 20;

  const selectedNav = isSaleFilter ? "sale" : selectedSubCategory || selectedCategory;

  const handleNavChange = (item) => {
    if (item.type === "category") {
      setSelectedCategory(item.value);
      setSelectedSubCategory("");
      setIsSaleFilter(false);
    } else if (item.type === "subCategory") {
      setSelectedSubCategory(item.value);
      setSelectedCategory("All");
      setIsSaleFilter(false);
    } else if (item.type === "sale") {
      setIsSaleFilter(prev => !prev);
      setSelectedSubCategory("");
    }
  };

  const handleBrandToggle = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  // UI panels
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [profileOpen, setProfileOpen]   = useState(false);
  const [cartOpen, setCartOpen]         = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen]   = useState(false);

  const debounceTimer = useRef(null);

  useEffect(() => {
    async function fetchMeta() {
      try {
        const res = await api.get("/api/products/price-range");
        setPriceRange({ min: res.data.minPrice, max: res.data.maxPrice });
        setMinPrice(res.data.minPrice);
        setMaxPrice(res.data.maxPrice);
      } catch (err) { console.error(err.message); }
    }
    fetchMeta();
  }, []);

  const buildParams = useCallback(() => ({
    category: selectedCategory,
    subCategory: selectedSubCategory || undefined,
    isSale: isSaleFilter || undefined,
    minPrice, maxPrice,
    sortBy, search,
    size: selectedSize,
    brands: selectedBrands.join(","),
    minDiscount: minDiscount || undefined,
    minRating:   minRating   || undefined,
    limit: LIMIT,
  }), [selectedCategory, selectedSubCategory, isSaleFilter, minPrice, maxPrice, sortBy, search, selectedSize, selectedBrands, minDiscount, minRating]);

  const fetchProducts = useCallback(async (params) => {
    setLoading(true);
    try {
      const res = await api.get("/api/products", { params: { ...params, page: 1 } });
      setProducts(res.data.products);
      setTotal(res.data.total);
      setPage(1);
      setHasMore(res.data.page < res.data.pages);
    } catch (err) {
      console.error("API unavailable, showing demo products:", err.message);
      setProducts(mockProducts);
      setTotal(mockProducts.length);
      setPage(1);
      setHasMore(false);
    }
    finally { setLoading(false); }
  }, []);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await api.get("/api/products", { params: { ...buildParams(), page: nextPage } });
      setProducts(prev => [...prev, ...res.data.products]);
      setPage(nextPage);
      setHasMore(nextPage < res.data.pages);
    } catch (err) { console.error(err.message); }
    finally { setLoadingMore(false); }
  };

  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchProducts(buildParams());
    }, 300);
    return () => clearTimeout(debounceTimer.current);
  }, [buildParams, fetchProducts]);

  // Lock body scroll when panels are open
  useEffect(() => {
    document.body.style.overflow = (profileOpen || cartOpen || mobileMenuOpen) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [profileOpen, cartOpen, mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Header
        total={total}
        cartCount={cartCount}
        onSearch={setSearch}
        selectedNav={selectedNav}
        onNavChange={handleNavChange}
        onProfileOpen={() => setProfileOpen(true)}
        onCartOpen={() => setCartOpen(true)}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <main className="max-w-full mx-auto px-4 lg:px-6 py-5 grid grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr] gap-5 items-start">
        <FilterPanel
          priceRange={priceRange}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
          selectedSize={selectedSize}
          onSizeChange={setSelectedSize}
          selectedBrands={selectedBrands}
          onBrandToggle={handleBrandToggle}
          minDiscount={minDiscount}
          onMinDiscountChange={setMinDiscount}
          minRating={minRating}
          onMinRatingChange={setMinRating}
          selectedCategory={selectedCategory}
        />

        <div className="space-y-4">
          {!search.trim() && <Recommendations category={selectedCategory} />}
          <SortBar sortBy={sortBy} onSortChange={setSortBy} total={total} loading={loading} selectedCategory={selectedCategory} />
          <ProductGrid products={products} loading={loading} hasMore={hasMore} loadingMore={loadingMore} onLoadMore={loadMore} onProductClick={setSelectedProduct} />
        </div>
      </main>

      {/* Slide-in panels */}
      {selectedProduct && <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
      {profileOpen   && <ProfilePage onClose={() => setProfileOpen(false)} />}
      {cartOpen      && <CartPage    onClose={() => setCartOpen(false)} onAuthNeeded={() => { setCartOpen(false); setAuthModalOpen(true); }} />}
      {authModalOpen && <AuthModal   onClose={() => setAuthModalOpen(false)} />}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        selectedNav={selectedNav}
        onNavChange={handleNavChange}
        onProfileClick={() => setProfileOpen(true)}
        onCartClick={() => setCartOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  );
}
