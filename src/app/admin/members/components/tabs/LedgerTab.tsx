import { formatNaira } from "../utils";

interface LedgerTabProps {
  memberTransactions: any[];
  isLedgerLoading: boolean;
}

export default function LedgerTab({
  memberTransactions,
  isLedgerLoading,
}: LedgerTabProps) {
  return (
    <div className="bg-white dark:bg-[#1B1B25] rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-full flex flex-col transition-colors">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#12121A]/50">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
          Financial Forensics
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Localized ledger activity for this member.
        </p>
      </div>
      <div className="flex-1 overflow-x-auto">
        {isLedgerLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1b5e3a] dark:border-emerald-500"></div>
          </div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
            <thead className="bg-slate-50 dark:bg-[#12121A]/50">
              <tr>
                <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300 text-center w-16 border border-slate-200 dark:border-slate-800">
                  Status
                </th>
                <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                  Description
                </th>
                <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300 text-right border border-slate-200 dark:border-slate-800">
                  Debit
                </th>
                <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300 text-right border border-slate-200 dark:border-slate-800">
                  Credit
                </th>
                <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300 text-right border border-slate-200 dark:border-slate-800">
                  Dividends
                </th>
                <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300 text-right border border-slate-200 dark:border-slate-800">
                  Total Balance
                </th>
                <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {memberTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
                  >
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                memberTransactions.map((txn) => {
                  const isDividend =
                    txn.type === "CREDIT" &&
                    txn.description?.toLowerCase().includes("dividend");
                  const isCredit = txn.type === "CREDIT" && !isDividend;
                  const isDebit = txn.type === "DEBIT";

                  return (
                    <tr
                      key={txn._id}
                      className="hover:bg-slate-50 dark:hover:bg-[#12121A]/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-center border border-slate-200 dark:border-slate-800">
                        <div
                          className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center flex-shrink-0 ${txn.type === "CREDIT" ? "bg-emerald-100 dark:bg-emerald-900/30 text-[#1b5e3a] dark:text-emerald-400" : "bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400"}`}
                        >
                          {txn.type === "CREDIT" ? (
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
                                d="M7 11l5-5m0 0l5 5m-5-5v12"
                              />
                            </svg>
                          ) : (
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
                                d="M17 13l-5 5m0 0l-5-5m5 5V6"
                              />
                            </svg>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                        {txn.description}
                      </td>
                      <td className="py-3 px-4 text-red-500 dark:text-red-400 text-right font-medium border border-slate-200 dark:border-slate-800">
                        {isDebit ? formatNaira(txn.amount) : ""}
                      </td>
                      <td className="py-3 px-4 text-[#1b5e3a] dark:text-emerald-400 text-right font-bold border border-slate-200 dark:border-slate-800">
                        {isCredit ? formatNaira(txn.amount) : ""}
                      </td>
                      <td className="py-3 px-4 text-purple-600 dark:text-purple-400 text-right font-bold border border-slate-200 dark:border-slate-800">
                        {isDividend ? formatNaira(txn.amount) : ""}
                      </td>
                      <td className="py-3 px-4 text-slate-800 dark:text-slate-200 text-right font-black border border-slate-200 dark:border-slate-800">
                        ₦{formatNaira(txn.balanceAfter || 0)}
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-500 text-[11px] leading-tight border border-slate-200 dark:border-slate-800">
                        {new Date(txn.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        <br />
                        {new Date(txn.createdAt).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
