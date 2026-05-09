"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardOverview() {
  const { account, loans, transactions, status } = useSelector(
    (state: RootState) => state.finance,
  );

  const [user, setUser] = useState<any>(null);
  const [probationEndDate, setProbationEndDate] = useState<Date | null>(null);
  const [isUnderProbation, setIsUnderProbation] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("coop_user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }
  }, []);

  useEffect(() => {
    if (account && account.cooperatorId) {
      const joinDate = new Date(
        account.cooperatorId.dateJoined ??
          account.cooperatorId.createdAt ??
          Date.now(),
      );
      const endDate = new Date(joinDate);
      endDate.setMonth(endDate.getMonth() + 6);

      if (new Date() < endDate) {
        setIsUnderProbation(true);
        setProbationEndDate(endDate);
      } else {
        setIsUnderProbation(false);
        setProbationEndDate(null);
      }
    }
  }, [account]);

  const formatNaira = (koboAmount: number) => {
    return new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(koboAmount / 100);
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
        <div className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-sm w-full"></div>
      </div>
    );
  }

  const activeLoans = loans.filter((l: any) => l.status === "APPROVED");
  const outstandingLoanBalance = activeLoans.reduce(
    (sum: number, loan: any) => {
      const targetRepayment = loan.amountDue || loan.amountRequested;
      const amountRepaid = loan.amountRepaid || 0;
      return sum + (targetRepayment - amountRepaid);
    },
    0,
  );

  const currentMonthString = new Date().toLocaleString("en-GB", {
    month: "long",
    year: "numeric",
  });
  const currentMonthSavings = transactions
    .filter(
      (txn: any) =>
        txn.type === "CREDIT" && txn.effectiveMonth === currentMonthString,
    )
    .reduce((sum: number, txn: any) => sum + txn.amount, 0);

  const chartData = [
    { name: "Current Debt", value: outstandingLoanBalance / 100 },
    { name: "Total Savings", value: account.totalSavings / 100 },
    { name: "Credit Limit", value: (account.totalSavings * 2) / 100 },
  ];

  const COLORS = ["#ef4444", "#1b5e3a", "#f59e0b"];

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="flex flex-col gap-6 w-full">
        {isUnderProbation && probationEndDate && (
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-sm p-4 flex items-start sm:items-center gap-4 transition-colors shadow-sm">
            <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 p-2.5 rounded-full flex-shrink-0">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-0.5">
                Probation Period Active
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed text-justify sm:text-left">
                As a new cooperator, you must complete your 6-month probation
                before applying for loan facilities. Your loan privileges will
                automatically unlock on{" "}
                <strong className="font-bold underline">
                  {probationEndDate.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </strong>
                .
              </p>
            </div>
          </div>
        )}

        <div className="flex overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pb-4 sm:pb-0 snap-x snap-mandatory custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="min-w-[260px] sm:min-w-0 snap-center bg-white dark:bg-[#1B1B25] rounded-sm p-6 shadow-sm border-l-4 border-[#1b5e3a] relative overflow-hidden group transition-colors">
            <div className="absolute -right-6 -top-6 text-emerald-50 dark:text-emerald-900/20 opacity-50 group-hover:scale-110 transition-transform duration-500">
              <svg
                className="w-24 h-24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.64-2.25 1.64-1.74 0-2.1-.96-2.15-1.92H8.03c.05 1.78 1.16 2.92 2.87 3.33V19h2.34v-1.6c1.64-.32 2.89-1.41 2.89-2.99 0-1.85-1.42-2.74-3.82-3.27z" />
              </svg>
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Total Savings
            </p>
            <div className="flex items-baseline gap-1 relative z-10">
              <span className="text-lg font-bold text-slate-400 dark:text-slate-500">
                ₦
              </span>
              <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight truncate">
                {formatNaira(account.totalSavings)}
              </h3>
            </div>
          </div>

          <div className="min-w-[260px] sm:min-w-0 snap-center bg-white dark:bg-[#1B1B25] rounded-sm p-6 shadow-sm border-l-4 border-blue-500 relative overflow-hidden group transition-colors">
            <div className="absolute -right-6 -top-6 text-blue-50 dark:text-blue-900/20 opacity-50 group-hover:scale-110 transition-transform duration-500">
              <svg
                className="w-24 h-24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-2V7h-2v5H6v2h2v5h2v-5h2v-2z" />
              </svg>
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Saved This Month
            </p>
            <div className="flex items-baseline gap-1 relative z-10">
              <span className="text-lg font-bold text-slate-400 dark:text-slate-500">
                ₦
              </span>
              <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight truncate">
                {formatNaira(currentMonthSavings)}
              </h3>
            </div>
          </div>

          <div className="min-w-[260px] sm:min-w-0 snap-center bg-white dark:bg-[#1B1B25] rounded-sm p-6 shadow-sm border-l-4 border-red-500 relative overflow-hidden group transition-colors">
            <div className="absolute -right-6 -top-6 text-red-50 dark:text-red-900/20 opacity-50 group-hover:scale-110 transition-transform duration-500">
              <svg
                className="w-24 h-24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Outstanding Debt
            </p>
            <div className="flex items-baseline gap-1 relative z-10">
              <span className="text-lg font-bold text-red-400 dark:text-red-500">
                ₦
              </span>
              <h3 className="text-2xl font-extrabold text-red-600 dark:text-red-400 tracking-tight truncate">
                {formatNaira(outstandingLoanBalance)}
              </h3>
            </div>
          </div>

          <div className="min-w-[260px] sm:min-w-0 snap-center bg-white dark:bg-[#1B1B25] rounded-sm p-6 shadow-sm border-l-4 border-amber-500 relative overflow-hidden group transition-colors">
            <div className="absolute -right-6 -top-6 text-amber-50 dark:text-amber-900/20 opacity-50 group-hover:scale-110 transition-transform duration-500">
              <svg
                className="w-24 h-24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
              </svg>
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Available Credit Limit
            </p>
            <div className="flex items-baseline gap-1 relative z-10">
              <span className="text-lg font-bold text-amber-400 dark:text-amber-500">
                ₦
              </span>
              <h3 className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight truncate">
                {formatNaira(account.totalSavings * 2)}
              </h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-[#1B1B25] rounded-sm p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col transition-colors">
            <div className="flex justify-between items-center mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                  Portfolio Scale & Limits
                </h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                  Visual comparison of your core financial pillars
                </p>
              </div>
            </div>

            <div className="h-[320px] w-full min-w-0 mt-2 [&_.recharts-default-legend]:!flex [&_.recharts-default-legend]:!flex-nowrap [&_.recharts-default-legend]:!overflow-x-auto [&_.recharts-default-legend]:!justify-start sm:[&_.recharts-default-legend]:!justify-center [&_.recharts-legend-item]:!whitespace-nowrap [&_.recharts-legend-item]:!mr-4 [&_.recharts-default-legend]:pb-2 custom-scrollbar hide-scrollbar-on-mobile">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [
                      `₦${(Number(value) || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`,
                      "Amount",
                    ]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.3)",
                      backgroundColor: "#1B1B25",
                      color: "#ededed",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#94a3b8",
                      width: "100%",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-1 bg-white dark:bg-[#1B1B25] rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden transition-colors">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#12121A]/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                Recent Activity
              </h3>
              <Link
                href="/dashboard/savings"
                className="text-xs font-bold text-[#1b5e3a] dark:text-emerald-400 hover:underline"
              >
                View Ledger &rarr;
              </Link>
            </div>
            <div className="p-5 flex-1 overflow-y-auto max-h-[350px] custom-scrollbar">
              {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
                  <svg
                    className="w-12 h-12 mb-3 opacity-20"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-xs font-medium">No recent transactions.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((txn: any, index: number) => (
                    <div
                      key={txn._id || index}
                      className="flex items-start gap-3"
                    >
                      <div
                        className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${txn.type === "CREDIT" ? "bg-emerald-100 dark:bg-emerald-900/30 text-[#1b5e3a] dark:text-emerald-400" : "bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400"}`}
                      >
                        {txn.type === "CREDIT" ? (
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
                              d="M7 11l5-5m0 0l5 5m-5-5v12"
                            />
                          </svg>
                        ) : (
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
                              d="M17 13l-5 5m0 0l-5-5m5 5V6"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                          {txn.description}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {/* 🚀 FIX: Apply explicit "en-GB" locale to prevent SSR/CSR Hydration Mismatch */}
                          {new Date(txn.createdAt).toLocaleDateString("en-GB")}{" "}
                          • {txn.effectiveMonth || "Auto"}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p
                          className={`text-sm font-bold ${txn.type === "CREDIT" ? "text-[#1b5e3a] dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}
                        >
                          {txn.type === "CREDIT" ? "+" : "-"}₦
                          {formatNaira(txn.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
