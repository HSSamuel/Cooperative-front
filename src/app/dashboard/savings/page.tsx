"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function SavingsPage() {
  const [account, setAccount] = useState({
    totalSavings: 0,
    availableCreditLimit: 0,
  });
  const [depositAmount, setDepositAmount] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDepositing, setIsDepositing] = useState(false);

  const fetchAccountData = async () => {
    try {
      const token = localStorage.getItem("coop_token");
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/account/my-account`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setAccount(res.data);
    } catch (error) {
      console.error("Error fetching account data", error);
      toast.error("Failed to load account details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountData();
  }, []);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert the Naira input into an integer of Kobo for the backend
    const amountInNaira = parseFloat(depositAmount);
    if (isNaN(amountInNaira) || amountInNaira <= 0) {
      toast.error("Please enter a valid deposit amount.");
      return;
    }
    const amountInKobo = Math.round(amountInNaira * 100);

    setIsDepositing(true);
    try {
      const token = localStorage.getItem("coop_token");
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/account/deposit`,
        { amountInKobo },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success("Deposit successful! Your balance has been updated.");
      setDepositAmount(""); // Clear the form
      setAccount(res.data.account); // Instantly update the UI with new balances
    } catch (error: any) {
      console.error("Deposit Error:", error);
      toast.error(
        error.response?.data?.message || "Failed to process deposit.",
      );
    } finally {
      setIsDepositing(false);
    }
  };

  const formatNaira = (koboAmount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(koboAmount / 100);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-48 bg-slate-200 rounded-3xl"></div>
        <div className="h-64 bg-slate-200 rounded-3xl"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up pb-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          My Savings
        </h2>
        <p className="text-sm sm:text-base text-slate-500 mt-1">
          Manage your cooperative funds and grow your credit limit.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: THE BALANCE CARD */}
        <div className="flex flex-col gap-6">
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-2xl p-8 group border border-slate-800">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl transform group-hover:scale-110 transition-transform duration-700 translate-x-1/3 -translate-y-1/3"></div>

            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/5">
                <svg
                  className="w-6 h-6 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                  />
                </svg>
              </div>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">
                Total Available Savings
              </p>
              <h1 className="text-4xl font-extrabold tracking-tight mb-2">
                {formatNaira(account.totalSavings)}
              </h1>
            </div>
          </div>

          {/* Educational Box */}
          <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 flex items-start gap-4">
            <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Did you know?
              </h4>
              <p className="text-sm text-slate-600 mt-1">
                Your available credit limit automatically grows as you save. You
                currently have access to{" "}
                <span className="font-bold text-[#1b5e3a]">
                  {formatNaira(account.availableCreditLimit)}
                </span>{" "}
                in loan requests.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DEPOSIT FORM */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/40 border border-slate-100 relative">
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Make a Deposit
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            Enter the amount you wish to add to your savings.
          </p>

          <form onSubmit={handleDeposit} className="space-y-6">
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Amount (NGN)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-slate-500 font-bold">₦</span>
                </div>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  className="appearance-none block w-full pl-10 pr-4 py-3.5 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1b5e3a]/20 focus:border-[#1b5e3a] sm:text-lg font-medium transition duration-200 bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isDepositing}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-[#1b5e3a]/20 text-base font-bold text-white bg-[#1b5e3a] hover:bg-[#124228] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1b5e3a] transition-all duration-200 disabled:opacity-70 transform hover:-translate-y-0.5"
              >
                {isDepositing ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
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
                    Processing Deposit...
                  </span>
                ) : (
                  "Complete Deposit securely"
                )}
              </button>
            </div>

            <p className="text-xs text-center text-slate-400 flex items-center justify-center gap-1.5 mt-4">
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Transactions are encrypted and secure.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
