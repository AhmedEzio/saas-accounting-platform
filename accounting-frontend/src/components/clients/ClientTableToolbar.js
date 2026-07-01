"use client";

import { useState } from "react";

const TABS = ["All", "Clients", "Vendors"];
const SORT_OPTS = ["Newest", "Oldest", "Balance ↑", "Balance ↓"];

export default function ClientTableToolbar({
  search,
  onSearch,
  tab,
  onTabChange,
  sort,
  onSortChange,
}) {
  const [sortOpen, setSortOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2.5 px-4 sm:px-5 pt-4 sm:pt-[18px] pb-3 border-b border-gray-100">

      {/* Search — full width on mobile */}
      <div className="relative w-full sm:flex-1 sm:min-w-[160px] sm:max-w-[260px]">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </span>
        <input
          id="client-search"
          type="text"
          placeholder="Filter by name..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border-[1.5px] border-gray-200 rounded-[10px] text-[13.5px] text-gray-700 bg-gray-50 outline-none transition-colors focus:border-[#1b2b6b] focus:bg-white"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 bg-gray-100 rounded-[10px] p-[3px]">
        {TABS.map((t) => {
          const active =
            tab === t ||
            (t === "Clients" && tab === "Client") ||
            (t === "Vendors" && tab === "Vendor");
          return (
            <button
              key={t}
              id={`tab-${t.toLowerCase()}`}
              onClick={() =>
                onTabChange(
                  t === "Clients" ? "Client" : t === "Vendors" ? "Vendor" : "All"
                )
              }
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-[12px] sm:text-[13px] font-semibold border-none cursor-pointer transition-all whitespace-nowrap ${
                active
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 bg-transparent hover:text-gray-700"
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>

      {/* Sort — pushed to the far right */}
      <div className="relative ml-auto">
        <button
          id="sort-btn"
          onClick={() => setSortOpen((o) => !o)}
          className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 border-[1.5px] border-gray-200 rounded-[10px] bg-white text-[12px] sm:text-[13px] font-semibold text-gray-700 cursor-pointer whitespace-nowrap"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="20" y2="12" />
            <line x1="12" y1="18" x2="20" y2="18" />
          </svg>
          Sort: {sort}
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {sortOpen && (
          <div className="absolute top-[calc(100%+6px)] right-0 bg-white border-[1.5px] border-gray-200 rounded-[10px] shadow-[0_8px_24px_rgba(0,0,0,.1)] z-50 min-w-[150px] overflow-hidden">
            {SORT_OPTS.map((o) => (
              <div
                key={o}
                id={`sort-opt-${o.replace(/\s/g, "-").toLowerCase()}`}
                onClick={() => { onSortChange(o); setSortOpen(false); }}
                className={`px-4 py-2.5 text-[13px] cursor-pointer transition-colors hover:bg-gray-50 ${
                  sort === o ? "text-[#1b2b6b] font-bold" : "text-gray-700"
                }`}
              >
                {o}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
