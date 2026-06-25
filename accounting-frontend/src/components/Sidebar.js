"use client";

import { useRouter } from "next/navigation";
import { useLang } from "@/context/LanguageContext";

// ── Icons ─────────────────────────────────────────────────────────────────────

const Icon = {
  dashboard: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  clients: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  invoices: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  payments: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  documents: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
      <polyline points="13 2 13 9 20 9" />
    </svg>
  ),
  subscription: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  aiUsage: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  settings: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  plus: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
};

// ── Nav config ────────────────────────────────────────────────────────────────

export const navItems = [
  {
    key: "overview",
    label: "Overview",
    icon: Icon.dashboard,
    href: "/overview",
  },
  { key: "clients", label: "Clients", icon: Icon.clients, href: "/clients" },
  {
    key: "invoices",
    label: "Invoices",
    icon: Icon.invoices,
    href: "/invoices",
  },
  {
    key: "payments",
    label: "Payments",
    icon: Icon.payments,
    href: "/payments",
  },
  {
    key: "documents",
    label: "Documents",
    icon: Icon.documents,
    href: "/documents",
  },
];

export const systemItems = [
  {
    key: "subscription",
    label: "Subscription",
    icon: Icon.subscription,
    href: "/subscription",
  },
  { key: "ai-usage", label: "AI Usage", icon: Icon.aiUsage, href: "/ai-usage" },
  {
    key: "settings",
    label: "Settings",
    icon: Icon.settings,
    href: "/settings",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Sidebar
 *
 * Props:
 *  - active  {string}  — nav key of the current page (e.g. "overview")
 *  - user    {object}  — { name, email } from AuthContext
 */
export default function Sidebar({ active, user }) {
  const router = useRouter();
  const { lang } = useLang();
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "JD";

  const go = (href) => router.push(href);

  return (
    <aside
  className={`fixed top-0 h-screen w-64 ${
    lang === "ar" ? "right-0" : "left-0"
  }`}
>
      {/* ── Logo ── */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
        <div className="w-9 h-9 rounded-lg bg-[#1b2b6b] flex flex-col items-center justify-center gap-0.5 shrink-0">
          <span className="text-white text-base font-extrabold leading-none">
            F
          </span>
          <div className="w-5 h-0.5 rounded-full bg-[#1fc99e]" />
          <div className="w-3.5 h-0.5 rounded-full bg-[#1fc99e] opacity-70" />
        </div>
        <div>
          <p className="text-[14px] font-bold text-[#1b2b6b] leading-tight">
            Finora
          </p>
          <p className="text-[10px] text-gray-400 leading-tight">
            Accounting AI
          </p>
        </div>
      </div>

      {/* ── New Invoice ── */}
      <div className="px-3 pt-4 pb-2">
        <button
          onClick={() => go("/invoices/new")}
          className="w-full flex items-center justify-center gap-1.5 bg-[#1b2b6b] hover:bg-[#162358] text-white text-sm font-semibold rounded-lg py-2.5 transition"
        >
          {Icon.plus}
          New Invoice
        </button>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 pt-1 overflow-y-auto">
        <div className="space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => go(item.href)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition text-left ${
                active === item.key
                  ? "bg-[#e8ebf7] text-[#1b2b6b]"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span
                className={
                  active === item.key ? "text-[#1b2b6b]" : "text-gray-400"
                }
              >
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </div>

        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mt-5 mb-1.5">
          System
        </p>

        <div className="space-y-0.5">
          {systemItems.map((item) => (
            <button
              key={item.key}
              onClick={() => go(item.href)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition text-left ${
                active === item.key
                  ? "bg-[#e8ebf7] text-[#1b2b6b]"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span
                className={
                  active === item.key ? "text-[#1b2b6b]" : "text-gray-400"
                }
              >
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── User strip ── */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#1b2b6b] flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {user?.email || ""}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
