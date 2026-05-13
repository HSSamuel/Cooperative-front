"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import apiClient from "@/lib/axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { fetchFinancialData } from "@/store/financeSlice";
import type { AppDispatch } from "@/store";
import { GlobalSpinner } from "@/components/GlobalSpinner";

export default function ApplyForLoanPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [loanType, setLoanType] = useState("REGULAR");
  const [amountRequested, setAmountRequested] = useState("");
  const [tenure, setTenure] = useState<number>(10);
  const [allowedTenures, setAllowedTenures] = useState<number[]>([
    10, 20, 30, 36,
  ]);

  const [guarantor1, setGuarantor1] = useState("");
  const [guarantor2, setGuarantor2] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [creditLimit, setCreditLimit] = useState(0);
  const [interestRate, setInterestRate] = useState(10);
  const [formFee, setFormFee] = useState(50000);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accountRes, settingsRes] = await Promise.all([
          apiClient.get("/account/my-account"),
          apiClient
            .get("/system/settings")
            .catch(() => ({ data: { settings: { interestRate: 10 } } })),
        ]);

        setCreditLimit(accountRes.data.availableCreditLimit);

        const fetchedSettings = settingsRes.data.settings || {};
        setInterestRate(fetchedSettings.interestRate ?? 10);
        setFormFee(fetchedSettings.loanFormFee ?? 50000);

        if (
          fetchedSettings.loanTenures &&
          fetchedSettings.loanTenures.length > 0
        ) {
          setAllowedTenures(fetchedSettings.loanTenures);
          // Set default tenure if current is not in the list
          if (!fetchedSettings.loanTenures.includes(tenure)) {
            setTenure(fetchedSettings.loanTenures[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
        toast.error("Could not verify your application limits.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // Only run once on mount

  const formatNaira = (amountInKobo: number) => {
    return new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amountInKobo / 100);
  };

  const requestedValueKobo = Math.round(
    (parseFloat(amountRequested) || 0) * 100,
  );
  const totalInterestPercentage = interestRate;
  const interestAmountKobo = Math.round(
    requestedValueKobo * (totalInterestPercentage / 100),
  );
  const totalDueKobo = requestedValueKobo + interestAmountKobo;
  const monthlyDeduction = totalDueKobo / tenure;

  const isOverLimit = requestedValueKobo > creditLimit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (requestedValueKobo <= 0)
      return toast.error("Please enter a valid loan amount.");
    if (isOverLimit)
      return toast.error(
        "Requested amount exceeds your available credit limit.",
      );
    if (!guarantor1 || !guarantor2)
      return toast.error("Two guarantors are strictly required.");
    if (guarantor1 === guarantor2)
      return toast.error("You must provide two different guarantors.");

    setIsSubmitting(true);
    try {
      await apiClient.post("/loans/request", {
        loanType,
        amountInKobo: requestedValueKobo,
        guarantor1FileNumber: guarantor1,
        guarantor2FileNumber: guarantor2,
        tenure,
      });

      toast.success("Loan application submitted successfully!");

      await dispatch(fetchFinancialData());

      router.push("/dashboard/loans");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to submit application.",
      );
      setIsSubmitting(false); // Only toggle if failed to allow global overlay to hold during redirect
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse flex gap-6 h-[600px] w-full">
        <div className="w-2/3 bg-slate-200 dark:bg-slate-800 rounded-sm"></div>
        <div className="w-1/3 bg-slate-200 dark:bg-slate-800 rounded-sm"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up pb-10 relative">
      {/* 🚀 Global Spinner Overlay */}
      <GlobalSpinner
        isLoading={isSubmitting}
        text="Submitting application..."
      />

      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/dashboard/loans"
          className="text-slate-400 dark:text-slate-400 hover:text-[#1b5e3a] dark:hover:text-emerald-400 transition-colors p-2 bg-white dark:bg-[#1B1B25] rounded-full shadow-sm border border-slate-100 dark:border-slate-800"
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
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
            Apply for a Facility
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Fill out the details below to request a new cooperative loan.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 bg-white dark:bg-[#1B1B25] rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm p-8 transition-colors">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
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
                        ? "border-[#1b5e3a] dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20"
                        : "border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
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
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${loanType === type.id ? "border-[#1b5e3a] dark:border-emerald-500" : "border-slate-300 dark:border-slate-600"}`}
                      >
                        {loanType === type.id && (
                          <div className="w-2.5 h-2.5 bg-[#1b5e3a] dark:bg-emerald-500 rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <h4
                          className={`font-bold ${loanType === type.id ? "text-[#1b5e3a] dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"}`}
                        >
                          {type.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {type.desc}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                2. Nominate Guarantors
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Enter the ASCON File Numbers of two cooperative members to
                guarantee this facility.
              </p>

              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-sm p-3 mb-4 text-xs text-amber-800 dark:text-amber-400 flex gap-2 items-start transition-colors">
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-justify">
                  <strong className="font-bold">System Rule:</strong> Nominated
                  guarantors must have sufficient unencumbered savings to cover
                  your requested amount. If a guarantor is already backing other
                  active loans that max out their savings capacity, the system
                  will reject your nomination.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1.5">
                    First Guarantor
                  </label>
                  <input
                    type="text"
                    required
                    value={guarantor1}
                    onChange={(e) =>
                      setGuarantor1(e.target.value.toUpperCase())
                    }
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 rounded-sm text-sm focus:outline-none focus:border-[#1b5e3a] dark:focus:border-emerald-500 uppercase transition-colors"
                    placeholder="E.g. ASCON-042"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1.5">
                    Second Guarantor
                  </label>
                  <input
                    type="text"
                    required
                    value={guarantor2}
                    onChange={(e) =>
                      setGuarantor2(e.target.value.toUpperCase())
                    }
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 rounded-sm text-sm focus:outline-none focus:border-[#1b5e3a] dark:focus:border-emerald-500 uppercase transition-colors"
                    placeholder="E.g. ASCON-089"
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                3. Enter Requested Amount
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Your maximum available credit limit is{" "}
                <span className="font-bold text-[#1b5e3a] dark:text-emerald-400">
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
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  className={`w-full pl-10 pr-4 py-4 text-xl font-bold border-2 rounded-sm bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none transition-colors ${
                    isOverLimit
                      ? "border-red-300 dark:border-red-500/50 focus:border-red-500 bg-red-50 dark:bg-red-900/10"
                      : "border-slate-200 dark:border-slate-700 focus:border-[#1b5e3a] dark:focus:border-emerald-500"
                  }`}
                  placeholder="0.00"
                />
              </div>
              {isOverLimit && (
                <p className="text-xs font-bold text-red-500 dark:text-red-400 mt-2 flex items-center gap-1">
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

            <div className="pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  isOverLimit ||
                  !amountRequested ||
                  !guarantor1 ||
                  !guarantor2 ||
                  creditLimit < formFee
                }
                className="bg-[#1b5e3a] hover:bg-[#124228] text-white w-full sm:w-auto px-5 py-2.5 text-sm rounded-sm font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap flex-shrink-0"
              >
                {isSubmitting ? (
                  "Processing..."
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
                        d="M14 5l7 7m0 0l7-7m7-7H3"
                      />
                    </svg>
                  </>
                )}
              </button>
              <div className="text-[11px] leading-snug font-medium text-amber-700 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-3 py-2.5 rounded-sm border border-amber-200 dark:border-amber-800/50 w-full text-center sm:text-left">
                A non-refundable fee of <strong>₦{formatNaira(formFee)}</strong>{" "}
                will be automatically deducted for Application form.
              </div>
            </div>
          </form>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-[#f8f9fe] dark:bg-[#12121A]/50 border border-slate-200 dark:border-slate-800 rounded-sm overflow-hidden shadow-sm sticky top-6 transition-colors">
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
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Requested Amount
                </p>
                <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  ₦
                  {requestedValueKobo > 0
                    ? formatNaira(requestedValueKobo)
                    : "0.00"}
                </h4>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Facility Type
                </p>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 capitalize">
                  {loanType.toLowerCase()} Loan
                </h4>
              </div>

              <div className="bg-white dark:bg-[#1B1B25] p-4 rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Estimated Monthly Deduction
                </p>
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-bold text-red-500 dark:text-red-400">
                    -₦
                    {requestedValueKobo > 0
                      ? formatNaira(monthlyDeduction)
                      : "0.00"}
                  </h4>
                  <select
                    value={tenure}
                    onChange={(e) => setTenure(Number(e.target.value))}
                    className="text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1b5e3a]"
                  >
                    {allowedTenures.map((t) => (
                      <option key={t} value={t}>
                        {t} Months
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 leading-tight">
                  Based on a {tenure}-month repayment tenure at{" "}
                  <strong className="text-slate-700 dark:text-slate-300">
                    {totalInterestPercentage.toFixed(1)}% total interest
                  </strong>
                  . This amount will be automatically deducted from your payroll
                  during reconciliation.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-sm p-5 text-amber-800 dark:text-amber-400 text-xs transition-colors text-justify">
            <h4 className="font-bold flex items-center gap-1.5 mb-2 text-left">
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
