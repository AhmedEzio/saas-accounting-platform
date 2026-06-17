"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/services/api";

export default function ForgotPassword() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await authApi.forgotPassword({
        email,
      });

      setMessage(
        res?.resetUrl
          ? `Reset link created. Development link: ${res.resetUrl}`
          : "If this email exists, a reset password link has been sent."
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e8ecf5] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-10">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-xl bg-[#1b2b6b] flex items-center justify-center mb-5">
            <span className="text-white text-3xl font-bold">F</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-800">Forgot Password?</h1>

          <p className="text-sm text-gray-500 mt-2">
            Enter your email and we will send you a reset link.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-600 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="block mb-2 text-sm font-medium">Email</label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className="w-full px-4 py-3 rounded-lg border bg-gray-50 outline-none focus:ring-2 focus:ring-blue-300"
          />

          <button
            disabled={loading}
            className="w-full mt-6 py-3 rounded-xl bg-[#2d3ebd] text-white font-bold hover:bg-[#2233aa]"
          >
            {loading ? "Sending..." : "Send Reset Link"}
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
