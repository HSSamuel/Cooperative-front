"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function AdminOverviewPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Search and Tab State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"PENDING" | "ACTIVE" | "ARCHIVE">(
    "PENDING",
  );

  useEffect(() => {
    const token = localStorage.getItem("coop_token");
    if (token) fetchLoans(token);
  }, []);

  const fetchLoans = async (token: string) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/loans/all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setLoans(res.data);
    } catch (error) {
      console.error("Fetch Loans Error:", error);
      toast.error("Failed to load cooperative data.");
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
      fetchLoans(token!);
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

  const pendingReviewsCount = loans.filter(
    (l) => l.status === "PENDING_ADMIN",
  ).length;
  const activeLoansValue = loans
    .filter((l) => l.status === "APPROVED")
    .reduce(
      (acc, l) => acc + ((l.amountDue || l.amountRequested) - l.amountRepaid),
      0,
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
    <div className="animate-fade-in-up">
      {/* THE POWER ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/40 border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Action Required
            </p>
            <span className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </span>
          </div>
          <h2 className="text-4xl font-extrabold text-slate-800 tabular-nums">
            {pendingReviewsCount}
          </h2>
          <p className="text-xs font-semibold text-amber-500 mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Awaiting your approval
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/40 border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Capital
            </p>
            <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
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
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 tabular-nums">
            {formatNaira(activeLoansValue)}
          </h2>
          <p className="text-xs font-semibold text-emerald-600 mt-2">
            Total outstanding funds in the field
          </p>
        </div>

        {/* HR EXPORT HUB */}
        <div className="bg-[#0f3420] rounded-3xl p-6 shadow-xl shadow-emerald-900/10 text-white flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 border border-[#1b5e3a]">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-emerald-200/70 uppercase tracking-wider">
                HR Export Hub
              </p>
            </div>
            <button
              onClick={handleDownloadPayroll}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg flex items-center justify-between text-sm mt-3"
            >
              Download Payroll CSV
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </button>
          </div>
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
                        <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-md border-2 border-emerald-100 flex-shrink-0">
                          {loan.cooperatorId?.lastName?.charAt(0) || "U"}
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
