"use client";

import { useEffect, useMemo, useState } from "react";
import { clientsApi } from "@/services/invoices";

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function extractClients(response) {
  if (Array.isArray(response?.results?.data)) return response.results.data;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;
  return [];
}

export default function ClientSearch({
  clientType,
  error,
  label,
  onSelect,
  selectedClient,
  t,
}) {
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    const timeout = setTimeout(async () => {
      setLoading(true);
      setLoadError("");

      try {
        const response = await clientsApi.getAll({
          type: clientType,
          ...(search.trim() ? { search: search.trim() } : {}),
        });

        if (active) setClients(extractClients(response));
      } catch (err) {
        if (active) {
          setClients([]);
          setLoadError(err?.response?.data?.message || t("state.networkError"));
        }
      } finally {
        if (active) setLoading(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [clientType, search, t]);

  const helper = useMemo(() => {
    if (loading) return t("state.loading");
    if (loadError) return loadError;
    if (selectedClient) return selectedClient.email || selectedClient.phone || t("form.clientSelected");
    return clientType === "vendor" ? t("form.searchVendor") : t("form.searchClient");
  }, [clientType, loadError, loading, selectedClient, t]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-600" htmlFor="client-search">
        {label}
      </label>
      <input
        aria-describedby="client-search-help"
        className={`min-h-11 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 transition focus:border-[#001540] focus:outline-none focus:ring-2 focus:ring-[#001540]/20 ${
          error ? "border-rose-400" : "border-slate-300"
        }`}
        id="client-search"
        onChange={(event) => setSearch(event.target.value)}
        placeholder={clientType === "vendor" ? t("form.searchVendor") : t("form.searchClient")}
        type="search"
        value={search}
      />
      <p className={`text-xs ${error || loadError ? "text-rose-600" : "text-slate-500"}`} id="client-search-help">
        {error || helper}
      </p>

      <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white">
        {clients.map((client) => (
          <button
            className={`flex min-h-12 w-full items-center justify-between gap-3 border-b border-slate-100 px-3 py-2 text-left transition last:border-b-0 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#001540]/20 ${
              selectedClient?._id === client._id ? "bg-slate-50" : ""
            }`}
            key={client._id}
            onClick={() => onSelect(client)}
            type="button"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-slate-200 text-xs font-bold text-slate-600">
                {initials(client.name) || "#"}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-slate-950">
                  {client.name}
                </span>
                <span className="block truncate text-xs text-slate-500">
                  {client.email || client.phone || client.type}
                </span>
              </span>
            </span>
            {selectedClient?._id === client._id ? (
              <span className="text-sm font-semibold text-[#001540]">{t("form.selected")}</span>
            ) : null}
          </button>
        ))}
        {!loading && clients.length === 0 ? (
          <div className="px-3 py-4 text-sm text-slate-500">{t("form.noClients")}</div>
        ) : null}
      </div>
    </div>
  );
}
