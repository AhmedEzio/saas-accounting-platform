/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback } from "react";
import ClientStatCards from "@/components/clients/ClientStatCards";
import ClientTableToolbar from "@/components/clients/ClientTableToolbar";
import ClientsTable from "@/components/clients/ClientsTable";
import AddClientModal from "@/components/clients/AddClientModal";

const PAGE_SIZE = 5;

/* ─── auth helper ─────────────────────────────────────────────────────────── */
function getAuthHeaders() {
  const token = localStorage.getItem("accounting_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/* ─── API helpers ─────────────────────────────────────────────────────────── */
async function apiFetch(path, options = {}) {
  const res = await fetch(`http://localhost:8000/api${path}`, {
    ...options,
    headers: { ...getAuthHeaders(), ...(options.headers || {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

/* ─── page ────────────────────────────────────────────────────────────────── */
export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ clients: 0, vendors: 0, balance: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Newest");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [showModal, setShowModal] = useState(false);

  /* ── UPDATED: Map UI labels to match backend expected parameters ── */
  const sortParams = {
    Newest: { sortBy: "createdAt", sortOrder: "desc" },
    Oldest: { sortBy: "createdAt", sortOrder: "asc" },
    "Balance ↑": { sortBy: "currentBalance", sortOrder: "asc" },
    "Balance ↓": { sortBy: "currentBalance", sortOrder: "desc" },
  };

  /* ── fetch clients from server ── */
  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page,
        limit: PAGE_SIZE,
        ...(tab !== "All" ? { type: tab.toLowerCase() } : {}),
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(sortParams[sort] || {}), // Spreads matching parameters: sortBy and sortOrder
      });

      const data = await apiFetch(`/clients?${params}`);
      setClients(data.results?.data ?? []);
      setTotal(data.results?.total ?? 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, tab, search, sort]);

  /* ── fetch summary stats (all records, no filters) ── */
  const fetchStats = useCallback(async () => {
    try {
      const [clientData, vendorData] = await Promise.all([
        apiFetch("/clients?type=client&limit=1"),
        apiFetch("/clients?type=vendor&limit=1"),
      ]);
      // balance stat comes from the full unfiltered list — fetch once with high limit
      const allData = await apiFetch("/clients?limit=1000");
      const allClients = allData.results?.data ?? [];
      setStats({
        clients: clientData.results?.total ?? 0,
        vendors: vendorData.results?.total ?? 0,
        balance: allClients.reduce((s, c) => s + (c.balance ?? 0), 0),
      });
    } catch {
      // stats are non-critical; fail silently
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function handleAdd(formData) {
    try {
      await apiFetch("/clients", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setPage(1);
      await fetchClients();
      await fetchStats();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleEdit(id, formData) {
    await apiFetch(`/clients/${id}`, {
      method: "PUT",
      body: JSON.stringify(formData),
    });
    await fetchClients();
    await fetchStats();
  }

  async function handleDelete(id) {
    try {
      await apiFetch(`/clients/${id}`, { method: "DELETE" });
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      // if deleting the last item on this pagce, go back one
      if (clients.length === 1 && page > 1) setPage((p) => p - 1);
      else await fetchClients();
      await fetchStats();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleReactivate(id) {
    try {
      await apiFetch(`/clients/${id}/reactivate`, { method: "PUT" });
      await fetchClients();
      await fetchStats();
    } catch (err) {
      alert(err.message);
    }
  }

  function handleTabChange(t) {
    setTab(t);
    setPage(1);
  }
  function handleSearch(v) {
    setSearch(v);
    setPage(1);
  }
  function handleSort(s) {
    setSort(s);
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-[#f0f2f8] px-4 pt-5 pb-12 sm:px-6 sm:pt-7 lg:px-9 lg:pt-9 lg:pb-16 font-[Inter,system-ui,sans-serif]">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between gap-4 mb-6 sm:mb-7">
        <div>
          <h1 className="text-xl sm:text-[26px] font-extrabold text-gray-900 mb-0.5 sm:mb-1">
            Clients
          </h1>
          <p className="text-sm text-gray-500">
            Manage clients and vendors in one place.
          </p>
        </div>

        <button
          id="add-client-btn"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-[#1b2b6b] hover:bg-[#2d3ebd] text-white text-sm font-bold border-none cursor-pointer transition-colors whitespace-nowrap shrink-0"
        >
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
          <span className="hidden sm:inline">Add Client</span>
          <span className="inline sm:hidden">Add</span>
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <ClientStatCards
        totalClients={stats.clients}
        totalVendors={stats.vendors}
        totalBalance={stats.balance}
      />

      {/* ── Error banner ── */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={fetchClients} className="underline font-medium ml-4">
            Retry
          </button>
        </div>
      )}

      {/* ── Table Card ── */}
      <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,.06)] overflow-hidden">
        <ClientTableToolbar
          search={search}
          onSearch={handleSearch}
          tab={tab}
          onTabChange={handleTabChange}
          sort={sort}
          onSortChange={handleSort}
        />

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm gap-3">
            <svg
              className="animate-spin h-5 w-5 text-[#1b2b6b]"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            Loading clients…
          </div>
        ) : (
          <ClientsTable
            rows={clients}
            selected={selected}
            onDelete={(id) => handleDelete(id)}
            onReactivate={(id) => handleReactivate(id)}
            onEdit={handleEdit}
            page={page}
            totalFiltered={total}
            totalPages={totalPages}
            onPrevPage={() => setPage((p) => p - 1)}
            onNextPage={() => setPage((p) => p + 1)}
          />
        )}
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <AddClientModal onClose={() => setShowModal(false)} onAdd={handleAdd} />
      )}
    </div>
  );
}
