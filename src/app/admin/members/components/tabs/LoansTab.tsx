import { formatNaira, getStatusBadge } from "../utils";

interface LoansTabProps {
  memberLoans: any[];
  guaranteedLoans: any[];
}

export default function LoansTab({
  memberLoans,
  guaranteedLoans,
}: LoansTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#1B1B25] rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#12121A]/50">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
            Member Loan Portfolio
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Facilities requested by this user.
          </p>
        </div>
        <div className="p-4">
          {memberLoans.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
              No loan history on record.
            </p>
          ) : (
            <div className="space-y-4">
              {memberLoans.map((loan) => {
                const total = loan.amountDue || loan.amountRequested;
                const bal = total - loan.amountRepaid;
                return (
                  <div
                    key={loan._id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-slate-100 dark:border-slate-800 rounded-sm bg-slate-50/50 dark:bg-slate-800/30 gap-4 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                          {loan.loanType} LOAN
                        </h4>
                        {getStatusBadge(loan.status)}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Req: ₦{formatNaira(loan.amountRequested)} • Due: ₦
                        {formatNaira(total)}
                      </p>
                    </div>
                    <div className="text-left sm:text-right w-full sm:w-auto">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        Outstanding
                      </p>
                      <p
                        className={`font-bold text-sm ${bal > 0 ? "text-red-500" : "text-emerald-500"}`}
                      >
                        ₦{formatNaira(bal)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-[#1B1B25] rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-4 border-b border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 transition-colors">
          <h3 className="font-bold text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            Guarantor Risk Exposure
          </h3>
          <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-0.5">
            Loans where this member serves as a guarantor.
          </p>
        </div>
        <div className="p-4">
          {guaranteedLoans.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
              No risk exposure. Not guaranteeing any loans.
            </p>
          ) : (
            <div className="space-y-4">
              {guaranteedLoans.map((loan) => (
                <div
                  key={loan._id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-slate-100 dark:border-slate-800 rounded-sm bg-slate-50/50 dark:bg-slate-800/30 gap-4 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                        Borrower: {loan.cooperatorId?.lastName}{" "}
                        {loan.cooperatorId?.firstName}
                      </h4>
                      {getStatusBadge(loan.status)}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      File: {loan.cooperatorId?.fileNumber} • Applied:{" "}
                      {new Date(loan.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      Principal Amount
                    </p>
                    <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                      ₦{formatNaira(loan.amountRequested)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
