"use client";

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
          <div className="h-32 bg-slate-200 rounded-sm"></div>
          <div className="h-32 bg-slate-200 rounded-sm"></div>
          <div className="h-32 bg-slate-200 rounded-sm"></div>
          <div className="h-32 bg-slate-200 rounded-sm"></div>
        </div>
        <div className="flex-1 bg-slate-200 rounded-sm w-full"></div>
      </div>
    );
  }

  // Synchronous calculations based on cached data
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

  // Pie Chart Data mapping
  const chartData = [
    { name: "Current Debt", value: outstandingLoanBalance / 100 },
    { name: "Total Savings", value: account.totalSavings / 100 },
    { name: "Credit Limit", value: (account.totalSavings * 2) / 100 },
  ];

  // Custom colors for the Pie slices
  const COLORS = ["#ef4444", "#1b5e3a", "#f59e0b"];

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="flex flex-col gap-6 w-full">
        {/* 🚀 4-Point KPI Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Total Savings */}
          <div className="bg-white rounded-sm p-6 shadow-sm border-l-4 border-[#1b5e3a] relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 text-emerald-50 opacity-50 group-hover:scale-110 transition-transform duration-500">
              <svg
                className="w-24 h-24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.64-2.25 1.64-1.74 0-2.1-.96-2.15-1.92H8.03c.05 1.78 1.16 2.92 2.87 3.33V19h2.34v-1.6c1.64-.32 2.89-1.41 2.89-2.99 0-1.85-1.42-2.74-3.82-3.27z" />
              </svg>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Total Savings
            </p>
            <div className="flex items-baseline gap-1 relative z-10">
              <span className="text-lg font-bold text-slate-400">₦</span>
              <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight truncate">
                {formatNaira(account.totalSavings)}
              </h3>
            </div>
          </div>

          {/* Card 2: Current Month Deposit */}
          <div className="bg-white rounded-sm p-6 shadow-sm border-l-4 border-blue-500 relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 text-blue-50 opacity-50 group-hover:scale-110 transition-transform duration-500">
              <svg
                className="w-24 h-24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-2V7h-2v5H6v2h2v5h2v-5h2v-2z" />
              </svg>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Saved This Month
            </p>
            <div className="flex items-baseline gap-1 relative z-10">
              <span className="text-lg font-bold text-slate-400">₦</span>
              <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight truncate">
                {formatNaira(currentMonthSavings)}
              </h3>
            </div>
          </div>

          {/* Card 3: Outstanding Loan */}
          <div className="bg-white rounded-sm p-6 shadow-sm border-l-4 border-red-500 relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 text-red-50 opacity-50 group-hover:scale-110 transition-transform duration-500">
              <svg
                className="w-24 h-24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Outstanding Debt
            </p>
            <div className="flex items-baseline gap-1 relative z-10">
              <span className="text-lg font-bold text-red-400">₦</span>
              <h3 className="text-2xl font-extrabold text-red-600 tracking-tight truncate">
                {formatNaira(outstandingLoanBalance)}
              </h3>
            </div>
          </div>

          {/* Card 4: Available Credit Limit */}
          <div className="bg-white rounded-sm p-6 shadow-sm border-l-4 border-amber-500 relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 text-amber-50 opacity-50 group-hover:scale-110 transition-transform duration-500">
              <svg
                className="w-24 h-24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
              </svg>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Available Credit Limit
            </p>
            <div className="flex items-baseline gap-1 relative z-10">
              <span className="text-lg font-bold text-amber-400">₦</span>
              <h3 className="text-2xl font-extrabold text-amber-600 tracking-tight truncate">
                {formatNaira(account.totalSavings * 2)}
              </h3>
            </div>
          </div>
        </div>

        {/* 🚀 Split Data View (Chart + Recent Activity) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Area (Spans 2 columns) */}
          <div className="lg:col-span-2 bg-white rounded-sm p-6 border border-slate-200 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Portfolio Scale & Limits
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  Visual comparison of your core financial pillars
                </p>
              </div>
            </div>

            <div className="h-[320px] w-full min-w-0 mt-2">
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

                  {/* 🚀 THE FIX IS HERE */}
                  <Tooltip
                    formatter={(value: any) => [
                      `₦${(Number(value) || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`,
                      "Amount",
                    ]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />

                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#475569",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity Panel (Spans 1 column) */}
          <div className="lg:col-span-1 bg-white rounded-sm border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">
                Recent Activity
              </h3>
              <Link
                href="/dashboard/savings"
                className="text-xs font-bold text-[#1b5e3a] hover:underline"
              >
                View Ledger &rarr;
              </Link>
            </div>

            <div className="p-5 flex-1 overflow-y-auto max-h-[350px] custom-scrollbar">
              {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
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
                        className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${txn.type === "CREDIT" ? "bg-emerald-100 text-[#1b5e3a]" : "bg-red-100 text-red-500"}`}
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
                        <p className="text-sm font-bold text-slate-800 truncate">
                          {txn.description}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {new Date(txn.createdAt).toLocaleDateString()} •{" "}
                          {txn.effectiveMonth || "Auto"}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p
                          className={`text-sm font-bold ${txn.type === "CREDIT" ? "text-[#1b5e3a]" : "text-red-500"}`}
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
