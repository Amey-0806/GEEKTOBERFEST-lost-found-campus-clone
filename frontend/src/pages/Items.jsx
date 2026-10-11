import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import ItemCard from "../components/ItemCard";
import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";

const INITIAL_FILTERS = {
  search: "",
  category: "",
  location: "",
  type: "",
  status: "",
  startDate: "",
  endDate: "",
};

function Items() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchItems = useCallback(
    async (currentFilters = filters, currentPage = page, currentLimit = limit) => {
      try {
        setLoading(true);
        setError("");

        // Validate client-side date range before making request
        if (
          currentFilters.startDate &&
          currentFilters.endDate &&
          new Date(currentFilters.startDate) > new Date(currentFilters.endDate)
        ) {
          setError("Start date cannot be after end date.");
          setLoading(false);
          return;
        }

        const params = {
          page: currentPage,
          limit: currentLimit,
        };

        Object.keys(currentFilters).forEach((key) => {
          if (currentFilters[key]) {
            params[key] = currentFilters[key];
          }
        });

        const response = await api.get("/items", { params });

        if (Array.isArray(response.data)) {
          setItems(response.data);
          setTotalItems(response.data.length);
          setTotalPages(1);
        } else {
          setItems(response.data.items || []);
          setTotalItems(response.data.total ?? response.data.totalItems ?? 0);
          setTotalPages(response.data.totalPages ?? 1);
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to fetch items. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [filters, page, limit]
  );

  useEffect(() => {
    fetchItems(filters, page, limit);
  }, [filters, page, limit, fetchItems]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters(INITIAL_FILTERS);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  const startItemIndex = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const endItemIndex = Math.min(page * limit, totalItems);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Lost & Found Items
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Discover and search reported items across campus
          </p>
        </div>

        {/* Page size dropdown */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Items per page:</span>
          <select
            value={limit}
            onChange={handleLimitChange}
            className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-blue-500"
          >
            <option value={6}>6</option>
            <option value={9}>9</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar
          value={filters.search}
          onChange={handleFilterChange}
          placeholder="Search by title, description, category, or location..."
        />
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {/* Error state */}
      {error && (
        <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Error:</span>
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchItems(filters, page, limit)}
            className="font-medium underline hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Results Header */}
      {!loading && !error && totalItems > 0 && (
        <div className="mb-4 flex items-center justify-between text-sm text-gray-500">
          <span>
            Showing <strong className="text-gray-700">{startItemIndex}</strong> -{" "}
            <strong className="text-gray-700">{endItemIndex}</strong> of{" "}
            <strong className="text-gray-700">{totalItems}</strong> items
          </span>
          <span>
            Page <strong className="text-gray-700">{page}</strong> of{" "}
            <strong className="text-gray-700">{totalPages}</strong>
          </span>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-500">Loading items...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-4 text-base font-semibold text-gray-800">
            No items found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search keywords, categories, or date filters.
          </p>
          <button
            type="button"
            onClick={handleClearFilters}
            className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                // Show first, last, and window around current page
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= page - 2 && pageNum <= page + 2)
                ) {
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => handlePageChange(pageNum)}
                      className={`min-w-[40px] rounded-lg px-3 py-2 text-sm font-medium transition ${
                        pageNum === page
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                if (pageNum === page - 3 || pageNum === page + 3) {
                  return (
                    <span key={pageNum} className="px-1 text-gray-400">
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <button
                type="button"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Items;