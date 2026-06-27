"use client";

import { useState } from "react";

const COLORS = [
  "#3b5bdb", "#0ca678", "#6c5ce7", "#e84393",
  "#f03e3e", "#f59f00", "#1098ad", "#2f9e44",
];

const EMPTY = { name: "", email: "", phone: "", type: "client", notes: "" };

export default function AddClientModal({ onClose, onAdd }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      setError("All fields are required.");
      return;
    }
    const entry = {
      ...form,
      currentBalance: 0,
      createdAt: new Date().toISOString().slice(0, 10),
      initials: form.name
        .split(" ")
        .map((n) => n[0])
        .join(""), color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
    onAdd(entry);
    setForm(EMPTY);
    setError("");
    onClose();
  }

  function set(field) {
    return (e) => {
      setForm((p) => ({ ...p, [field]: e.target.value }));
      setError("");
    };
  }

  return (
    <div
      className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[200] flex items-center justify-center p-5"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-[20px] p-9 w-full max-w-[460px] shadow-[0_24px_60px_rgba(0,0,0,.18)]"
        style={{ animation: "modalIn .2s ease" }}
      >
        {/* header */}
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-[18px] font-extrabold text-gray-900">Add New Client</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 -mt-1 -mr-1"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-[13px] text-gray-500 mb-6">
          Fill in the details to add a new client or vendor.
        </p>

        {/* error */}
        {error && (
          <div className="text-[13px] text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="nc-name" className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Full Name / Company
            </label>
            <input
              id="nc-name"
              type="text"
              placeholder="e.g. Acme Corp"
              value={form.name}
              onChange={set("name")}
              className="w-full px-3.5 py-2.5 border-[1.5px] border-gray-200 rounded-[10px] text-sm text-gray-900 bg-gray-50 outline-none transition-colors focus:border-[#1b2b6b] focus:bg-white"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="nc-email" className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Email Address
            </label>
            <input
              id="nc-email"
              type="email"
              placeholder="contact@example.com"
              value={form.email}
              onChange={set("email")}
              className="w-full px-3.5 py-2.5 border-[1.5px] border-gray-200 rounded-[10px] text-sm text-gray-900 bg-gray-50 outline-none transition-colors focus:border-[#1b2b6b] focus:bg-white"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="nc-phone" className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Phone Number
            </label>
            <input
              id="nc-phone"
              type="text"
              placeholder="+1 (555) 000-0000"
              value={form.phone}
              onChange={set("phone")}
              className="w-full px-3.5 py-2.5 border-[1.5px] border-gray-200 rounded-[10px] text-sm text-gray-900 bg-gray-50 outline-none transition-colors focus:border-[#1b2b6b] focus:bg-white"
            />
          </div>

          {/* Type */}
          <div>
            <label htmlFor="nc-type" className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Type
            </label>
            <select
              id="nc-type"
              value={form.type}
              onChange={set("type")}
              className="w-full px-3.5 py-2.5 border-[1.5px] border-gray-200 rounded-[10px] text-sm text-gray-900 bg-gray-50 outline-none transition-colors focus:border-[#1b2b6b] focus:bg-white"
            >
              <option value="client">Client</option>
              <option value="vendor">Vendor</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="nc-notes"
              className="block text-[13px] font-semibold text-gray-700 mb-1.5"
            >
              Notes
            </label>

            <textarea
              id="nc-notes"
              value={form.notes}
              onChange={set("notes")}
              placeholder="Write any notes about this client..."
              rows={4}
              className="w-full px-3.5 py-2.5 border-[1.5px] border-gray-200 rounded-[10px] text-sm text-gray-900 bg-gray-50 outline-none transition-colors focus:border-[#1b2b6b] focus:bg-white resize-none"
            />
          </div>
          {/* actions */}
          <div className="flex gap-2.5 justify-end pt-2">
            <button
              type="button"
              onClick={() => { onClose(); setError(""); }}
              className="px-5 py-2.5 border-[1.5px] border-gray-200 rounded-[10px] bg-white text-[14px] font-semibold text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-client-btn"
              className="px-5 py-2.5 border-none rounded-[10px] bg-[#1b2b6b] text-white text-[14px] font-bold cursor-pointer hover:bg-[#2d3ebd] transition-colors"
            >
              Add Client
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(.95) translateY(12px); }
          to   { opacity: 1; transform: scale(1)  translateY(0); }
        }
      `}</style>
    </div>
  );
}
