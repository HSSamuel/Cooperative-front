"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function GuarantorRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("coop_token");
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/loans/guarantor-requests`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setRequests(res.data);
    } catch (error) {
      console.error("Error fetching requests", error);
      toast.error("Failed to load guarantor requests.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (
    loanId: string,
    action: "ACCEPTED" | "DECLINED",
  ) => {
    setProcessingId(loanId);
    try {
      const token = localStorage.getItem("coop_token");
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/loans/${loanId}/guarantee`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (action === "ACCEPTED") {
        toast.success("You have accepted the guarantor request.");
      } else {
        toast.success(
          "You have declined the request. The loan has been cancelled.",
        );
      }

      // Remove the processed request from the UI immediately
      setRequests(requests.filter((req) => req._id !== loanId));
    } catch (error: any) {
      console.error("Action Error:", error);
      toast.error(
        error.response?.data?.message || "Failed to process your decision.",
      );
    } finally {
      setProcessingId(null);
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
      <div className="animate-pulse flex flex-col gap-6">
        <div className="h-32 bg-slate-200 rounded-3xl w-full"></div>
        <div className="h-48 bg-slate-200 rounded-3xl w-full"></div>
        <div className="h-48 bg-slate-200 rounded-3xl w-full"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up pb-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          Guarantor Requests
        </h2>
        <p className="text-sm sm:text-base text-slate-500 mt-1">
          Review loan applications from colleagues who have listed you as a
          guarantor.
        </p>
      </div>

      {requests.length === 0 ? (
        // ==========================================
        // EMPTY STATE
        // ==========================================
        <div className="bg-white rounded-3xl p-12 shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border-4 border-emerald-100">
            <svg
              className="w-10 h-10 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            You're all caught up!
          </h3>
          <p className="text-slate-500 max-w-md">
            You currently have no pending guarantor requests. When a colleague
            needs your backing for a loan, it will appear securely here.
          </p>
        </div>
      ) : (
        // ==========================================
        // REQUEST CARDS
        // ==========================================
        <div className="space-y-6">
          {requests.map((loan) => (
            <div
              key={loan._id}
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden group hover:shadow-2xl transition-shadow duration-300"
            >
              {/* Subtle background warning gradient to imply risk */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Applicant Info */}
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-full bg-slate-100 text-[#1b5e3a] flex items-center justify-center font-bold text-xl shadow-inner border border-slate-200 flex-shrink-0 mt-1">
                    {loan.cooperatorId.lastName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md inline-block mb-2 border border-amber-200">
                      Action Required
                    </p>
                    <h3 className="text-xl font-bold text-slate-800">
                      {loan.cooperatorId.firstName} {loan.cooperatorId.lastName}
                    </h3>
                    <p className="text-sm font-medium text-slate-500 mt-0.5">
                      File Number:{" "}
                      <span className="text-slate-700">
                        {loan.cooperatorId.fileNumber}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Financial Details */}
                <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 md:min-w-[200px] text-center md:text-right">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Amount Requested
                  </p>
                  <p className="text-2xl font-extrabold text-slate-800">
                    {formatNaira(loan.amountRequested)}
                  </p>
                </div>
              </div>

              <hr className="my-6 border-slate-100" />

              {/* Action Buttons */}
              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 justify-end">
                <button
                  onClick={() => handleAction(loan._id, "DECLINED")}
                  disabled={processingId === loan._id}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
                >
                  Decline Request
                </button>
                <button
                  onClick={() => handleAction(loan._id, "ACCEPTED")}
                  disabled={processingId === loan._id}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-white bg-[#1b5e3a] hover:bg-[#124228] shadow-lg shadow-[#1b5e3a]/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                >
                  {processingId === loan._id ? (
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
                  ) : (
                    "Accept & Guarantee Loan"
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
