"use client";



function fmtBalance(n) {
  const val = Number(n) || 0;
  const int = Math.floor(Math.abs(val)).toLocaleString("en-US");
  const dec = (Math.abs(val) % 1).toFixed(2).slice(1);
  return { int, dec };
}

export default function ClientDetailHeader({ client, onEdit, onDelete, onBack }) {
  const { int, dec } = fmtBalance(client?.currentBalance ?? client?.balance ?? 0);


  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,.06)] px-6 py-5 mb-5">

      <nav className="flex items-center gap-1.5 text-[13px] text-gray-400 mb-5">
        <button
          onClick={onBack}
          className="hover:text-[#1b2b6b] transition-colors font-medium cursor-pointer"
        >
          Clients
        </button>
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M9 18l6-6-6-6" />
        </svg>
        <span className="text-gray-700 font-medium truncate">{client?.name ?? "…"}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-start gap-5">

        <div className="flex-1 min-w-0">
          <h1 className="text-[28px] sm:text-[32px] font-extrabold text-gray-900 leading-tight">
            {client?.name ?? "—"}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm text-gray-500">
            {client?.phone && (
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.36 12 19.79 19.79 0 0 1 1.26 3.41 2 2 0 0 1 3.24 1.25h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.72a16 16 0 0 0 6.08 6.08l1.58-1.58a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {client.phone}
              </span>
            )}
            {client?.address && (
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {client.address}
              </span>
            )}
            {client?.email && !client?.phone && (
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                {client.email}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-shrink-0 sm:ml-auto">

          <div className="flex flex-col gap-2">
            <button
              id="client-edit-btn"
              onClick={onEdit}
              className="flex items-center gap-1.5 px-4 py-2 border-[1.5px] border-gray-200 rounded-[10px] bg-white text-[13px] font-semibold text-gray-700 cursor-pointer hover:border-[#1b2b6b] hover:text-[#1b2b6b] transition-colors whitespace-nowrap"
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit
            </button>

            {client?.isActive !== false ? (
              <button
                id="client-deactivate-btn"
                onClick={onDelete}
                className="flex items-center gap-1.5 px-4 py-2 border-[1.5px] border-red-200 rounded-[10px] bg-white text-[13px] font-semibold text-red-500 cursor-pointer hover:bg-red-50 hover:border-red-400 transition-colors whitespace-nowrap"
              >
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                </svg>
                Deactivate
              </button>
            ) : (
              <button
                id="client-reactivate-btn"
                onClick={onDelete}
                className="flex items-center gap-1.5 px-4 py-2 border-[1.5px] border-emerald-200 rounded-[10px] bg-white text-[13px] font-semibold text-emerald-600 cursor-pointer hover:bg-emerald-50 hover:border-emerald-400 transition-colors whitespace-nowrap"
              >
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                Reactivate
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
