"use client";

import React, { useState, useEffect } from "react";
import apiClient from "@/lib/axios";
import toast from "react-hot-toast";
import Link from "next/link";
import { GlobalSpinner } from "@/components/GlobalSpinner";

export default function AdminOverviewPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [globalStats, setGlobalStats] = useState({
    totalCooperativeSavings: 0,
    activeMembersCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    "PENDING" | "ACTIVE" | "ARCHIVE" | "AUDIT"
  >("PENDING");

  // New state for collapsible groups
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [loansRes, statsRes, auditRes] = await Promise.all([
        apiClient.get("/loans/all"),
        apiClient.get("/account/global-stats"),
        apiClient.get("/auth/audit-logs"),
      ]);
      setLoans(loansRes.data);
      setGlobalStats(statsRes.data);
      setAuditLogs(auditRes.data);
    } catch (error) {
      toast.error("Failed to load cooperative dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  const executeReview = async (
    loanId: string,
    status: "APPROVED" | "REJECTED",
  ) => {
    setProcessingId(loanId);
    try {
      await apiClient.put(`/loans/${loanId}/review`, {
        status,
        adminComment: `Reviewed by Admin`,
      });
      toast.success(`Loan successfully ${status.toLowerCase()}`);
      fetchData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update loan status.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleReview = (loanId: string, status: "APPROVED" | "REJECTED") => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } max-w-sm w-full bg-white dark:bg-[#1B1B25] shadow-2xl rounded-2xl pointer-events-auto flex flex-col ring-1 ring-black/5 dark:ring-white/10 border border-slate-100 dark:border-slate-800 p-5`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                status === "APPROVED"
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
              }`}
            >
              {status === "APPROVED" ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Confirm {status === "APPROVED" ? "Approval" : "Rejection"}
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Are you sure you want to {status.toLowerCase()} this loan? This
                action is permanent.
              </p>
            </div>
          </div>
          <div className="mt-5 flex gap-3 justify-end">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                executeReview(loanId, status);
              }}
              className={`px-4 py-2 text-xs font-bold text-white rounded-lg transition-colors shadow-sm ${
                status === "APPROVED"
                  ? "bg-[#20C997] hover:bg-[#1ab586]"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              Yes, {status === "APPROVED" ? "Approve" : "Reject"}
            </button>
          </div>
        </div>
      ),
      { duration: Infinity, id: `confirm-review-${loanId}` },
    );
  };

  const handleDownloadPayroll = async () => {
    try {
      const res = await apiClient.get("/loans/payroll-report", {
        responseType: "blob",
      });
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

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatNaira = (koboAmount: number) => {
    return new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2 }).format(
      koboAmount / 100,
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="bg-[#20C997] text-white px-2 py-1 text-[10px] uppercase font-bold rounded-sm">
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="bg-red-500 text-white px-2 py-1 text-[10px] uppercase font-bold rounded-sm">
            Rejected
          </span>
        );
      case "REPAID":
        return (
          <span className="bg-slate-400 text-white px-2 py-1 text-[10px] uppercase font-bold rounded-sm">
            Repaid
          </span>
        );
      case "PENDING_ADMIN":
        return (
          <span className="bg-[#F39C12] text-white px-2 py-1 text-[10px] uppercase font-bold rounded-sm animate-pulse">
            Pending Review
          </span>
        );
      default:
        return (
          <span className="bg-blue-400 text-white px-2 py-1 text-[10px] uppercase font-bold rounded-sm">
            {status.replace("_", " ")}
          </span>
        );
    }
  };

  // Group consecutive identical logs by the same admin
  const groupedLogs: any[] = [];
  let currentGroup: any = null;

  for (const log of auditLogs) {
    if (!currentGroup) {
      currentGroup = { ...log, count: 1, subLogs: [log] };
    } else {
      const isSameAdmin =
        currentGroup.adminId?._id === log.adminId?._id ||
        currentGroup.adminId?.fileNumber === log.adminId?.fileNumber;
      const isSameAction = currentGroup.action === log.action;

      if (isSameAdmin && isSameAction) {
        currentGroup.count += 1;
        currentGroup.subLogs.push(log);
      } else {
        groupedLogs.push(currentGroup);
        currentGroup = { ...log, count: 1, subLogs: [log] };
      }
    }
  }
  if (currentGroup) {
    groupedLogs.push(currentGroup);
  }

  const pendingReviewsCount = loans.filter(
    (l) => l.status === "PENDING_ADMIN",
  ).length;
  const activeLoansValue = loans
    .filter((l) => l.status === "APPROVED")
    .reduce(
      (acc, l) => acc + ((l.amountDue || l.amountRequested) - l.amountRepaid),
      0,
    );
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
      <div className="animate-pulse flex flex-col gap-6 relative">
        {/* 🚀 Initial Data Loading Overlay */}
        <GlobalSpinner
          isLoading={true}
          text="Initializing Admin Dashboard..."
        />
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-sm"></div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-sm"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up pb-10 relative">
      {/* 🚀 Global Spinner for Loan Review Process */}
      <GlobalSpinner
        isLoading={processingId !== null}
        text="Applying Administrative Review..."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#2B2F42] rounded-sm p-6 shadow-sm text-white transition-colors">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Total Pooled Savings
          </p>
          <h2 className="text-3xl font-bold tabular-nums tracking-tight">
            ₦{formatNaira(globalStats.totalCooperativeSavings)}
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            {globalStats.activeMembersCount} Active Members
          </p>
        </div>
        <div className="bg-white dark:bg-[#1B1B25] rounded-sm p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Estimated Liquidity
          </p>
          <h2 className="text-3xl font-bold text-slate-700 dark:text-slate-200 tabular-nums tracking-tight">
            ₦{formatNaira(estimatedLiquidity)}
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            Approx. funds available for lending
          </p>
        </div>
        <div className="bg-white dark:bg-[#1B1B25] rounded-sm p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Active Capital (Field)
          </p>
          <h2 className="text-3xl font-bold text-[#1b5e3a] dark:text-emerald-400 tabular-nums tracking-tight">
            ₦{formatNaira(activeLoansValue)}
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            Total outstanding loan balances
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-[#1B1B25] rounded-sm p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex justify-between items-center transition-colors">
          <div>
            <p className="text-xs font-bold text-[#F39C12] uppercase tracking-wider mb-1">
              Action Required
            </p>
            <h2 className="text-3xl font-bold text-slate-700 dark:text-slate-200">
              {pendingReviewsCount}
            </h2>
            <p className="text-xs text-slate-400">
              Applications awaiting approval
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1B1B25] rounded-sm p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-center transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              HR Export Hub
            </p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Generate the monthly deduction report for the ASCON Payroll team.
          </p>
          <button
            onClick={handleDownloadPayroll}
            className="w-full bg-[#6A5AE0] hover:bg-[#5b4bc4] text-white font-semibold py-2.5 rounded-sm transition-colors text-sm"
          >
            Download Payroll CSV
          </button>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-sm p-6 shadow-sm border border-purple-700 flex flex-col justify-center transition-colors text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-purple-200 uppercase tracking-wider">
              Dividend Management
            </p>
            <svg
              className="w-5 h-5 text-purple-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
              />
            </svg>
          </div>
          <h2 className="text-lg font-bold mb-1">Targeted Payouts Active</h2>
          <p className="text-xs text-purple-200 mb-4">
            To distribute dividends individually, use the Member Directory to
            credit specific accounts.
          </p>
          <Link
            href="/admin/members"
            className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-2.5 rounded-sm transition-colors text-sm text-center flex items-center justify-center gap-2"
          >
            Go to Member Directory
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
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1B1B25] rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm p-6 transition-colors">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4 gap-4">
          <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 custom-scrollbar">
            <button
              onClick={() => setActiveTab("PENDING")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-sm transition-all whitespace-nowrap ${activeTab === "PENDING" ? "bg-[#1b5e3a] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"}`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab("ACTIVE")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-sm transition-all whitespace-nowrap ${activeTab === "ACTIVE" ? "bg-[#1b5e3a] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"}`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab("ARCHIVE")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-sm transition-all whitespace-nowrap ${activeTab === "ARCHIVE" ? "bg-[#1b5e3a] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"}`}
            >
              Archive
            </button>
            <button
              onClick={() => setActiveTab("AUDIT")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-sm transition-all whitespace-nowrap ${activeTab === "AUDIT" ? "bg-[#6A5AE0] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"}`}
            >
              Audit Log
            </button>
          </div>
          {activeTab !== "AUDIT" && (
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 rounded-sm px-3 py-1.5 text-sm focus:outline-none focus:border-slate-500 dark:focus:border-slate-400 w-full sm:w-64"
            />
          )}
        </div>

        <div className="overflow-x-auto">
          {activeTab === "AUDIT" ? (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                  <th className="py-3 px-4">TIME/DATE</th>
                  <th className="py-3 px-4">ADMIN DETAILS</th>
                  <th className="py-3 px-4">ACTION TYPE</th>
                  <th className="py-3 px-4">DESCRIPTION</th>
                </tr>
              </thead>
              <tbody>
                {groupedLogs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-slate-500 dark:text-slate-400"
                    >
                      No audit trails found.
                    </td>
                  </tr>
                ) : (
                  groupedLogs.map((group) => {
                    const isExpanded = expandedGroups.has(group._id);
                    const dateObj = new Date(group.createdAt);

                    return (
                      <React.Fragment key={group._id}>
                        <tr
                          className={`border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-[#12121A]/50 transition-colors ${group.count > 1 ? "cursor-pointer" : ""}`}
                          onClick={() =>
                            group.count > 1 && toggleGroup(group._id)
                          }
                        >
                          <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-xs">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {`${dateObj.toLocaleString("en-US", { month: "short" })}/${dateObj.getDate().toString().padStart(2, "0")}/${dateObj.getFullYear()}`}
                            </span>
                            <br />
                            <span className="text-[10px]">
                              {dateObj.toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-200">
                            {group.adminId?.firstName} {group.adminId?.lastName}{" "}
                            <br />
                            <span className="text-xs font-normal text-slate-400 dark:text-slate-500">
                              {group.adminId?.fileNumber}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 text-[10px] rounded-sm uppercase tracking-wider">
                                {group.action.replace(/_/g, " ")}
                              </span>
                              {group.count > 1 && (
                                <span className="bg-[#1b5e3a]/10 text-[#1b5e3a] dark:bg-emerald-500/10 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                                  {group.count} times
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                            <div className="flex items-center justify-between gap-4">
                              <span className="truncate max-w-xs sm:max-w-md">
                                {group.description}
                              </span>
                              {group.count > 1 && (
                                <svg
                                  className={`w-4 h-4 transform transition-transform text-slate-400 flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Collapsible Dropdown for duplicates */}
                        {isExpanded && group.count > 1 && (
                          <tr className="bg-slate-50/50 dark:bg-[#12121A]/30 border-b border-slate-100 dark:border-slate-800/50">
                            <td colSpan={4} className="p-0">
                              <div className="max-h-60 overflow-y-auto custom-scrollbar px-4 py-2">
                                {group.subLogs.map((sub: any) => {
                                  const subDate = new Date(sub.createdAt);
                                  return (
                                    <div
                                      key={sub._id}
                                      className="flex justify-between items-center text-[11px] py-2 border-b border-slate-100 dark:border-slate-700/50 last:border-0"
                                    >
                                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                                        {subDate.toLocaleTimeString("en-US", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          second: "2-digit",
                                        })}{" "}
                                        -{" "}
                                        {`${subDate.toLocaleString("en-US", { month: "short" })}/${subDate.getDate().toString().padStart(2, "0")}/${subDate.getFullYear()}`}
                                      </span>
                                      <span className="text-slate-600 dark:text-slate-300 truncate text-right">
                                        {sub.description}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                  <th className="py-3 px-4">APPLICANT</th>
                  <th className="py-3 px-4 text-right">REQUESTED</th>
                  <th className="py-3 px-4 text-center">STATUS</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {displayLoans.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-slate-500 dark:text-slate-400"
                    >
                      No records found.
                    </td>
                  </tr>
                ) : (
                  displayLoans.map((loan) => (
                    <tr
                      key={loan._id}
                      className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-[#12121A]/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {loan.cooperatorId?.lastName}{" "}
                          {loan.cooperatorId?.firstName}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {loan.cooperatorId?.fileNumber}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-700 dark:text-slate-300 text-right">
                        ₦{formatNaira(loan.amountRequested)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {getStatusBadge(loan.status)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {loan.status === "PENDING_ADMIN" ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleReview(loan._id, "APPROVED")}
                              disabled={processingId === loan._id}
                              className="bg-[#20C997] text-white px-3 py-1 text-xs rounded-sm hover:opacity-90 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReview(loan._id, "REJECTED")}
                              disabled={processingId === loan._id}
                              className="bg-red-500 text-white px-3 py-1 text-xs rounded-sm hover:opacity-90 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            Reviewed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
