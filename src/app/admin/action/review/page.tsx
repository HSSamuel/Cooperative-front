"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import apiClient from "@/lib/axios";
import Link from "next/link";
import { GlobalSpinner } from "@/components/GlobalSpinner";

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
      const action = searchParams.get("action");

      const userStr = localStorage.getItem("coop_user");

      if (!userStr) {
        setStatus("unauthorized");
        setMessage(
          "Security Check: Please log in to your Admin account to process this loan.",
        );
        return;
      }

      if (!loanId || !action) {
        setStatus("error");
        setMessage(
          "Invalid or corrupted link. Please check your email and try again.",
        );
        return;
      }

      try {
        await apiClient.put(`/loans/${loanId}/review`, {
          status: action,
          adminComment: "Reviewed via Email Action Link",
        });

        setStatus("success");
        setMessage(`Loan successfully marked as ${action.toLowerCase()}.`);

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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <GlobalSpinner
        isLoading={status === "processing"}
        text="Executing Admin Override..."
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-slate-100 text-center">
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
