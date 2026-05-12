import { useState, useEffect } from "react";
import apiClient from "@/lib/axios";
import toast from "react-hot-toast";
import { formatNaira } from "../utils";

interface FinancialsTabProps {
  selectedMember: any;
  memberAccount: any;
  isAccountLoading: boolean;
  onAccountUpdated: (account: any) => void;
  refreshLedger: () => void;
  refreshInitialData: () => void;
}

export default function FinancialsTab({
  selectedMember,
  memberAccount,
  isAccountLoading,
  onAccountUpdated,
  refreshLedger,
  refreshInitialData,
}: FinancialsTabProps) {
  const [adjustAmount, setAdjustAmount] = useState("");
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [customLimitAmount, setCustomLimitAmount] = useState("");
  const [isUpdatingLimit, setIsUpdatingLimit] = useState(false);

  const [settingsForm, setSettingsForm] = useState({
    status: "ACTIVE",
    customMonthlySavings: "",
    dateJoined: "",
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    if (memberAccount) {
      const userDoc = memberAccount.cooperatorId || selectedMember;
      const defaultDate =
        userDoc?.dateJoined || userDoc?.createdAt || new Date();
      setSettingsForm({
        status: memberAccount?.status || "ACTIVE",
        customMonthlySavings: memberAccount?.customMonthlySavings
          ? (memberAccount.customMonthlySavings / 100).toString()
          : "0",
        dateJoined: new Date(defaultDate).toISOString().split("T")[0],
      });
    }
  }, [memberAccount, selectedMember]);

  const executeAdminAdjustment = async (
    type: "CREDIT" | "DEBIT" | "DIVIDEND",
    amountInNaira: number,
  ) => {
    setIsAdjusting(true);
    try {
      const res = await apiClient.post("/account/admin-adjust", {
        cooperatorId: selectedMember._id,
        amountInKobo: Math.round(amountInNaira * 100),
        type,
      });
      toast.success(res.data.message);
      onAccountUpdated(res.data.account);
      setAdjustAmount("");
      refreshLedger();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Adjustment failed.");
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleAdminAdjustmentTrigger = (
    type: "CREDIT" | "DEBIT" | "DIVIDEND",
  ) => {
    const amountInNaira = parseFloat(adjustAmount);
    if (isNaN(amountInNaira) || amountInNaira <= 0)
      return toast.error("Enter a valid amount.");

    let themeColor = "";
    let icon = null;
    let title = "";
    let actionText = "";
    let btnClass = "";

    if (type === "CREDIT") {
      themeColor =
        "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30";
      title = "Confirm Credit";
      actionText = "credit";
      btnClass = "bg-[#20C997] hover:bg-[#1ab586]";
      icon = (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M12 4v16m8-8H4"
          />
        </svg>
      );
    } else if (type === "DEBIT") {
      themeColor =
        "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30";
      title = "Confirm Debit";
      actionText = "debit";
      btnClass = "bg-red-500 hover:bg-red-600";
      icon = (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M20 12H4"
          />
        </svg>
      );
    } else if (type === "DIVIDEND") {
      themeColor =
        "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30";
      title = "Confirm Dividend";
      actionText = "distribute a dividend of";
      btnClass = "bg-purple-600 hover:bg-purple-700";
      icon = (
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
            d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
          />
        </svg>
      );
    }

    toast.custom(
      (t) => (
        <div
          className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-sm w-full bg-white dark:bg-[#1B1B25] shadow-2xl rounded-2xl pointer-events-auto flex flex-col ring-1 ring-black/5 dark:ring-white/10 border border-slate-100 dark:border-slate-800 p-5`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${themeColor}`}
            >
              {icon}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {title}
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Are you sure you want to {actionText}{" "}
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  ₦{amountInNaira.toLocaleString()}
                </span>{" "}
                for{" "}
                <span className="font-semibold">
                  {selectedMember?.firstName} {selectedMember?.lastName}
                </span>
                ?
              </p>
            </div>
          </div>
          <div className="mt-5 flex gap-3 justify-end">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                executeAdminAdjustment(type, amountInNaira);
              }}
              className={`px-4 py-2 text-xs font-bold text-white rounded-lg transition-colors shadow-sm ${btnClass}`}
            >
              Yes, Confirm
            </button>
          </div>
        </div>
      ),
      { duration: Infinity, id: `confirm-adjust-${selectedMember?._id}` },
    );
  };

  const handleUpdateCreditLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountInNaira = parseFloat(customLimitAmount);
    if (isNaN(amountInNaira) || amountInNaira < 0)
      return toast.error("Enter a valid limit amount.");

    setIsUpdatingLimit(true);
    try {
      const res = await apiClient.put(
        `/account/user/${selectedMember._id}/credit-limit`,
        {
          newCreditLimitInKobo: Math.round(amountInNaira * 100),
        },
      );
      toast.success("Credit limit successfully updated!");
      onAccountUpdated(res.data.account);
      setCustomLimitAmount("");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update credit limit.",
      );
    } finally {
      setIsUpdatingLimit(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const savingsInKobo = parseInt(settingsForm.customMonthlySavings) * 100;
      const res = await apiClient.put(
        `/account/user/${selectedMember._id}/settings`,
        {
          status: settingsForm.status,
          customMonthlySavings: isNaN(savingsInKobo) ? 0 : savingsInKobo,
          dateJoined: settingsForm.dateJoined,
        },
      );
      toast.success("Account settings updated!");
      onAccountUpdated(res.data.account);
      refreshInitialData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save settings.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  if (isAccountLoading || !memberAccount) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1b5e3a] dark:border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      <div className="space-y-6">
        <div className="bg-[#2B2F42] rounded-sm p-6 text-white shadow-sm transition-colors">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            Verified Savings
          </p>
          <h3 className="text-3xl font-bold mb-4">
            ₦{formatNaira(memberAccount.totalSavings)}
          </h3>
          <div className="space-y-2">
            <div className="bg-white/10 p-3 rounded-sm flex justify-between items-center text-sm">
              <span className="text-slate-300">Credit Limit</span>
              <span className="font-bold text-[#00B5E2]">
                ₦{formatNaira(memberAccount.availableCreditLimit)}
              </span>
            </div>
            <div className="bg-white/10 p-3 rounded-sm flex justify-between items-center text-sm">
              <span className="text-slate-300">Total Dividends</span>
              <span className="font-bold text-purple-400">
                ₦{formatNaira(memberAccount.totalDividends || 0)}
              </span>
            </div>
            <div className="bg-white/10 p-3 rounded-sm flex justify-between items-center text-sm">
              <span className="text-slate-300">Current Monthly Savings</span>
              <span className="font-bold text-[#20C997]">
                ₦{formatNaira(memberAccount.currentMonthSavings || 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1B1B25] rounded-sm p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
            Override Credit Limit
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Bypass the automated 2x savings rule.
          </p>
          <form onSubmit={handleUpdateCreditLimit} className="flex gap-2">
            <input
              type="number"
              step="0.01"
              placeholder="E.g. 200000"
              value={customLimitAmount}
              onChange={(e) => setCustomLimitAmount(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 rounded-sm text-sm focus:outline-none focus:border-slate-500 dark:focus:border-slate-400 transition-colors"
            />
            <button
              type="submit"
              disabled={isUpdatingLimit || !customLimitAmount}
              className="bg-[#6A5AE0] hover:bg-[#5b4bc4] text-white text-sm font-bold px-4 rounded-sm transition-colors whitespace-nowrap disabled:opacity-70 shadow-sm"
            >
              Apply
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-[#1B1B25] rounded-sm p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">
            Manual Ledger Adjustment
          </h3>
          <input
            type="number"
            step="0.01"
            placeholder="Amount (₦)"
            value={adjustAmount}
            onChange={(e) => setAdjustAmount(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 rounded-sm text-sm mb-3 focus:outline-none focus:border-slate-500 dark:focus:border-slate-400 transition-colors"
          />
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleAdminAdjustmentTrigger("CREDIT")}
              disabled={isAdjusting || !adjustAmount}
              className="bg-[#20C997] text-white text-xs sm:text-sm font-bold py-2 rounded-sm hover:opacity-90 disabled:opacity-50 shadow-sm"
            >
              + Credit
            </button>
            <button
              onClick={() => handleAdminAdjustmentTrigger("DEBIT")}
              disabled={isAdjusting || !adjustAmount}
              className="bg-red-500 text-white text-xs sm:text-sm font-bold py-2 rounded-sm hover:opacity-90 disabled:opacity-50 shadow-sm"
            >
              - Debit
            </button>
            <button
              onClick={() => handleAdminAdjustmentTrigger("DIVIDEND")}
              disabled={isAdjusting || !adjustAmount}
              className="bg-purple-600 text-white text-xs sm:text-sm font-bold py-2 rounded-sm hover:opacity-90 disabled:opacity-50 shadow-sm"
            >
              🎁 Dividend
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-[#1B1B25] rounded-sm p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors h-full">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">
            Reconciliation Settings
          </h3>
          <form onSubmit={handleSaveSettings} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Join Date (Probation Override)
              </label>
              <input
                type="date"
                value={settingsForm.dateJoined}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    dateJoined: e.target.value,
                  })
                }
                className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 rounded-sm text-sm transition-colors focus:outline-none focus:border-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Account Status
              </label>
              <select
                value={settingsForm.status}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, status: e.target.value })
                }
                className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 rounded-sm text-sm transition-colors focus:outline-none focus:border-slate-500"
              >
                <option
                  value="ACTIVE"
                  className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  Active (Process Payroll)
                </option>
                <option
                  value="PAUSED"
                  className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  Paused (Skip Payroll)
                </option>
                <option
                  value="INACTIVE"
                  className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  Inactive (Suspended)
                </option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Custom Monthly Savings (₦)
              </label>
              <input
                type="number"
                value={settingsForm.customMonthlySavings}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    customMonthlySavings: e.target.value,
                  })
                }
                placeholder="0 = Use System Default"
                className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 rounded-sm text-sm transition-colors focus:outline-none focus:border-slate-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Leave as 0 to use the global cooperative rate.
              </p>
            </div>
            <button
              type="submit"
              disabled={isSavingSettings}
              className="w-full bg-[#1b5e3a] hover:bg-[#124228] text-white text-sm font-bold py-3 mt-4 rounded-sm transition-colors disabled:opacity-70 shadow-sm"
            >
              Save Configuration
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
