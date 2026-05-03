"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

function AdminActionProcessor() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<
    "processing" | "success" | "error" | "unauthorized"
  >("processing");
  const [message, setMessage] = useState("Verifying Admin credentials...");

  useEffect(() => {
    const processAdminAction = async () => {
      const loanId = searchParams.get("loanId");
      const action = searchParams.get("action"); // "APPROVED" or "REJECTED"
      const token = localStorage.getItem("coop_token");

      // 1. Security Check: Are they logged in?
      if (!token) {
        setStatus("unauthorized");
        setMessage(
          "Security Check: Please log in to your Admin account to process this loan.",
        );
        return;
      }

      // 2. Validate URL Parameters
      if (!loanId || !action) {
        setStatus("error");
        setMessage(
          "Invalid or corrupted link. Please check your email and try again.",
        );
        return;
      }

      try {
        // 3. 🚀 THE DIFFERENCE: Hitting the Admin Review Route
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/loans/${loanId}/review`,
          {
            status: action,
            adminComment: "Reviewed via Email Action Link",
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        setStatus("success");
        setMessage(`Loan successfully marked as ${action.toLowerCase()}.`);

        // 4. 🚀 THE DIFFERENCE: Redirecting back to the Admin Dashboard
        setTimeout(() => {
          router.push("/admin");
        }, 3000);
      } catch (error: any) {
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Failed to process request. You may have already reviewed this loan, or you lack Admin privileges.",
        );
      }
    };

    processAdminAction();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-slate-100 text-center">
        {status === "processing" && (
          <div className="animate-pulse">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 mb-4">
              <svg
                className="animate-spin h-6 w-6 text-amber-600"
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
              Executing Admin Override...
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
              Review Confirmed
            </h3>
            <p className="text-sm text-slate-500 mb-6">{message}</p>
            <p className="text-xs text-slate-400">
              Routing you to Command Center...
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
              Authorization Failed
            </h3>
            <p className="text-sm text-slate-500 mb-6">{message}</p>
            <Link
              href="/admin"
              className="w-full inline-flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-[#1b5e3a] bg-emerald-50 hover:bg-emerald-100 transition-colors"
            >
              Return to Command Center
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
              Admin Login Required
            </h3>
            <p className="text-sm text-slate-500 mb-6">{message}</p>
            <Link
              href="/login"
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

export default function AdminActionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-500">
          Loading secure admin portal...
        </div>
      }
    >
      <AdminActionProcessor />
    </Suspense>
  );
}
