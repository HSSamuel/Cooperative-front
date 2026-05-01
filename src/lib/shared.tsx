import React from "react";

// --- SHARED TYPESCRIPT INTERFACES ---
export interface AccountData {
  totalSavings: number;
  availableCreditLimit: number;
}

export interface Guarantor {
  cooperatorId: {
    firstName: string;
    lastName: string;
    fileNumber: string;
  } | null;
  status: string;
}

export interface LoanData {
  _id: string;
  amountRequested: number;
  interestRate?: number;
  amountDue?: number;
  amountRepaid: number;
  status: string;
  createdAt: string;
  adminComment?: string;
  cooperatorId?: { firstName: string; lastName: string; fileNumber: string };
  guarantor1?: Guarantor;
  guarantor2?: Guarantor;
}

// --- SHARED UI COMPONENTS ---
export const getStatusBadge = (status: string) => {
  switch (status) {
    case "PENDING_GUARANTORS":
      return (
        <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold tracking-wide border border-orange-200">
          WAITING ON GUARANTORS
        </span>
      );
    case "PENDING_ADMIN":
      return (
        <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold tracking-wide border border-yellow-200">
          PENDING ADMIN REVIEW
        </span>
      );
    case "APPROVED":
      return (
        <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold tracking-wide border border-green-200">
          APPROVED
        </span>
      );
    case "REJECTED":
      return (
        <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold tracking-wide border border-red-200">
          REJECTED
        </span>
      );
    case "REPAID":
      return (
        <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold tracking-wide border border-slate-200">
          REPAID
        </span>
      );
    default:
      return (
        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold tracking-wide border border-gray-200">
          {status}
        </span>
      );
  }
};
