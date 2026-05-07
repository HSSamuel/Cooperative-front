"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function DashboardOverview() {
  const [account, setAccount] = useState({
    totalSavings: 0,
    availableCreditLimit: 0,
    customMonthlySavings: 0,
  });
  const [loans, setLoans] = useState<any[]>([]);
  const [activeLoan, setActiveLoan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("coop_token");

    const fetchDashboardData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };

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
        setLoans(loansRes.data);

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

  const formatNaira = (koboAmount: number) => {
    return new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(koboAmount / 100);
  };

  const activeLoansCount = loans.filter((l) => l.status === "APPROVED").length;

  const chartData = [
    {
      name: "Savings",
      CREDIT: 0,
      DEBIT: account.totalSavings / 100,
    },
    {
      name: "Loan",
      CREDIT: activeLoan
        ? (activeLoan.amountDue || activeLoan.amountRequested) / 100
        : 0,
      DEBIT: activeLoan ? activeLoan.amountRepaid / 100 : 0,
    },
    {
      name: "Shares",
      CREDIT: 0,
      DEBIT: 25000,
    },
    {
      name: "Target Svs",
      CREDIT: 0,
      DEBIT: 0,
    },
    {
      name: "Commodity",
      CREDIT: 0,
      DEBIT: 0,
    },
  ];

  if (isLoading) {
    return (
      <div className="animate-pulse flex flex-col gap-6 h-[800px]">
        <div className="h-40 bg-slate-200 rounded-sm"></div>
        <div className="flex-1 bg-slate-200 rounded-sm"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="flex flex-col gap-6 w-full">
        {/* Top 3 Stat Cards */}
        <div className="bg-[#1b5e3a] p-6 rounded-sm grid grid-cols-1 sm:grid-cols-3 gap-6 shadow-md border border-[#124228]">
          <div className="bg-white rounded-sm p-6 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="flex items-start justify-center gap-1 mb-2">
              <span className="text-xl font-medium text-slate-500 mt-1">₦</span>
              <h3 className="text-3xl font-bold text-slate-700 tracking-tight">
                {formatNaira(account.totalSavings)}
              </h3>
            </div>
            <p className="text-sm text-slate-500 italic">Account Balance</p>
          </div>

          <div className="bg-white rounded-sm p-6 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="flex items-start justify-center gap-1 mb-2">
              <span className="text-xl font-medium text-slate-500 mt-1">₦</span>
              <h3 className="text-3xl font-bold text-slate-700 tracking-tight">
                {formatNaira(account.customMonthlySavings || 1500000)}
              </h3>
            </div>
            <p className="text-sm text-slate-500 italic">
              Agreed Monthly Savings
            </p>
          </div>

          <div className="bg-white rounded-sm p-6 flex flex-col items-center justify-center text-center shadow-sm">
            <h3 className="text-3xl font-bold text-slate-700 tracking-tight mb-2">
              {activeLoansCount}
            </h3>
            <p className="text-sm text-slate-500 italic">
              Total no of Active Loans
            </p>
          </div>
        </div>

        {/* Interactive Bar Chart */}
        <div className="bg-white rounded-sm p-6 border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-700">
                Society Reports for This Month
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Savings & Loans Overview
              </p>
            </div>
            <button className="text-slate-400 hover:text-slate-600">
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          <div className="h-[350px] w-full min-w-0">
            <ResponsiveContainer width="99%" height={350}>
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                barGap={2}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickFormatter={(value) => `${value.toLocaleString()}`}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend
                  align="right"
                  verticalAlign="top"
                  iconType="square"
                  wrapperStyle={{ paddingBottom: "20px" }}
                />
                <Bar
                  dataKey="CREDIT"
                  fill="#00B5E2"
                  name="CREDIT"
                  barSize={24}
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="DEBIT"
                  fill="#00E396"
                  name="DEBIT"
                  barSize={24}
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
