export default function SortBar({ sortBy, onSortChange, total, loading, selectedCategory }) {
  const sorts = [
    { key: "",           label: "Recommended" },
    { key: "discount",   label: "Best Discount" },
    { key: "rating",     label: "Top Rated" },
    { key: "price_asc",  label: "Price: Low to High" },
    { key: "price_desc", label: "Price: High to Low" },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 flex items-center justify-between flex-wrap gap-3 transition-colors duration-300">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {loading ? (
          <span className="animate-pulse text-orange-500 font-medium">Loading...</span>
        ) : (
          <>
            Showing <strong className="text-gray-900 dark:text-gray-100 font-bold">{total}</strong> results
            {selectedCategory !== "All" && (
              <span className="ml-1 text-gray-400">in <span className="font-semibold text-gray-600 dark:text-gray-300">{selectedCategory}</span></span>
            )}
          </>
        )}
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-400 font-medium hidden sm:block">Sort:</span>
        <div className="flex gap-1 flex-wrap">
          {sorts.map(({ key, label }) => (
            <button key={key} onClick={() => onSortChange(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer border
                ${sortBy === key
                  ? "bg-orange-500 border-orange-500 text-white"
                  : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-orange-300 hover:text-orange-500"
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
