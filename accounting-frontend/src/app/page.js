"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { subscriptionApi } from "@/services/api";

// --- SVG Icons ---

const PillarLogo = () => (
  <svg
    className="w-6 h-6 text-primary"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="22" x2="21" y2="22"></line>
    <line x1="6" y1="18" x2="18" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="6"></line>
    <line x1="3" y1="2" x2="21" y2="2"></line>
    <path d="M7 6v12M11 6v12M13 6v12M17 6v12"></path>
  </svg>
);

const SparklesIcon = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5 5 3Z" />
    <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z" />
  </svg>
);

const UsersIcon = () => (
  <svg
    className="w-5 h-5 text-secondary"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const InvoiceIcon = () => (
  <svg
    className="w-5 h-5 text-secondary"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const PaymentIcon = () => (
  <svg
    className="w-5 h-5 text-secondary"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);

const VaultIcon = () => (
  <svg
    className="w-5 h-5 text-secondary"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M12 2a5 5 0 0 0-5 5v4h10V7a5 5 0 0 0-5-5z" />
    <circle cx="12" cy="16" r="1" />
  </svg>
);

const CheckIcon = ({ className = "w-5 h-5 text-secondary" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function HomePage() {
  const { user } = useAuth();
  const [dbPlans, setDbPlans] = useState([]);

  // Fetch plans from backend
  useEffect(() => {
    subscriptionApi
      .getPlans()
      .then((res) => {
        if (res && res.success && res.data) {
          setDbPlans(res.data);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch plans from backend, using default static pricing.", err);
      });
  }, []);

  // Match backend plans to static tiers or fall back to defaults
  const getPlanPrice = (tierName, defaultPrice) => {
    const matched = dbPlans.find((p) =>
      p.name.toLowerCase().includes(tierName.toLowerCase())
    );
    return matched ? `$${matched.price}` : `$${defaultPrice}`;
  };

  const getPlanRegisterLink = (tierName) => {
    const matched = dbPlans.find((p) =>
      p.name.toLowerCase().includes(tierName.toLowerCase())
    );
    return matched ? `/register?planId=${matched._id}` : "/register";
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8fe] text-[#1a1b1f] selection:bg-secondary/20">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-[#faf8fe]/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 font-display font-bold text-xl text-primary">
            <PillarLogo />
            <span>Finora</span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("features")}
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("platform")}
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors cursor-pointer"
            >
              Platform
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors cursor-pointer"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection("ai-assistant")}
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors cursor-pointer"
            >
              AI Assistant
            </button>
          </nav>

          {/* CTA / Auth Buttons */}
          <div className="flex items-center gap-5">
            {user ? (
              <Link
                href="/overview"
                className="px-4.5 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover shadow-sm transition-all duration-200"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4.5 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover shadow-sm transition-all duration-200"
                >
                  Start Free Trial
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">

        {/* Hero Section */}
        <section
          id="platform"
          className="relative py-20 overflow-hidden"
          style={{
            backgroundImage: "radial-gradient(rgba(0, 21, 64, 0.04) 1.2px, transparent 1.2px)",
            backgroundSize: "28px 28px",
          }}
        >
          <div className="mx-auto max-w-5xl px-6 flex flex-col items-center text-center relative z-10">
            {/* AI Badge */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-accent-green-bg text-accent-green text-xs font-semibold mb-8 border border-accent-green/10 shadow-sm animate-fade-in">
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>AI-Powered Accounting Intelligence</span>
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-primary leading-[1.12] max-w-3xl mb-6">
              Accounting Intelligence for the <br />
              <span className="text-secondary">Modern Accountant</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mb-10 leading-relaxed font-normal">
              Manage clients, automate invoices, track payments, and store documents in one powerful, AI-driven platform built for freelancers and SMBs.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-row items-center justify-center gap-4 mb-16 w-full sm:w-auto">
              <Link
                href={user ? "/overview" : "/register"}
                className="w-full sm:w-auto text-center px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover hover:-translate-y-0.5 transition-all duration-200"
              >
                Start Free Trial
              </Link>
              <button
                onClick={() => scrollToSection("pricing")}
                className="w-full sm:w-auto text-center px-6 py-3 bg-white text-primary border border-gray-200 font-semibold rounded-lg shadow-sm hover:bg-gray-50 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                View Pricing
              </button>
            </div>

            {/* Tablet Mockup Container */}
            <div className="w-full max-w-4xl rounded-2xl md:rounded-3xl bg-[#1b4343] p-4 sm:p-6 md:p-8 shadow-2xl border border-[#1b4343]/30 relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl md:rounded-3xl pointer-events-none" />
              <div className="bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-800 relative aspect-[16/10] w-full">
                <Image
                  src="/dashboard_mockup.png"
                  alt="Finora Dashboard Mockup"
                  fill
                  sizes="(max-w-7xl) 100vw"
                  className="object-cover object-top"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white/50 border-y border-gray-100">
          <div className="mx-auto max-w-7xl px-6">

            {/* Section Heading */}
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-4">
                Everything you need to scale
              </h2>
              <p className="text-gray-600 text-base sm:text-lg">
                A unified suite designed to streamline your financial operations, from client acquisition to final reconciliation.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Feature 1 - AI Assistant (2 columns on desktop) */}
              <div
                id="ai-assistant"
                className="md:col-span-2 rounded-2xl bg-gradient-to-br from-accent-green-bg/60 via-white to-white p-8 border border-gray-200/80 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 min-h-[340px]"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-accent-green-bg flex items-center justify-center mb-6 border border-accent-green/10">
                    <SparklesIcon className="w-5 h-5 text-accent-green" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-primary mb-3">
                    AI Accounting Assistant
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed max-w-xl">
                    Automate data entry, categorize expenses instantly, and receive intelligent financial insights before you even ask.
                  </p>
                </div>

                {/* Micro-UI: AI Insight Box */}
                <div className="mt-8 bg-white border border-gray-100 rounded-xl p-4.5 shadow-sm max-w-md flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                    <CheckIcon className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 mb-0.5">Finora AI Insight</h4>
                    <p className="text-xs text-gray-500 leading-normal">
                      Identified recurring subscriptions that can be optimized to save $1,200 annually.{" "}
                      <Link href={user ? "/overview" : "/register"} className="text-secondary hover:underline font-semibold">
                        Review suggestions
                      </Link>
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 2 - Client Management */}
              <div className="rounded-2xl bg-white p-8 border border-gray-200/80 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-[#f4f3f8] flex items-center justify-center mb-6">
                  <UsersIcon />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-primary mb-3">
                    Client Management
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    A dedicated CRM for your accounting practice. Track communications, share contracts, and manage client lifecycles.
                  </p>
                </div>
              </div>

              {/* Feature 3 - Invoice Management */}
              <div className="rounded-2xl bg-white p-8 border border-gray-200/80 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-[#f4f3f8] flex items-center justify-center mb-6">
                  <InvoiceIcon />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-primary mb-3">
                    Invoice Management
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Create professional, customizable invoices. Set up automated reminders and handle tax fees seamlessly.
                  </p>
                </div>
              </div>

              {/* Feature 4 - Payment Tracking */}
              <div className="rounded-2xl bg-white p-8 border border-gray-200/80 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-[#f4f3f8] flex items-center justify-center mb-6">
                  <PaymentIcon />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-primary mb-3">
                    Payment Tracking
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Real-time reconciliation with bank feeds. Track incoming payments and manage accounts receivable effortlessly.
                  </p>
                </div>
              </div>

              {/* Feature 5 - Global Vault */}
              <div className="rounded-2xl bg-white p-8 border border-gray-200/80 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-[#f4f3f8] flex items-center justify-center mb-6">
                  <VaultIcon />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-primary mb-3">
                    Global Vault
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Secure digital document storage with built-in multi-language OCR AI and multi-currency support for global operations.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-gradient-to-b from-transparent to-[#faf8fe]/80">
          <div className="mx-auto max-w-7xl px-6">

            {/* Section Heading */}
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-4">
                Transparent Pricing for Growth
              </h2>
              <p className="text-gray-600 text-base sm:text-lg">
                Choose the plan that fits your accounting needs. No hidden fees.
              </p>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">

              {/* Plan 1: Starter */}
              <div className="rounded-2xl bg-white p-8 border border-gray-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 relative">
                <div>
                  <h3 className="font-display text-xl font-bold text-primary mb-1">Starter</h3>
                  <p className="text-xs text-gray-500 mb-6">For freelancers and solo practitioners.</p>

                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-extrabold text-primary tracking-tight">
                      {getPlanPrice("Starter", "29")}
                    </span>
                    <span className="text-gray-500 text-sm font-medium">/mo</span>
                  </div>

                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                      <CheckIcon className="w-4 h-4 text-[#00a975]" />
                      <span>Up to 50 Clients</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                      <CheckIcon className="w-4 h-4 text-[#00a975]" />
                      <span>Basic Invoicing</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                      <CheckIcon className="w-4 h-4 text-[#00a975]" />
                      <span>5GB Document Storage</span>
                    </li>
                  </ul>
                </div>

                <Link
                  href={getPlanRegisterLink("Starter")}
                  className="w-full text-center py-2.5 bg-white text-primary border border-gray-300 font-semibold rounded-lg hover:bg-gray-50 transition duration-200 text-sm"
                >
                  Start Starter Trial
                </Link>
              </div>

              {/* Plan 2: Professional (Popular) */}
              <div className="rounded-2xl bg-primary text-white p-8 border border-primary/10 shadow-xl flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 relative md:-mt-4 md:mb-4">
                {/* Popular Badge */}
                <div className="absolute top-4 right-4 bg-[#00a975] text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full">
                  POPULAR
                </div>

                <div>
                  <h3 className="font-display text-xl font-bold mb-1">Professional</h3>
                  <p className="text-xs text-blue-100/70 mb-6">For growing accounting firms and SMBs.</p>

                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-extrabold tracking-tight">
                      {getPlanPrice("Professional", "79")}
                    </span>
                    <span className="text-blue-100/70 text-sm font-medium">/mo</span>
                  </div>

                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3 text-sm text-blue-50">
                      <CheckIcon className="w-4 h-4 text-[#00a975]" />
                      <span>Unlimited Clients</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-blue-50">
                      <CheckIcon className="w-4 h-4 text-[#00a975]" />
                      <span>Advanced Invoicing & Recon</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-blue-50">
                      <CheckIcon className="w-4 h-4 text-[#00a975]" />
                      <span>Basic AI Assistant (500 credits)</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-blue-50">
                      <CheckIcon className="w-4 h-4 text-[#00a975]" />
                      <span>Multi-Currency Support</span>
                    </li>
                  </ul>
                </div>

                <Link
                  href={getPlanRegisterLink("Professional")}
                  className="w-full text-center py-2.5 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition duration-200 text-sm"
                >
                  Start Professional Trial
                </Link>
              </div>

              {/* Plan 3: Business */}
              <div className="rounded-2xl bg-white p-8 border border-gray-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 relative">
                <div>
                  <h3 className="font-display text-xl font-bold text-primary mb-1">Business</h3>
                  <p className="text-xs text-gray-500 mb-6">For large enterprises needing full automation.</p>

                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-extrabold text-primary tracking-tight">
                      {getPlanPrice("Business", "199")}
                    </span>
                    <span className="text-gray-500 text-sm font-medium">/mo</span>
                  </div>

                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                      <CheckIcon className="w-4 h-4 text-[#00a975]" />
                      <span>Everything in Pro</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                      <CheckIcon className="w-4 h-4 text-[#00a975]" />
                      <span>Unlimited AI Assistant</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                      <CheckIcon className="w-4 h-4 text-[#00a975]" />
                      <span>Custom API Access</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                      <CheckIcon className="w-4 h-4 text-[#00a975]" />
                      <span>Dedicated Success Manager</span>
                    </li>
                  </ul>
                </div>

                <Link
                  href={getPlanRegisterLink("Business")}
                  className="w-full text-center py-2.5 bg-white text-primary border border-gray-300 font-semibold rounded-lg hover:bg-gray-50 transition duration-200 text-sm"
                >
                  Contact Sales
                </Link>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* Footer Section */}
      <footer className="w-full border-t border-gray-100 bg-[#faf8fe] py-12">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 font-display font-bold text-lg text-primary">
            <PillarLogo />
            <span>Finora</span>
          </div>
          {/* Copyright */}
          <p className="text-xs text-gray-500">
            &copy; 2026 Finora Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
