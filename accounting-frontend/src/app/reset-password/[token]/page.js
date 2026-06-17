"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/services/api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const { setAuth } = useAuth();

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
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
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
      setMessage("Password reset successfully. Redirecting to profile...");
      router.push("/profile");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Reset link is invalid or expired. Please request a new link."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e8ecf5] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-10">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-xl bg-[#1b2b6b] flex flex-col items-center justify-center gap-0.5 mb-5">
            <span className="text-white text-3xl font-extrabold leading-none">
              F
            </span>
            <div className="w-7 h-0.75 rounded-full bg-[#1fc99e]" />
            <div className="w-5 h-[2.5px] rounded-full bg-[#1fc99e] opacity-70" />
          </div>

          <h1 className="text-2xl font-bold text-gray-800">Reset Password</h1>

          <p className="text-sm text-gray-500 mt-2">
            Enter your new password to access your account again.
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
            <label className="block mb-2 text-sm font-medium text-gray-700">
              New Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-[#1b2b6b]/25 focus:border-[#1b2b6b]"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={showPasswordConfirm ? "text" : "password"}
                value={passwordConfirm}
                onChange={(e) => {
                  setPasswordConfirm(e.target.value);
                  setError("");
                }}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-[#1b2b6b]/25 focus:border-[#1b2b6b]"
              />

              <button
                type="button"
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500"
              >
                {showPasswordConfirm ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#2d3ebd] text-white font-bold hover:bg-[#2233aa] disabled:opacity-60 transition"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link
            href="/login"
            className="text-sm font-bold text-gray-700 hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
