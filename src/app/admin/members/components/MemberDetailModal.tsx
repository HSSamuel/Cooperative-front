import { useState, useEffect } from "react";
import apiClient from "@/lib/axios";
import toast from "react-hot-toast";

// Import sub-components
import IdentityTab from "./tabs/IdentityTab";
import FinancialsTab from "./tabs/FinancialsTab";
import LoansTab from "./tabs/LoansTab";
import LedgerTab from "./tabs/LedgerTab";
import CommsTab from "./tabs/CommsTab";

type TabType = "IDENTITY" | "FINANCIALS" | "LOANS" | "LEDGER" | "COMMS";

interface MemberDetailModalProps {
  selectedMember: any;
  allLoans: any[];
  closeModal: () => void;
  refreshInitialData: () => void;
}

export default function MemberDetailModal({
  selectedMember,
  allLoans,
  closeModal,
  refreshInitialData,
}: MemberDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("IDENTITY");

  const [memberAccount, setMemberAccount] = useState<any>(null);
  const [memberTransactions, setMemberTransactions] = useState<any[]>([]);
  const [isAccountLoading, setIsAccountLoading] = useState(false);
  const [isLedgerLoading, setIsLedgerLoading] = useState(false);

  useEffect(() => {
    fetchMemberAccount(selectedMember._id);
    fetchMemberLedger(selectedMember._id);
  }, [selectedMember._id]);

  const fetchMemberAccount = async (cooperatorId: string) => {
    setIsAccountLoading(true);
    try {
      const res = await apiClient.get(`/account/user/${cooperatorId}`);
      setMemberAccount(res.data);
    } catch (error) {
      toast.error("Failed to load user financials.");
    } finally {
      setIsAccountLoading(false);
    }
  };

  const fetchMemberLedger = async (cooperatorId: string) => {
    setIsLedgerLoading(true);
    try {
      const res = await apiClient.get(
        `/account/user/${cooperatorId}/transactions`,
      );
      setMemberTransactions(res.data);
    } catch (error) {
      console.error("Ledger fetch failed:", error);
    } finally {
      setIsLedgerLoading(false);
    }
  };

  const memberLoans = allLoans.filter(
    (l) => l.cooperatorId?._id === selectedMember?._id,
  );
  const guaranteedLoans = allLoans.filter(
    (l) =>
      l.guarantor1?.cooperatorId?._id === selectedMember?._id ||
      l.guarantor2?.cooperatorId?._id === selectedMember?._id,
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-900/80 transition-opacity backdrop-blur-sm"
      onClick={closeModal}
    >
      <div
        className="bg-white dark:bg-[#1B1B25] rounded-sm shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col animate-fade-in-up border border-slate-200 dark:border-slate-800 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#12121A]/50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-sm bg-[#2B2F42] text-white flex items-center justify-center font-bold text-xl overflow-hidden shadow-sm">
              {selectedMember.avatarUrl ? (
                <img
                  src={selectedMember.avatarUrl}
                  className="w-full h-full object-cover"
                />
              ) : (
                selectedMember.lastName?.charAt(0)
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 leading-none">
                  {selectedMember.firstName}{" "}
                  {selectedMember.otherName
                    ? `${selectedMember.otherName} `
                    : ""}
                  {selectedMember.lastName}
                </h2>
                {memberAccount?.status === "ACTIVE" ? (
                  <span
                    className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
                    title="Account Active"
                  ></span>
                ) : (
                  <span
                    className="w-2 h-2 rounded-full bg-red-500"
                    title="Account Inactive"
                  ></span>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                {selectedMember.fileNumber} • {selectedMember.email}
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1B1B25] overflow-x-auto custom-scrollbar transition-colors">
          {[
            { id: "IDENTITY", label: "Identity & Access" },
            { id: "FINANCIALS", label: "Financial Control" },
            { id: "LOANS", label: "Loan & Risk Portfolio" },
            { id: "LEDGER", label: "Micro-Ledger" },
            { id: "COMMS", label: "Communication" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`py-3 px-5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? "border-[#1b5e3a] dark:border-emerald-500 text-[#1b5e3a] dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10" : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-[#12121A] custom-scrollbar transition-colors">
          {activeTab === "IDENTITY" && (
            <IdentityTab
              selectedMember={selectedMember}
              memberAccount={memberAccount}
            />
          )}

          {activeTab === "FINANCIALS" && (
            <FinancialsTab
              selectedMember={selectedMember}
              memberAccount={memberAccount}
              isAccountLoading={isAccountLoading}
              onAccountUpdated={(acc) => setMemberAccount(acc)}
              refreshLedger={() => fetchMemberLedger(selectedMember._id)}
              refreshInitialData={refreshInitialData}
            />
          )}

          {activeTab === "LOANS" && (
            <LoansTab
              memberLoans={memberLoans}
              guaranteedLoans={guaranteedLoans}
            />
          )}

          {activeTab === "LEDGER" && (
            <LedgerTab
              memberTransactions={memberTransactions}
              isLedgerLoading={isLedgerLoading}
            />
          )}

          {activeTab === "COMMS" && (
            <CommsTab selectedMember={selectedMember} />
          )}
        </div>
      </div>
    </div>
  );
}
