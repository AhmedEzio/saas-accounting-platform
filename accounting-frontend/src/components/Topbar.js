"use client";

import { useLang } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
// ── Icons ─────────────────────────────────────────────────────────────────────

const Icon = {
  search: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  globe: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
    </svg>
  ),
  bell: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  ),
};

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Topbar
 *
 * Props:
 *  - user  {object}  — { name } from AuthContext (for the avatar initials)
 *
 * Reads lang / toggleLang directly from LanguageContext — no prop drilling.
 */
export default function Topbar({ user }) {
  const { lang, toggleLang } = useLang();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "JD";
  const router = useRouter();
  return (
    <header
  className={`fixed top-0 h-14 bg-white border-b border-gray-100 flex items-center px-6 gap-3 z-20
  ${
    lang === "ar"
      ? "right-64 left-0"
      : "left-64 right-0"
  }`}
>
      {/* ── Search ── */}
      <div className="flex items-center gap-2 flex-1 bg-gray-50 rounded-lg px-3 py-2 max-w-xs">
        <span className="text-gray-400">{Icon.search}</span>
        <input
          className="bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none flex-1"
          placeholder="Search..."
        />
      </div>

      {/* ── Right actions ── */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Language toggle */}
        <button
          onClick={toggleLang}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-medium text-gray-500 hover:bg-gray-50 transition"
        >
          {Icon.globe}
          {lang === "ar" ? "EN" : "AR"}
        </button>

        {/* Notifications */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-50 text-gray-500 transition">
          {Icon.bell}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Avatar */}
        <div onClick={() => {router.push("/profile");}} className="w-9 h-9 rounded-full bg-[#1b2b6b] flex items-center justify-center text-white text-xs font-bold cursor-pointer select-none">
          {initials}
        </div>
      </div>
    </header>
  );
}
