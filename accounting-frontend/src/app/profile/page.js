"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/services/api";

const EyeBtn = ({ open, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
  >
    {open ? (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        viewBox="0 0 24 24"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ) : (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        viewBox="0 0 24 24"
      >
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    )}
  </button>
);

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, loading, clearAuth, updateUser } = useAuth();

  const [form, setForm] = useState(() => ({
    name: user?.name || "",
    email: user?.email || "",
  }));
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [showCur, setShowCur] = useState(false);
  const [showNxt, setShowNxt] = useState(false);
  const [tab, setTab] = useState("info");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  /* redirect if not logged in */
  useEffect(() => {
    if (!loading && !token) {
      router.push("/login");
    }
  }, [loading, token, router]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      setError("Name and email are required.");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await authApi.updateProfile(user.id, {
        name: form.name,
        email: form.email,
      });
      updateUser(updated);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err?.response?.data?.message || "Update failed. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "—";

  if (loading) return null;
  if (!user) return null;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f0f2f8] px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* ── Header card ── */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* banner */}
          <div className="h-28 bg-linear-to-r from-[#1b2b6b] to-[#2d3ebd] relative mb-12">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(to right,rgba(255,255,255,0.06) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,0.06) 1px,transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
          </div>

          <div className="px-8 pb-6">
            <div className="flex items-end justify-between -mt-10 mb-4">
              {/* avatar */}
              <div className="w-20 h-20 rounded-2xl bg-[#1b2b6b] border-4 border-white shadow flex items-center justify-center">
                <span className="text-white text-2xl font-extrabold">
                  {initials}
                </span>
              </div>
              {/* logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
            <h1 className="text-xl font-bold text-[#111827]">{user.name}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="flex items-center gap-3 mt-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#eef0fb] text-[#2d3ebd]">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                {user.role === "admin" ? "Admin" : "Accountant"}
              </span>
              <span className="text-xs text-gray-400">
                Member since {joinDate}
              </span>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-white rounded-xl shadow-sm p-1.5">
          {[
            { key: "info", label: "Personal Info" },
            { key: "security", label: "Security" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setError("");
                setSuccess("");
              }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
                tab === t.key
                  ? "bg-[#1b2b6b] text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Personal Info Tab ── */}
        {tab === "info" && (
          <div className="bg-white rounded-2xl shadow-sm px-8 py-8">
            <h2 className="text-base font-bold text-[#111827] mb-6">
              Personal Information
            </h2>

            {success && (
              <div className="mb-5 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700 flex items-center gap-2">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
                {success}
              </div>
            )}
            {error && (
              <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg
                      className="w-4.5 h-4.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, name: e.target.value }));
                      setError("");
                      setSuccess("");
                    }}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#1b2b6b]/25 focus:border-[#1b2b6b] transition"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Work Email
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg
                      className="w-4.5 h-4.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      viewBox="0 0 24 24"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M2 7l10 7 10-7" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, email: e.target.value }));
                      setError("");
                      setSuccess("");
                    }}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#1b2b6b]/25 focus:border-[#1b2b6b] transition"
                  />
                </div>
              </div>

              {/* Role (readonly) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Role
                </label>
                <input
                  type="text"
                  value={user.role === "admin" ? "Admin" : "Accountant"}
                  readOnly
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-100 text-sm text-gray-500 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Role can only be changed by an admin.
                </p>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#2d3ebd] hover:bg-[#2233aa] text-white font-bold text-sm transition disabled:opacity-60"
                >
                  {saving ? (
                    <svg
                      className="w-4 h-4 animate-spin"
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
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Security Tab ── */}
        {tab === "security" && (
          <div className="bg-white rounded-2xl shadow-sm px-8 py-8 space-y-8">
            <div>
              <h2 className="text-base font-bold text-[#111827] mb-1">
                Change Password
              </h2>
              <p className="text-sm text-gray-400 mb-6">
                Your password must be at least 8 characters.
              </p>

              <div className="space-y-5">
                {/* Current */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg
                        className="w-4.5 h-4.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        viewBox="0 0 24 24"
                      >
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                      </svg>
                    </span>
                    <input
                      type={showCur ? "text" : "password"}
                      value={pwForm.current}
                      onChange={(e) =>
                        setPwForm((p) => ({ ...p, current: e.target.value }))
                      }
                      placeholder="Enter current password"
                      className="w-full pl-10 pr-11 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#1b2b6b]/25 focus:border-[#1b2b6b] transition"
                    />
                    <EyeBtn
                      open={showCur}
                      onToggle={() => setShowCur(!showCur)}
                    />
                  </div>
                </div>

                {/* New */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg
                        className="w-4.5 h-4.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        viewBox="0 0 24 24"
                      >
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                      </svg>
                    </span>
                    <input
                      type={showNxt ? "text" : "password"}
                      value={pwForm.next}
                      onChange={(e) =>
                        setPwForm((p) => ({ ...p, next: e.target.value }))
                      }
                      placeholder="Enter new password"
                      className="w-full pl-10 pr-11 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#1b2b6b]/25 focus:border-[#1b2b6b] transition"
                    />
                    <EyeBtn
                      open={showNxt}
                      onToggle={() => setShowNxt(!showNxt)}
                    />
                  </div>
                </div>

                {/* Confirm */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={pwForm.confirm}
                    onChange={(e) =>
                      setPwForm((p) => ({ ...p, confirm: e.target.value }))
                    }
                    placeholder="Repeat new password"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#1b2b6b]/25 focus:border-[#1b2b6b] transition"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#2d3ebd] hover:bg-[#2233aa] text-white font-bold text-sm transition"
                    onClick={() =>
                      alert("Password change endpoint coming soon.")
                    }
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    Update Password
                  </button>
                </div>
              </div>
            </div>

            {/* Danger zone */}
            <div className="border-t border-gray-100 pt-7">
              <h3 className="text-sm font-bold text-red-500 mb-1">
                Danger Zone
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Once you sign out, you will need your credentials to access the
                platform again.
              </p>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
