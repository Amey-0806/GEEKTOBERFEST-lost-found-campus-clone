import React from "react";

function FilterBar({ filters, onChange, onClear }) {
  return (
    <div className="mb-6 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {/* Category */}
        <div>
          <label htmlFor="filter-category" className="mb-1 block text-xs font-semibold uppercase text-gray-500">
            Category
          </label>
          <select
            id="filter-category"
            name="category"
            value={filters.category || ""}
            onChange={onChange}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Documents">Documents</option>
            <option value="Clothing">Clothing</option>
            <option value="Accessories">Accessories</option>
            <option value="Books">Books</option>
            <option value="Keys">Keys</option>
            <option value="Bags">Bags</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="filter-location" className="mb-1 block text-xs font-semibold uppercase text-gray-500">
            Location
          </label>
          <select
            id="filter-location"
            name="location"
            value={filters.location || ""}
            onChange={onChange}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value="">All Locations</option>
            <option value="Library">Library</option>
            <option value="Canteen">Canteen</option>
            <option value="Hostel">Hostel</option>
            <option value="Main Gate">Main Gate</option>
            <option value="Academic Block">Academic Block</option>
            <option value="Sports Complex">Sports Complex</option>
            <option value="Parking">Parking</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Type */}
        <div>
          <label htmlFor="filter-type" className="mb-1 block text-xs font-semibold uppercase text-gray-500">
            Type
          </label>
          <select
            id="filter-type"
            name="type"
            value={filters.type || ""}
            onChange={onChange}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value="">All Types</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="filter-status" className="mb-1 block text-xs font-semibold uppercase text-gray-500">
            Status
          </label>
          <select
            id="filter-status"
            name="status"
            value={filters.status || ""}
            onChange={onChange}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="claimed">Claimed</option>
            <option value="recovered">Recovered</option>
          </select>
        </div>
      </div>

      {/* Date Range and Actions */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label htmlFor="filter-start-date" className="mb-1 block text-xs font-semibold uppercase text-gray-500">
              From Date
            </label>
            <input
              id="filter-start-date"
              type="date"
              name="startDate"
              value={filters.startDate || ""}
              onChange={onChange}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label htmlFor="filter-end-date" className="mb-1 block text-xs font-semibold uppercase text-gray-500">
              To Date
            </label>
            <input
              id="filter-end-date"
              type="date"
              name="endDate"
              value={filters.endDate || ""}
              onChange={onChange}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onClear}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}

export default FilterBar;
