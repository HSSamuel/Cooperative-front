"use client";

import { useState, useEffect } from "react";
import apiClient from "@/lib/axios";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { fetchFinancialData } from "@/store/financeSlice";
import type { AppDispatch, RootState } from "@/store";
import { InstallPrompt } from "@/components/InstallPrompt";

export default function SavingsPage() {
  const dispatch = useDispatch<AppDispatch>();

  const { account, loans, transactions, status } = useSelector(
    (state: RootState) => state.finance,
  );

  const [user, setUser] = useState<any>({
    firstName: "Member",
    lastName: "",
    email: "",
    fileNumber: "",
    avatarUrl: "",
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("coop_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    dispatch(fetchFinancialData());
  }, [dispatch]);

  const formatNaira = (koboAmount: number) => {
    return new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(koboAmount / 100);
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountInKobo = Math.round((parseFloat(depositAmount) || 0) * 100);

    if (isNaN(amountInKobo) || amountInKobo <= 0) {
      return toast.error("Please enter a valid amount.");
    }

    setIsSubmitting(true);
    try {
      await apiClient.post("/account/deposit", {
        amountInKobo,
        targetUserId: user._id || user.id,
      });

      toast.success("Deposit successful!");
      setIsAddModalOpen(false);
      setDepositAmount("");

      // 🚀 Instantly sync Redux state
      dispatch(fetchFinancialData());
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Deposit failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentMonthString = new Date().toLocaleString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const currentMonthSavings = transactions
    .filter(
      (txn) =>
        txn.type === "CREDIT" &&
        txn.effectiveMonth === currentMonthString &&
        !txn.description?.toLowerCase().includes("dividend"),
    )
    .reduce((sum, txn) => sum + txn.amount, 0);

  const activeLoans = loans.filter((l: any) => l.status === "APPROVED");
  const outstandingLoanBalance = activeLoans.reduce(
    (sum: number, loan: any) => {
      const targetRepayment = loan.amountDue || loan.amountRequested;
      const amountRepaid = loan.amountRepaid || 0;
      return sum + (targetRepayment - amountRepaid);
    },
    0,
  );

  const totalDebits = transactions
    .filter((txn) => txn.type === "DEBIT")
    .reduce((sum, txn) => sum + txn.amount, 0);

  const totalDividends =
    account.totalDividends ||
    transactions
      .filter(
        (txn) =>
          txn.type === "CREDIT" &&
          txn.description?.toLowerCase().includes("dividend"),
      )
      .reduce((sum, txn) => sum + txn.amount, 0);

  if (status === "loading" || status === "idle") {
    return (
      <div className="animate-pulse flex flex-col gap-6 h-[800px] w-full">
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-sm w-full"></div>
        <div className="h-[500px] bg-slate-200 dark:bg-slate-800 rounded-sm w-full"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up pb-10 relative">
      <InstallPrompt />
      <div className="flex flex-col gap-6 w-full">
        <div className="bg-[#1b5e3a] p-6 rounded-sm grid grid-cols-1 sm:grid-cols-3 gap-6 shadow-md border border-[#124228]">
          <div className="bg-white dark:bg-[#1B1B25] rounded-sm p-6 flex flex-col items-center justify-center text-center shadow-sm transition-colors">
            <div className="flex items-start justify-center gap-1 mb-2">
              <span className="text-xl font-medium text-slate-500 dark:text-slate-400 mt-1">
                ₦
              </span>
              <h3 className="text-3xl font-bold text-slate-700 dark:text-slate-200 tracking-tight">
                {formatNaira(account.totalSavings)}
              </h3>
            </div>
            {/* Second Card - Was "Current Monthly Savings" */}
            <p className="text-sm text-slate-500 dark:text-slate-400 italic">
              Available Balance
            </p>
          </div>

          <div className="bg-white dark:bg-[#1B1B25] rounded-sm p-6 flex flex-col items-center justify-center text-center shadow-sm transition-colors">
            <div className="flex items-start justify-center gap-1 mb-2">
              <span className="text-xl font-medium text-slate-500 dark:text-slate-400 mt-1">
                ₦
              </span>
              <h3 className="text-3xl font-bold text-slate-700 dark:text-slate-200 tracking-tight">
                {formatNaira(currentMonthSavings)}
              </h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 italic">
              Deposits This Month
            </p>
          </div>

          <div className="bg-white dark:bg-[#1B1B25] rounded-sm p-6 flex flex-col items-center justify-center text-center shadow-sm transition-colors">
            <div className="flex items-start justify-center gap-1 mb-2">
              <span className="text-xl font-medium text-red-400 mt-1">₦</span>
              <h3 className="text-3xl font-bold text-red-500 tracking-tight">
                {formatNaira(outstandingLoanBalance)}
              </h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 italic">
              Outstanding Loan Balance
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1B1B25] rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm p-6 w-full transition-colors">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4 gap-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
              Transaction Ledger
            </h3>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#1b5e3a] text-white px-4 py-2 rounded-sm flex items-center justify-center gap-2 text-sm font-bold transition-colors hover:bg-[#124228] shadow-sm w-full sm:w-auto"
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
              New Deposit
            </button>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
              <thead className="bg-slate-50 dark:bg-[#12121A]/50">
                <tr>
                  <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300 text-center w-16 border border-slate-200 dark:border-slate-800">
                    Status
                  </th>
                  <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300 text-sm border border-slate-200 dark:border-slate-800">
                    Effective Month
                  </th>
                  <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300 text-sm border border-slate-200 dark:border-slate-800">
                    Description
                  </th>
                  <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300 text-sm text-right border border-slate-200 dark:border-slate-800">
                    Debit
                  </th>
                  <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300 text-sm text-right border border-slate-200 dark:border-slate-800">
                    Credit
                  </th>
                  <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300 text-sm text-right border border-slate-200 dark:border-slate-800">
                    Dividends
                  </th>
                  {/* 🚀 NEW: Total Balance Column */}
                  <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300 text-sm text-right border border-slate-200 dark:border-slate-800">
                    Total Balance
                  </th>
                  <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300 text-sm border border-slate-200 dark:border-slate-800">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-8 text-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
                    >
                      No transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((txn) => {
                    const isDividend =
                      txn.type === "CREDIT" &&
                      txn.description?.toLowerCase().includes("dividend");
                    const isCredit = txn.type === "CREDIT" && !isDividend;
                    const isDebit = txn.type === "DEBIT";

                    return (
                      <tr
                        key={txn._id}
                        className="hover:bg-slate-50 dark:hover:bg-[#12121A]/50 transition-colors"
                      >
                        <td className="py-3 px-4 border border-slate-200 dark:border-slate-800 text-center">
                          <div
                            className={`w-8 h-8 mx-auto rounded-full inline-flex items-center justify-center shadow-sm ${txn.type === "CREDIT" ? "bg-emerald-100 dark:bg-emerald-900/30 text-[#1b5e3a] dark:text-emerald-400" : "bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400"}`}
                          >
                            {txn.type === "CREDIT" ? (
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M17 13l-5 5m0 0l-5-5m5 5V6"
                                />
                              </svg>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium border border-slate-200 dark:border-slate-800">
                          {txn.effectiveMonth || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                          {txn.description}
                        </td>
                        <td className="py-3 px-4 text-red-500 dark:text-red-400 text-right font-medium border border-slate-200 dark:border-slate-800">
                          {isDebit ? formatNaira(txn.amount) : ""}
                        </td>
                        <td className="py-3 px-4 text-[#1b5e3a] dark:text-emerald-400 text-right font-bold border border-slate-200 dark:border-slate-800">
                          {isCredit ? formatNaira(txn.amount) : ""}
                        </td>
                        <td className="py-3 px-4 text-purple-600 dark:text-purple-400 text-right font-bold border border-slate-200 dark:border-slate-800">
                          {isDividend ? formatNaira(txn.amount) : ""}
                        </td>
                        {/* 🚀 NEW: Data for Total Balance */}
                        <td className="py-3 px-4 text-slate-800 dark:text-slate-200 text-right font-black border border-slate-200 dark:border-slate-800">
                          ₦{formatNaira(txn.balanceAfter || 0)}
                        </td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-500 text-[11px] leading-tight border border-slate-200 dark:border-slate-800">
                          {new Date(txn.createdAt).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                          <br />
                          {new Date(txn.createdAt).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="bg-[#f8f9fe] dark:bg-[#12121A]/50 p-5 rounded-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-1">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-sm text-[#1b5e3a] dark:text-emerald-400">
                  <svg
                    className="w-5 h-5"
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
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                  ₦{formatNaira(account.totalSavings)}
                </h3>
              </div>
              {/* First Bottom Box - Was "Total savings" */}
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium ml-11">
                Available balance
              </p>
            </div>

            <div className="bg-[#f8f9fe] dark:bg-[#12121A]/50 p-5 rounded-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-1">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-sm text-purple-600 dark:text-purple-400">
                  <svg
                    className="w-5 h-5"
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
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                  ₦{formatNaira(totalDividends)}
                </h3>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium ml-11">
                Total dividends
              </p>
            </div>

            <div className="bg-[#f8f9fe] dark:bg-[#12121A]/50 p-5 rounded-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-1">
                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-sm text-red-500 dark:text-red-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                  ₦{formatNaira(totalDebits)}
                </h3>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium ml-11">
                Total debit/withdrawal
              </p>
            </div>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1B1B25] rounded-sm shadow-xl w-full max-w-sm overflow-hidden animate-fade-in-up border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#12121A]/50">
              <h3 className="font-bold text-slate-800 dark:text-slate-200">
                New Deposit
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleDeposit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Amount to Save (₦)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-medium">
                    ₦
                  </span>
                  <input
                    type="number"
                    required
                    min="100"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    className="w-full pl-8 pr-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-sm text-sm focus:outline-none focus:border-[#1b5e3a] dark:focus:border-emerald-500 bg-transparent text-slate-800 dark:text-slate-200"
                    placeholder="e.g. 50000"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">
                  Enter the amount you wish to add to your total savings.
                </p>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-[#1b5e3a] hover:bg-[#124228] text-white text-sm font-bold rounded-sm transition-colors disabled:opacity-70 shadow-sm"
                >
                  {isSubmitting ? "Processing..." : "Save Money"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
