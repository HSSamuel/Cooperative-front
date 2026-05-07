"use client";

import { useState, useEffect } from "react";
import apiClient from "@/lib/axios";
import toast from "react-hot-toast";

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 🚀 Clean apiClient call
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
      // 🚀 Clean apiClient call
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

  const handleDownloadPayroll = async () => {
    try {
      // 🚀 Clean apiClient call
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
      <div className="animate-pulse flex flex-col gap-6">
        <div className="h-32 bg-slate-200 rounded-sm"></div>
        <div className="h-64 bg-slate-200 rounded-sm"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#2B2F42] rounded-sm p-6 shadow-sm text-white">
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
        <div className="bg-white rounded-sm p-6 shadow-sm border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Estimated Liquidity
          </p>
          <h2 className="text-3xl font-bold text-slate-700 tabular-nums tracking-tight">
            ₦{formatNaira(estimatedLiquidity)}
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            Approx. funds available for lending
          </p>
        </div>
        <div className="bg-white rounded-sm p-6 shadow-sm border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Active Capital (Field)
          </p>
          <h2 className="text-3xl font-bold text-[#1b5e3a] tabular-nums tracking-tight">
            ₦{formatNaira(activeLoansValue)}
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            Total outstanding loan balances
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-sm p-6 shadow-sm border border-slate-200 flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-[#F39C12] uppercase tracking-wider mb-1">
              Action Required
            </p>
            <h2 className="text-3xl font-bold text-slate-700">
              {pendingReviewsCount}
            </h2>
            <p className="text-xs text-slate-400">
              Applications awaiting approval
            </p>
          </div>
        </div>
        <div className="bg-white rounded-sm p-6 shadow-sm border border-slate-200 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              HR Export Hub
            </p>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Generate the monthly deduction report for the ASCON Payroll team.
          </p>
          <button
            onClick={handleDownloadPayroll}
            className="w-full bg-[#6A5AE0] hover:bg-[#5b4bc4] text-white font-semibold py-2.5 rounded-sm transition-colors text-sm"
          >
            Download Payroll CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-sm border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 border-b border-slate-100 pb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("PENDING")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-sm transition-all ${activeTab === "PENDING" ? "bg-[#1b5e3a] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab("ACTIVE")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-sm transition-all ${activeTab === "ACTIVE" ? "bg-[#1b5e3a] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab("ARCHIVE")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-sm transition-all ${activeTab === "ARCHIVE" ? "bg-[#1b5e3a] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              Archive
            </button>
            <button
              onClick={() => setActiveTab("AUDIT")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-sm transition-all ${activeTab === "AUDIT" ? "bg-[#6A5AE0] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
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
              className="border border-slate-300 rounded-sm px-3 py-1.5 text-sm focus:outline-none focus:border-slate-500 w-full sm:w-64"
            />
          )}
        </div>

        <div className="overflow-x-auto">
          {activeTab === "AUDIT" ? (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b-2 border-slate-200 text-slate-700 font-bold">
                  <th className="py-3 px-4">TIMESTAMP</th>
                  <th className="py-3 px-4">ADMIN DETAILS</th>
                  <th className="py-3 px-4">ACTION TYPE</th>
                  <th className="py-3 px-4">DESCRIPTION</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      No audit trails found.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr
                      key={log._id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {log.adminId?.firstName} {log.adminId?.lastName} <br />
                        <span className="text-xs font-normal text-slate-400">
                          {log.adminId?.fileNumber}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-200 text-slate-700 px-2 py-1 text-[10px] rounded-sm uppercase">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {log.description}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b-2 border-slate-200 text-slate-700 font-bold">
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
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      No records found.
                    </td>
                  </tr>
                ) : (
                  displayLoans.map((loan) => (
                    <tr
                      key={loan._id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-800">
                          {loan.cooperatorId?.lastName}{" "}
                          {loan.cooperatorId?.firstName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {loan.cooperatorId?.fileNumber}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-700 text-right">
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
                              className="bg-[#20C997] text-white px-3 py-1 text-xs rounded-sm hover:opacity-90"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReview(loan._id, "REJECTED")}
                              disabled={processingId === loan._id}
                              className="bg-red-500 text-white px-3 py-1 text-xs rounded-sm hover:opacity-90"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">
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
