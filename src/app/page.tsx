"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f9fe] font-sans">
      {/* 1. SOLID ENTERPRISE NAVIGATION */}
      <nav className="fixed w-full z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Image
                src="/ascon-logo.png"
                alt="ASCON Logo"
                width={36}
                height={36}
                className="object-contain w-auto h-auto"
              />
              <div className="flex flex-col">
                <span className="font-extrabold text-[10px] tracking-tight text-slate-500 uppercase leading-tight">
                  ASCON
                </span>
                <span className="font-bold text-lg tracking-tight text-[#1b5e3a] leading-tight">
                  Co-operative
                </span>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-600 hover:text-[#1b5e3a] transition px-2"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-sm font-bold bg-[#1b5e3a] text-white px-6 py-2 rounded-sm hover:bg-[#124228] transition shadow-sm whitespace-nowrap"
              >
                Create Account
              </Link>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-2 text-slate-600"
            >
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
                  d={
                    isMobileMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="sm:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-lg">
            <div className="px-5 pt-4 pb-6 space-y-4">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 py-3 rounded-sm hover:bg-slate-100"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center text-sm font-bold bg-[#1b5e3a] text-white py-3 rounded-sm hover:bg-[#124228]"
              >
                Create Account
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* 2. STRUCTURED HERO SECTION */}
      <main className="pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pb-32 bg-[#1b5e3a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-white/10 text-emerald-300 text-xs font-bold tracking-widest uppercase mb-6 border border-white/5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            ASCON Staff Multi-Purpose Society
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight mb-6 leading-tight">
            Financial Independence, <br className="hidden sm:block" />
            Digitized for <span className="text-emerald-400">Efficiency.</span>
          </h1>
          <p className="text-base sm:text-lg text-emerald-100/80 mb-10 leading-relaxed max-w-2xl mx-auto">
            Secure your deposits, request low-interest loans, and monitor your
            cooperative dividends through our transparent, automated platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/register"
              className="w-full sm:w-auto text-sm font-bold bg-white text-[#1b5e3a] px-8 py-3.5 rounded-sm hover:bg-slate-100 transition shadow-md"
            >
              Start Saving Today
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto text-sm font-bold bg-white/10 text-white border border-white/20 px-8 py-3.5 rounded-sm hover:bg-white/20 transition"
            >
              Access Dashboard
            </Link>
          </div>
        </div>
      </main>

      {/* 3. FLAT FEATURES GRID */}
      <section className="py-24 bg-[#f8f9fe]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
              Platform Capabilities
            </h2>
            <p className="text-slate-500 text-sm">
              Enterprise-grade tools for your cooperative journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-sm shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-emerald-50 text-[#1b5e3a] rounded-sm flex items-center justify-center mb-6">
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
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                High-Yield Savings
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Watch your money grow securely. Your deposits generate annual
                dividends based on cooperative profits.
              </p>
            </div>

            <div className="bg-white p-8 rounded-sm shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-emerald-50 text-[#1b5e3a] rounded-sm flex items-center justify-center mb-6">
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                Instant Smart Loans
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Apply digitally, get guaranteed by colleagues, and receive funds
                with a flat, subsidized 5% interest rate.
              </p>
            </div>

            <div className="bg-white p-8 rounded-sm shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-emerald-50 text-[#1b5e3a] rounded-sm flex items-center justify-center mb-6">
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
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                Automated Payroll
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                No manual bank transfers. Loan repayments are seamlessly
                exported and managed via HR deductions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FLAT FOOTER */}
      <footer className="bg-white py-8 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-slate-800">
              ASCON<span className="text-[#1b5e3a]">Coop</span>
            </span>
          </div>
          <p className="text-slate-500 text-xs text-center">
            &copy; {new Date().getFullYear()} ASCON Staff Cooperative. All
            rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
