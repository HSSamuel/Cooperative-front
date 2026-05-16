"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import apiClient from "@/lib/axios";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";

function GuaranteeActionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loanId = searchParams.get("loanId");
  const actionParam = searchParams.get("action"); // "ACCEPTED" or "DECLINED"

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loanDetails, setLoanDetails] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        // 1. Validate Authentication
        const storedUser = localStorage.getItem("coop_user");
        if (!storedUser) {
          // If not logged in, redirect to login with a return URL
          const currentUrl = encodeURIComponent(
            window.location.pathname + window.location.search,
          );
          router.push(`/login?redirect=${currentUrl}`);
          return;
        }
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // 2. Validate URL Parameters
        if (!loanId || !actionParam) {
          setError("Invalid confirmation link. Missing required parameters.");
          setIsLoading(false);
          return;
        }

        if (actionParam !== "ACCEPTED" && actionParam !== "DECLINED") {
          setError("Invalid action parameter. Must be ACCEPTED or DECLINED.");
          setIsLoading(false);
          return;
        }

        // 3. Fetch Pending Guarantor Requests for this user
        const { data } = await apiClient.get("/loans/guarantor-requests");

        // Find the specific loan from the pending requests
        const targetLoan = data.find((l: any) => l._id === loanId);

        if (!targetLoan) {
          setError(
            "This request is no longer available. It may have already been processed, cancelled, or you are not an authorized guarantor for this specific facility.",
          );
        } else {
          setLoanDetails(targetLoan);
        }
      } catch (err: any) {
        console.error("Fetch Error:", err);
        setError(
          "Failed to securely fetch the loan details. Please try again.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadDetails();
  }, [loanId, actionParam, router]);

  const handleConfirmAction = async () => {
    setIsProcessing(true);
    try {
      await apiClient.put(`/loans/${loanId}/guarantee`, {
        action: actionParam,
      });

      toast.success(`Successfully ${actionParam?.toLowerCase()} the request.`);
      setIsSuccess(true);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to process guarantee action.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const formatNaira = (koboAmount: number) => {
    return new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(koboAmount / 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9fe] dark:bg-[#12121A] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-[#1b5e3a] rounded-full animate-spin mb-4"></div>
        <p className="text-[#1b5e3a] dark:text-emerald-400 font-bold animate-pulse">
          Retrieving secure request details...
        </p>
      </div>
    );
  }

  // UI STATE 1: ERROR / NOT FOUND
  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f9fe] dark:bg-[#12121A] flex flex-col items-center justify-center p-4 transition-colors">
        <div className="bg-white dark:bg-[#1B1B25] p-8 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
            Request Unavailable
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            {error}
          </p>
          <Link
            href="/dashboard"
            className="block w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-sm transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // UI STATE 2: SUCCESS
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#f8f9fe] dark:bg-[#12121A] flex flex-col items-center justify-center p-4 transition-colors">
        <div className="bg-white dark:bg-[#1B1B25] p-8 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 text-[#1b5e3a] dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
            Action Completed
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            You have successfully <strong>{actionParam?.toLowerCase()}</strong>{" "}
            the guarantee request for {loanDetails?.cooperatorId?.firstName}'s
            loan.
          </p>
          <Link
            href="/dashboard/guarantors"
            className="block w-full bg-[#1b5e3a] hover:bg-[#124228] text-white font-bold py-3 rounded-sm transition-colors shadow-sm"
          >
            View My Active Guarantees
          </Link>
        </div>
      </div>
    );
  }

  // UI STATE 3: CONFIRMATION
  const isAccepting = actionParam === "ACCEPTED";

  return (
    <div className="min-h-screen bg-[#f8f9fe] dark:bg-[#12121A] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-xl w-full space-y-8">
        {/* Header Logo */}
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <Image
            src="/ascon-logo.png"
            alt="ASCON Logo"
            width={50}
            height={50}
            className="object-contain"
          />
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-200">
              Guarantor Action Confirmation
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Please review the facility details carefully before proceeding.
            </p>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-white dark:bg-[#1B1B25] rounded-sm shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
          {/* Action Header Banner */}
          <div
            className={`px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 ${isAccepting ? "bg-emerald-50 dark:bg-emerald-900/10" : "bg-red-50 dark:bg-red-900/10"}`}
          >
            <div
              className={`p-2 rounded-full ${isAccepting ? "bg-[#1b5e3a] text-white" : "bg-red-500 text-white"}`}
            >
              {isAccepting ? (
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
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
              )}
            </div>
            <div>
              <h3
                className={`font-bold ${isAccepting ? "text-[#1b5e3a] dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}
              >
                Intended Action:{" "}
                {isAccepting ? "ACCEPT RISK" : "DECLINE REQUEST"}
              </h3>
              <p
                className={`text-xs ${isAccepting ? "text-emerald-700 dark:text-emerald-500" : "text-red-600 dark:text-red-500"}`}
              >
                {isAccepting
                  ? "You are agreeing to back this loan with your savings."
                  : "You are refusing to guarantee this facility."}
              </p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Applicant Details */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                1. Applicant Details
              </p>
              <div className="bg-slate-50 dark:bg-[#12121A]/50 p-4 rounded-sm border border-slate-100 dark:border-slate-800">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                      Full Name
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {loanDetails.cooperatorId.firstName}{" "}
                      {loanDetails.cooperatorId.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                      File Number
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {loanDetails.cooperatorId.fileNumber}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Facility Details */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                2. Facility Details
              </p>
              <div className="bg-slate-50 dark:bg-[#12121A]/50 p-4 rounded-sm border border-slate-100 dark:border-slate-800">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                      Requested Principal
                    </span>
                    <span className="font-bold text-xl text-[#1b5e3a] dark:text-emerald-400">
                      ₦{formatNaira(loanDetails.amountRequested)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                      Facility Type
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                      {loanDetails.loanType.toLowerCase()} Loan
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Guarantor Profile */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                3. Your Guarantor Profile
              </p>
              <div className="bg-slate-50 dark:bg-[#12121A]/50 p-4 rounded-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-lg font-bold text-slate-600 dark:text-slate-300">
                  {user?.lastName?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {user?.fileNumber} &bull; {user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            {isAccepting && (
              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-4 rounded-sm text-xs text-amber-800 dark:text-amber-400 text-justify">
                <strong>Legal Binding Notice:</strong> By clicking confirm
                below, you irrevocably agree to act as a guarantor for the
                principal amount shown above. Should the applicant default on
                their repayment schedule, the outstanding balance will be
                automatically deducted from your cooperative savings.
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard"
                className="w-full sm:w-1/3 px-4 py-3 bg-white dark:bg-[#1B1B25] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-center shadow-sm"
              >
                Cancel
              </Link>
              <button
                onClick={handleConfirmAction}
                disabled={isProcessing}
                className={`w-full sm:w-2/3 px-4 py-3 text-white text-sm font-bold rounded-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 ${
                  isAccepting
                    ? "bg-[#1b5e3a] hover:bg-[#124228]"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {isProcessing ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
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
                    Processing Action...
                  </>
                ) : (
                  <>
                    {isAccepting
                      ? "I Accept Liability & Guarantee Loan"
                      : "Decline This Request"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrap in suspense boundary for Next.js App Router useSearchParams requirements
export default function GuaranteeActionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8f9fe] dark:bg-[#12121A] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-[#1b5e3a] rounded-full animate-spin"></div>
        </div>
      }
    >
      <GuaranteeActionContent />
    </Suspense>
  );
}
