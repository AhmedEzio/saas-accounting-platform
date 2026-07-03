// app/not-found.js (أو app/[locale]/not-found.js لو بتستخدم i18n)

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function NotFound() {
  const router = useRouter();
  const canvasRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const pages = [
    { title: "الرئيسية", path: "/", description: "الصفحة الرئيسية" },
    { title: "من نحن", path: "/about", description: "تعرف على شركتنا" },
    { title: "المدونة", path: "/blog", description: "آخر الأخبار والمقالات" },
    { title: "تواصل معنا", path: "/contact", description: "تواصل مع فريقنا" },
    { title: "الأسعار", path: "/pricing", description: "خطط الأسعار" },
    { title: "التوثيق", path: "/docs", description: "الوثائق والـ API" },
  ];

  // Particle System
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let particles = [];
    let mouse = { x: null, y: null };
    let animationId;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.opacity = Math.random() * 0.5 + 0.1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;

        if (mouse.x != null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 100) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (100 - distance) / 100;
            this.speedX -= forceDirectionX * force * 0.5;
            this.speedY -= forceDirectionY * force * 0.5;
          }
        }
      }

      draw() {
        ctx.fillStyle = `rgba(99, 102, 241, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function init() {
      particles = [];
      const count = Math.min(window.innerWidth / 10, 100);
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    }
    init();

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animationId = requestAnimationFrame(animate);
    }
    animate();

    const handleMouseMove = (e) => {
      mouse.x = e.x;
      mouse.y = e.y;
    };
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (!query) {
      setShowResults(false);
      return;
    }

    const matches = pages.filter(
      (page) =>
        page.title.toLowerCase().includes(query) ||
        page.description.toLowerCase().includes(query),
    );

    setSearchResults(matches);
    setShowResults(true);
  };

  return (
    <div className="bg-gray-950 text-white min-h-screen overflow-hidden relative">
      {/* Tailwind Config for Animations - add to tailwind.config.js */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes glitch {
          0%,
          100% {
            transform: translate(0);
          }
          20% {
            transform: translate(-2px, 2px);
          }
          40% {
            transform: translate(-2px, -2px);
          }
          60% {
            transform: translate(2px, 2px);
          }
          80% {
            transform: translate(2px, -2px);
          }
        }
        @keyframes slideUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 6s ease-in-out 3s infinite;
        }
        .animate-glitch {
          animation: glitch 1s linear infinite;
        }
        .animate-slide-up {
          animation: slideUp 0.5s ease-out forwards;
        }
        .glass-effect {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .grid-bg {
          background-image:
            linear-gradient(rgba(99, 102, 241, 0.05) 1px, transparent 1px),
            linear-gradient(
              90deg,
              rgba(99, 102, 241, 0.05) 1px,
              transparent 1px
            );
          background-size: 50px 50px;
        }
      `}</style>

      {/* Animated Background Orbs */}
      <div className="absolute w-96 h-96 bg-purple-600 rounded-full blur-[80px] opacity-40 top-0 left-0 animate-float pointer-events-none" />
      <div className="absolute w-80 h-80 bg-blue-600 rounded-full blur-[80px] opacity-40 bottom-0 right-0 animate-float-delayed pointer-events-none" />
      <div className="absolute w-64 h-64 bg-indigo-600 rounded-full blur-[80px] opacity-40 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Grid Background */}
      <div className="absolute inset-0 grid-bg pointer-events-none" />

      {/* Particles Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0"
      />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-indigo-500/30">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              موقعك
            </span>
          </Link>
        </nav>

        {/* 404 Content */}
        <div className="text-center max-w-4xl mx-auto">
          {/* Large 404 */}
          <div className="relative mb-8 animate-slide-up">
            <h1 className="text-[150px] sm:text-[200px] font-black leading-none tracking-tighter select-none">
              <span className="inline-block animate-glitch text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-600">
                4
              </span>
              <span className="inline-block relative mx-2">
                <svg
                  className="w-32 h-32 sm:w-40 sm:h-40 inline-block animate-spin text-indigo-500"
                  style={{ animationDuration: "12s" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl sm:text-8xl font-black text-white">
                    0
                  </span>
                </div>
              </span>
              <span
                className="inline-block animate-glitch text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-600"
                style={{ animationDelay: "0.5s" }}
              >
                4
              </span>
            </h1>
          </div>

          {/* Message */}
          <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              الصفحة غير موجودة
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
              عذراً! الصفحة اللي بتدور عليها مش موجودة. ممكن تكون اتنقلت،
              اتمسحت، أو مكنتش موجودة من الأساس.
            </p>
          </div>

          {/* Search Bar */}
          <div
            className="max-w-md mx-auto mb-10 animate-slide-up relative"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="relative group">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="ابحث عن صفحة..."
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 backdrop-blur-sm text-right"
                dir="rtl"
              />
              <button className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors duration-200">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>

            {/* Search Results */}
            {showResults && (
              <div className="mt-2 text-right absolute w-full z-20" dir="rtl">
                {searchResults.length > 0 ? (
                  searchResults.map((page) => (
                    <Link
                      key={page.path}
                      href={page.path}
                      className="block p-3 bg-gray-900/90 border border-white/10 rounded-xl hover:bg-white/10 hover:border-indigo-500/50 transition-all duration-200 group backdrop-blur-sm mb-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <span className="text-white font-medium group-hover:text-indigo-400 transition-colors block">
                            {page.title}
                          </span>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {page.description}
                          </p>
                        </div>
                        <svg
                          className="w-5 h-5 text-gray-600 group-hover:text-indigo-400 transform group-hover:-translate-x-1 transition-all mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-3 bg-gray-900/90 border border-white/10 rounded-xl text-gray-500 text-sm backdrop-blur-sm">
                    مفيش نتائج لـ {searchQuery}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            <Link
              href="/"
              className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl font-semibold text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                الرئيسية
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>

            <button
              onClick={() => router.back()}
              className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-semibold text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/20 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 backdrop-blur-sm"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              رجوع
            </button>
          </div>

          {/* Quick Links */}
          <div
            className="mt-16 animate-slide-up"
            style={{ animationDelay: "0.4s" }}
            dir="rtl"
          >
            <p className="text-sm text-gray-500 uppercase tracking-widest mb-6 font-medium">
              صفحات شائعة
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {pages.slice(0, 5).map((page) => (
                <Link
                  key={page.path}
                  href={page.path}
                  className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 hover:border-indigo-500/50 transition-all duration-300 text-sm font-medium backdrop-blur-sm"
                >
                  {page.title}
                </Link>
              ))}
            </div>
          </div>

          {/* Error Code */}
          <div
            className="mt-12 animate-slide-up"
            style={{ animationDelay: "0.6s" }}
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <code className="text-xs text-gray-500 font-mono">
                Error Code: 404 | Path:{" "}
                <span className="text-gray-400">/unknown</span>
              </code>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="absolute bottom-0 left-0 right-0 p-6 text-center">
          <p className="text-sm text-gray-600">
            © 2026 موقعك. جميع الحقوق محفوظة.
          </p>
        </footer>
      </div>
    </div>
  );
}
