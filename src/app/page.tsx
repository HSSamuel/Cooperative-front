"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InstallPrompt } from "@/components/InstallPrompt";
import { GlobalSpinner } from "@/components/GlobalSpinner";

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavigation = () => {
    setIsNavigating(true);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fe] dark:bg-[#12121A] font-sans transition-colors relative">
      <InstallPrompt />

      {/* 🚀 Global Spinner for Route Transitions */}
      <GlobalSpinner
        isLoading={isNavigating}
        text="Connecting to Secure Portal..."
      />

      {/* 1. SOLID ENTERPRISE NAVIGATION */}
      <nav className="fixed w-full z-50 bg-white dark:bg-[#1B1B25] border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
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
                <span className="font-extrabold text-[15px] tracking-tight text-slate-500 dark:text-slate-400 uppercase leading-tight">
                  ASCON
                </span>
                <span className="font-bold text-lg tracking-tight text-[#1b5e3a] dark:text-emerald-400 leading-tight">
                  Cooperative
                </span>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-4">
              {/* 🚀 Dark Mode Toggle for Desktop */}
              <ThemeToggle />
              <Link
                href="/login"
                onClick={handleNavigation}
                className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[#1b5e3a] dark:hover:text-emerald-400 transition px-2"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={handleNavigation}
                className="text-sm font-bold bg-[#1b5e3a] dark:bg-[#1b5e3a] text-white px-6 py-2 rounded-sm hover:bg-[#124228] transition shadow-sm whitespace-nowrap"
              >
                Create Account
              </Link>
            </div>

            <div className="flex items-center gap-2 sm:hidden">
              {/* 🚀 Dark Mode Toggle for Mobile */}
              <ThemeToggle />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-600 dark:text-slate-300"
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
        </div>

        {isMobileMenuOpen && (
          <div className="sm:hidden absolute top-16 left-0 w-full bg-white dark:bg-[#1B1B25] border-b border-slate-200 dark:border-slate-800 shadow-lg transition-colors">
            <div className="px-5 pt-4 pb-6 space-y-4">
              <Link
                href="/login"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleNavigation();
                }}
                className="block w-full text-center text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-3 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleNavigation();
                }}
                className="block w-full text-center text-sm font-bold bg-[#1b5e3a] text-white py-3 rounded-sm hover:bg-[#124228] transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* 2. STRUCTURED HERO SECTION */}
      <main className="pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pb-32 bg-[#1b5e3a] dark:bg-[#114026] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-white/10 text-emerald-300 text-xs font-bold tracking-widest uppercase mb-6 border border-white/5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            ASCON Staff Multi-Purpose Cooperative Society Ltd.
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
              onClick={handleNavigation}
              className="w-full sm:w-auto text-sm font-bold bg-white text-[#1b5e3a] px-8 py-3.5 rounded-sm hover:bg-slate-100 transition shadow-md"
            >
              Start Saving Today
            </Link>
            <Link
              href="/login"
              onClick={handleNavigation}
              className="w-full sm:w-auto text-sm font-bold bg-white/10 text-white border border-white/20 px-8 py-3.5 rounded-sm hover:bg-white/20 transition"
            >
              Access Dashboard
            </Link>
          </div>
        </div>
      </main>

      {/* 3. FLAT FEATURES GRID */}
      <section className="py-24 bg-[#f8f9fe] dark:bg-[#12121A] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2 transition-colors">
              Platform Capabilities
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">
              Enterprise-grade tools for your cooperative journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-[#1B1B25] p-8 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-[#1b5e3a] dark:text-emerald-400 rounded-sm flex items-center justify-center mb-6 transition-colors">
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
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2 transition-colors">
                High-Yield Savings
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed transition-colors">
                Watch your money grow securely. Your deposits generate annual
                dividends based on cooperative profits.
              </p>
            </div>

            <div className="bg-white dark:bg-[#1B1B25] p-8 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-[#1b5e3a] dark:text-emerald-400 rounded-sm flex items-center justify-center mb-6 transition-colors">
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
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2 transition-colors">
                Instant Smart Loans
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed transition-colors">
                Apply digitally, get guaranteed by colleagues, and receive funds
                with a flat, subsidized interest rate tailored for members.
              </p>
            </div>

            <div className="bg-white dark:bg-[#1B1B25] p-8 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-[#1b5e3a] dark:text-emerald-400 rounded-sm flex items-center justify-center mb-6 transition-colors">
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
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2 transition-colors">
                Automated Payroll
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed transition-colors">
                No manual bank transfers. Loan repayments are seamlessly
                exported and managed via HR deductions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FLAT FOOTER */}
      <footer className="bg-white dark:bg-[#1B1B25] py-8 border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-slate-800 dark:text-slate-200 transition-colors">
              ASCON
              <span className="text-[#1b5e3a] dark:text-emerald-400">Coop</span>
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs text-center transition-colors">
            &copy; {new Date().getFullYear()} ASCON Staff Cooperative. All
            rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
