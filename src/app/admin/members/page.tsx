"use client";

import { useState, useEffect } from "react";
import apiClient from "@/lib/axios";
import toast from "react-hot-toast";

type TabType = "IDENTITY" | "FINANCIALS" | "LOANS" | "LEDGER" | "COMMS";

export default function MemberDirectoryPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [allLoans, setAllLoans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("IDENTITY");

  // Financial States
  const [memberAccount, setMemberAccount] = useState<any>(null);
  const [isAccountLoading, setIsAccountLoading] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [customLimitAmount, setCustomLimitAmount] = useState("");
  const [isUpdatingLimit, setIsUpdatingLimit] = useState(false);

  // Settings States
  const [settingsForm, setSettingsForm] = useState({
    status: "ACTIVE",
    customMonthlySavings: "",
    dateJoined: "",
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Communication States
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  const [isSendingNotice, setIsSendingNotice] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedMember) {
      fetchMemberAccount(selectedMember._id);
    }
  }, [selectedMember]);

  const fetchInitialData = async () => {
    try {
      const [membersRes, loansRes] = await Promise.all([
        apiClient.get("/auth/all-members"),
        apiClient.get("/loans/all").catch(() => ({ data: [] })),
      ]);
      setMembers(membersRes.data);
      setAllLoans(loansRes.data);
    } catch (error) {
      toast.error("Failed to load member directory.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMemberAccount = async (cooperatorId: string) => {
    setIsAccountLoading(true);
    try {
      const res = await apiClient.get(`/account/user/${cooperatorId}`);
      setMemberAccount(res.data);

      const userDoc = res.data.cooperatorId;
      const defaultDate =
        userDoc?.dateJoined || userDoc?.createdAt || new Date();
      setSettingsForm({
        status: res.data?.status || "ACTIVE",
        customMonthlySavings: res.data?.customMonthlySavings
          ? (res.data.customMonthlySavings / 100).toString()
          : "0",
        dateJoined: new Date(defaultDate).toISOString().split("T")[0],
      });
    } catch (error) {
      toast.error("Failed to load user financials.");
    } finally {
      setIsAccountLoading(false);
    }
  };

  const handleAdminAdjustment = async (type: "CREDIT" | "DEBIT") => {
    const amountInNaira = parseFloat(adjustAmount);
    if (isNaN(amountInNaira) || amountInNaira <= 0)
      return toast.error("Enter a valid amount.");
    if (
      !window.confirm(
        `Are you sure you want to ${type.toLowerCase()} ₦${amountInNaira} to this account?`,
      )
    )
      return;

    setIsAdjusting(true);
    try {
      const res = await apiClient.post("/account/admin-adjust", {
        cooperatorId: selectedMember._id,
        amountInKobo: Math.round(amountInNaira * 100),
        type,
      });
      toast.success(res.data.message);
      setMemberAccount(res.data.account);
      setAdjustAmount("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Adjustment failed.");
    } finally {
      setIsAdjusting(false);
    }
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
        { newCreditLimitInKobo: Math.round(amountInNaira * 100) },
      );
      toast.success("Credit limit successfully updated!");
      setMemberAccount(res.data.account);
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
      setMemberAccount(res.data.account);
      fetchInitialData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save settings.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSendNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle || !noticeMessage)
      return toast.error("Please fill out the message.");
    setIsSendingNotice(true);
    try {
      await apiClient.post("/notifications/admin-send", {
        targetUserId: selectedMember._id,
        title: noticeTitle,
        message: noticeMessage,
        type: "system",
      });

      toast.success("In-app notification sent to the member.");
      setNoticeTitle("");
      setNoticeMessage("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send notice.");
    } finally {
      setIsSendingNotice(false);
    }
  };

  // 1. The actual API execution logic
  const executePasswordReset = async () => {
    try {
      await apiClient.post("/auth/forgot-password", {
        email: selectedMember.email,
      });
      toast.success("Password reset link sent to member's email.");
    } catch (error) {
      toast.error("Failed to send reset link.");
    }
  };

  // 2. The custom toast confirmation UI
  const handlePasswordResetTrigger = () => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } max-w-sm w-full bg-white dark:bg-[#1B1B25] shadow-2xl rounded-2xl pointer-events-auto flex flex-col ring-1 ring-black/5 dark:ring-white/10 border border-slate-100 dark:border-slate-800 p-5`}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Send Reset Link
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Are you sure you want to email a secure password reset link to{" "}
                <span className="font-semibold">{selectedMember.email}</span>?
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
                executePasswordReset();
              }}
              className="px-4 py-2 text-xs font-bold text-white rounded-lg transition-colors shadow-sm bg-blue-500 hover:bg-blue-600"
            >
              Yes, Send Link
            </button>
          </div>
        </div>
      ),
      { duration: Infinity, id: `confirm-reset-${selectedMember?._id}` },
    );
  };

  const closeModal = () => {
    setSelectedMember(null);
    setActiveTab("IDENTITY");
    setMemberAccount(null);
  };

  const formatNaira = (koboAmount: number) => {
    return new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2 }).format(
      koboAmount / 100,
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === "APPROVED")
      return (
        <span className="text-emerald-500 font-bold text-xs uppercase">
          Active
        </span>
      );
    if (status === "REPAID")
      return (
        <span className="text-slate-500 font-bold text-xs uppercase">
          Repaid
        </span>
      );
    if (status === "REJECTED")
      return (
        <span className="text-red-500 font-bold text-xs uppercase">
          Rejected
        </span>
      );
    return (
      <span className="text-amber-500 font-bold text-xs uppercase">
        Pending
      </span>
    );
  };

  const filteredMembers = members.filter((member) => {
    const term = searchQuery.toLowerCase();
    return (
      (member.firstName?.toLowerCase() || "").includes(term) ||
      (member.lastName?.toLowerCase() || "").includes(term) ||
      (member.fileNumber?.toLowerCase() || "").includes(term)
    );
  });

  // Derived Risk Data for Selected Member
  const memberLoans = allLoans.filter(
    (l) => l.cooperatorId?._id === selectedMember?._id,
  );
  const guaranteedLoans = allLoans.filter(
    (l) =>
      l.guarantor1?.cooperatorId?._id === selectedMember?._id ||
      l.guarantor2?.cooperatorId?._id === selectedMember?._id,
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-sm"></div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-sm"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="bg-white dark:bg-[#1B1B25] rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm p-6 transition-colors">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">
              Member Directory
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage {members.length} registered staff members.
            </p>
          </div>
          <input
            type="text"
            placeholder="Search name or file no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-slate-500 dark:focus:border-slate-400 w-full sm:w-72 transition-colors"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold transition-colors">
                <th className="py-3 px-4">PROFILE</th>
                <th className="py-3 px-4">FILE NUMBER</th>
                <th className="py-3 px-4">SYSTEM ROLE</th>
                <th className="py-3 px-4">JOINED DATE</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-slate-500 dark:text-slate-400"
                  >
                    No members match your search.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr
                    key={member._id}
                    onClick={() => setSelectedMember(member)}
                    className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-[#12121A]/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm bg-[#2B2F42] text-white flex items-center justify-center font-bold text-xs overflow-hidden shadow-sm">
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          member.lastName?.charAt(0) || "U"
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {member.lastName} {member.firstName}{" "}
                          {member.otherName || ""}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {member.email}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">
                      {member.fileNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider ${member.role.includes("ADMIN") ? "bg-[#2B2F42] text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"}`}
                      >
                        {member.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      {new Date(
                        member.dateJoined || member.createdAt,
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-900/80 transition-opacity backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-white dark:bg-[#1B1B25] rounded-sm shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col animate-fade-in-up border border-slate-200 dark:border-slate-800 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
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

            {/* Modal Tabs */}
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

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-[#12121A] custom-scrollbar transition-colors">
              {/* TAB 1: IDENTITY & ACCESS */}
              {activeTab === "IDENTITY" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-[#1B1B25] p-5 rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                        Bio-Data
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                            First Name
                          </p>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            {selectedMember.firstName}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                            Other Name
                          </p>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            {selectedMember.otherName || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                            Surname
                          </p>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            {selectedMember.lastName}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                            Gender
                          </p>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            {selectedMember.gender || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                            Mobile
                          </p>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            {selectedMember.mobile || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white dark:bg-[#1B1B25] p-5 rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                        Security & Access
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                              Password Reset
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              Send a secure recovery link.
                            </p>
                          </div>
                          <button
                            onClick={handlePasswordResetTrigger}
                            className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold px-3 py-1.5 rounded-sm transition-colors"
                          >
                            Send Link
                          </button>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                          <div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                              System Role
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              Current access level.
                            </p>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider ${selectedMember.role.includes("ADMIN") ? "bg-[#2B2F42] text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"}`}
                          >
                            {selectedMember.role.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: FINANCIAL CONTROL */}
              {activeTab === "FINANCIALS" && (
                <div className="h-full">
                  {isAccountLoading || !memberAccount ? (
                    <div className="flex justify-center items-center py-20">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1b5e3a] dark:border-emerald-500"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-6">
                        <div className="bg-[#2B2F42] rounded-sm p-6 text-white shadow-sm transition-colors">
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                            Verified Savings
                          </p>
                          <h3 className="text-3xl font-bold mb-4">
                            ₦{formatNaira(memberAccount.totalSavings)}
                          </h3>
                          <div className="bg-white/10 p-3 rounded-sm flex justify-between items-center text-sm">
                            <span className="text-slate-300">Credit Limit</span>
                            <span className="font-bold text-[#00B5E2]">
                              ₦{formatNaira(memberAccount.availableCreditLimit)}
                            </span>
                          </div>
                        </div>

                        <div className="bg-white dark:bg-[#1B1B25] rounded-sm p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                            Override Credit Limit
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                            Bypass the automated 2x savings rule.
                          </p>
                          <form
                            onSubmit={handleUpdateCreditLimit}
                            className="flex gap-2"
                          >
                            <input
                              type="number"
                              step="0.01"
                              placeholder="E.g. 200000"
                              value={customLimitAmount}
                              onChange={(e) =>
                                setCustomLimitAmount(e.target.value)
                              }
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
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleAdminAdjustment("CREDIT")}
                              disabled={isAdjusting || !adjustAmount}
                              className="bg-[#20C997] text-white text-sm font-bold py-2 rounded-sm hover:opacity-90 disabled:opacity-50 shadow-sm"
                            >
                              + Credit
                            </button>
                            <button
                              onClick={() => handleAdminAdjustment("DEBIT")}
                              disabled={isAdjusting || !adjustAmount}
                              className="bg-red-500 text-white text-sm font-bold py-2 rounded-sm hover:opacity-90 disabled:opacity-50 shadow-sm"
                            >
                              - Debit
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-white dark:bg-[#1B1B25] rounded-sm p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors h-full">
                          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">
                            Reconciliation Settings
                          </h3>
                          <form
                            onSubmit={handleSaveSettings}
                            className="space-y-5"
                          >
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
                                  setSettingsForm({
                                    ...settingsForm,
                                    status: e.target.value,
                                  })
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
                  )}
                </div>
              )}

              {/* TAB 3: LOAN & RISK PORTFOLIO */}
              {activeTab === "LOANS" && (
                <div className="space-y-6">
                  {/* User's Active Loans */}
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
                            const total =
                              loan.amountDue || loan.amountRequested;
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
                                    Req: ₦{formatNaira(loan.amountRequested)} •
                                    Due: ₦{formatNaira(total)}
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

                  {/* Guarantor Risk Exposure */}
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
                                  File: {loan.cooperatorId?.fileNumber} •
                                  Applied:{" "}
                                  {new Date(
                                    loan.createdAt,
                                  ).toLocaleDateString()}
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
              )}

              {/* TAB 4: MICRO-LEDGER */}
              {activeTab === "LEDGER" && (
                <div className="bg-white dark:bg-[#1B1B25] rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-full flex flex-col transition-colors">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#12121A]/50">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                      Financial Forensics
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Recent localized ledger activity for this member.
                    </p>
                  </div>
                  <div className="p-8 flex flex-col items-center justify-center flex-1 text-center">
                    <svg
                      className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Micro-Ledger Pending
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                      Admin transactional filtering is currently being routed.
                      In the interim, you can adjust balances in the Financial
                      Control tab.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 5: COMMUNICATION */}
              {activeTab === "COMMS" && (
                <div className="bg-white dark:bg-[#1B1B25] rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#12121A]/50">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                      Direct Notice Hub
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Push an immediate in-app alert to{" "}
                      {selectedMember.firstName}'s dashboard.
                    </p>
                  </div>
                  <form onSubmit={handleSendNotice} className="p-6 space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Notice Title
                      </label>
                      <input
                        type="text"
                        required
                        value={noticeTitle}
                        onChange={(e) => setNoticeTitle(e.target.value)}
                        placeholder="E.g. Action Required: Update Guarantor"
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 rounded-sm text-sm focus:outline-none focus:border-[#1b5e3a] dark:focus:border-emerald-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Detailed Message
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={noticeMessage}
                        onChange={(e) => setNoticeMessage(e.target.value)}
                        placeholder="Type your official administrative message here..."
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 rounded-sm text-sm focus:outline-none focus:border-[#1b5e3a] dark:focus:border-emerald-500 transition-colors resize-none"
                      ></textarea>
                    </div>
                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={isSendingNotice}
                        className="px-6 py-2.5 bg-[#1b5e3a] hover:bg-[#124228] text-white text-sm font-bold rounded-sm shadow-md transition-all disabled:opacity-70 flex items-center gap-2"
                      >
                        {isSendingNotice
                          ? "Dispatching..."
                          : "Send Official Notice"}
                        {!isSendingNotice && (
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
                              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
