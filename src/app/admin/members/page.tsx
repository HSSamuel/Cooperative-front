"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function MemberDirectoryPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"IDENTITY" | "FINANCIALS">(
    "IDENTITY",
  );

  const [memberAccount, setMemberAccount] = useState<any>(null);
  const [isAccountLoading, setIsAccountLoading] = useState(false);
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
        {
          headers: { Authorization: `Bearer ${token}` },
        },
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
        {
          headers: { Authorization: `Bearer ${token}` },
        },
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
    if (isNaN(amountInNaira) || amountInNaira < 0)
      return toast.error("Enter a valid limit amount.");

    setIsUpdatingLimit(true);
    try {
      const token = localStorage.getItem("coop_token");
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/account/user/${selectedMember._id}/credit-limit`,
        { newCreditLimitInKobo: Math.round(amountInNaira * 100) },
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
      toast.success("Account settings updated!");
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
  };

  const formatNaira = (koboAmount: number) => {
    return new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2 }).format(
      koboAmount / 100,
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

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-16 bg-slate-200 rounded-sm"></div>
        <div className="h-64 bg-slate-200 rounded-sm"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="bg-white rounded-sm border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-700">
              Member Directory
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Manage {members.length} registered staff members.
            </p>
          </div>
          <input
            type="text"
            placeholder="Search name or file no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-slate-300 rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-slate-500 w-full sm:w-72"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b-2 border-slate-200 text-slate-700 font-bold">
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
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No members match your search.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr
                    key={member._id}
                    onClick={() => setSelectedMember(member)}
                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                  >
                    <td className="py-3 px-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm bg-[#2B2F42] text-white flex items-center justify-center font-bold text-xs overflow-hidden">
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
                        <div className="font-semibold text-slate-800">
                          {member.lastName} {member.firstName}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {member.email}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {member.fileNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider ${member.role.includes("ADMIN") ? "bg-[#2B2F42] text-white" : "bg-slate-200 text-slate-700"}`}
                      >
                        {member.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 transition-opacity"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-sm shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-sm bg-[#2B2F42] text-white flex items-center justify-center font-bold text-lg overflow-hidden">
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
                  <h2 className="text-xl font-bold text-slate-800 leading-none">
                    {selectedMember.firstName} {selectedMember.lastName}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {selectedMember.fileNumber} • {selectedMember.email}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-700"
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

            <div className="flex border-b border-slate-200 bg-white px-6">
              <button
                onClick={() => setActiveTab("IDENTITY")}
                className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === "IDENTITY" ? "border-[#1b5e3a] text-[#1b5e3a]" : "border-transparent text-slate-500 hover:text-slate-800"}`}
              >
                Identity Records
              </button>
              <button
                onClick={() => setActiveTab("FINANCIALS")}
                className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === "FINANCIALS" ? "border-[#1b5e3a] text-[#1b5e3a]" : "border-transparent text-slate-500 hover:text-slate-800"}`}
              >
                Financial Control
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 custom-scrollbar">
              {activeTab === "IDENTITY" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-5 rounded-sm border border-slate-200 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 mb-1">
                      First Name
                    </p>
                    <p className="text-sm font-bold text-slate-800">
                      {selectedMember.firstName}
                    </p>
                  </div>
                  <div className="bg-white p-5 rounded-sm border border-slate-200 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 mb-1">
                      Surname
                    </p>
                    <p className="text-sm font-bold text-slate-800">
                      {selectedMember.lastName}
                    </p>
                  </div>
                  <div className="bg-white p-5 rounded-sm border border-slate-200 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 mb-1">
                      ASCON File Number
                    </p>
                    <p className="text-sm font-bold text-slate-800">
                      {selectedMember.fileNumber}
                    </p>
                  </div>
                  <div className="bg-white p-5 rounded-sm border border-slate-200 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 mb-1">
                      Contact Email
                    </p>
                    <p className="text-sm font-bold text-slate-800">
                      {selectedMember.email}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "FINANCIALS" && (
                <div className="h-full">
                  {isAccountLoading || !memberAccount ? (
                    <div className="flex justify-center items-center py-20">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1b5e3a]"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-6">
                        <div className="bg-[#2B2F42] rounded-sm p-6 text-white shadow-sm">
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

                        <div className="bg-white rounded-sm p-6 border border-slate-200 shadow-sm">
                          <h3 className="text-sm font-bold text-slate-800 mb-1">
                            Override Credit Limit
                          </h3>
                          <p className="text-xs text-slate-500 mb-4">
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
                              className="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-slate-500"
                            />
                            <button
                              type="submit"
                              disabled={isUpdatingLimit || !customLimitAmount}
                              className="bg-[#6A5AE0] hover:bg-[#5b4bc4] text-white text-sm font-bold px-4 rounded-sm transition-colors whitespace-nowrap disabled:opacity-70"
                            >
                              Apply
                            </button>
                          </form>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-white rounded-sm p-6 border border-slate-200 shadow-sm">
                          <h3 className="text-sm font-bold text-slate-800 mb-4">
                            Reconciliation Settings
                          </h3>
                          <form
                            onSubmit={handleSaveSettings}
                            className="space-y-4"
                          >
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">
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
                                className="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                  Status
                                </label>
                                <select
                                  value={settingsForm.status}
                                  onChange={(e) =>
                                    setSettingsForm({
                                      ...settingsForm,
                                      status: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm"
                                >
                                  <option value="ACTIVE">Active</option>
                                  <option value="PAUSED">Paused</option>
                                  <option value="INACTIVE">Inactive</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                  Custom Savings (₦)
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
                                  className="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm"
                                />
                              </div>
                            </div>
                            <button
                              type="submit"
                              disabled={isSavingSettings}
                              className="w-full bg-[#1b5e3a] hover:bg-[#124228] text-white text-sm font-bold py-2.5 rounded-sm transition-colors disabled:opacity-70"
                            >
                              Save Settings
                            </button>
                          </form>
                        </div>

                        <div className="bg-white rounded-sm p-6 border border-slate-200 shadow-sm">
                          <h3 className="text-sm font-bold text-slate-800 mb-4">
                            Manual Ledger Adjustment
                          </h3>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Amount (₦)"
                            value={adjustAmount}
                            onChange={(e) => setAdjustAmount(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm mb-3 focus:outline-none focus:border-slate-500"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleAdminAdjustment("CREDIT")}
                              disabled={isAdjusting || !adjustAmount}
                              className="bg-[#20C997] text-white text-sm font-bold py-2 rounded-sm hover:opacity-90 disabled:opacity-50"
                            >
                              + Credit
                            </button>
                            <button
                              onClick={() => handleAdminAdjustment("DEBIT")}
                              disabled={isAdjusting || !adjustAmount}
                              className="bg-red-500 text-white text-sm font-bold py-2 rounded-sm hover:opacity-90 disabled:opacity-50"
                            >
                              - Debit
                            </button>
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
      )}
    </div>
  );
}
