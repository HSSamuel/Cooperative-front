"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function MemberDirectoryPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Drawer State
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [drawerTab, setDrawerTab] = useState<"IDENTITY" | "FINANCIALS">(
    "IDENTITY",
  );

  // Specific User Financial State
  const [memberAccount, setMemberAccount] = useState<any>(null);
  const [isAccountLoading, setIsAccountLoading] = useState(false);

  // Manual Adjustment State
  const [adjustAmount, setAdjustAmount] = useState("");
  const [isAdjusting, setIsAdjusting] = useState(false);

  // 🚀 NEW: Automated Engine Settings State
  const [settingsForm, setSettingsForm] = useState({
    status: "ACTIVE",
    customMonthlySavings: "",
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  // When a user is selected AND the financials tab is clicked, fetch their specific ledger
  useEffect(() => {
    if (selectedMember && drawerTab === "FINANCIALS") {
      fetchMemberAccount(selectedMember._id);
    }
  }, [selectedMember, drawerTab]);

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

      // Pre-fill the settings form with their current database settings
      setSettingsForm({
        status: res.data?.status || "ACTIVE",
        customMonthlySavings: res.data?.customMonthlySavings
          ? (res.data.customMonthlySavings / 100).toString()
          : "0",
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

  // 🚀 NEW: Save automated engine settings
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
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success("Account settings updated!");
      setMemberAccount(res.data.account);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save settings.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const closeDrawer = () => {
    setSelectedMember(null);
    setDrawerTab("IDENTITY");
    setMemberAccount(null);
    setAdjustAmount("");
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
        <svg
          className="animate-spin h-8 w-8 text-emerald-600"
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
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up relative">
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
          <button className="bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-xl shadow-md transition-colors flex-shrink-0">
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
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
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

      {/* 360-DEGREE CRM SLIDE-OVER DRAWER */}
      {selectedMember && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={closeDrawer}
        ></div>
      )}

      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-slate-200 flex flex-col ${selectedMember ? "translate-x-0" : "translate-x-full"}`}
      >
        {selectedMember && (
          <>
            <div className="relative h-32 bg-[#0f3420] flex-shrink-0">
              <button
                onClick={closeDrawer}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors"
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
              <div className="absolute -bottom-10 left-6 w-20 h-20 bg-white rounded-2xl p-1 shadow-lg">
                <div className="w-full h-full bg-slate-800 rounded-xl flex items-center justify-center text-3xl font-bold text-white overflow-hidden">
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

            <div className="pt-12 px-6 pb-4 border-b border-slate-100 flex-shrink-0">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 leading-none mb-1">
                    {selectedMember.firstName} {selectedMember.lastName}
                  </h2>
                  <p className="text-sm text-slate-500 font-medium">
                    {selectedMember.email}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider border ${selectedMember.role.includes("ADMIN") ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}
                >
                  {selectedMember.role.replace("_", " ")}
                </span>
              </div>
            </div>

            <div className="flex px-6 border-b border-slate-100 flex-shrink-0 gap-6">
              <button
                onClick={() => setDrawerTab("IDENTITY")}
                className={`py-3 text-sm font-bold border-b-2 transition-colors ${drawerTab === "IDENTITY" ? "border-emerald-600 text-emerald-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
              >
                Identity
              </button>
              <button
                onClick={() => setDrawerTab("FINANCIALS")}
                className={`py-3 text-sm font-bold border-b-2 transition-colors ${drawerTab === "FINANCIALS" ? "border-emerald-600 text-emerald-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
              >
                Financial Control
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
              {drawerTab === "IDENTITY" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                      Official Records
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">
                          ASCON File Number
                        </p>
                        <p className="font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                          {selectedMember.fileNumber}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">
                            First Name
                          </p>
                          <p className="font-medium text-slate-800">
                            {selectedMember.firstName}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Surname</p>
                          <p className="font-medium text-slate-800">
                            {selectedMember.lastName}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {drawerTab === "FINANCIALS" && (
                <div className="space-y-6">
                  {isAccountLoading || !memberAccount ? (
                    <div className="flex justify-center py-10">
                      <svg
                        className="animate-spin h-8 w-8 text-emerald-600"
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
                    </div>
                  ) : (
                    <>
                      {/* Active Ledger Readout */}
                      <div className="bg-[#0f3420] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl"></div>
                        <div className="relative z-10">
                          <p className="text-emerald-200/70 text-xs font-bold uppercase tracking-wider mb-1">
                            Total Verified Savings
                          </p>
                          <h3 className="text-3xl font-extrabold mb-4">
                            {formatNaira(memberAccount.totalSavings)}
                          </h3>
                          <div className="bg-white/10 p-3 rounded-xl border border-white/10 flex justify-between items-center">
                            <span className="text-xs text-emerald-100">
                              Available Credit Limit
                            </span>
                            <span className="font-bold">
                              {formatNaira(memberAccount.availableCreditLimit)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 🚀 NEW: Automated Engine Settings */}
                      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-800 mb-1">
                          Reconciliation Settings
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">
                          Control how the payroll engine processes this account.
                        </p>

                        <form
                          onSubmit={handleSaveSettings}
                          className="space-y-4"
                        >
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
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
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                              <option value="ACTIVE">
                                Active (Process Deductions)
                              </option>
                              <option value="PAUSED">
                                Paused (Skip Deductions)
                              </option>
                              <option value="INACTIVE">
                                Inactive (Suspended/Retired)
                              </option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Custom Monthly Savings (NGN)
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
                              placeholder="Leave as 0 for Standard"
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">
                              Enter 0 to use the global ASCON rate.
                            </p>
                          </div>
                          <button
                            type="submit"
                            disabled={isSavingSettings}
                            className="w-full bg-[#1b5e3a] hover:bg-[#124228] text-white text-xs font-bold py-2.5 rounded-lg shadow-md transition-colors disabled:opacity-70"
                          >
                            {isSavingSettings
                              ? "Saving..."
                              : "Save Engine Settings"}
                          </button>
                        </form>
                      </div>

                      {/* Manual Adjustment Form */}
                      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-800 mb-1">
                          Manual Adjustment
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">
                          Add or subtract funds manually (e.g., cash deposits).
                        </p>

                        <div className="space-y-4">
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-slate-500 font-bold">
                                ₦
                              </span>
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={adjustAmount}
                              onChange={(e) => setAdjustAmount(e.target.value)}
                              className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => handleAdminAdjustment("CREDIT")}
                              disabled={isAdjusting || !adjustAmount}
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-2 rounded-lg border border-emerald-200 transition-colors disabled:opacity-50 text-sm"
                            >
                              + Credit Savings
                            </button>
                            <button
                              onClick={() => handleAdminAdjustment("DEBIT")}
                              disabled={isAdjusting || !adjustAmount}
                              className="bg-red-50 hover:bg-red-100 text-red-700 font-bold py-2 rounded-lg border border-red-200 transition-colors disabled:opacity-50 text-sm"
                            >
                              - Debit Savings
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
