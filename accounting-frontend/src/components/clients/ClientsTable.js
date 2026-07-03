"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ClientBadge from "./ClientBadge";
import EditClientModal from "./EditClientModal";

const PAGE_SIZE = 5;

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function fmtBalance(n) {
  const val = Number(n) || 0;
  const int = Math.floor(val).toLocaleString("en-US");
  const dec = (val % 1).toFixed(2).slice(1).replace(".", "");
  return { int, dec };
}

/* ─── status badge ────────────────────────────────────────────────────────── */
function StatusBadge({ isActive, t }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${isActive ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"
        }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
      {isActive ? t("status.active") : t("status.inactive")}
    </span>
  );
}

/* ─── confirm modal (shared for delete & reactivate) ─────────────────────── */
function ConfirmModal({ client, onConfirm, onCancel, loading, t }) {
  const isActive = client?.isActive;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        className="bg-white rounded-2xl p-8 w-full max-w-[400px] shadow-[0_24px_60px_rgba(0,0,0,.2)]"
        style={{ animation: "modalIn .18s ease" }}
      >
        {/* icon */}
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${isActive ? "bg-red-50" : "bg-emerald-50"
            }`}
        >
          {isActive ? (
            <svg width="22" height="22" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          ) : (
            <svg width="22" height="22" fill="none" stroke="#10b981" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          )}
        </div>

        <h3 className="text-[17px] font-extrabold text-gray-900 text-center mb-1">
          {isActive ? t("confirm.deleteTitle") : t("confirm.reactivateTitle")}
        </h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          {isActive ? (
            <>
              {t("confirm.deleteMsg")}{" "}
              <span className="font-semibold text-gray-700">{client?.name}</span>?<br />
              {t("confirm.deleteWarning")}
            </>
          ) : (
            <>
              {t("confirm.reactivateMsg")}{" "}
              <span className="font-semibold text-gray-700">{client?.name}</span>?<br />
              {t("confirm.reactivateInfo")}
            </>
          )}
        </p>

        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 border-[1.5px] border-gray-200 rounded-[10px] bg-white text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {t("action.cancel")}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 border-none rounded-[10px] text-white text-sm font-bold cursor-pointer transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${isActive ? "bg-red-500 hover:bg-red-600" : "bg-emerald-500 hover:bg-emerald-600"
              }`}
          >
            {loading ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : isActive ? (
              <>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </svg>
                {t("action.delete")}
              </>
            ) : (
              <>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {t("action.reactivate")}
              </>
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

/* ─── individual row ─────────────────────────────────────────────────────── */
function ClientRow({ row, onActionClick, onEditClick, onViewClick, t, isRtl }) {
  const { int, dec } = fmtBalance(row.currentBalance ?? row.balance);
  const id = row._id ?? row.id;

  return (
    <tr className="hover:bg-[#fafbff] transition-colors">

      {/* name + email */}
      <td className={`px-3 sm:px-4 py-3.5 ${isRtl ? "sm:pr-10" : "sm:pl-10"}`}>
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="min-w-0">
            <div className={`font-semibold text-gray-900 text-sm truncate ${isRtl ? "text-right" : ""}`}>{row.name}</div>
            <div className={`text-xs text-gray-400 mt-0.5 truncate ${isRtl ? "text-right" : ""}`}>{row.email}</div>
          </div>
        </div>
      </td>

      {/* phone */}
      <td className="hidden md:table-cell px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">
        {row.phone}
      </td>

      {/* type */}
      <td className="px-3 sm:px-4 py-3.5">
        <ClientBadge type={row.type} />
      </td>

      {/* status */}
      <td className="px-3 sm:px-4 py-3.5">
        <StatusBadge isActive={row.isActive} t={t} />
      </td>

      {/* balance */}
      <td className="px-3 sm:px-4 py-3.5 whitespace-nowrap">
        <span className="font-bold text-gray-900 text-sm">
          ${int}<span className="text-gray-400 font-normal">.{dec}</span>
        </span>
      </td>

      {/* date */}
      <td className="hidden lg:table-cell px-4 py-3.5 text-sm text-gray-500 whitespace-nowrap">
        {fmtDate(row.createdAt)}
      </td>

      {/* actions */}
      <td className="px-3 sm:px-4 py-3.5">
        <div className="flex gap-0.5">
          <button id={`view-${id}`} title={t("action.view")} onClick={() => onViewClick(id)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-[#1b2b6b] hover:bg-[#eef0fb] transition-colors inline-flex items-center">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
          <button id={`edit-${id}`} title={t("action.edit")} onClick={() => onEditClick(row)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-[#1b2b6b] hover:bg-[#eef0fb] transition-colors inline-flex items-center">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button id={`status-${id}`} title={row.isActive ? t("action.delete") : t("action.reactivate")}
            onClick={() => onActionClick(row)}
            className={`p-1.5 rounded-lg transition-colors inline-flex items-center ${
              row.isActive ? "text-gray-400 hover:text-red-500 hover:bg-red-50" : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
            }`}>
            {row.isActive ? (
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
            ) : (
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
            )}
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ─── headers ─────────────────────────────────────────────────────────────── */
const getHeaders = (t) => [
  { label: t("col.name"),    cls: "" },
  { label: t("col.phone"),   cls: "hidden md:table-cell" },
  { label: t("col.type"),    cls: "" },
  { label: t("col.status"),  cls: "" },
  { label: t("col.balance"), cls: "" },
  { label: t("col.created"), cls: "hidden lg:table-cell" },
  { label: t("col.actions"), cls: "" },
];

/* ─── main table + pagination ─────────────────────────────────────────────── */
export default function ClientsTable({
  rows,
  onDelete,
  onReactivate,
  onEdit,
  page,
  totalFiltered,
  totalPages,
  onPrevPage,
  onNextPage,
  t,
  isRtl,
}) {
  const router = useRouter();
  const [pendingRow, setPendingRow] = useState(null);
  const [pendingEdit, setPendingEdit] = useState(null);
  const [acting, setActing] = useState(false);

  const startEntry = totalFiltered === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endEntry = Math.min(page * PAGE_SIZE, totalFiltered);

  async function confirmAction() {
    if (!pendingRow) return;
    setActing(true);
    try {
      const id = pendingRow._id ?? pendingRow.id;
      if (pendingRow.isActive) await onDelete(id);
      else await onReactivate(id);
    } finally {
      setActing(false);
      setPendingRow(null);
    }
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse mt-4 min-w-[560px]" dir={isRtl ? "rtl" : "ltr"}>
          <thead>
            <tr>
              {getHeaders(t).map(({ label, cls }) => (
                <th
                  key={label}
                  className={`${isRtl ? "text-right" : "text-left"} text-[11px] sm:text-[12px] font-bold uppercase tracking-[.05em] text-gray-400 px-3 sm:px-4 py-2.5 border-b-[1.5px] border-gray-100 whitespace-nowrap ${cls}`}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-sm text-gray-400">
                  {t("table.empty")}
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const id = row._id ?? row.id;
                return (
                  <ClientRow
                    key={id}
                    row={row}
                    t={t}
                    isRtl={isRtl}
                    onActionClick={(r) => setPendingRow(r)}
                    onEditClick={(r) => setPendingEdit(r)}
                    onViewClick={(id) => router.push(`/clients/${id}`)}
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-t-[1.5px] border-gray-100 ${isRtl ? "flex-row-reverse" : ""}`}>
        <span className="text-[12px] sm:text-[13px] text-gray-500 order-2 sm:order-1">
          {t("pagination.showing")} {startEntry} {t("pagination.to")} {endEntry} {t("pagination.of")} {totalFiltered} {t("pagination.entries")}
        </span>
        <div className="flex gap-1.5 order-1 sm:order-2">
          <button
            id="prev-page-btn"
            disabled={page === 1}
            onClick={onPrevPage}
            className="px-4 py-1.5 border-[1.5px] border-gray-200 rounded-[9px] bg-white text-[13px] font-semibold text-gray-700 cursor-pointer transition-colors hover:border-[#1b2b6b] hover:text-[#1b2b6b] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t("pagination.prev")}
          </button>
          <button
            id="next-page-btn"
            disabled={page >= totalPages}
            onClick={onNextPage}
            className="px-4 py-1.5 border-[1.5px] border-gray-200 rounded-[9px] bg-white text-[13px] font-semibold text-gray-700 cursor-pointer transition-colors hover:border-[#1b2b6b] hover:text-[#1b2b6b] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t("pagination.next")}
          </button>
        </div>
      </div>

      {/* Confirm modal (delete or reactivate) */}
      {pendingRow && (
        <ConfirmModal
          client={pendingRow}
          loading={acting}
          t={t}
          onConfirm={confirmAction}
          onCancel={() => setPendingRow(null)}
        />
      )}

      {/* Edit modal */}
      {pendingEdit && (
        <EditClientModal
          client={pendingEdit}
          onClose={() => setPendingEdit(null)}
          onSave={async (id, data) => {
            await onEdit(id, data);
            setPendingEdit(null);
          }}
        />
      )}
    </>
  );
}