"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function LoanCenterPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [creditLimit, setCreditLimit] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [probationEndDate, setProbationEndDate] = useState<Date | null>(null);

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

      const userDoc = accountRes.data.cooperatorId;
      if (userDoc) {
        const joinedDate = new Date(userDoc.dateJoined || userDoc.createdAt);
        const eligibilityDate = new Date(joinedDate);
        eligibilityDate.setMonth(eligibilityDate.getMonth() + 6);

        if (new Date() < eligibilityDate) {
          setProbationEndDate(eligibilityDate);
        } else {
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
      fetchData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to submit application.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatNaira = (koboAmount: number) => {
    return new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(koboAmount / 100);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-[#20C997] text-white";
      case "REJECTED":
        return "bg-red-500 text-white";
      case "REPAID":
        return "bg-slate-400 text-white";
      default:
        return "bg-[#F39C12] text-white";
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
        <div className="bg-slate-200 rounded-sm h-full"></div>
        <div className="bg-slate-200 rounded-sm h-full"></div>
      </div>
    );
  }

  const hasActiveLoan = loans.some((loan) =>
    ["PENDING_GUARANTORS", "PENDING_ADMIN", "APPROVED"].includes(loan.status),
  );

  return (
    <div className="animate-fade-in-up pb-10">
      {probationEndDate && (
        <div className="mb-6 bg-[#00B5E2]/10 border-l-4 border-[#00B5E2] p-4 flex items-start gap-4 rounded-r-sm">
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-1">
              New Member Probation Period
            </h4>
            <p className="text-sm text-slate-600">
              Standard policy requires a 6-month active saving period before you
              can access loan facilities. Your loan eligibility unlocks on{" "}
              <strong className="text-slate-800">
                {probationEndDate.toLocaleDateString("en-GB")}
              </strong>
              .
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: LIMIT & HISTORY */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[#2B2F42] rounded-sm p-8 text-white shadow-sm flex flex-col items-center text-center">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
              Available Credit Limit
            </p>
            <div className="flex items-start justify-center gap-1 mb-2">
              <span className="text-xl font-medium text-slate-400 mt-1">₦</span>
              <h3 className="text-4xl font-bold tracking-tight">
                {formatNaira(creditLimit)}
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-sm border border-slate-200 shadow-sm p-6 flex-1">
            <h3 className="text-lg font-bold text-slate-700 mb-4 border-b border-slate-100 pb-3">
              Loan History
            </h3>
            {loans.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 text-sm">No loan history found.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {loans.map((loan) => (
                  <div
                    key={loan._id}
                    className="p-4 border border-slate-100 bg-slate-50 rounded-sm"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <p className="font-bold text-slate-700 text-lg">
                        ₦{formatNaira(loan.amountRequested)}
                      </p>
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wide ${getStatusStyle(loan.status)}`}
                      >
                        {loan.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-200 text-xs text-slate-500 font-medium">
                      <span>
                        Due: ₦
                        {formatNaira(loan.amountDue || loan.amountRequested)}
                      </span>
                      <span>Repaid: ₦{formatNaira(loan.amountRepaid)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: APPLICATION FORM */}
        <div className="lg:col-span-7 bg-white rounded-sm border border-slate-200 shadow-sm p-8">
          <h3 className="text-xl font-bold text-slate-700 mb-2">
            New Loan Application
          </h3>
          <p className="text-sm text-slate-500 mb-8 pb-4 border-b border-slate-100">
            Submit a request. You will need two active members to guarantee your
            loan.
          </p>

          {hasActiveLoan ? (
            <div className="bg-orange-50 border-l-4 border-orange-400 p-6 text-slate-700 text-sm font-medium">
              Application Locked: You already have an active or pending loan.
              Complete your current cycle before requesting another.
            </div>
          ) : (
            <form onSubmit={handleApply} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Requested Amount (NGN)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-500 font-bold">₦</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="block w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-sm focus:outline-none focus:border-slate-500 text-sm"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  A flat 5% interest rate applies automatically.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    1st Guarantor (File No.)
                  </label>
                  <input
                    type="text"
                    required
                    value={guarantor1}
                    onChange={(e) =>
                      setGuarantor1(e.target.value.toUpperCase())
                    }
                    placeholder="E.g. ASCON-001"
                    className="block w-full px-4 py-2.5 border border-slate-300 rounded-sm focus:outline-none focus:border-slate-500 text-sm uppercase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    2nd Guarantor (File No.)
                  </label>
                  <input
                    type="text"
                    required
                    value={guarantor2}
                    onChange={(e) =>
                      setGuarantor2(e.target.value.toUpperCase())
                    }
                    placeholder="E.g. ASCON-002"
                    className="block w-full px-4 py-2.5 border border-slate-300 rounded-sm focus:outline-none focus:border-slate-500 text-sm uppercase"
                  />
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3 text-sm font-bold text-white bg-[#6A5AE0] hover:bg-[#5b4bc4] rounded-sm transition-colors disabled:opacity-70"
                >
                  {isSubmitting
                    ? "Submitting Application..."
                    : "Submit Loan Request"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
