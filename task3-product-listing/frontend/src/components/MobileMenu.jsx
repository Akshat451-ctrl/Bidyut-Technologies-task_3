const NAV_CATS = ["All", "Men", "Women", "Kids", "Sports"];

export default function MobileMenu({ isOpen, onClose, selectedCategory, onCategoryChange, onProfileClick, onCartClick, theme, toggleTheme }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col lg:hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative bg-white dark:bg-gray-950 w-72 h-full shadow-2xl flex flex-col" style={{ animation: "slideLeft 0.25s ease" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-black text-xs">F</div>
            <span className="font-display font-black text-lg">
              Fabric<span className="text-orange-500">Hub</span>
            </span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center cursor-pointer transition-colors">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Categories */}
        <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2.5">Shop by Category</p>
          <div className="space-y-1">
            {NAV_CATS.map((cat) => (
              <button key={cat} onClick={() => { onCategoryChange(cat); onClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer
                  ${selectedCategory === cat
                    ? "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
                  }`}
              >
                <span>{cat === "All" ? "🌐" : cat === "Men" ? "👔" : cat === "Women" ? "👗" : cat === "Kids" ? "🧒" : "🏃"}</span>
                {cat}
                {selectedCategory === cat && <span className="ml-auto text-orange-500 text-xs">✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 py-4 space-y-1">
          <button onClick={() => { onProfileClick(); onClose(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            My Profile
          </button>
          <button onClick={() => { onCartClick(); onClose(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            Cart
            <span className="ml-auto bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">2</span>
          </button>
          <button onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors">
            <span className="text-base">{theme === "dark" ? "☀️" : "🌙"}</span>
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {/* Sale Banner */}
        <div className="mx-4 mt-auto mb-5 p-4 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl">
          <p className="text-white font-black text-base">🔥 SALE LIVE</p>
          <p className="text-white/80 text-xs mt-0.5">Up to 50% off on all categories</p>
        </div>
      </div>
    </div>
  );
}
