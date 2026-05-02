"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#1b5e3a]/20">
      {/* 1. GLASSMORPHISM NAVIGATION */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 relative">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* ASCON Official Logo (Navbar) */}
              <Image
                src="/ascon-logo.png"
                alt="ASCON Logo"
                width={40}
                height={40}
                className="object-contain w-8 h-8 sm:w-9 sm:h-9"
              />
              <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900">
                ASCON<span className="text-[#1b5e3a]">Coop</span>
              </span>
            </div>

            {/* Desktop Navigation (Hidden on Mobile) */}
            <div className="hidden sm:flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-600 hover:text-[#1b5e3a] transition px-2"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-slate-800 transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-200 whitespace-nowrap"
              >
                Create Account
              </Link>
            </div>

            {/* Mobile Hamburger Button (Visible ONLY on Mobile) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-2 text-slate-600 hover:text-[#1b5e3a] focus:outline-none transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu (Animated Glassmorphism) */}
        {isMobileMenuOpen && (
          <div className="sm:hidden absolute top-16 left-0 w-full bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-2xl animate-fade-in-up origin-top">
            <div className="px-5 pt-4 pb-6 space-y-4">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 py-3.5 rounded-xl hover:bg-slate-100 transition shadow-sm"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center text-sm font-bold bg-[#1b5e3a] text-white py-3.5 rounded-xl hover:bg-[#124228] transition shadow-md"
              >
                Create Account
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* 2. HIGH-IMPACT HERO SECTION */}
      <main className="pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Decorative ASCON Green Background Blobs */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-[#1b5e3a]/10 blur-3xl"></div>
          <div className="absolute top-40 left-0 -ml-20 w-72 h-72 rounded-full bg-emerald-400/10 blur-3xl"></div>

          <div className="text-center max-w-3xl mx-auto relative z-10">
            {/* ASCON Green Pulsing Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b5e3a]/5 border border-[#1b5e3a]/20 text-[#1b5e3a] text-xs font-semibold tracking-wide uppercase mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1b5e3a] opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1b5e3a]"></span>
              </span>
              Built exclusively for ASCON Staff
            </div>

            <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 tracking-tight mb-8 leading-[1.1]">
              Financial Freedom, <br className="hidden sm:block" />
              {/* ASCON Green to Emerald Gradient */}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1b5e3a] to-emerald-500">
                Powered by Community.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-500 mb-10 leading-relaxed max-w-2xl mx-auto">
              Secure your future, access low-interest loans instantly, and earn
              guaranteed dividends at the end of the year. The smart way to
              build wealth together.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {/* Official ASCON Green Button */}
              <Link
                href="/register"
                className="w-full sm:w-auto text-base font-semibold bg-[#1b5e3a] text-white px-8 py-4 rounded-full hover:bg-[#124228] transition shadow-lg shadow-[#1b5e3a]/30 transform hover:-translate-y-1 duration-200"
              >
                Start Saving Today
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto text-base font-semibold bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-full hover:bg-slate-50 transition shadow-sm"
              >
                Access Dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* 3. PREMIUM FEATURES GRID (With Image Background) */}
      <section className="relative py-24 border-y border-slate-900 overflow-hidden">
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/features-bg.jpg"
            alt="ASCON Cooperative Background"
            fill
            className="object-cover"
            style={{ backgroundColor: "#1b5e3a" }}
          />
          {/* Deep ASCON Green Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-[#1b5e3a]/85 backdrop-blur-[2px]"></div>
        </div>

        {/* Content Layer (z-10 puts it exactly above the background) */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Why join the Cooperative?
            </h2>
            <p className="text-emerald-100/90 text-lg">
              Everything you need to manage your financial life in one secure
              platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 - Glassmorphism Card */}
            <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl hover:shadow-xl hover:-translate-y-1 transition duration-300 group flex flex-col items-center text-center md:items-start md:text-left">
              <div className="w-14 h-14 bg-[#1b5e3a]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                High-Yield Savings
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Watch your money grow securely. Your deposits are protected and
                generate annual dividends based on cooperative profits.
              </p>
            </div>

            {/* Feature 2 - Glassmorphism Card */}
            <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl hover:shadow-xl hover:-translate-y-1 transition duration-300 group flex flex-col items-center text-center md:items-start md:text-left">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Instant Smart Loans
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Need urgent cash? Apply digitally, get guaranteed by colleagues,
                and receive funds with a flat, highly subsidized 5% interest
                rate.
              </p>
            </div>

            {/* Feature 3 - Glassmorphism Card */}
            <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl hover:shadow-xl hover:-translate-y-1 transition duration-300 group flex flex-col items-center text-center md:items-start md:text-left">
              <div className="w-14 h-14 bg-slate-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Automated Payroll
              </h3>
              <p className="text-slate-600 leading-relaxed">
                No need for manual bank transfers. Loan repayments are
                seamlessly exported and managed directly through ASCON payroll
                deductions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SLEEK FOOTER */}
      <footer className="bg-slate-900 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            {/* ASCON Official Logo (Footer) */}
            <Image
              src="/ascon-logo.png"
              alt="ASCON Logo"
              width={32}
              height={32}
              className="object-contain grayscale hover:grayscale-0 transition duration-300"
            />
            {/* Lighter emerald for footer contrast on dark background */}
            <span className="font-bold text-lg tracking-tight text-white">
              ASCON<span className="text-emerald-400">Coop</span>
            </span>
          </div>

          <p className="text-slate-400 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} Administrative Staff College of
            Nigeria Staff Cooperative. All rights reserved.
          </p>

          <div className="flex gap-6">
            <span className="text-sm font-medium text-slate-400 hover:text-white cursor-pointer transition">
              Privacy Policy
            </span>
            <span className="text-sm font-medium text-slate-400 hover:text-white cursor-pointer transition">
              Terms of Service
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
