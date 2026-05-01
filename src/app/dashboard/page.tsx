"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";

export default function DashboardOverview() {
  const [account, setAccount] = useState({
    totalSavings: 0,
    availableCreditLimit: 0,
  });
  const [activeLoan, setActiveLoan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("Member");

  useEffect(() => {
    // 1. Get the local user info for the greeting
    const storedUser = localStorage.getItem("coop_user");
    const token = localStorage.getItem("coop_token");

    if (storedUser) {
      setUserName(JSON.parse(storedUser).firstName);
    }

    // 2. Fetch the real financial data from the backend
    const fetchDashboardData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Run both API calls at the same time for speed
        const [accountRes, loansRes] = await Promise.all([
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/account/my-account`,
            config,
          ),
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/loans/my-loans`,
            config,
          ),
        ]);

        setAccount(accountRes.data);

        // Find the most recent active or pending loan
        const currentLoan = loansRes.data.find((loan: any) =>
          ["PENDING_GUARANTORS", "PENDING_ADMIN", "APPROVED"].includes(
            loan.status,
          ),
        );
        setActiveLoan(currentLoan || null);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchDashboardData();
  }, []);

  // Utility to convert backend Kobo to formatted Naira
  const formatNaira = (koboAmount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(koboAmount / 100);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse flex flex-col gap-8">
        <div className="h-64 bg-slate-200 rounded-3xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-48 bg-slate-200 rounded-3xl"></div>
          <div className="h-48 bg-slate-200 rounded-3xl md:col-span-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up pb-10">
      {/* 1. WELCOME GREETING */}
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          Welcome back, {userName}
        </h2>
        <p className="text-sm sm:text-base text-slate-500 mt-1">
          Here is your cooperative financial summary.
        </p>
      </div>

      {/* 2. THE VIRTUAL COOPERATIVE CARD (HERO) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1b5e3a] via-[#124228] to-slate-900 text-white shadow-2xl shadow-[#1b5e3a]/20 p-6 sm:p-10 group">
        {/* Glassmorphism Abstract Glows inside the card */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-64 h-64 rounded-full bg-white/5 blur-3xl transform group-hover:scale-110 transition-transform duration-700"></div>
        <div className="absolute bottom-0 right-1/4 w-40 h-40 rounded-full bg-emerald-400/10 blur-2xl"></div>

        {/* Card Content */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <p className="text-emerald-100/80 text-sm font-medium uppercase tracking-wider mb-1">
              Total Cooperative Savings
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2">
              {formatNaira(account.totalSavings)}
            </h1>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-semibold tracking-wide text-emerald-50">
                Active & Yielding
              </span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-2xl md:min-w-[240px]">
            <p className="text-emerald-100/80 text-xs font-medium uppercase tracking-wider mb-1">
              Available Credit Limit
            </p>
            <p className="text-2xl font-bold">
              {formatNaira(account.availableCreditLimit)}
            </p>
          </div>
        </div>
      </div>

      {/* 3. BENTO BOX GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 sm:mt-8">
        {/* BOX 1: QUICK ACTIONS */}
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col justify-between hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <div>
            <div className="w-12 h-12 bg-emerald-50 text-[#1b5e3a] rounded-xl flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Quick Actions</h3>
            <p className="text-sm text-slate-500 mt-1 mb-6">
              Manage your funds securely.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/dashboard/savings"
              className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-center transition-colors border border-slate-200 text-sm"
            >
              Deposit Funds
            </Link>
            <Link
              href="/dashboard/loans"
              className="w-full py-2.5 px-4 bg-[#1b5e3a] hover:bg-[#124228] text-white font-semibold rounded-xl text-center shadow-md shadow-[#1b5e3a]/20 transition-all transform hover:scale-[1.02] text-sm"
            >
              Request a Loan
            </Link>
          </div>
        </div>

        {/* BOX 2: ACTIVE LOAN TRACKER */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col hover:shadow-2xl transition-shadow duration-300 relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-1/3 -translate-y-1/3"></div>

          <div className="relative z-10 flex-1">
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              Active Loan Status
            </h3>

            {activeLoan ? (
              <div className="mt-4">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1b5e3a] bg-emerald-50 px-2.5 py-1 rounded-md">
                      {activeLoan.status.replace("_", " ")}
                    </span>
                    <p className="text-sm text-slate-500 mt-2">
                      Outstanding Balance
                    </p>
                    <p className="text-xl font-bold text-slate-800">
                      {formatNaira(
                        (activeLoan.amountDue || activeLoan.amountRequested) -
                          activeLoan.amountRepaid,
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-500">
                      Amount Repaid
                    </p>
                    <p className="text-sm font-bold text-emerald-600">
                      {formatNaira(activeLoan.amountRepaid)}
                    </p>
                  </div>
                </div>

                {/* Animated Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2.5 mt-4 overflow-hidden">
                  <div
                    className="bg-[#1b5e3a] h-2.5 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${Math.min(100, (activeLoan.amountRepaid / (activeLoan.amountDue || activeLoan.amountRequested)) * 100)}%`,
                    }}
                  ></div>
                </div>

                {activeLoan.status === "APPROVED" && (
                  <div className="mt-5">
                    <button className="text-sm font-bold text-[#1b5e3a] hover:text-[#124228] transition flex items-center gap-1">
                      Make a Repayment
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full mt-2 py-6">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <svg
                    className="w-8 h-8 text-slate-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <p className="text-slate-500 font-medium text-center">
                  No active loans.
                </p>
                <p className="text-xs text-slate-400 text-center mt-1">
                  Your credit limit is untouched and ready.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
