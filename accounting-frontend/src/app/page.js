"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { subscriptionApi } from "@/services/api";
import useLandingLang from "@/hooks/useLandingLang";

// --- SVG Icons ---

const FinoraLogo = () => (
  <div className="flex items-center gap-2.5">
    <div className="w-9 h-9 rounded-lg bg-[#0b2154] flex flex-col items-center justify-center relative shrink-0">
      <span className="text-white font-extrabold text-base leading-none mt-0.5 select-none">F</span>
      <div className="w-3.5 h-0.5 bg-[#00a975] rounded-full mt-0.5"></div>
    </div>
    <div className="flex flex-col text-start leading-none select-none">
      <span className="font-display font-bold text-[15px] text-[#001540]">Finora</span>
      <span className="text-[9px] text-gray-500 font-semibold mt-0.5 uppercase tracking-wide">Accounting AI</span>
    </div>
  </div>
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
  const { lang, dir, isRtl, setLang, toggleLang, t } = useLandingLang();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        console.warn(
          "Could not fetch plans from backend, using default static pricing.",
          err
        );
      });
  }, []);


  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-[#faf8fe] text-[#1a1b1f] selection:bg-secondary/20 font-sans transition-all duration-300"
      dir={dir}
      style={{
        backgroundColor: "#faf8fe",
        backgroundImage:
          "linear-gradient(to bottom, transparent 0%, transparent 72%, #faf8fe 80%, #faf8fe 100%), radial-gradient(rgba(6, 20, 66, 0.09) 1.1px, transparent 1.1px)",
        backgroundSize: "100% 100%, 24px 24px",
        backgroundPosition: "top center, top center",
        backgroundRepeat: "no-repeat, repeat",
      }}
    >
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-100/50 bg-[#faf8fe]/45 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center select-none"
          >
            <FinoraLogo />
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("features")}
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors cursor-pointer"
            >
              {t("nav.features")}
            </button>

            <button
              onClick={() => scrollToSection("platform")}
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors cursor-pointer"
            >
              {t("nav.platform")}
            </button>

            <button
              onClick={() => scrollToSection("pricing")}
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors cursor-pointer"
            >
              {t("nav.pricing")}
            </button>

            <button
              onClick={() => scrollToSection("ai-assistant")}
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors cursor-pointer"
            >
              {t("nav.aiAssistant")}
            </button>
          </nav>

          {/* CTA / Auth Buttons */}
          <div className="flex items-center gap-5">
            {/* Language Toggle Button */}
            <button
              onClick={toggleLang}
              className="hidden sm:flex w-10 h-10 items-center justify-center rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-600 hover:text-primary hover:border-primary/30 hover:bg-gray-50 transition-all duration-200 shadow-sm cursor-pointer select-none shrink-0"
              title={lang === "ar" ? "Switch to English" : "تغيير إلى العربية"}
            >
              {lang === "ar" ? "EN" : "AR"}
            </button>

            {user ? (
              <Link
                href="/overview"
                className="px-4.5 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover shadow-sm transition-all duration-200"
              >
                {t("nav.goToDashboard")}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors"
                >
                  {t("nav.login")}
                </Link>

                <Link
                  href="/register"
                  className="px-4.5 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover shadow-sm transition-all duration-200"
                >
                  {t("nav.startTrial")}
                </Link>
              </>
            )}

            {/* Hamburger Button for Mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-primary transition-colors focus:outline-none cursor-pointer"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer Overlay */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
        
        {/* Content Drawer */}
        <div
          className={`absolute top-0 bottom-0 ${
            isRtl ? "left-0" : "right-0"
          } w-72 max-w-[80vw] bg-[#faf8fe] shadow-2xl p-6 flex flex-col gap-6 transform transition-transform duration-300 ${
            isMobileMenuOpen ? "translate-x-0" : isRtl ? "-translate-x-full" : "translate-x-full"
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center select-none"
            >
              <FinoraLogo />
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 text-gray-500 hover:text-primary transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Drawer Links */}
          <nav className="flex flex-col gap-5 text-start">
            <button
              onClick={() => {
                scrollToSection("features");
                setIsMobileMenuOpen(false);
              }}
              className="text-start font-medium text-gray-700 hover:text-primary transition-colors text-base cursor-pointer"
            >
              {t("nav.features")}
            </button>
            <button
              onClick={() => {
                scrollToSection("platform");
                setIsMobileMenuOpen(false);
              }}
              className="text-start font-medium text-gray-700 hover:text-primary transition-colors text-base cursor-pointer"
            >
              {t("nav.platform")}
            </button>
            <button
              onClick={() => {
                scrollToSection("pricing");
                setIsMobileMenuOpen(false);
              }}
              className="text-start font-medium text-gray-700 hover:text-primary transition-colors text-base cursor-pointer"
            >
              {t("nav.pricing")}
            </button>
            <button
              onClick={() => {
                scrollToSection("ai-assistant");
                setIsMobileMenuOpen(false);
              }}
              className="text-start font-medium text-gray-700 hover:text-primary transition-colors text-base cursor-pointer"
            >
              {t("nav.aiAssistant")}
            </button>
          </nav>

          <div className="border-t border-gray-100 my-2" />

          {/* Language and Auth */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">{lang === "ar" ? "اللغة" : "Language"}</span>
              <button
                onClick={() => {
                  toggleLang();
                  setIsMobileMenuOpen(false);
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-600 hover:text-primary hover:bg-gray-50 transition-all duration-200 shadow-sm cursor-pointer select-none"
              >
                {lang === "ar" ? "EN" : "AR"}
              </button>
            </div>

            {user ? (
              <Link
                href="/overview"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover shadow-sm transition-all duration-200"
              >
                {t("nav.goToDashboard")}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t("nav.login")}
                </Link>

                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover shadow-sm transition-all duration-200"
                >
                  {t("nav.startTrial")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section id="platform" className="relative py-20 overflow-hidden">
          <div className="mx-auto max-w-5xl px-6 flex flex-col items-center text-center relative z-10">
            {/* AI Badge */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-accent-green-bg text-accent-green text-xs font-semibold mb-8 border border-accent-green/10 shadow-sm animate-fade-in">
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>{t("hero.badge")}</span>
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-primary leading-[1.12] max-w-3xl mb-6">
              {t("hero.title1")} <br />
              <span className="bg-gradient-to-r from-[#061442] via-[#12317f] to-[#3b82f6] bg-clip-text text-transparent">
                {t("hero.title2")}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mb-10 leading-relaxed font-normal">
              {t("hero.subtitle")}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 w-full sm:w-auto px-4">
              <Link
                href={user ? "/overview" : "/register"}
                className="w-full sm:w-auto text-center px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover hover:-translate-y-0.5 transition-all duration-200"
              >
                {t("nav.startTrial")}
              </Link>

              <button
                onClick={() => scrollToSection("pricing")}
                className="w-full sm:w-auto text-center px-6 py-3 bg-white text-primary border border-gray-200 font-semibold rounded-lg shadow-sm hover:bg-gray-50 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                {t("nav.viewPricing")}
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
        <section
          id="features"
          className="py-24 bg-white/50 border-y border-gray-100"
        >
          <div className="mx-auto max-w-7xl px-6">
            {/* Section Heading */}
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-4">
                {t("features.title")}
              </h2>

              <p className="text-gray-600 text-base sm:text-lg">
                {t("features.subtitle")}
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 - AI Assistant */}
              <div
                id="ai-assistant"
                className="md:col-span-2 rounded-2xl bg-gradient-to-br from-accent-green-bg/60 via-white to-white p-8 border border-gray-200/80 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 min-h-[340px]"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-accent-green-bg flex items-center justify-center mb-6 border border-accent-green/10">
                    <SparklesIcon className="w-5 h-5 text-accent-green" />
                  </div>

                  <h3 className="font-display text-xl font-bold text-primary mb-3 text-start">
                    {t("feature1.title")}
                  </h3>

                  <p className="text-gray-600 text-sm leading-relaxed max-w-xl text-start">
                    {t("feature1.desc")}
                  </p>
                </div>

                {/* Micro-UI: AI Insight Box */}
                <div className="mt-8 bg-white border border-gray-100 rounded-xl p-4.5 shadow-sm max-w-md w-full flex items-start gap-3.5 text-start">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                    <CheckIcon className="w-4 h-4 text-emerald-600" />
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-gray-900 mb-0.5">
                      {t("feature1.insightTitle")}
                    </h4>

                    <p className="text-xs text-gray-500 leading-normal">
                      {t("feature1.insightDesc")}
                      <Link
                        href={user ? "/overview" : "/register"}
                        className="text-secondary hover:underline font-semibold"
                      >
                        {t("feature1.insightAction")}
                      </Link>
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 2 - Client Management */}
              <div className="rounded-2xl bg-white p-8 border border-gray-200/80 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-start">
                <div className="w-10 h-10 rounded-lg bg-[#f4f3f8] flex items-center justify-center mb-6">
                  <UsersIcon />
                </div>

                <div>
                  <h3 className="font-display text-lg font-bold text-primary mb-3">
                    {t("feature2.title")}
                  </h3>

                  <p className="text-gray-600 text-sm leading-relaxed">
                    {t("feature2.desc")}
                  </p>
                </div>
              </div>

              {/* Feature 3 - Invoice Management */}
              <div className="rounded-2xl bg-white p-8 border border-gray-200/80 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-start">
                <div className="w-10 h-10 rounded-lg bg-[#f4f3f8] flex items-center justify-center mb-6">
                  <InvoiceIcon />
                </div>

                <div>
                  <h3 className="font-display text-lg font-bold text-primary mb-3">
                    {t("feature3.title")}
                  </h3>

                  <p className="text-gray-600 text-sm leading-relaxed">
                    {t("feature3.desc")}
                  </p>
                </div>
              </div>

              {/* Feature 4 - Payment Tracking */}
              <div className="rounded-2xl bg-white p-8 border border-gray-200/80 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-start">
                <div className="w-10 h-10 rounded-lg bg-[#f4f3f8] flex items-center justify-center mb-6">
                  <PaymentIcon />
                </div>

                <div>
                  <h3 className="font-display text-lg font-bold text-primary mb-3">
                    {t("feature4.title")}
                  </h3>

                  <p className="text-gray-600 text-sm leading-relaxed">
                    {t("feature4.desc")}
                  </p>
                </div>
              </div>

              {/* Feature 5 - Global Vault */}
              <div className="rounded-2xl bg-white p-8 border border-gray-200/80 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-start">
                <div className="w-10 h-10 rounded-lg bg-[#f4f3f8] flex items-center justify-center mb-6">
                  <VaultIcon />
                </div>

                <div>
                  <h3 className="font-display text-lg font-bold text-primary mb-3">
                    {t("feature5.title")}
                  </h3>

                  <p className="text-gray-600 text-sm leading-relaxed">
                    {t("feature5.desc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section
          id="pricing"
          className="py-24 bg-gradient-to-b from-transparent to-[#faf8fe]/80"
        >
          <div className="mx-auto max-w-7xl px-6">
            {/* Section Heading */}
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-4">
                {t("pricing.title")}
              </h2>

              <p className="text-gray-600 text-base sm:text-lg">
                {t("pricing.subtitle")}
              </p>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
              {dbPlans.length > 0 && dbPlans.map((plan, index) => {
                const isPopular = plan.name.toLowerCase().includes("professional") || index === 1;

                return (
                  <div 
                    key={plan._id || index}
                    className={`rounded-2xl p-8 shadow-sm flex flex-col justify-between transition-all duration-300 relative text-start ${
                      isPopular 
                        ? "bg-primary text-white border border-primary/10 shadow-xl hover:-translate-y-1 md:-mt-4 md:mb-4"
                        : "bg-white border border-gray-200/80 hover:shadow-md"
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 bg-[#00a975] text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full">
                        {t("plan.professional.popular")}
                      </div>
                    )}

                    <div>
                      <h3 className={`font-display text-xl font-bold mb-1 ${isPopular ? "" : "text-primary"}`}>
                        {plan.name}
                      </h3>

                      <p className={`text-xs mb-6 ${isPopular ? "text-blue-100/70" : "text-gray-500"}`}>
                        {plan.description}
                      </p>

                      <div className="flex items-baseline gap-1 mb-8">
                        <span className={`text-4xl font-extrabold tracking-tight ${isPopular ? "" : "text-primary"}`}>
                          ${plan.price}
                        </span>

                        <span className={`text-sm font-medium ${isPopular ? "text-blue-100/70" : "text-gray-500"}`}>
                          {lang === "ar" ? " / شهر" : "/mo"}
                        </span>
                      </div>

                      {plan.features && plan.features.length > 0 && (
                        <ul className="space-y-4 mb-8">
                          {plan.features.map((feature, fIndex) => (
                            <li key={fIndex} className={`flex items-center gap-3 text-sm ${isPopular ? "text-blue-50" : "text-gray-600"}`}>
                              <CheckIcon className="w-4 h-4 text-[#00a975]" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <Link
                      href={`/register?planId=${plan._id}`}
                      className={`w-full text-center py-2.5 font-semibold rounded-lg transition duration-200 text-sm ${
                        isPopular 
                          ? "bg-white text-primary hover:bg-gray-100" 
                          : "bg-white text-primary border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {t("plan.starter.action")}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t border-gray-200/80 bg-gradient-to-b from-[#faf8fe] via-[#c7d2fe] to-[#a5b4fc] py-16 relative">
        
        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pb-12 border-b border-slate-300/40">
            {/* Branding Column */}
            <div className="md:col-span-4 flex flex-col gap-4 text-start">
              <Link href="/" className="flex items-center select-none w-fit">
                <FinoraLogo />
              </Link>
              <p className="text-sm text-slate-700 leading-relaxed max-w-sm">
                {t("footer.desc")}
              </p>
            </div>
            
            {/* Links Grid */}
            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
              {/* Product */}
              <div className="flex flex-col gap-4 text-start">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                  {t("footer.product")}
                </h4>
                <ul className="flex flex-col gap-2.5">
                  <li>
                    <button
                      onClick={() => scrollToSection("features")}
                      className="text-sm text-slate-700 hover:text-primary transition-colors cursor-pointer text-start font-medium"
                    >
                      {t("nav.features")}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection("pricing")}
                      className="text-sm text-slate-700 hover:text-primary transition-colors cursor-pointer text-start font-medium"
                    >
                      {t("nav.pricing")}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection("ai-assistant")}
                      className="text-sm text-slate-700 hover:text-primary transition-colors cursor-pointer text-start font-medium"
                    >
                      {t("nav.aiAssistant")}
                    </button>
                  </li>
                </ul>
              </div>
 
              {/* Company */}
              <div className="flex flex-col gap-4 text-start">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                  {t("footer.company")}
                </h4>
                <ul className="flex flex-col gap-2.5">
                  <li>
                    <button
                      onClick={() => scrollToSection("platform")}
                      className="text-sm text-slate-700 hover:text-primary transition-colors cursor-pointer text-start font-medium"
                    >
                      {t("footer.about")}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection("pricing")}
                      className="text-sm text-slate-700 hover:text-primary transition-colors cursor-pointer text-start font-medium"
                    >
                      {t("footer.careers")}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection("features")}
                      className="text-sm text-slate-700 hover:text-primary transition-colors cursor-pointer text-start font-medium"
                    >
                      {t("footer.security")}
                    </button>
                  </li>
                </ul>
              </div>
 
              {/* Legal */}
              <div className="flex flex-col gap-4 text-start">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                  {t("footer.legal")}
                </h4>
                <ul className="flex flex-col gap-2.5 text-start font-medium">
                  <li>
                    <Link
                      href="/privacy"
                      className="text-sm text-slate-700 hover:text-primary transition-colors"
                    >
                      {t("footer.privacy")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms"
                      className="text-sm text-slate-700 hover:text-primary transition-colors"
                    >
                      {t("footer.terms")}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Bottom Footer */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-xs text-slate-600 font-medium">
              {t("footer.copyright")}
            </p>
            
            {/* Language Selector */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLang("en")}
                className={`text-xs font-semibold px-2.5 py-1 rounded transition-all duration-200 cursor-pointer ${
                  lang === "en"
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-700 hover:text-primary"
                }`}
              >
                {t("lang.en")}
              </button>
              <span className="text-slate-400 text-xs">|</span>
              <button
                onClick={() => setLang("ar")}
                className={`text-xs font-semibold px-2.5 py-1 rounded transition-all duration-200 cursor-pointer ${
                  lang === "ar"
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-700 hover:text-primary"
                }`}
              >
                {t("lang.ar")}
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}