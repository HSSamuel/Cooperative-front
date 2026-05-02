"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function HRReportsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [loans, setLoans] = useState<any[]>([]);

  // Custom Export State
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const token = localStorage.getItem("coop_token");
      // For the MVP, we pull all loans and filter on the frontend.
      // In Phase 2, this would be a dedicated analytics endpoint.
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/loans/all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setLoans(res.data);
    } catch (error) {
      toast.error("Failed to load financial intelligence data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomExport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error("Please select both a start and end date.");
      return;
    }

    setIsExporting(true);
    try {
      const token = localStorage.getItem("coop_token");
      // Passing dates as query parameters
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/loans/payroll-report?start=${startDate}&end=${endDate}`,
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
        `ASCON_Payroll_${startDate}_to_${endDate}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Custom Payroll CSV downloaded successfully.");
    } catch (error) {
      toast.error("Failed to generate custom report.");
    } finally {
      setIsExporting(false);
    }
  };

  const formatNaira = (koboAmount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(koboAmount / 100);
  };

  // Analytics Math
  const activeLoans = loans.filter((l) => l.status === "APPROVED");
  const totalDisbursed = activeLoans.reduce(
    (acc, l) => acc + (l.amountDue || l.amountRequested),
    0,
  );
  const totalRepaid = activeLoans.reduce((acc, l) => acc + l.amountRepaid, 0);
  const totalOutstanding = totalDisbursed - totalRepaid;
  const repaymentRate =
    totalDisbursed > 0
      ? ((totalRepaid / totalDisbursed) * 100).toFixed(1)
      : "0.0";

  // Mock Risk Logic: Flag loans where repayment is less than 10% (adjust logic as needed)
  const atRiskLoans = activeLoans.filter(
    (l) => l.amountRepaid / (l.amountDue || l.amountRequested) < 0.1,
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg
          className="animate-spin h-8 w-8 text-emerald-600"
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
      {/* HEADER */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
          HR Financial Intelligence
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Generate payroll exports and monitor cooperative capital health.
        </p>
      </div>

      {/* TOP ROW: CAPITAL FLOW OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Total Disbursed (Active)
          </p>
          <h3 className="text-2xl font-extrabold text-slate-800 tabular-nums">
            {formatNaira(totalDisbursed)}
          </h3>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-1">
            Total Repaid
          </p>
          <h3 className="text-2xl font-extrabold text-emerald-600 tabular-nums">
            {formatNaira(totalRepaid)}
          </h3>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1">
            Outstanding Capital
          </p>
          <h3 className="text-2xl font-extrabold text-slate-800 tabular-nums">
            {formatNaira(totalOutstanding)}
          </h3>
        </div>
        <div className="bg-[#0f3420] rounded-2xl p-5 border border-[#1b5e3a] shadow-lg text-white">
          <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider mb-1">
            Repayment Health
          </p>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-extrabold text-white tabular-nums leading-none">
              {repaymentRate}%
            </h3>
            <span className="text-xs text-emerald-400 mb-1">recovery</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: CUSTOM EXPORT ENGINE */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/40 border border-slate-100">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              Custom Payroll Export
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Select a date range to generate a precise CSV deduction report for
              HR processing.
            </p>

            <form onSubmit={handleCustomExport} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                type="submit"
                disabled={isExporting}
                className="w-full mt-2 bg-[#1b5e3a] hover:bg-[#124228] text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-70"
              >
                {isExporting ? "Generating Report..." : "Download Custom CSV"}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: RISK & DEFAULT LEDGER */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-800">
                  {/* Shows on Mobile */}
                  <span className="sm:hidden">Priority Risk Watch</span>

                  {/* Shows on Desktop/Tablet */}
                  <span className="hidden sm:inline">
                    Risk & Default Ledger
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Active loans with repayment progress below 10%.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <th className="px-6 py-3 font-bold">Cooperator</th>
                    <th className="px-6 py-3 font-bold">Outstanding Balance</th>
                    <th className="px-6 py-3 font-bold">Guarantors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {atRiskLoans.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
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
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <p className="text-slate-600 font-bold text-sm">
                          Excellent Portfolio Health
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          No loans are currently flagged for high risk.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    atRiskLoans.map((loan) => {
                      const balance =
                        (loan.amountDue || loan.amountRequested) -
                        loan.amountRepaid;
                      return (
                        <tr
                          key={loan._id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-800 text-sm">
                              {loan.cooperatorId?.lastName}{" "}
                              {loan.cooperatorId?.firstName}
                            </div>
                            <div className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded inline-block mt-1">
                              {loan.cooperatorId?.fileNumber}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-red-600 text-sm">
                              {formatNaira(balance)}
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                              <div
                                className="bg-red-500 h-1.5 rounded-full"
                                style={{
                                  width: `${Math.max(1, (loan.amountRepaid / (loan.amountDue || loan.amountRequested)) * 100)}%`,
                                }}
                              ></div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs font-medium text-slate-600">
                              {loan.guarantors[0]?.fileNumber}
                            </div>
                            <div className="text-xs font-medium text-slate-600">
                              {loan.guarantors[1]?.fileNumber}
                            </div>
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
      </div>
    </div>
  );
}
