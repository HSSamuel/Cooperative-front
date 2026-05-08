"use client";

import { useState } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { fetchFinancialData } from "@/store/financeSlice";
import apiClient from "@/lib/axios";
import toast from "react-hot-toast";

export default function LoansPage() {
  const dispatch = useDispatch<AppDispatch>();

  const { account, loans, status } = useSelector(
    (state: RootState) => state.finance,
  );

  const [isRepayModalOpen, setIsRepayModalOpen] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [repayAmount, setRepayAmount] = useState("");
  const [isRepaying, setIsRepaying] = useState(false);

  const formatNaira = (amountInKobo: number) => {
    return new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amountInKobo / 100);
  };

  const activeLoans = loans.filter((l: any) => l.status === "APPROVED");

  const totalBorrowed = activeLoans.reduce(
    (sum: number, l: any) => sum + (l.amountDue || l.amountRequested),
    0,
  );
  const totalRepaid = activeLoans.reduce(
    (sum: number, l: any) => sum + (l.amountRepaid || 0),
    0,
  );
  const outstandingDebt = totalBorrowed - totalRepaid;

  const getStatusBadge = (loanStatus: string) => {
    switch (loanStatus) {
      case "APPROVED":
        return (
          <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-[#1b5e3a] dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-sm">
            Active
          </span>
        );
      case "PENDING_GUARANTORS":
      case "PENDING_ADMIN":
        return (
          <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider rounded-sm">
            Pending
          </span>
        );
      case "REPAID":
        return (
          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider rounded-sm">
            Repaid
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider rounded-sm">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider rounded-sm">
            {loanStatus}
          </span>
        );
    }
  };

  const getGuarantorStatus = (guarantorStatus: string) => {
    if (guarantorStatus === "ACCEPTED")
      return (
        <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase">
          Accepted
        </span>
      );
    if (guarantorStatus === "DECLINED")
      return (
        <span className="text-red-500 dark:text-red-400 font-bold text-[10px] uppercase">
          Declined
        </span>
      );
    return (
      <span className="text-amber-500 dark:text-amber-400 font-bold text-[10px] uppercase animate-pulse">
        Pending
      </span>
    );
  };

  const openRepayModal = (loanId: string) => {
    setSelectedLoanId(loanId);
    setRepayAmount("");
    setIsRepayModalOpen(true);
  };

  const handleRepayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanId) return;

    const amountInKobo = Math.round((parseFloat(repayAmount) || 0) * 100);

    if (isNaN(amountInKobo) || amountInKobo <= 0) {
      return toast.error("Please enter a valid repayment amount.");
    }

    if (amountInKobo > account.totalSavings) {
      return toast.error("Insufficient savings to make this repayment.");
    }

    setIsRepaying(true);
    try {
      await apiClient.post(`/loans/${selectedLoanId}/repay`, { amountInKobo });
      toast.success("Repayment processed successfully!");
      setIsRepayModalOpen(false);
      dispatch(fetchFinancialData());
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to process repayment.",
      );
    } finally {
      setIsRepaying(false);
    }
  };

  if (status === "loading" || status === "idle") {
    return (
      <div className="animate-pulse flex flex-col gap-6 h-[800px] w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-sm"></div>
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-sm"></div>
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-sm"></div>
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-sm"></div>
        </div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-sm w-full"></div>
        <div className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-sm w-full"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up pb-10 relative">
      <div className="flex flex-col gap-6 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-[#1B1B25] rounded-sm p-6 shadow-sm border-l-4 border-slate-400 dark:border-slate-600 relative overflow-hidden group transition-colors">
            <div className="absolute -right-6 -top-6 text-slate-50 dark:text-slate-800 opacity-50 group-hover:scale-110 transition-transform duration-500">
              <svg
                className="w-24 h-24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
              </svg>
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Amount Borrowed
            </p>
            <div className="flex items-baseline gap-1 relative z-10">
              <span className="text-xl font-bold text-slate-400 dark:text-slate-500">
                ₦
              </span>
              <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight truncate">
                {formatNaira(totalBorrowed)}
              </h3>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1B1B25] rounded-sm p-6 shadow-sm border-l-4 border-[#1b5e3a] relative overflow-hidden group transition-colors">
            <div className="absolute -right-6 -top-6 text-emerald-50 dark:text-emerald-900/20 opacity-50 group-hover:scale-110 transition-transform duration-500">
              <svg
                className="w-24 h-24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Total Repaid
            </p>
            <div className="flex items-baseline gap-1 relative z-10">
              <span className="text-xl font-bold text-slate-400 dark:text-slate-500">
                ₦
              </span>
              <h3 className="text-3xl font-extrabold text-[#1b5e3a] dark:text-emerald-400 tracking-tight truncate">
                {formatNaira(totalRepaid)}
              </h3>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1B1B25] rounded-sm p-6 shadow-sm border-l-4 border-red-500 relative overflow-hidden group transition-colors">
            <div className="absolute -right-6 -top-6 text-red-50 dark:text-red-900/20 opacity-50 group-hover:scale-110 transition-transform duration-500">
              <svg
                className="w-24 h-24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
              </svg>
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Outstanding Debt
            </p>
            <div className="flex items-baseline gap-1 relative z-10">
              <span className="text-xl font-bold text-red-400 dark:text-red-500">
                ₦
              </span>
              <h3 className="text-3xl font-extrabold text-red-600 dark:text-red-400 tracking-tight truncate">
                {formatNaira(outstandingDebt)}
              </h3>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1B1B25] rounded-sm p-6 shadow-sm border-l-4 border-amber-500 relative overflow-hidden group transition-colors">
            <div className="absolute -right-6 -top-6 text-amber-50 dark:text-amber-900/20 opacity-50 group-hover:scale-110 transition-transform duration-500">
              <svg
                className="w-24 h-24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 14h-3v3h-2v-3H8v-2h3v-3h2v3h3v2zm-3-9V3.5L18.5 9H13z" />
              </svg>
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Active Loan Facilities
            </p>
            <div className="flex items-baseline gap-1 relative z-10">
              <h3 className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
                {activeLoans.length}
              </h3>
            </div>
          </div>
        </div>

        {activeLoans.length > 0 && (
          <div className="flex flex-col gap-6">
            {activeLoans.map((loan: any) => {
              const principalKobo = loan.amountRequested;
              const totalDueKobo = loan.amountDue || loan.amountRequested;
              const interestKobo = totalDueKobo - principalKobo;
              const interestRate = loan.interestRate || 10;

              // 🚀 Dynamic Tenure Calculation
              const loanTenure = loan.tenure || 10;
              const monthlyKobo = totalDueKobo / loanTenure;

              const repaidKobo = loan.amountRepaid || 0;
              const balanceKobo = totalDueKobo - repaidKobo;
              const progress =
                totalDueKobo > 0
                  ? Math.min(Math.round((repaidKobo / totalDueKobo) * 100), 100)
                  : 0;

              const startDate = new Date(loan.createdAt);
              const endDate = new Date(loan.createdAt);
              endDate.setMonth(endDate.getMonth() + loanTenure); // 🚀 Add dynamic months
              const dateOptions: Intl.DateTimeFormatOptions = {
                day: "numeric",
                month: "short",
                year: "numeric",
              };

              const totalInterestRate = (
                interestRate *
                (loanTenure / 10)
              ).toFixed(1);

              return (
                <div
                  key={loan._id}
                  className="bg-white dark:bg-[#1B1B25] border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden w-full transition-colors hover:shadow-md"
                >
                  <div className="bg-gradient-to-r from-[#1b5e3a] to-[#0f3420] dark:from-[#114026] dark:to-[#092214] px-6 py-6 md:py-8 md:px-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden transition-colors">
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                      <svg
                        width="100%"
                        height="100%"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <defs>
                          <pattern
                            id="grid-pattern"
                            width="40"
                            height="40"
                            patternUnits="userSpaceOnUse"
                          >
                            <path
                              d="M 40 0 L 0 0 0 40"
                              fill="none"
                              stroke="white"
                              strokeWidth="1"
                            />
                          </pattern>
                        </defs>
                        <rect
                          width="100%"
                          height="100%"
                          fill="url(#grid-pattern)"
                        />
                      </svg>
                    </div>

                    <div className="relative z-10">
                      <span className="bg-emerald-500/30 text-emerald-100 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest mb-3 inline-block shadow-sm">
                        Active Facility
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        {loan.loanType || "REGULAR"} LOAN
                      </h3>
                      <p className="text-emerald-100/70 text-xs sm:text-sm font-medium mt-1">
                        Disbursed on{" "}
                        {startDate.toLocaleDateString("en-GB", dateOptions)}
                      </p>
                    </div>

                    <div className="relative z-10 md:text-right mt-2 md:mt-0 flex flex-col items-start md:items-end w-full md:w-auto">
                      <p className="text-emerald-100/70 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">
                        Total Amount Due
                      </p>
                      <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-baseline gap-1">
                        <span className="text-lg sm:text-xl opacity-70">₦</span>
                        {formatNaira(totalDueKobo)}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 sm:gap-y-8 gap-x-4 sm:gap-x-6 p-4 sm:p-6 md:p-8 bg-slate-50/50 dark:bg-[#12121A]/50 border-b border-slate-100 dark:border-slate-800 transition-colors">
                    <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5"
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
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                          Principal
                        </p>
                        <p className="text-xs sm:text-base font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                          ₦{formatNaira(principalKobo)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                          Interest ({totalInterestRate}%)
                        </p>
                        <p className="text-xs sm:text-base font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                          +₦{formatNaira(interestKobo)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                          Duration
                        </p>
                        <p className="text-xs sm:text-base font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                          {loanTenure} Months
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                          Monthly Pay
                        </p>
                        <p className="text-xs sm:text-base font-bold text-red-500 dark:text-red-400 mt-0.5 truncate">
                          -₦{formatNaira(monthlyKobo)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                          Start Date
                        </p>
                        <p className="text-xs sm:text-sm md:text-base font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                          {startDate.toLocaleDateString("en-GB", dateOptions)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                          End Date
                        </p>
                        <p className="text-xs sm:text-sm md:text-base font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                          {endDate.toLocaleDateString("en-GB", dateOptions)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 md:p-8 bg-white dark:bg-[#1B1B25] transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-3 gap-3">
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide text-xs sm:text-sm">
                          Repayment Progress
                        </h4>
                      </div>
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <span className="text-xl sm:text-2xl font-black text-[#1b5e3a] dark:text-emerald-400">
                          {progress}%
                        </span>
                        <button
                          onClick={() => openRepayModal(loan._id)}
                          className="ml-auto sm:ml-0 bg-[#1b5e3a] text-white px-4 py-2 rounded-sm text-xs font-bold shadow-sm hover:bg-[#124228] transition-colors flex items-center gap-1"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          Pay Now
                        </button>
                      </div>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3.5 mb-5 overflow-hidden shadow-inner">
                      <div
                        className="bg-[#20C997] h-full rounded-full transition-all duration-1000 relative"
                        style={{ width: `${progress}%` }}
                      >
                        <div className="absolute inset-0 bg-white/30 w-full h-full animate-pulse"></div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <div>
                        <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-0.5">
                          Repaid So Far
                        </p>
                        <p className="font-black text-[#1b5e3a] dark:text-emerald-400 text-base sm:text-lg">
                          ₦{formatNaira(repaidKobo)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-0.5">
                          Remaining Balance
                        </p>
                        <p className="font-black text-red-500 dark:text-red-400 text-base sm:text-lg">
                          ₦{formatNaira(balanceKobo)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-white dark:bg-[#1B1B25] rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm p-6 w-full transition-colors">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4 gap-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
              Loan Ledger
            </h3>
            <Link
              href="/dashboard/loans/apply"
              className="bg-[#1b5e3a] hover:bg-[#124228] text-white px-5 py-2 rounded-sm text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Apply for Loan
            </Link>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
              <thead className="bg-slate-50 dark:bg-[#12121A]/50">
                <tr>
                  <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300 text-sm border border-slate-200 dark:border-slate-800">
                    Loan Type
                  </th>
                  <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300 text-sm border border-slate-200 dark:border-slate-800 text-center">
                    Status
                  </th>
                  <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300 text-sm border border-slate-200 dark:border-slate-800">
                    Guarantors & Review Status
                  </th>
                  <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300 text-sm border border-slate-200 dark:border-slate-800 text-right">
                    Amount Borrowed
                  </th>
                  <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300 text-sm border border-slate-200 dark:border-slate-800 text-right">
                    Amount Repaid
                  </th>
                  <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300 text-sm border border-slate-200 dark:border-slate-800 text-right">
                    Balance
                  </th>
                  <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300 text-sm border border-slate-200 dark:border-slate-800">
                    Date Applied
                  </th>
                </tr>
              </thead>
              <tbody>
                {loans.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
                    >
                      No loan history found.
                    </td>
                  </tr>
                ) : (
                  loans.map((loan: any) => {
                    const target = loan.amountDue || loan.amountRequested;
                    const repaid = loan.amountRepaid || 0;
                    const balance = target - repaid;

                    return (
                      <tr
                        key={loan._id}
                        className="hover:bg-slate-50 dark:hover:bg-[#12121A]/50 transition-colors"
                      >
                        <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-800">
                          {loan.loanType || "REGULAR"}
                        </td>
                        <td className="py-3 px-4 text-center border border-slate-200 dark:border-slate-800">
                          {getStatusBadge(loan.status)}
                        </td>
                        <td className="py-3 px-4 border border-slate-200 dark:border-slate-800">
                          {loan.guarantor1?.cooperatorId ? (
                            <div className="flex flex-col gap-1.5 min-w-[200px]">
                              <div className="flex items-center justify-between gap-4 bg-white dark:bg-slate-800 px-2 py-1.5 rounded-sm border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">
                                  {loan.guarantor1.cooperatorId.firstName}{" "}
                                  {loan.guarantor1.cooperatorId.lastName}
                                </span>
                                {getGuarantorStatus(loan.guarantor1.status)}
                              </div>
                              {loan.guarantor2?.cooperatorId && (
                                <div className="flex items-center justify-between gap-4 bg-white dark:bg-slate-800 px-2 py-1.5 rounded-sm border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">
                                    {loan.guarantor2.cooperatorId.firstName}{" "}
                                    {loan.guarantor2.cooperatorId.lastName}
                                  </span>
                                  {getGuarantorStatus(loan.guarantor2.status)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                              No Guarantors Required
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium text-right border border-slate-200 dark:border-slate-800">
                          ₦{formatNaira(target)}
                        </td>
                        <td className="py-3 px-4 text-[#1b5e3a] dark:text-emerald-400 font-bold text-right border border-slate-200 dark:border-slate-800">
                          ₦{formatNaira(repaid)}
                        </td>
                        <td className="py-3 px-4 text-red-500 dark:text-red-400 font-bold text-right border border-slate-200 dark:border-slate-800">
                          {balance > 0 ? `₦${formatNaira(balance)}` : "₦0.00"}
                        </td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-[11px] leading-tight border border-slate-200 dark:border-slate-800">
                          {new Date(loan.createdAt).toLocaleDateString()}
                          <br />
                          {new Date(loan.createdAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Repay Modal */}
      {isRepayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1B1B25] rounded-sm shadow-xl w-full max-w-sm overflow-hidden animate-fade-in-up border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#12121A]/50">
              <h3 className="font-bold text-slate-800 dark:text-slate-200">
                Make Repayment
              </h3>
              <button
                onClick={() => setIsRepayModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleRepayment} className="p-6 space-y-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 text-xs p-3 rounded-sm border border-emerald-100 dark:border-emerald-800/50 mb-4 transition-colors">
                Available Savings Balance:{" "}
                <strong className="font-black text-[#1b5e3a] dark:text-emerald-300">
                  ₦{formatNaira(account.totalSavings)}
                </strong>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Amount to Repay (₦)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-medium">
                    ₦
                  </span>
                  <input
                    type="number"
                    required
                    min="100"
                    value={repayAmount}
                    onChange={(e) => setRepayAmount(e.target.value)}
                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    className="w-full pl-8 pr-3 py-2.5 border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 rounded-sm text-sm focus:outline-none focus:border-[#1b5e3a] dark:focus:border-emerald-500"
                    placeholder="e.g. 50000"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-tight">
                  This amount will be instantly deducted from your cooperative
                  savings balance.
                </p>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRepayModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRepaying || !repayAmount}
                  className="px-6 py-2 bg-[#1b5e3a] hover:bg-[#124228] text-white text-sm font-bold rounded-sm transition-colors disabled:opacity-70 shadow-sm"
                >
                  {isRepaying ? "Processing..." : "Confirm Pay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
