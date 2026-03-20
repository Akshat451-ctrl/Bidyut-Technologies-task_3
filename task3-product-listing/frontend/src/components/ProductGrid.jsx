import ProductCard from "./ProductCard";

function Skeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
      <div className="bg-gray-100 dark:bg-gray-800 animate-pulse" style={{ aspectRatio: "4/5" }} />
      <div className="p-3 space-y-2.5">
        <div className="h-3 w-1/3 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
        <div className="h-4 w-4/5 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
        <div className="h-3 w-1/2 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
        <div className="h-5 w-2/5 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
      </div>
    </div>
  );
}

export default function ProductGrid({ products, loading, hasMore, loadingMore, onLoadMore, onProductClick }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="font-bold text-lg text-gray-700 dark:text-gray-300 mb-1">No Products Found</h3>
        <p className="text-sm text-gray-400 max-w-xs">Try changing your filters or search with different keywords.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4">
        {products.map((p) => <ProductCard key={p._id} product={p} onProductClick={onProductClick} />)}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="px-10 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:border-orange-400 hover:text-orange-500 transition-all cursor-pointer disabled:opacity-60 flex items-center gap-2 shadow-sm"
          >
            {loadingMore
              ? <><div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" /> Loading...</>
              : "Load More Products"
            }
          </button>
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <p className="text-center text-xs text-gray-400 py-2">Showing all {products.length} products</p>
      )}
    </div>
  );
}
