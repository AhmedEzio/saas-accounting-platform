"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { authApi } from "@/services/api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const { setAuth } = useAuth();

  const { t, lang, toggleLang } = useLang();
  const isRtl = lang === "ar";

  const token = params?.token;

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !passwordConfirm) {
      setError(t("fillAll"));
      return;
    }

    if (password.length < 8) {
      setError(t("minPassword"));
      return;
    }

    if (password !== passwordConfirm) {
      setError(t("passwordMatch"));
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const res = await authApi.resetPassword({
        token,
        password,
        passwordConfirm,
      });

      setAuth(res.data, res.token);

      setMessage(t("passwordResetSuccess"));

      setTimeout(() => {
        router.push("/profile");
      }, 1000);
    } catch (err) {
      setError(
        err?.response?.data?.message || t("invalidResetLink")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-[#e8ecf5] relative overflow-hidden">
      {/* Grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right,#c5cde0 1px,transparent 1px),linear-gradient(to bottom,#c5cde0 1px,transparent 1px)",
          backgroundSize: "52px 52px",
        }}
      />

      {/* Glow */}
      <div className="absolute bottom-0 right-0 w-125 h-100 bg-[#c8ede0] rounded-full blur-[80px] opacity-70 pointer-events-none" />

      {/* Language Switch */}
    <div className="absolute top-5 right-5 z-10">
        <button
          onClick={toggleLang}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-gray-300 bg-white/80 text-sm font-medium text-gray-600 hover:bg-white transition cursor-pointer"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
          </svg>
          {isRtl ? "EN" : "AR"}
        </button>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-md p-10">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-xl bg-[#1b2b6b] flex flex-col items-center justify-center gap-0.5 mb-5">
            <span className="text-white text-3xl font-extrabold leading-none">
              F
            </span>

            <div className="w-7 h-0.75 rounded-full bg-[#1fc99e]" />
            <div className="w-5 h-0.5 rounded-full bg-[#1fc99e] opacity-70" />
          </div>

          <h1 className="text-2xl font-bold text-gray-800">
            {t("resetPassword")}
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            {t("resetSubtitle")}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              className={`block mb-2 text-sm font-medium text-gray-700 ${
                isRtl ? "text-right" : ""
              }`}
            >
              {t("newPassword")}
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder={t("passwordPlaceholder")}
                className={`w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-[#1b2b6b]/25 focus:border-[#1b2b6b] ${
                  isRtl ? "text-right pl-12" : "pr-12"
                }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 ${
                  isRtl ? "left-3" : "right-3"
                }`}
              >
                {showPassword ? t("hide") : t("show")}
              </button>
            </div>
          </div>

          <div>
            <label
              className={`block mb-2 text-sm font-medium text-gray-700 ${
                isRtl ? "text-right" : ""
              }`}
            >
              {t("confirmPassword")}
            </label>

            <div className="relative">
              <input
                type={showPasswordConfirm ? "text" : "password"}
                value={passwordConfirm}
                onChange={(e) => {
                  setPasswordConfirm(e.target.value);
                  setError("");
                }}
                placeholder={t("passwordPlaceholder")}
                className={`w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-[#1b2b6b]/25 focus:border-[#1b2b6b] ${
                  isRtl ? "text-right pl-12" : "pr-12"
                }`}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPasswordConfirm(!showPasswordConfirm)
                }
                className={`absolute top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 ${
                  isRtl ? "left-3" : "right-3"
                }`}
              >
                {showPasswordConfirm ? t("hide") : t("show")}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#2d3ebd] text-white font-bold hover:bg-[#2233aa] disabled:opacity-60 transition"
          >
            {loading ? t("resetting") : t("resetPassword")}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link
            href="/login"
            className="text-sm font-bold text-gray-700 hover:underline"
          >
            {t("backToLogin")}
          </Link>
        </div>
      </div>
    </div>
  );
}