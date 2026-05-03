"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function LoanCenterPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [creditLimit, setCreditLimit] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Probation State
  const [probationEndDate, setProbationEndDate] = useState<Date | null>(null);

  // Form State
  const [amount, setAmount] = useState("");
  const [guarantor1, setGuarantor1] = useState("");
  const [guarantor2, setGuarantor2] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("coop_token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [loansRes, accountRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/loans/my-loans`, config),
        axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/account/my-account`,
          config,
        ),
      ]);

      setLoans(loansRes.data);
      setCreditLimit(accountRes.data.availableCreditLimit);

      // 🚀 UPDATED: Perfectly sync the Banner to the Admin-Controlled Date
      const userDoc = accountRes.data.cooperatorId;
      if (userDoc) {
        // Fallback to createdAt only if dateJoined is somehow missing
        const joinedDate = new Date(userDoc.dateJoined || userDoc.createdAt);

        const eligibilityDate = new Date(joinedDate);
        eligibilityDate.setMonth(eligibilityDate.getMonth() + 6); // Add 6 months

        // If today is BEFORE their specific eligibility date, show the banner
        if (new Date() < eligibilityDate) {
          setProbationEndDate(eligibilityDate);
        } else {
          // If they passed 6 months, ensure the banner hides silently
          setProbationEndDate(null);
        }
      }
    } catch (error) {
      console.error("Error fetching loan data", error);
      toast.error("Failed to load loan details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountInNaira = parseFloat(amount);
    if (isNaN(amountInNaira) || amountInNaira <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    const amountInKobo = Math.round(amountInNaira * 100);

    if (amountInKobo > creditLimit) {
      toast.error("Requested amount exceeds your available credit limit.");
      return;
    }

    if (guarantor1 === guarantor2) {
      toast.error("You must provide two different guarantors.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("coop_token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/loans/request`,
        {
          amountInKobo,
          guarantor1FileNumber: guarantor1.trim(),
          guarantor2FileNumber: guarantor2.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success("Application submitted! Live requests sent to guarantors.");
      setAmount("");
      setGuarantor1("");
      setGuarantor2("");
      fetchData(); // Refresh the history list
    } catch (error: any) {
      console.error("Loan Request Error:", error);
      toast.error(
        error.response?.data?.message || "Failed to submit application.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatNaira = (koboAmount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(koboAmount / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "REJECTED":
        return "bg-red-100 text-red-700 border-red-200";
      case "REPAID":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-amber-100 text-amber-700 border-amber-200"; // Pending states
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-96 bg-slate-200 rounded-3xl"></div>
        <div className="h-[500px] bg-slate-200 rounded-3xl"></div>
      </div>
    );
  }

  const hasActiveLoan = loans.some((loan) =>
    ["PENDING_GUARANTORS", "PENDING_ADMIN", "APPROVED"].includes(loan.status),
  );

  return (
    <div className="animate-fade-in-up pb-10 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          Loan Center
        </h2>
        <p className="text-sm sm:text-base text-slate-500 mt-1">
          Apply for cooperative loans and track your active requests.
        </p>
      </div>

      {/* THE PROBATION AWARENESS BANNER */}
      {probationEndDate && (
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-800 mb-1">
              New Member Probation Period
            </h4>
            <p className="text-sm text-blue-600">
              Welcome to the cooperative! Standard policy requires a 6-month
              active saving period before you can access loan facilities. Your
              loan eligibility officially unlocks on{" "}
              <strong className="text-blue-800">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[#1b5e3a] rounded-3xl p-6 shadow-xl text-white relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <p className="text-emerald-100/80 text-xs font-medium uppercase tracking-wider mb-1">
              Available Credit Limit
            </p>
            <h3 className="text-3xl font-extrabold tracking-tight">
              {formatNaira(creditLimit)}
            </h3>
            <p className="text-xs text-emerald-200 mt-2 flex items-center gap-1.5">
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
              Limits increase automatically as you save.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/40 border border-slate-100 flex-1">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Loan History
            </h3>

            {loans.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 text-sm">
                  You haven't requested any loans yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {loans.map((loan) => (
                  <div
                    key={loan._id}
                    className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-100/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-slate-800">
                        {formatNaira(loan.amountRequested)}
                      </p>
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide border ${getStatusColor(loan.status)}`}
                      >
                        {loan.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex justify-between items-center mt-3 pt-3 border-t border-slate-200">
                      <span>
                        Due:{" "}
                        {formatNaira(loan.amountDue || loan.amountRequested)}
                      </span>
                      <span>Repaid: {formatNaira(loan.amountRepaid)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/40 border border-slate-100 h-full">
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              New Loan Application
            </h3>
            <p className="text-sm text-slate-500 mb-8">
              Submit a request. You will need two active members to guarantee
              your loan.
            </p>

            {hasActiveLoan ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
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
                <h4 className="font-bold text-slate-800 mb-1">
                  Application Locked
                </h4>
                <p className="text-sm text-slate-600">
                  You already have an active or pending loan. You must complete
                  your current loan cycle before requesting another.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-6">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <label
                    htmlFor="amount"
                    className="block text-sm font-semibold text-slate-800 mb-1.5"
                  >
                    Requested Amount (NGN)
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
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="appearance-none block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1b5e3a]/20 focus:border-[#1b5e3a] transition duration-200 bg-white"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    A flat 5% interest rate will be applied automatically.
                  </p>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                  <h4 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">
                    Provide Guarantors
                  </h4>

                  <div>
                    <label
                      htmlFor="g1"
                      className="block text-xs font-semibold text-slate-600 mb-1.5"
                    >
                      1st Guarantor (ASCON File Number)
                    </label>
                    <input
                      id="g1"
                      type="text"
                      required
                      value={guarantor1}
                      onChange={(e) =>
                        setGuarantor1(e.target.value.toUpperCase())
                      }
                      placeholder="e.g. ASCON-001"
                      className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1b5e3a]/20 focus:border-[#1b5e3a] transition duration-200 bg-white text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="g2"
                      className="block text-xs font-semibold text-slate-600 mb-1.5"
                    >
                      2nd Guarantor (ASCON File Number)
                    </label>
                    <input
                      id="g2"
                      type="text"
                      required
                      value={guarantor2}
                      onChange={(e) =>
                        setGuarantor2(e.target.value.toUpperCase())
                      }
                      placeholder="e.g. ASCON-002"
                      className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1b5e3a]/20 focus:border-[#1b5e3a] transition duration-200 bg-white text-sm"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-[#1b5e3a]/20 text-sm font-bold text-white bg-[#1b5e3a] hover:bg-[#124228] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1b5e3a] transition-all duration-200 disabled:opacity-70 transform hover:-translate-y-0.5"
                  >
                    {isSubmitting ? (
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
                        Submitting Application...
                      </span>
                    ) : (
                      "Submit Loan Request"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
