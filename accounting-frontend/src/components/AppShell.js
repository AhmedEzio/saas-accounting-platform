"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

/* ─── Nav items ─────────────────────────────────────────────────────────────── */
const navItems = [
  {
    key: "overview",
    href: "/overview",
    label: "Overview",
    labelAr: "نظرة عامة",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" />
      </svg>
    ),
  },
  {
    key: "invoices",
    href: "/invoices",
    label: "Invoices",
    labelAr: "الفواتير",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6M8 13h8M8 17h6" />
      </svg>
    ),
  },
  {
    key: "clients",
    href: "/clients",
    label: "Clients",
    labelAr: "العملاء",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9.5" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 00-3-3.8M16 3.2a4 4 0 010 7.6" />
      </svg>
    ),
  },
  {
    key: "chat",
    href: "/chat",
    label: "AI Chat",
    labelAr: "المساعد الذكي",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
];

/* ─── AppShell ───────────────────────────────────────────────────────────────── */
export default function AppShell({ children, activeKey, lang: propLang, setLang: propSetLang, headerActions }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { lang: contextLang, setLang: contextSetLang } = useLanguage();

  const lang = propLang || contextLang;
  const setLang = propSetLang || contextSetLang;
  const isRtl = lang === "ar";
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  /* Determine active key from pathname if not passed explicitly */
  const currentKey =
    activeKey ||
    navItems.find((item) => pathname?.startsWith(item.href))?.key ||
    "overview";

  const go = (href) => {
    setMobileOpen(false);
    router.push(href);
  };

  /* ─── Sidebar Content ─── */
  const SidebarContent = ({ compact = false }) => (
    <aside
      className={`flex h-full flex-col bg-white transition-all duration-300 ${
        compact ? "w-full" : ""
      }`}
    >
      {/* Logo */}
      <div
        className={`flex items-center border-b border-gray-100 transition-all duration-300 ${
          collapsed && !compact ? "justify-center px-3 py-4" : "gap-3 px-5 py-5"
        }`}
      >
        <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl bg-[#1b2b6b] shadow-sm">
          <span className="text-lg font-extrabold leading-none text-white">F</span>
          <span className="h-0.5 w-5 rounded-full bg-[#1fc99e]" />
          <span className="h-0.5 w-3 rounded-full bg-[#1fc99e] opacity-70" />
        </div>
        {(!collapsed || compact) && (
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight text-[#1b2b6b]">Finora</p>
            <p className="text-[11px] leading-tight text-gray-400">Accounting AI</p>
          </div>
        )}
      </div>

      {/* New Invoice CTA */}
      <div className={`px-3 py-4 ${collapsed && !compact ? "flex justify-center" : ""}`}>
        <button
          type="button"
          onClick={() => go("/invoices/new")}
          title="New Invoice"
          className={`flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1b2b6b] text-sm font-semibold text-white shadow-sm transition hover:bg-[#162358] focus:outline-none focus:ring-2 focus:ring-[#1b2b6b] focus:ring-offset-2 ${
            collapsed && !compact ? "h-11 w-11 p-0" : "w-full px-3 py-2.5"
          }`}
        >
          <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {(!collapsed || compact) && (
            <span>{isRtl ? "فاتورة جديدة" : "New Invoice"}</span>
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {navItems.map((item) => {
          const active = item.key === currentKey;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => go(item.href)}
              title={isRtl ? item.labelAr : item.label}
              className={`flex min-h-11 w-full items-center rounded-xl px-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#1b2b6b] focus:ring-offset-1 ${
                collapsed && !compact ? "justify-center gap-0" : "gap-3"
              } ${
                active
                  ? "bg-[#e8ebf7] text-[#1b2b6b]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              } ${isRtl ? "flex-row-reverse text-right" : "text-left"}`}
            >
              <span
                className={`shrink-0 ${active ? "text-[#1b2b6b]" : "text-gray-400"}`}
                aria-hidden="true"
              >
                {item.icon}
              </span>
              {(!collapsed || compact) && (
                <span className="truncate">
                  {isRtl ? item.labelAr : item.label}
                </span>
              )}
              {active && (!collapsed || compact) && (
                <span className={`ml-auto h-1.5 w-1.5 rounded-full bg-[#1b2b6b] ${isRtl ? "mr-auto ml-0" : ""}`} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Profile section */}
      <div className="border-t border-gray-100 px-3 py-3">
        <button
          type="button"
          onClick={() => go("/profile")}
          title="Go to Profile"
          className={`flex w-full items-center rounded-xl px-2 py-2 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1b2b6b] focus:ring-offset-1 ${
            collapsed && !compact ? "justify-center" : "gap-3"
          } ${currentKey === "profile" ? "bg-[#e8ebf7]" : ""}`}
        >
          <div
            className={`flex shrink-0 items-center justify-center rounded-full bg-[#1b2b6b] text-xs font-bold text-white ${
              collapsed && !compact ? "h-10 w-10" : "h-8 w-8"
            }`}
          >
            {initials}
          </div>
          {(!collapsed || compact) && (
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-semibold text-gray-800">
                {user?.name || "User"}
              </p>
              <p className="truncate text-xs text-gray-400">{user?.email || ""}</p>
            </div>
          )}
          {(!collapsed || compact) && (
            <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M9 18l6-6-6-6" />
            </svg>
          )}
        </button>
      </div>
    </aside>
  );

  /* ─── Collapse toggle button (desktop only) ─── */
  const CollapseBtn = () => (
    <button
      type="button"
      onClick={() => setCollapsed((c) => !c)}
      title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className={`absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm text-gray-500 transition hover:border-[#1b2b6b] hover:text-[#1b2b6b] hidden lg:flex`}
    >
      <svg
        className={`h-3 w-3 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        viewBox="0 0 24 24"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );

  const sidebarWidth = collapsed ? "w-[70px]" : "w-64";

  return (
    <div className="min-h-dvh bg-[#f4f5f8] text-gray-900" dir={isRtl ? "rtl" : "ltr"}>
      {/* ── Desktop Sidebar ── */}
      <div
        className={`fixed inset-y-0 z-30 hidden border-gray-100 bg-white shadow-sm print:hidden lg:block transition-all duration-300 ${sidebarWidth} ${
          isRtl ? "right-0 border-l" : "left-0 border-r"
        }`}
      >
        {/* inner wrapper gives CollapseBtn an absolute-positioned parent */}
        <div className="relative h-full">
          <CollapseBtn />
          <SidebarContent />
        </div>
      </div>

      {/* ── Mobile Nav Overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 print:hidden lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className={`absolute inset-y-0 w-72 max-w-[86vw] shadow-2xl ${
              isRtl ? "right-0" : "left-0"
            }`}
          >
            <SidebarContent compact />
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header
        className={`sticky top-0 z-20 flex min-h-16 items-center gap-3 border-b border-gray-100 bg-white/95 px-4 backdrop-blur print:hidden lg:fixed lg:h-16 transition-all duration-300 ${
          isRtl
            ? `lg:left-0 ${collapsed ? "lg:right-[70px]" : "lg:right-64"}`
            : `${collapsed ? "lg:left-[70px]" : "lg:left-64"} lg:right-0`
        }`}
      >
        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-gray-600 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1b2b6b] focus:ring-offset-2 lg:hidden"
          aria-label="Open navigation"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Page title (derived from active key) */}
        <div className="hidden lg:block">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            {navItems.find((n) => n.key === currentKey)?.[isRtl ? "labelAr" : "label"] || "Finora"}
          </p>
        </div>

        {/* Page-specific header action buttons (e.g. export, print) */}
        {headerActions && (
          <div className={`hidden items-center gap-2 lg:flex ${isRtl ? "mr-4" : "ml-4"}`}>
            {headerActions}
          </div>
        )}

        <div className={`ms-auto flex items-center gap-2 ${isRtl ? "mr-auto ms-0" : ""}`}>
          {/* Language toggle */}
          {setLang && (
            <button
              type="button"
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="min-h-9 rounded-full border border-gray-200 bg-white px-4 text-xs font-bold text-gray-600 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1b2b6b] focus:ring-offset-2"
              aria-label="Switch language"
            >
              {lang === "ar" ? "EN" : "عربي"}
            </button>
          )}

          {/* Profile avatar → links to profile */}
          <button
            type="button"
            onClick={() => router.push("/profile")}
            title="My Profile"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1b2b6b] text-xs font-bold text-white shadow-sm transition hover:bg-[#162358] focus:outline-none focus:ring-2 focus:ring-[#1b2b6b] focus:ring-offset-2"
          >
            {initials}
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main
        className={`min-h-dvh px-4 py-5 print:m-0 print:bg-white print:p-0 lg:px-7 lg:pb-8 lg:pt-20 transition-all duration-300 ${
          isRtl
            ? `${collapsed ? "lg:mr-[70px]" : "lg:mr-64"} print:mr-0`
            : `${collapsed ? "lg:ml-[70px]" : "lg:ml-64"} print:ml-0`
        }`}
      >
        {children}
      </main>
    </div>
  );
}
