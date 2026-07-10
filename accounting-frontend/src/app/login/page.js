"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/services/api";
import { GoogleLogin } from "@react-oauth/google";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/locales/auth";
import ThemeToggle from "@/components/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const { lang, setLang, dir, isRtl } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await authApi.googleLogin(credentialResponse.credential);
      setAuth(res.data, res.token);
      router.push("/profile");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          t("error.googleFailed", lang)
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError(t("error.fillFields", lang));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await authApi.login({ email, password });
      setAuth(res.data, res.token);
      router.push("/profile");
    } catch (err) {
      setError(err?.response?.data?.message || t("error.invalidCredentials", lang));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#e8ecf5] dark:bg-slate-900 relative overflow-hidden" dir={dir}>
      <div
        className="absolute inset-0 pointer-events-none opacity-100 dark:opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(to right,#c5cde0 1px,transparent 1px),linear-gradient(to bottom,#c5cde0 1px,transparent 1px)",
          backgroundSize: "52px 52px",
        }}
      />

      <div className="absolute bottom-0 right-0 w-125 h-100 bg-[#c8ede0] dark:bg-emerald-900/30 rounded-full blur-[80px] opacity-70 pointer-events-none" />

      <div className={`absolute top-5 z-10 flex items-center gap-2 ${isRtl ? 'left-5' : 'right-5'}`}>
        <ThemeToggle />
        <button
          onClick={() => setLang(lang === "ar" ? "en" : "ar")}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-gray-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition"
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
          {lang === "ar" ? "EN" : "AR"}
        </button>
      </div>

      <div className="relative z-10 w-full max-w-105 bg-white dark:bg-slate-800 rounded-2xl shadow-md dark:shadow-xl dark:border dark:border-slate-700 px-10 py-10">
        <div className="flex justify-center mb-7">
          <div className="w-17 h-17 rounded-xl bg-[#1b2b6b] flex flex-col items-center justify-center gap-0.5">
            <span className="text-white text-3xl font-extrabold leading-none">
              F
            </span>
            <div className="w-7 h-0.75 rounded-full bg-[#1fc99e]" />
            <div className="w-5 h-[2.5px] rounded-full bg-[#1fc99e] opacity-70" />
          </div>
        </div>

        <h1 className="text-center text-[28px] font-extrabold text-[#111827] dark:text-white mb-1 tracking-tight">
          {t("login.title", lang)}
        </h1>
        <p className="text-center text-sm text-gray-500 dark:text-slate-400 mb-8">
          {t("login.subtitle", lang)}
        </p>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
              {t("field.workEmail", lang)}
            </label>
            <div className="relative">
              <span className={`absolute top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 ${isRtl ? 'right-3.5' : 'left-3.5'}`}>
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
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder={t("field.emailPlaceholder", lang)}
                className={`w-full py-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900/50 text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#1b2b6b]/25 dark:focus:ring-blue-500/50 focus:border-[#1b2b6b] dark:focus:border-blue-500 transition ${isRtl ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4'}`}
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
              {t("field.password", lang)}
            </label>
            <div className="relative">
              <span className={`absolute top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 ${isRtl ? 'right-3.5' : 'left-3.5'}`}>
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
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder={t("field.passwordPlaceholder", lang)}
                className={`w-full py-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900/50 text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#1b2b6b]/25 dark:focus:ring-blue-500/50 focus:border-[#1b2b6b] dark:focus:border-blue-500 transition ${isRtl ? 'pr-10 pl-11 text-right' : 'pl-10 pr-11'}`}
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className={`absolute top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 ${isRtl ? 'left-3.5' : 'right-3.5'}`}
              >
                {showPass ? (
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
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 dark:bg-slate-800 accent-[#1b2b6b] dark:accent-blue-500"
              />
              {t("action.rememberMe", lang)}
            </label>
            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-[#111827] dark:text-white hover:underline"
            >
              {t("action.forgotPassword", lang)}
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#2d3ebd] dark:bg-blue-600 hover:bg-[#2233aa] dark:hover:bg-blue-700 active:bg-[#1b2b9e] dark:active:bg-blue-800 text-white font-bold text-base tracking-wide transition disabled:opacity-60"
          >
            {loading ? (
              <svg
                className="w-5 h-5 animate-spin"
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
              <>
                {t("action.signIn", lang)}
                <svg
                  className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </>
            )}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
          <span className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 tracking-[0.12em] whitespace-nowrap uppercase">
            {t("text.orContinueWith", lang)}
          </span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
        </div>

        <div className="space-y-3">
          <div className="relative w-full">
            <div className="absolute inset-0 z-10 opacity-0 flex justify-center overflow-hidden">
              <GoogleLogin
                width="360"
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  setError(t("error.googleFailed", lang));
                }}
              />
            </div>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition text-sm font-medium text-gray-700 dark:text-slate-300"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {t("action.google", lang)}
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-slate-400">
          {t("text.noAccount", lang)}{" "}
          <Link
            href="/register"
            className="font-bold text-[#111827] dark:text-white hover:underline"
          >
            {t("action.requestAccess", lang)}
          </Link>
        </p>
        <p className="mt-2 text-xs text-gray-400 dark:text-slate-500 flex items-center justify-center gap-2">
          <Link href="/privacy" className="hover:underline">
            {t("text.privacyPolicy", lang)}
          </Link>
          <span>•</span>
          <Link href="/terms" className="hover:underline">
            {t("text.termsOfService", lang)}
          </Link>
        </p>
      </div>
    </div>
  );
}