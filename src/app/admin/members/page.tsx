"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function MemberDirectoryPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"IDENTITY" | "FINANCIALS">(
    "IDENTITY",
  );

  // Specific User Financial State
  const [memberAccount, setMemberAccount] = useState<any>(null);
  const [isAccountLoading, setIsAccountLoading] = useState(false);

  // Manual Adjustment State
  const [adjustAmount, setAdjustAmount] = useState("");
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Credit Limit Override State
  const [customLimitAmount, setCustomLimitAmount] = useState("");
  const [isUpdatingLimit, setIsUpdatingLimit] = useState(false);

  // Automated Engine Settings State
  const [settingsForm, setSettingsForm] = useState({
    status: "ACTIVE",
    customMonthlySavings: "",
    dateJoined: "",
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (selectedMember && activeTab === "FINANCIALS") {
      fetchMemberAccount(selectedMember._id);
    }
  }, [selectedMember, activeTab]);

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem("coop_token");
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/all-members`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMembers(res.data);
    } catch (error) {
      toast.error("Failed to load member directory.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMemberAccount = async (cooperatorId: string) => {
    setIsAccountLoading(true);
    try {
      const token = localStorage.getItem("coop_token");
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/account/user/${cooperatorId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
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
    if (isNaN(amountInNaira) || amountInNaira <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to ${type.toLowerCase()} ₦${amountInNaira} to this account?`,
      )
    )
      return;

    setIsAdjusting(true);
    try {
      const token = localStorage.getItem("coop_token");
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/account/admin-adjust`,
        {
          cooperatorId: selectedMember._id,
          amountInKobo: Math.round(amountInNaira * 100),
          type,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

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
    if (isNaN(amountInNaira) || amountInNaira < 0) {
      toast.error("Please enter a valid limit amount.");
      return;
    }

    const newCreditLimitInKobo = Math.round(amountInNaira * 100);

    setIsUpdatingLimit(true);
    try {
      const token = localStorage.getItem("coop_token");
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/account/user/${selectedMember._id}/credit-limit`,
        { newCreditLimitInKobo },
        { headers: { Authorization: `Bearer ${token}` } },
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
      const token = localStorage.getItem("coop_token");
      const savingsInKobo = parseInt(settingsForm.customMonthlySavings) * 100;

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/account/user/${selectedMember._id}/settings`,
        {
          status: settingsForm.status,
          customMonthlySavings: isNaN(savingsInKobo) ? 0 : savingsInKobo,
          dateJoined: settingsForm.dateJoined,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success("Account settings & dates updated!");
      setMemberAccount(res.data.account);
      fetchMembers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save settings.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const closeModal = () => {
    setSelectedMember(null);
    setActiveTab("IDENTITY");
    setMemberAccount(null);
    setAdjustAmount("");
    setCustomLimitAmount("");
  };

  const formatNaira = (koboAmount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(koboAmount / 100);
  };

  const filteredMembers = members.filter((member) => {
    const term = searchQuery.toLowerCase();
    return (
      (member.firstName?.toLowerCase() || "").includes(term) ||
      (member.lastName?.toLowerCase() || "").includes(term) ||
      (member.fileNumber?.toLowerCase() || "").includes(term)
    );
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up relative pb-10">
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Cooperative Members
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage all {members.length} registered staff members.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="w-5 h-5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search directory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all"
            />
          </div>
        </div>
      </div>

      {/* MEMBER DATA GRID */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse cursor-pointer">
            <thead>
              <tr className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <th className="px-6 py-4 font-bold whitespace-nowrap">
                  Profile
                </th>
                <th className="px-6 py-4 font-bold whitespace-nowrap">
                  File Number
                </th>
                <th className="px-6 py-4 font-bold whitespace-nowrap">
                  System Role
                </th>
                <th className="px-6 py-4 font-bold whitespace-nowrap">
                  Joined Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No members match your search.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr
                    key={member._id}
                    onClick={() => setSelectedMember(member)}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm shadow-md flex-shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
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
                          <div className="font-bold text-slate-800">
                            {member.lastName} {member.firstName}
                          </div>
                          <div className="text-xs text-slate-500">
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600 whitespace-nowrap">
                      {member.fileNumber}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border ${member.role.includes("ADMIN") ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}
                      >
                        {member.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
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

      {/* 🚀 NEW: LARGE CENTERED MODAL OVERLAY */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          onClick={closeModal} // Clicking the background closes it
        >
          {/* Modal Container */}
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col relative animate-fade-in-up"
            onClick={(e) => e.stopPropagation()} // Prevent clicking inside from closing it
          >
            {/* Always-Visible Floating Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-50 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white backdrop-blur-md transition-colors"
            >
              <svg
                className="w-5 h-5"
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

            {/* 🚀 THE FIX: The entire modal is now one scrollable block, so the header isn't static! */}
            <div className="flex-1 overflow-y-auto bg-slate-50 relative custom-scrollbar">
              {/* Profile Header (Centered & Compact) */}
              <div className="bg-white border-b border-slate-200">
                {/* Banner Background */}
                <div className="relative h-28 sm:h-32 bg-[#0f3420]">
                  {/* Avatar - Centered directly over the border */}
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-24 h-24 bg-white rounded-[2rem] p-1.5 shadow-lg">
                    <div className="w-full h-full bg-slate-800 rounded-3xl flex items-center justify-center text-4xl font-bold text-white overflow-hidden">
                      {selectedMember.avatarUrl ? (
                        <img
                          src={selectedMember.avatarUrl}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        selectedMember.lastName?.charAt(0)
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Text - Centered */}
                <div className="pt-14 pb-6 px-6 flex flex-col items-center text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-none mb-2">
                    {selectedMember.firstName} {selectedMember.lastName}
                  </h2>

                  <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-slate-500 font-medium mb-4">
                    <span>{selectedMember.email}</span>
                    <span className="text-slate-300 hidden sm:inline">•</span>
                    <span>
                      File:{" "}
                      <strong className="text-slate-700">
                        {selectedMember.fileNumber}
                      </strong>
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-md uppercase tracking-wider border ${selectedMember.role.includes("ADMIN") ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}
                  >
                    {selectedMember.role.replace("_", " ")}
                  </span>
                </div>

                {/* Modal Tabs - Sticky to the top when you scroll down */}
                <div className="flex justify-center gap-6 sm:gap-12 px-6 sticky top-0 bg-white/95 backdrop-blur-md z-40 border-t border-slate-100 shadow-sm">
                  <button
                    onClick={() => setActiveTab("IDENTITY")}
                    className={`py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === "IDENTITY" ? "border-emerald-600 text-emerald-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                  >
                    Identity & Records
                  </button>
                  <button
                    onClick={() => setActiveTab("FINANCIALS")}
                    className={`py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === "FINANCIALS" ? "border-emerald-600 text-emerald-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                  >
                    Financial Control Center
                  </button>
                </div>
              </div>

              {/* Main Tab Content */}
              <div className="p-6 sm:p-10 max-w-6xl mx-auto">
                {/* TAB 1: IDENTITY */}
                {activeTab === "IDENTITY" && (
                  <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">
                        Official Identity Records
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div>
                          <p className="text-xs font-semibold text-slate-500 mb-1.5">
                            First Name
                          </p>
                          <p className="text-lg font-bold text-slate-800 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                            {selectedMember.firstName}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500 mb-1.5">
                            Surname
                          </p>
                          <p className="text-lg font-bold text-slate-800 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                            {selectedMember.lastName}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500 mb-1.5">
                            ASCON File Number
                          </p>
                          <p className="text-lg font-bold text-slate-800 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                            {selectedMember.fileNumber}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500 mb-1.5">
                            Contact Email
                          </p>
                          <p className="text-lg font-medium text-slate-800 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 overflow-hidden text-ellipsis">
                            {selectedMember.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: FINANCIALS */}
                {activeTab === "FINANCIALS" && (
                  <div className="h-full">
                    {isAccountLoading || !memberAccount ? (
                      <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* LEFT COLUMN: Readouts & Overrides */}
                        <div className="space-y-8">
                          <div className="bg-[#0f3420] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute -right-8 -top-8 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
                            <div className="relative z-10">
                              <p className="text-emerald-200/70 text-xs font-bold uppercase tracking-wider mb-2">
                                Total Verified Savings
                              </p>
                              <h3 className="text-4xl font-extrabold mb-6">
                                {formatNaira(memberAccount.totalSavings)}
                              </h3>
                              <div className="bg-white/10 p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                <span className="text-sm font-medium text-emerald-100">
                                  Available Credit Limit
                                </span>
                                <span className="text-xl font-bold text-amber-300">
                                  {formatNaira(
                                    memberAccount.availableCreditLimit,
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-amber-50 rounded-3xl p-8 border border-amber-200 shadow-sm">
                            <h3 className="text-base font-bold text-amber-900 mb-1">
                              Override Credit Limit
                            </h3>
                            <p className="text-sm text-amber-700 mb-6">
                              Bypass the automated 2x savings rule to grant a
                              custom limit for this member.
                            </p>
                            <form
                              onSubmit={handleUpdateCreditLimit}
                              className="flex flex-col sm:flex-row gap-4"
                            >
                              <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                  <span className="text-amber-700 font-bold">
                                    ₦
                                  </span>
                                </div>
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="E.g. 200000"
                                  value={customLimitAmount}
                                  onChange={(e) =>
                                    setCustomLimitAmount(e.target.value)
                                  }
                                  className="w-full pl-10 pr-4 py-3 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                                />
                              </div>
                              <button
                                type="submit"
                                disabled={isUpdatingLimit || !customLimitAmount}
                                className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold py-3 px-6 rounded-xl shadow-md transition-colors disabled:opacity-70 whitespace-nowrap"
                              >
                                {isUpdatingLimit
                                  ? "Updating..."
                                  : "Force Update"}
                              </button>
                            </form>
                          </div>
                        </div>

                        {/* RIGHT COLUMN: Engine Settings & Adjustments */}
                        <div className="space-y-8">
                          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                            <h3 className="text-base font-bold text-slate-800 mb-1">
                              Reconciliation Engine Settings
                            </h3>
                            <p className="text-sm text-slate-500 mb-6">
                              Control how the payroll engine processes this
                              specific account.
                            </p>

                            <form
                              onSubmit={handleSaveSettings}
                              className="space-y-5"
                            >
                              <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                  Official Join Date (Legacy Override)
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
                                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                                <p className="text-xs text-slate-400 mt-1.5">
                                  Changes the 6-month loan eligibility lock.
                                </p>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                  <label className="block text-sm font-bold text-slate-700 mb-2">
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
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                  >
                                    <option value="ACTIVE">
                                      Active (Process)
                                    </option>
                                    <option value="PAUSED">
                                      Paused (Skip)
                                    </option>
                                    <option value="INACTIVE">
                                      Inactive (Retired)
                                    </option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Custom Savings (NGN)
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
                                    placeholder="0 for Standard"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                  />
                                </div>
                              </div>

                              <button
                                type="submit"
                                disabled={isSavingSettings}
                                className="w-full bg-[#1b5e3a] hover:bg-[#124228] text-white text-sm font-bold py-3.5 rounded-xl shadow-md transition-colors disabled:opacity-70 mt-2"
                              >
                                {isSavingSettings
                                  ? "Saving Engine Settings..."
                                  : "Save Settings & Date"}
                              </button>
                            </form>
                          </div>

                          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                            <h3 className="text-base font-bold text-slate-800 mb-1">
                              Manual Savings Adjustment
                            </h3>
                            <p className="text-sm text-slate-500 mb-6">
                              Add or subtract funds directly to the ledger
                              (e.g., manual cash deposits).
                            </p>

                            <div className="flex flex-col gap-4">
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                  <span className="text-slate-500 font-bold">
                                    ₦
                                  </span>
                                </div>
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={adjustAmount}
                                  onChange={(e) =>
                                    setAdjustAmount(e.target.value)
                                  }
                                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <button
                                  onClick={() =>
                                    handleAdminAdjustment("CREDIT")
                                  }
                                  disabled={isAdjusting || !adjustAmount}
                                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-3 rounded-xl border border-emerald-200 transition-colors disabled:opacity-50 text-sm"
                                >
                                  + Credit Ledger
                                </button>
                                <button
                                  onClick={() => handleAdminAdjustment("DEBIT")}
                                  disabled={isAdjusting || !adjustAmount}
                                  className="bg-red-50 hover:bg-red-100 text-red-700 font-bold py-3 rounded-xl border border-red-200 transition-colors disabled:opacity-50 text-sm"
                                >
                                  - Debit Ledger
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
