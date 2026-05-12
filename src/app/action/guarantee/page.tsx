"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import apiClient from "@/lib/axios";
import Link from "next/link";

function ActionProcessor() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Added "ready" state
  const [status, setStatus] = useState<
    "verifying" | "ready" | "processing" | "success" | "error" | "unauthorized"
  >("verifying");
  const [message, setMessage] = useState("Verifying your secure link...");

  // Store the params in state so the user can manually trigger the API call later
  const [loanId, setLoanId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<string | null>(null);

  useEffect(() => {
    // 1. Verify the link safely without firing the PUT request
    const id = searchParams.get("loanId");
    const action = searchParams.get("action");
    const userStr = localStorage.getItem("coop_user");

    if (!userStr) {
      setStatus("unauthorized");
      setMessage(
        "Security Check: Please log in to verify your identity before processing this request.",
      );
      return;
    }

    if (!id || !action) {
      setStatus("error");
      setMessage(
        "Invalid or corrupted link. Please check your email and try again.",
      );
      return;
    }

    // 2. Set the ready state and await user confirmation
    setLoanId(id);
    setActionType(action);
    setStatus("ready");
    setMessage(
      `Are you sure you want to ${action.toLowerCase()} this guarantor request?`,
    );
  }, [searchParams]);

  const handleConfirmAction = async () => {
    setStatus("processing");
    setMessage("Processing your decision...");

    try {
      await apiClient.put(`/loans/${loanId}/guarantee`, { action: actionType });

      setStatus("success");
      setMessage(
        `Successfully ${actionType?.toLowerCase()} the guarantor request.`,
      );

      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (error: any) {
      setStatus("error");
      setMessage(
        error.response?.data?.message ||
          "Failed to process request. You may have already responded.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-slate-100 text-center">
        {/* NEW: The Manual Confirmation UI */}
        {status === "ready" && (
          <div className="animate-fade-in-up">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Action Confirmation
            </h3>
            <p className="text-sm text-slate-500 mb-8">{message}</p>
            <div className="flex flex-col gap-3 sm:flex-row justify-center">
              <button
                onClick={handleConfirmAction}
                className="w-full sm:w-auto inline-flex justify-center py-2.5 px-6 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#1b5e3a] hover:bg-[#124228] transition-colors"
              >
                Confirm {actionType === "ACCEPTED" ? "Acceptance" : "Rejection"}
              </button>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex justify-center py-2.5 px-6 border border-slate-300 rounded-xl shadow-sm text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </div>
        )}

        {(status === "verifying" || status === "processing") && (
          <div className="animate-pulse">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 mb-4">
              <svg
                className="animate-spin h-6 w-6 text-emerald-600"
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
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {status === "verifying"
                ? "Verifying Link..."
                : "Processing Request..."}
            </h3>
          </div>
        )}

        {status === "success" && (
          <div className="animate-fade-in-up">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 mb-4">
              <svg
                className="h-6 w-6 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Action Confirmed
            </h3>
            <p className="text-sm text-slate-500 mb-6">{message}</p>
            <p className="text-xs text-slate-400">
              Redirecting you to your dashboard...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="animate-fade-in-up">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Processing Failed
            </h3>
            <p className="text-sm text-slate-500 mb-6">{message}</p>
            <Link
              href="/dashboard"
              className="w-full inline-flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-[#1b5e3a] bg-emerald-50 hover:bg-emerald-100 transition-colors"
            >
              Return to Dashboard
            </Link>
          </div>
        )}

        {status === "unauthorized" && (
          <div className="animate-fade-in-up">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 mb-4">
              <svg
                className="h-6 w-6 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Authentication Required
            </h3>
            <p className="text-sm text-slate-500 mb-6">{message}</p>
            <Link
              href={`/login?redirect=${encodeURIComponent(`/action/guarantee?loanId=${searchParams.get("loanId")}&action=${searchParams.get("action")}`)}`}
              className="w-full inline-flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors"
            >
              Log in to continue
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GuaranteeActionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-500">
          Loading secure portal...
        </div>
      }
    >
      <ActionProcessor />
    </Suspense>
  );
}
