"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function AdminOverviewPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [globalStats, setGlobalStats] = useState({
    totalCooperativeSavings: 0,
    activeMembersCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Search and Tab State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"PENDING" | "ACTIVE" | "ARCHIVE">(
    "PENDING",
  );

  useEffect(() => {
    const token = localStorage.getItem("coop_token");
    if (token) {
      fetchData(token);
    }
  }, []);

  const fetchData = async (token: string) => {
    try {
      // Fetch both loans and global stats simultaneously
      const [loansRes, statsRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/loans/all`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/account/global-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setLoans(loansRes.data);
      setGlobalStats(statsRes.data);
    } catch (error) {
      console.error("Fetch Data Error:", error);
      toast.error("Failed to load cooperative dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (
    loanId: string,
    status: "APPROVED" | "REJECTED",
  ) => {
    if (
      !window.confirm(
        `Are you sure you want to ${status.toLowerCase()} this loan?`,
      )
    )
      return;

    setProcessingId(loanId);
    try {
      const token = localStorage.getItem("coop_token");
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/loans/${loanId}/review`,
        { status, adminComment: `Reviewed by Admin` },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success(`Loan successfully ${status.toLowerCase()}`);
      fetchData(token!);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update loan status.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleDownloadPayroll = async () => {
    try {
      const token = localStorage.getItem("coop_token");
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/loans/payroll-report`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `ASCON_Payroll_${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Payroll CSV downloaded successfully.");
    } catch (error) {
      toast.error("Failed to generate payroll report.");
    }
  };

  const formatNaira = (koboAmount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(koboAmount / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "REJECTED":
        return "bg-red-100 text-red-700 border-red-200";
      case "REPAID":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "PENDING_ADMIN":
        return "bg-amber-100 text-amber-700 border-amber-200 animate-pulse";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  // --- CALCULATION LOGIC ---
  const pendingReviewsCount = loans.filter(
    (l) => l.status === "PENDING_ADMIN",
  ).length;

  const activeLoansValue = loans
    .filter((l) => l.status === "APPROVED")
    .reduce(
      (acc, l) => acc + ((l.amountDue || l.amountRequested) - l.amountRepaid),
      0,
    );

  // 🚀 NEW: Estimated Liquidity (Total Savings - Money Out on Active Loans)
  // Note: This is a simplified estimation. A real bank would track cash-at-hand vs assets.
  const estimatedLiquidity = Math.max(
    0,
    globalStats.totalCooperativeSavings - activeLoansValue,
  );

  const searchedLoans = loans.filter((loan) => {
    const term = searchQuery.toLowerCase();
    return (
      (loan.cooperatorId?.firstName?.toLowerCase() || "").includes(term) ||
      (loan.cooperatorId?.lastName?.toLowerCase() || "").includes(term) ||
      (loan.cooperatorId?.fileNumber?.toLowerCase() || "").includes(term)
    );
  });

  const displayLoans = searchedLoans.filter((loan) => {
    if (activeTab === "PENDING") return loan.status === "PENDING_ADMIN";
    if (activeTab === "ACTIVE") return loan.status === "APPROVED";
    if (activeTab === "ARCHIVE")
      return ["REJECTED", "REPAID", "PENDING_GUARANTORS"].includes(loan.status);
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <svg
          className="animate-spin h-10 w-10 text-emerald-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up pb-10">
      {/* ========================================== */}
      {/* ROW 1: COOPERATIVE HEALTH (NEW)            */}
      {/* ========================================== */}
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
        Cooperative Health Overview
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Pooled Savings */}
        <div className="bg-[#0f3420] rounded-3xl p-6 shadow-xl shadow-emerald-900/10 text-white relative overflow-hidden group">
          <div className="absolute -right-12 -top-12 w-40 h-40 bg-emerald-500/20 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-emerald-200/70 uppercase tracking-wider mb-2">
              Total Pooled Savings
            </p>
            <h2 className="text-3xl font-extrabold tabular-nums tracking-tight">
              {formatNaira(globalStats.totalCooperativeSavings)}
            </h2>
            <p className="text-[10px] text-emerald-100/60 mt-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {globalStats.activeMembersCount} Active Contributing Members
            </p>
          </div>
        </div>

        {/* Estimated Liquidity */}
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/40 border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Estimated Liquidity
          </p>
          <h2 className="text-3xl font-extrabold text-slate-800 tabular-nums tracking-tight">
            {formatNaira(estimatedLiquidity)}
          </h2>
          <p className="text-[10px] text-slate-500 mt-3 font-medium">
            Approx. funds available for new loans
          </p>
        </div>

        {/* Active Capital in Field */}
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/40 border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Active Capital (Field)
          </p>
          <h2 className="text-3xl font-extrabold text-[#1b5e3a] tabular-nums tracking-tight">
            {formatNaira(activeLoansValue)}
          </h2>
          <p className="text-[10px] text-slate-500 mt-3 font-medium">
            Total outstanding loan balances
          </p>
        </div>
      </div>

      {/* ========================================== */}
      {/* ROW 2: ACTION CENTER (EXISTING)            */}
      {/* ========================================== */}
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
        Command Actions
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Pending Reviews */}
        <div className="bg-gradient-to-br from-amber-50 to-white rounded-3xl p-6 shadow-xl shadow-amber-100/40 border border-amber-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                Action Required
              </p>
            </div>
            <h2 className="text-4xl font-extrabold text-slate-800 tabular-nums">
              {pendingReviewsCount}
            </h2>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Applications awaiting approval
            </p>
          </div>
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center shadow-inner">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        </div>

        {/* HR Export Hub */}
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              HR Export Hub
            </p>
            <svg
              className="w-5 h-5 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              />
            </svg>
          </div>
          <p className="text-sm text-slate-500 mb-4 font-medium">
            Generate the monthly deduction report for the ASCON Payroll team.
          </p>
          <button
            onClick={handleDownloadPayroll}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md text-sm"
          >
            Download Payroll CSV
          </button>
        </div>
      </div>

      {/* CONTROLS: TABS & SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex p-1 bg-slate-200/50 rounded-xl w-fit border border-slate-200">
          <button
            onClick={() => setActiveTab("PENDING")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "PENDING" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Action Required{" "}
            {pendingReviewsCount > 0 && (
              <span className="ml-2 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {pendingReviewsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("ACTIVE")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "ACTIVE" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Active Capital
          </button>
          <button
            onClick={() => setActiveTab("ARCHIVE")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "ARCHIVE" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Ledger Archive
          </button>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search name or file no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all"
          />
        </div>
      </div>

      {/* STRIPE-STYLE DATA TABLE */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <th className="px-6 py-4 font-bold">Applicant Details</th>
                <th className="px-6 py-4 font-bold">Financials</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">
                  Review Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayLoans.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-slate-500 font-medium"
                  >
                    No records found.
                  </td>
                </tr>
              ) : (
                displayLoans.map((loan) => (
                  <tr
                    key={loan._id}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-md border-2 border-emerald-100 flex-shrink-0 overflow-hidden">
                          {loan.cooperatorId?.avatarUrl ? (
                            <img
                              src={loan.cooperatorId.avatarUrl}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            loan.cooperatorId?.lastName?.charAt(0) || "U"
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">
                            {loan.cooperatorId?.lastName}{" "}
                            {loan.cooperatorId?.firstName}
                          </div>
                          <div className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide border border-slate-200">
                              {loan.cooperatorId?.fileNumber}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 tabular-nums">
                      <div className="font-bold text-slate-800">
                        {formatNaira(loan.amountRequested)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border ${getStatusColor(loan.status)}`}
                      >
                        {loan.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right align-middle">
                      {loan.status === "PENDING_ADMIN" ? (
                        <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => handleReview(loan._id, "REJECTED")}
                            disabled={processingId === loan._id}
                            className="p-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-xl border border-red-200 transition-all"
                            title="Reject Loan"
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
                          <button
                            onClick={() => handleReview(loan._id, "APPROVED")}
                            disabled={processingId === loan._id}
                            className="p-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl shadow-md transition-all"
                            title="Approve Loan"
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
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium italic">
                          Reviewed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
