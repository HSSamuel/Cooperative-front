"use client";

import { useState, useEffect } from "react";
import apiClient from "@/lib/axios";
import Link from "next/link";
import { formatNaira } from "@/utils/financeUtils";

export default function GuarantorHistoryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [guarantees, setGuarantees] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const storedUser = localStorage.getItem("coop_user");
        if (storedUser) setUser(JSON.parse(storedUser));

        const { data } = await apiClient.get("/loans/my-guarantees");
        setGuarantees(data);
      } catch (error) {
        console.error("Failed to fetch guarantee history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse flex flex-col gap-6">
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-sm"></div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-sm"></div>
      </div>
    );
  }

  // Helper to determine the current user's specific status on a loan
  const getMyGuarantorData = (loan: any) => {
    if (!user) return { status: "UNKNOWN", isGuarantor1: false };
    const isG1 = loan.guarantor1.cooperatorId === user.id;
    return {
      status: isG1 ? loan.guarantor1.status : loan.guarantor2.status,
      isGuarantor1: isG1,
    };
  };

  // Categorize the loans
  const actionRequired = guarantees.filter((loan) => {
    const myData = getMyGuarantorData(loan);
    return loan.status === "PENDING_GUARANTORS" && myData.status === "PENDING";
  });

  const activeLiabilities = guarantees.filter((loan) => {
    const myData = getMyGuarantorData(loan);
    return (
      (loan.status === "APPROVED" || loan.status === "PENDING_ADMIN") &&
      myData.status === "ACCEPTED"
    );
  });

  const historical = guarantees.filter((loan) => {
    const myData = getMyGuarantorData(loan);
    return (
      loan.status === "REPAID" ||
      loan.status === "REJECTED" ||
      myData.status === "DECLINED"
    );
  });

  // Calculate Total Risk Exposure
  const totalExposureKobo = activeLiabilities.reduce(
    (sum, loan) => sum + (loan.amountDue || loan.amountRequested),
    0,
  );

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
          Guarantor Dashboard
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage requests and monitor your active cooperative liabilities.
        </p>
      </div>

      {/* Exposure Summary Card */}
      <div className="bg-gradient-to-r from-[#1b5e3a] to-[#0f3420] dark:from-[#114026] dark:to-[#092214] rounded-sm p-6 mb-8 text-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-xs text-emerald-200/80 uppercase tracking-wider font-bold mb-1">
            Total Active Liability Exposure
          </p>
          <h3 className="text-3xl font-black tracking-tight">
            ₦{formatNaira(totalExposureKobo)}
          </h3>
          <p className="text-[11px] text-emerald-100/70 mt-1 max-w-md">
            This is the total outstanding balance of all active loans you are
            currently backing. This amount is encumbered against your personal
            savings.
          </p>
        </div>
        <div className="bg-white/10 px-6 py-4 rounded-sm border border-white/10 text-center w-full sm:w-auto">
          <p className="text-[10px] text-emerald-200 uppercase font-bold mb-1">
            Active Backings
          </p>
          <p className="text-2xl font-bold">{activeLiabilities.length}</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* SECTION 1: Action Required */}
        {actionRequired.length > 0 && (
          <section>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Action Required ({actionRequired.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {actionRequired.map((loan) => (
                <div
                  key={loan._id}
                  className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 p-5 rounded-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-amber-900 dark:text-amber-400">
                        {loan.cooperatorId.firstName}{" "}
                        {loan.cooperatorId.lastName}
                      </h4>
                      <span className="text-xs font-bold text-amber-700 bg-amber-100 dark:bg-amber-900/50 dark:text-amber-300 px-2 py-0.5 rounded-sm">
                        {loan.loanType}
                      </span>
                    </div>
                    <p className="text-xs text-amber-700/80 dark:text-amber-500/80 mb-3">
                      File No: {loan.cooperatorId.fileNumber}
                    </p>
                    <p className="text-2xl font-black text-amber-800 dark:text-amber-500 tracking-tight mb-4">
                      ₦{formatNaira(loan.amountRequested)}
                    </p>
                  </div>
                  <Link
                    href={`/action/guarantee?loanId=${loan._id}&action=ACCEPTED`}
                    className="w-full text-center bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2.5 rounded-sm transition-colors"
                  >
                    Review Request
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 2: Active Liabilities */}
        <section>
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Active Guarantees & Liabilities
          </h3>
          {activeLiabilities.length === 0 ? (
            <div className="bg-white dark:bg-[#1B1B25] p-8 text-center rounded-sm border border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                You currently have no active liabilities.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeLiabilities.map((loan) => {
                const targetRepayment = loan.amountDue || loan.amountRequested;
                const outstanding = targetRepayment - loan.amountRepaid;
                const progress = (loan.amountRepaid / targetRepayment) * 100;

                return (
                  <div
                    key={loan._id}
                    className="bg-white dark:bg-[#1B1B25] border border-slate-200 dark:border-slate-800 p-5 rounded-sm transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                          {loan.cooperatorId.firstName}{" "}
                          {loan.cooperatorId.lastName}
                        </h4>
                        <p className="text-[10px] text-slate-500">
                          {loan.cooperatorId.fileNumber}
                        </p>
                      </div>
                      {loan.status === "PENDING_ADMIN" ? (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-0.5 rounded-sm uppercase">
                          Awaiting Disbursal
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 px-2 py-0.5 rounded-sm uppercase">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="mb-4">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                        Original Loan
                      </p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        ₦{formatNaira(loan.amountRequested)}
                      </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-[#12121A]/50 p-3 rounded-sm border border-slate-100 dark:border-slate-800/50">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-500">
                          Risk Outstanding:
                        </span>
                        <span className="font-bold text-red-500 dark:text-red-400">
                          ₦{formatNaira(outstanding)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#1b5e3a] dark:bg-emerald-500 h-1.5 rounded-full"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1.5 text-right">
                        {progress.toFixed(0)}% Repaid by applicant
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* SECTION 3: Historical Data */}
        <section>
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            Historical Records
          </h3>
          {historical.length === 0 ? (
            <div className="bg-white dark:bg-[#1B1B25] p-8 text-center rounded-sm border border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No past guarantee records found.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#1B1B25] rounded-sm border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-[#12121A]/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <th className="px-4 py-3 font-bold">Applicant</th>
                      <th className="px-4 py-3 font-bold">Amount</th>
                      <th className="px-4 py-3 font-bold">Your Decision</th>
                      <th className="px-4 py-3 font-bold">Final Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {historical.map((loan) => {
                      const myData = getMyGuarantorData(loan);
                      return (
                        <tr
                          key={loan._id}
                          className="hover:bg-slate-50 dark:hover:bg-[#12121A]/30 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                              {loan.cooperatorId.firstName}{" "}
                              {loan.cooperatorId.lastName}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {loan.cooperatorId.fileNumber}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                            ₦{formatNaira(loan.amountRequested)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase ${
                                myData.status === "ACCEPTED"
                                  ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
                                  : myData.status === "DECLINED"
                                    ? "text-red-600 bg-red-50 dark:bg-red-900/20"
                                    : "text-slate-600 bg-slate-100 dark:bg-slate-800"
                              }`}
                            >
                              {myData.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase ${
                                loan.status === "REPAID"
                                  ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
                                  : loan.status === "REJECTED"
                                    ? "text-slate-500 bg-slate-100 dark:bg-slate-800"
                                    : "text-amber-600 bg-amber-50 dark:bg-amber-900/20"
                              }`}
                            >
                              {loan.status.replace("_", " ")}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
