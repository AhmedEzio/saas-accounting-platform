/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import ClientDetailHeader from "@/components/clients/ClientDetailHeader";
import ClientDetailStats from "@/components/clients/ClientDetailStats";
import ClientDetailTabs from "@/components/clients/ClientDetailTabs";
import EditClientModal from "@/components/clients/EditClientModal";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function getAuthHeaders() {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accounting_token")
      : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...getAuthHeaders(), ...(options.headers || {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

/* ── Spinner ─────────────────────────────────────────────────────────────── */
function Spinner() {
  return (
    <div className="flex items-center justify-center py-32 text-gray-400 gap-3">
      <svg
        className="animate-spin h-6 w-6 text-[#1b2b6b]"
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
      <span className="text-sm font-medium">Loading client…</span>
    </div>
  );
}

/* ── Deactivate / Reactivate confirm modal ────────────────────────────────── */
function ToggleStatusModal({ client, loading, onConfirm, onCancel }) {
  const isActive = client?.isActive !== false;
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-300 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        className="bg-white rounded-2xl p-8 w-full max-w-100 shadow-[0_24px_60px_rgba(0,0,0,.2)]"
        style={{ animation: "modalIn .18s ease" }}
      >
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${isActive ? "bg-red-50" : "bg-emerald-50"}`}
        >
          {isActive ? (
            <svg
              width="22"
              height="22"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          ) : (
            <svg
              width="22"
              height="22"
              fill="none"
              stroke="#059669"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          )}
        </div>
        <h3 className="text-[17px] font-extrabold text-gray-900 text-center mb-1">
          {isActive ? "Deactivate Client" : "Reactivate Client"}
        </h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          {isActive ? (
            <>
              Are you sure you want to deactivate{" "}
              <span className="font-semibold text-gray-700">
                {client?.name}
              </span>
              ?<br />
              They will be hidden from active lists.
            </>
          ) : (
            <>
              Reactivate{" "}
              <span className="font-semibold text-gray-700">
                {client?.name}
              </span>
              ?<br />
              They will be restored to active status.
            </>
          )}
        </p>
        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 border-[1.5px] border-gray-200 rounded-[10px] bg-white text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 border-none rounded-[10px] text-white text-sm font-bold cursor-pointer transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
              isActive
                ? "bg-red-500 hover:bg-red-600"
                : "bg-emerald-500 hover:bg-emerald-600"
            }`}
          >
            {loading ? (
              <svg
                className="animate-spin w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
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
            ) : isActive ? (
              "Deactivate"
            ) : (
              "Reactivate"
            )}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(.94) translateY(10px); }
          to   { opacity: 1; transform: scale(1)  translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default function ClientDetailPage({ params }) {
  const router = useRouter();

  const { id } = use(params);

  const [client, setClient] = useState(null);
  const [transactions, setTransactions] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 1,
    payments: [],
  });
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [totalDebit, setTotalDebit] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  const fetchClient = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch(`/clients/${id}`);
      setClient(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchTransactions = useCallback(async () => {
    setTxLoading(true);
    try {
      const data = await apiFetch(`/payments?clientId=${id}`);
      setTransactions(data.data);
      console.log(data);
    } catch {
      setTransactions([]);
    } finally {
      setTxLoading(false);
    }
  }, [id]);
  const fetchTotals = useCallback(async () => {
    try {
      const data = await apiFetch(`/clients/${id}/totals`);
      setTotalDebit(data.data.lastDebit?.balanceAfter ?? 0);
      setTotalCredit(data.data.lastCredit?.balanceAfter ?? 0);
      // setTotalDebit(0);
      // setTotalCredit(0);
      console.log("dataaa");
      console.log(data);
    } catch (err) {
      console.error("fetchTotals error:", err);
    }
  }, [id]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);
  useEffect(() => {
    fetchTotals();
  }, [fetchTotals]);
  console.log("yarabbb");
  console.log(totalDebit);

  async function handleEdit(id, formData) {
    await apiFetch(`/clients/${id}`, {
      method: "PUT",
      body: JSON.stringify(formData),
    });
    await fetchClient();
  }

  async function handleToggleStatus() {
    setDeleting(true);
    try {
      if (client?.isActive !== false) {
        await apiFetch(`/clients/${id}`, { method: "DELETE" });
      } else {
        await apiFetch(`/clients/${id}/reactivate`, { method: "PUT" });
      }
      await fetchClient();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
      setShowDelete(false);
    }
  }

  /* ── Render ───────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f8]">
        <Spinner />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-[#f0f2f8] flex items-center justify-center">
        <div className="bg-white rounded-2xl p-10 shadow-sm text-center max-w-sm">
          <p className="text-red-500 font-semibold mb-2">
            Failed to load client
          </p>
          <p className="text-sm text-gray-500 mb-5">
            {error ?? "Client not found."}
          </p>
          <button
            onClick={() => router.push("/clients")}
            className="px-5 py-2.5 bg-[#1b2b6b] text-white text-sm font-bold rounded-xl cursor-pointer hover:bg-[#2d3ebd] transition-colors"
          >
            ← Back to Clients
          </button>
        </div>
      </div>
    );
  }

  const currentBalance = client.currentBalance ?? client.balance ?? 0;

  return (
    <div className="min-h-screen bg-[#f0f2f8] px-4 pt-5 pb-12 sm:px-6 sm:pt-7 lg:px-9 lg:pt-9 lg:pb-16 font-[Inter,system-ui,sans-serif]">
      {/* ── Header ── */}
      <ClientDetailHeader
        client={client}
        onBack={() => router.push("/clients")}
        onEdit={() => setShowEdit(true)}
        onDelete={() => setShowDelete(true)}
      />

      {/* ── Stat cards ── */}
      <ClientDetailStats
        currentBalance={currentBalance}
        totalTransactions={transactions.total}
        totalDebit={totalDebit}
        totalCredit={totalCredit}
      />

      {/* ── Tabs + table ── */}
      {txLoading ? (
        <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,.06)] overflow-hidden">
          <Spinner />
        </div>
      ) : (
        <ClientDetailTabs clientId={id} />
      )}

      {/* ── Edit modal ── */}
      {showEdit && (
        <EditClientModal
          client={client}
          onClose={() => setShowEdit(false)}
          onSave={async (cid, data) => {
            await handleEdit(cid, data);
            setShowEdit(false);
          }}
        />
      )}

      {/* ── Toggle status modal ── */}
      {showDelete && (
        <ToggleStatusModal
          client={client}
          loading={deleting}
          onConfirm={handleToggleStatus}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  );
}
