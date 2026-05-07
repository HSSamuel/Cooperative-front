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
      toast.success(
        action === "ACCEPTED"
          ? "Guarantor request accepted."
          : "Request declined. Loan cancelled.",
      );
      setRequests(requests.filter((req) => req._id !== loanId));
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to process decision.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount / 100);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse flex flex-col gap-4">
        <div className="h-32 bg-slate-200 rounded-sm"></div>
        <div className="h-32 bg-slate-200 rounded-sm"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="bg-white rounded-sm border border-slate-200 shadow-sm p-6 sm:p-8">
        <h3 className="text-xl font-bold text-slate-700 mb-2">
          Guarantor Requests
        </h3>
        <p className="text-sm text-slate-500 mb-8 border-b border-slate-100 pb-4">
          Review loan applications from colleagues who have listed you as a
          guarantor.
        </p>

        {requests.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            You currently have no pending guarantor requests.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b-2 border-slate-200 text-slate-700 font-bold">
                  <th className="py-3 px-4">APPLICANT</th>
                  <th className="py-3 px-4">FILE NUMBER</th>
                  <th className="py-3 px-4 text-right">AMOUNT REQUESTED</th>
                  <th className="py-3 px-4 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((loan) => (
                  <tr
                    key={loan._id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="py-4 px-4 font-semibold text-slate-800">
                      {loan.cooperatorId.firstName} {loan.cooperatorId.lastName}
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      {loan.cooperatorId.fileNumber}
                    </td>
                    <td className="py-4 px-4 text-slate-800 text-right font-bold text-base">
                      ₦{formatNaira(loan.amountRequested)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleAction(loan._id, "ACCEPTED")}
                          disabled={processingId === loan._id}
                          className="px-4 py-1.5 bg-[#20C997] text-white text-xs font-semibold rounded-sm shadow-sm hover:opacity-90 disabled:opacity-50"
                        >
                          {processingId === loan._id
                            ? "Processing..."
                            : "Accept"}
                        </button>
                        <button
                          onClick={() => handleAction(loan._id, "DECLINED")}
                          disabled={processingId === loan._id}
                          className="px-4 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-sm shadow-sm hover:opacity-90 disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
