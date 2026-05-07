"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";

export default function ApplyForLoanPage() {
  const router = useRouter();

  // Form State
  const [loanType, setLoanType] = useState("REGULAR");
  const [amountRequested, setAmountRequested] = useState("");

  const [guarantor1, setGuarantor1] = useState("");
  const [guarantor2, setGuarantor2] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Account State (To enforce credit limits)
  const [creditLimit, setCreditLimit] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAccountData = async () => {
      const token = localStorage.getItem("coop_token");
      if (!token) return;

      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/account/my-account`,
          config,
        );
        setCreditLimit(data.availableCreditLimit);
      } catch (error) {
        console.error("Failed to fetch account for limit", error);
        toast.error("Could not verify your credit limit.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccountData();
  }, []);

  const formatNaira = (amountInKobo: number) => {
    return new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amountInKobo / 100);
  };

  // Live Math: ParseFloat and Math.round to prevent floating point errors
  const requestedValueKobo = Math.round(
    (parseFloat(amountRequested) || 0) * 100,
  );
  const monthlyDeduction = requestedValueKobo * 0.1;
  const isOverLimit = requestedValueKobo > creditLimit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (requestedValueKobo <= 0) {
      return toast.error("Please enter a valid loan amount.");
    }

    if (isOverLimit) {
      return toast.error(
        "Requested amount exceeds your available credit limit.",
      );
    }

    if (!guarantor1 || !guarantor2) {
      return toast.error("Two guarantors are strictly required.");
    }
    if (guarantor1 === guarantor2) {
      return toast.error("You must provide two different guarantors.");
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("coop_token");

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/loans/request`,
        {
          loanType,
          amountInKobo: requestedValueKobo,
          guarantor1FileNumber: guarantor1,
          guarantor2FileNumber: guarantor2,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success("Loan application submitted successfully!");
      router.push("/dashboard/loans");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to submit application.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse flex gap-6 h-[600px] w-full">
        <div className="w-2/3 bg-slate-200 rounded-sm"></div>
        <div className="w-1/3 bg-slate-200 rounded-sm"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up pb-10">
      {/* Header with Back Button */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/dashboard/loans"
          className="text-slate-400 hover:text-[#1b5e3a] transition-colors p-2 bg-white rounded-full shadow-sm border border-slate-100"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Apply for a Facility
          </h2>
          <p className="text-sm text-slate-500">
            Fill out the details below to request a new cooperative loan.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL: The Application Form */}
        <div className="lg:col-span-8 bg-white rounded-sm border border-slate-200 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Loan Type Selection */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">
                1. Select Facility Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    id: "REGULAR",
                    title: "Regular Loan",
                    desc: "Standard cooperative loan.",
                  },
                  {
                    id: "EMERGENCY",
                    title: "Emergency Loan",
                    desc: "Fast approval for urgent needs.",
                  },
                  {
                    id: "COMMODITY",
                    title: "Commodity Loan",
                    desc: "For purchasing household items.",
                  },
                  {
                    id: "EQUIPMENT",
                    title: "Equipment Loan",
                    desc: "For tools and business equipment.",
                  },
                ].map((type) => (
                  <label
                    key={type.id}
                    onClick={() => setLoanType(type.id)}
                    className={`cursor-pointer border-2 rounded-sm p-4 transition-all ${
                      loanType === type.id
                        ? "border-[#1b5e3a] bg-emerald-50/50"
                        : "border-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="loanType"
                      value={type.id}
                      checked={loanType === type.id}
                      onChange={() => setLoanType(type.id)}
                      className="hidden"
                    />
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${loanType === type.id ? "border-[#1b5e3a]" : "border-slate-300"}`}
                      >
                        {loanType === type.id && (
                          <div className="w-2.5 h-2.5 bg-[#1b5e3a] rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <h4
                          className={`font-bold ${loanType === type.id ? "text-[#1b5e3a]" : "text-slate-700"}`}
                        >
                          {type.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {type.desc}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* 2. Guarantors Input Section */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                2. Nominate Guarantors
              </label>
              <p className="text-xs text-slate-500 mb-4">
                Enter the ASCON File Numbers of two cooperative members to
                guarantee this facility.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    First Guarantor
                  </label>
                  <input
                    type="text"
                    required
                    value={guarantor1}
                    onChange={(e) =>
                      setGuarantor1(e.target.value.toUpperCase())
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-[#1b5e3a] uppercase"
                    placeholder="E.g. ASCON-042"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Second Guarantor
                  </label>
                  <input
                    type="text"
                    required
                    value={guarantor2}
                    onChange={(e) =>
                      setGuarantor2(e.target.value.toUpperCase())
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-[#1b5e3a] uppercase"
                    placeholder="E.g. ASCON-089"
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* 3. Amount Input */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                3. Enter Requested Amount
              </label>
              <p className="text-xs text-slate-500 mb-4">
                Your maximum available credit limit is{" "}
                <span className="font-bold text-[#1b5e3a]">
                  ₦{formatNaira(creditLimit)}
                </span>{" "}
                (200% of your total savings).
              </p>

              <div className="relative max-w-md">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 font-bold text-xl">
                  ₦
                </span>
                <input
                  type="number"
                  required
                  min="1000"
                  value={amountRequested}
                  onChange={(e) => setAmountRequested(e.target.value)}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()} // 🚀 THE FIX: Prevents scroll-wheel modifications
                  className={`w-full pl-10 pr-4 py-4 text-xl font-bold border-2 rounded-sm focus:outline-none transition-colors ${
                    isOverLimit
                      ? "border-red-300 focus:border-red-500 bg-red-50"
                      : "border-slate-200 focus:border-[#1b5e3a]"
                  }`}
                  placeholder="0.00"
                />
              </div>
              {isOverLimit && (
                <p className="text-xs font-bold text-red-500 mt-2 flex items-center gap-1">
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
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Amount exceeds your available limit by ₦
                  {formatNaira(requestedValueKobo - creditLimit)}.
                </p>
              )}
            </div>

            {/* Submit Area */}
            <div className="pt-4 flex items-center gap-4">
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  isOverLimit ||
                  !amountRequested ||
                  !guarantor1 ||
                  !guarantor2
                }
                className="bg-[#1b5e3a] hover:bg-[#124228] text-white px-8 py-3 rounded-sm font-bold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>Processing Application...</>
                ) : (
                  <>
                    Submit Application
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
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT PANEL: Live Summary */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-[#f8f9fe] border border-slate-200 rounded-sm overflow-hidden shadow-sm sticky top-6">
            <div className="bg-[#1b5e3a] px-6 py-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-emerald-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Application Summary
              </h3>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Requested Amount
                </p>
                <h4 className="text-2xl font-bold text-slate-800">
                  ₦
                  {requestedValueKobo > 0
                    ? formatNaira(requestedValueKobo)
                    : "0.00"}
                </h4>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Facility Type
                </p>
                <h4 className="text-sm font-bold text-slate-800 capitalize">
                  {loanType.toLowerCase()} Loan
                </h4>
              </div>

              <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Estimated Monthly Deduction
                </p>
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-bold text-red-500">
                    -₦
                    {requestedValueKobo > 0
                      ? formatNaira(monthlyDeduction)
                      : "0.00"}
                  </h4>
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-sm">
                    10 Months
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 leading-tight">
                  Based on a standard 10-month repayment tenure. This amount
                  will be automatically deducted from your payroll during
                  reconciliation.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-sm p-5 text-amber-800 text-xs">
            <h4 className="font-bold flex items-center gap-1.5 mb-2">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Important Notice
            </h4>
            <p className="mb-2">
              All loan applications are subject to Admin review and guarantor
              verification. Submitting this form does not guarantee immediate
              disbursement.
            </p>
            <p>
              Ensure your monthly savings are up to date to avoid processing
              delays.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
