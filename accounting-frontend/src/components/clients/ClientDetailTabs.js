"use client";

import { useState, useCallback, useEffect } from "react";
import InvoiceTable from "./InvoiceTable";
import PaymentTable from "./PaymentTable";


const TABS = ["Invoices", "Payments"];
const PAGE_SIZE = 10;

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

export default function ClientDetailTabs({ clientId }) {
  const [activeTab, setActiveTab] = useState("Invoices");

  const [invoices, setInvoices] = useState([]);
  const [invTotal, setInvTotal] = useState(0);
  const [invPage, setInvPage] = useState(1);
  const [invLoading, setInvLoading] = useState(false);

  const [payments, setPayments] = useState([]);
  const [payTotal, setPayTotal] = useState(0);
  const [payPage, setPayPage] = useState(1);
  const [payLoading, setPayLoading] = useState(false);
  const [payFetched, setPayFetched] = useState(false);

  const fetchInvoices = useCallback(async (page = 1) => {
    if (!clientId) return;
    setInvLoading(true);
    try {
      const data = await apiFetch(
        `/invoices?clientId=${clientId}&includeCancelled=true&limit=${PAGE_SIZE}&page=${page}`
      );
      const list = data?.data?.invoices ?? [];
      const total = data?.data?.total ?? data?.data?.pagination?.total ?? list.length;
      setInvoices(list);
      setInvTotal(total);
    } catch (err) {
      console.error("[InvoiceTab] fetch error:", err.message);
      setInvoices([]);
      setInvTotal(0);
    } finally {
      setInvLoading(false);
    }
  }, [clientId]);

  const fetchPayments = useCallback(async (page = 1) => {
    if (!clientId) return;
    setPayLoading(true);
    try {
      const data = await apiFetch(
        `/payments?clientId=${clientId}&limit=${PAGE_SIZE}&page=${page}`
      );
      const list = data?.data?.payments ?? [];
      const total = data?.data?.total ?? data?.data?.pagination?.total ?? list.length;
      setPayments(list);
      setPayTotal(total);
    } catch (err) {
      console.error("[PaymentTab] fetch error:", err.message);
      setPayments([]);
      setPayTotal(0);
    } finally {
      setPayLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchInvoices(1);
  }, [fetchInvoices]);

  useEffect(() => {
    fetchInvoices(invPage);
  }, [invPage]);

  useEffect(() => {
    if (payFetched) fetchPayments(payPage);
  }, [payPage]);

  function handleTabChange(tab) {
    setActiveTab(tab);
    if (tab === "Payments" && !payFetched) {
      setPayFetched(true);
      fetchPayments(1);
    }
  }

  function handleInvPage(p) {
    setInvPage(p);
  }

  function handlePayPage(p) {
    setPayPage(p);
  }

  async function handleCancelInvoice(invoiceId, reason) {
    await apiFetch(`/invoices/${invoiceId}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason: reason || "Cancelled by accountant" }),
    });
    setPayFetched(false);
    await fetchInvoices(invPage);
  }

  const invTotalPages = Math.max(1, Math.ceil(invTotal / PAGE_SIZE));
  const invRangeStart = invTotal === 0 ? 0 : (invPage - 1) * PAGE_SIZE + 1;
  const invRangeEnd = Math.min(invPage * PAGE_SIZE, invTotal);

  const payTotalPages = Math.max(1, Math.ceil(payTotal / PAGE_SIZE));
  const payRangeStart = payTotal === 0 ? 0 : (payPage - 1) * PAGE_SIZE + 1;
  const payRangeEnd = Math.min(payPage * PAGE_SIZE, payTotal);

  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,.06)] overflow-hidden">

      {/* ── Tab bar ── */}
      <div className="border-b border-gray-100 px-6 pt-4">
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab}
              id={`tab-${tab.toLowerCase()}`}
              onClick={() => handleTabChange(tab)}
              className={`relative pb-3.5 px-4 text-[14px] font-semibold transition-colors cursor-pointer border-0 bg-transparent ${activeTab === tab
                ? "text-[#1b2b6b]"
                : "text-gray-400 hover:text-gray-600"
                }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#1b2b6b] rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Panel sub-header ── */}
      <div className="px-6 py-4 border-b border-gray-50">
        {activeTab === "Invoices" && <h2 className="text-[15px] font-bold text-gray-800">Invoice History</h2>}
        {activeTab === "Payments" && <h2 className="text-[15px] font-bold text-gray-800">Payment Transactions</h2>}
      </div>

      {/* ── Content ── */}
      <div>
        {activeTab === "Invoices" && (
          <InvoiceTable
            invoices={invoices}
            loading={invLoading}
            onCancel={handleCancelInvoice}
            page={invPage}
            totalPages={invTotalPages}
            total={invTotal}
            rangeStart={invRangeStart}
            rangeEnd={invRangeEnd}
            onPage={handleInvPage}
          />
        )}

        {activeTab === "Payments" && (
          <PaymentTable
            payments={payments}
            loading={payLoading}
            page={payPage}
            totalPages={payTotalPages}
            total={payTotal}
            rangeStart={payRangeStart}
            rangeEnd={payRangeEnd}
            onPage={handlePayPage}
          />
        )}
      </div>
    </div>
  );
}
