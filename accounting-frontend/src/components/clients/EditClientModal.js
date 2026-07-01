"use client";

import { useState, useEffect } from "react";

const inputCls =
  "w-full px-3.5 py-2.5 border-[1.5px] border-gray-200 rounded-[10px] text-sm text-gray-900 bg-gray-50 outline-none transition-colors focus:border-[#1b2b6b] focus:bg-white";

export default function EditClientModal({ client, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* pre-fill whenever the client prop changes */
  useEffect(() => {
    if (!client) return;
    setForm({
      name: client.name ?? "",
      email: client.email ?? "",
      phone: client.phone ?? "",
      notes: client.notes ?? "",
    });
    setError("");
  }, [client]);

  function set(field) {
    return (e) => {
      setForm((p) => ({ ...p, [field]: e.target.value }));
      setError("");
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      setError("Name, email and phone are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(client._id ?? client._id, form);
      onClose();
    } catch (err) {
      setError(err?.message || "Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!client) return null;

  return (
    <div
      className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[200] flex items-center justify-center p-5"
      onClick={(e) => e.target === e.currentTarget && !saving && onClose()}
    >
      <div
        className="bg-white rounded-[20px] p-9 w-full max-w-[460px] shadow-[0_24px_60px_rgba(0,0,0,.18)] max-h-[90vh] overflow-y-auto"
        style={{ animation: "editModalIn .2s ease" }}
      >
        {/* header */}
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-[18px] font-extrabold text-gray-900">Edit Client</h2>
            <p className="text-[13px] text-gray-500 mt-0.5">Update the details for this record.</p>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 -mt-1 -mr-1 disabled:opacity-40"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* error */}
        {error && (
          <div className="text-[13px] text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mt-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {/* Name */}
          <div>
            <label htmlFor="ec-name" className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Full Name / Company
            </label>
            <input
              id="ec-name"
              type="text"
              placeholder="e.g. Acme Corp"
              value={form.name}
              onChange={set("name")}
              className={inputCls}
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="ec-email" className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Email Address
            </label>
            <input
              id="ec-email"
              type="email"
              placeholder="contact@example.com"
              value={form.email}
              onChange={set("email")}
              className={inputCls}
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="ec-phone" className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Phone Number
            </label>
            <input
              id="ec-phone"
              type="text"
              placeholder="+1 (555) 000-0000"
              value={form.phone}
              onChange={set("phone")}
              className={inputCls}
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="ec-notes" className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Notes
            </label>
            <textarea
              id="ec-notes"
              value={form.notes}
              onChange={set("notes")}
              placeholder="Write any notes about this client..."
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* actions */}
          <div className="flex gap-2.5 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2.5 border-[1.5px] border-gray-200 rounded-[10px] bg-white text-[14px] font-semibold text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-edit-client-btn"
              disabled={saving}
              className="px-5 py-2.5 border-none rounded-[10px] bg-[#1b2b6b] hover:bg-[#2d3ebd] text-white text-[14px] font-bold cursor-pointer transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {saving ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              )}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes editModalIn {
          from { opacity: 0; transform: scale(.95) translateY(12px); }
          to   { opacity: 1; transform: scale(1)  translateY(0); }
        }
      `}</style>
    </div>
  );
}
