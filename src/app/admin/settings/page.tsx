"use client";

import React, { useState, useEffect } from "react";
import apiClient from "@/lib/axios";
import toast from "react-hot-toast";
import { GlobalSpinner } from "@/components/GlobalSpinner";

export default function SystemSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [tenuresInput, setTenuresInput] = useState("");

  const [settings, setSettings] = useState<any>({
    interestRate: 10.0,
    creditMultiplier: 2.0,
    maintenanceMode: false,
    allowRegistrations: true,
    loanFormFee: 50000,
    loanTenures: [10, 20, 30, 36],
  });

  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSystemData();
  }, []);

  const fetchSystemData = async () => {
    try {
      const [settingsRes, logsRes] = await Promise.all([
        apiClient.get("/system/settings"),
        apiClient.get("/auth/audit-logs"),
      ]);

      const fetchedSettings = settingsRes.data.settings;

      setSettings({
        ...fetchedSettings,
        loanTenures: fetchedSettings.loanTenures || [10, 20, 30, 36],
      });

      setTenuresInput(
        (fetchedSettings.loanTenures || [10, 20, 30, 36]).join(", "),
      );

      const settingsLogs = logsRes.data.filter(
        (log: any) => log.action === "UPDATED_SETTINGS",
      );
      setAuditLogs(settingsLogs);

      setIsLoading(false);
    } catch (error) {
      toast.error("Failed to load system configurations.");
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const parsedArray = tenuresInput
        .split(",")
        .map((v) => parseInt(v.trim()))
        .filter((v) => !isNaN(v));

      await apiClient.put("/system/settings", {
        ...settings,
        loanTenures: parsedArray,
      });

      toast.success("Global algorithms and security parameters updated.");
      fetchSystemData();
    } catch (error) {
      toast.error("Failed to save configurations.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSetting = (key: string) => {
    setSettings((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTenuresChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTenuresInput(e.target.value);
  };

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const groupedLogs: any[] = [];
  let currentGroup: any = null;

  for (const log of auditLogs) {
    if (!currentGroup) {
      currentGroup = { ...log, count: 1, subLogs: [log] };
    } else {
      const isSameAdmin =
        currentGroup.adminId?._id === log.adminId?._id ||
        currentGroup.adminId?.fileNumber === log.adminId?.fileNumber;
      const isSameAction = currentGroup.action === log.action;

      if (isSameAdmin && isSameAction) {
        currentGroup.count += 1;
        currentGroup.subLogs.push(log);
      } else {
        groupedLogs.push(currentGroup);
        currentGroup = { ...log, count: 1, subLogs: [log] };
      }
    }
  }
  if (currentGroup) {
    groupedLogs.push(currentGroup);
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-sm"></div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-sm"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up pb-10 relative">
      <GlobalSpinner
        isLoading={isSaving}
        text="Synchronizing System Policy..."
      />

      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">
          System Architecture
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure core financial algorithms and access security protocols.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="bg-white dark:bg-[#1B1B25] rounded-sm p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                Core Financial Engine
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Standard Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.interestRate}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setSettings({
                        ...settings,
                        interestRate: isNaN(val) ? "" : val,
                      });
                    }}
                    className="block w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 rounded-sm text-sm focus:outline-none focus:border-[#1b5e3a] dark:focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Borrowing Multiplier
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={settings.creditMultiplier}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setSettings({
                        ...settings,
                        creditMultiplier: isNaN(val) ? "" : val,
                      });
                    }}
                    className="block w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 rounded-sm text-sm focus:outline-none focus:border-[#1b5e3a] dark:focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div className="sm:col-span-2 pt-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Loan Form Fee (₦)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 font-medium">
                      ₦
                    </span>
                    <input
                      type="number"
                      step="50"
                      value={
                        settings.loanFormFee === ""
                          ? ""
                          : settings.loanFormFee / 100
                      }
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setSettings({
                          ...settings,
                          loanFormFee: isNaN(val) ? "" : Math.round(val * 100),
                        });
                      }}
                      className="block w-full pl-9 pr-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 rounded-sm text-sm focus:outline-none focus:border-[#1b5e3a] dark:focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                    This amount is automatically deducted from a cooperator's
                    savings when they submit a loan application.
                  </p>
                </div>

                <div className="sm:col-span-2 pt-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Allowed Loan Tenures (Months)
                  </label>
                  <input
                    type="text"
                    value={tenuresInput}
                    onChange={handleTenuresChange}
                    placeholder="e.g. 10, 20, 30, 36"
                    className="block w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 rounded-sm text-sm focus:outline-none focus:border-[#1b5e3a] dark:focus:border-emerald-500 transition-colors"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                    Provide a comma-separated list of allowed repayment
                    durations (e.g. 10, 20, 30, 36).
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1B1B25] rounded-sm p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                Operational Security Controls
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#12121A]/50 rounded-sm border border-slate-100 dark:border-slate-800 transition-colors">
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      Open Portal Enrollment
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Allow new personnel to register accounts.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSetting("allowRegistrations")}
                    className={`relative inline-flex h-6 w-11 rounded-full transition-colors focus:outline-none ${settings.allowRegistrations ? "bg-[#20C997]" : "bg-slate-300 dark:bg-slate-600"}`}
                  >
                    <span
                      className={`inline-block h-5 w-5 mt-0.5 transform rounded-full bg-white transition ${settings.allowRegistrations ? "translate-x-5" : "translate-x-0.5"}`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-sm border border-red-100 dark:border-red-900/50 transition-colors">
                  <div>
                    <h4 className="text-sm font-bold text-red-700 dark:text-red-400">
                      Strict Audit Lockout
                    </h4>
                    <p className="text-xs text-red-500 dark:text-red-400/80">
                      Freeze all member-facing operations (Maintenance Mode).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSetting("maintenanceMode")}
                    className={`relative inline-flex h-6 w-11 rounded-full transition-colors focus:outline-none ${settings.maintenanceMode ? "bg-red-500" : "bg-red-200 dark:bg-red-900/50"}`}
                  >
                    <span
                      className={`inline-block h-5 w-5 mt-0.5 transform rounded-full bg-white transition ${settings.maintenanceMode ? "translate-x-5" : "translate-x-0.5"}`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-[#1b5e3a] hover:bg-[#124228] text-white text-sm font-bold py-3.5 rounded-sm shadow-sm transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              Apply Global Policy
            </button>
          </form>
        </div>

        {/* SECURITY AUDIT LOG */}
        <div className="lg:col-span-5">
          <div className="bg-white dark:bg-[#1B1B25] rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col min-h-[400px] transition-colors">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#12121A]/50">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                System Logs
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Recent configuration changes.
              </p>
            </div>
            <div className="flex-1 p-6 flex flex-col items-center justify-start text-center overflow-y-auto max-h-[500px] custom-scrollbar">
              {groupedLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full mt-10">
                  <svg
                    className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                    No Activity Found
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-400 mt-1 max-w-[200px]">
                    Configuration overrides will be permanently logged here.
                  </p>
                </div>
              ) : (
                <div className="w-full space-y-4">
                  {groupedLogs.map((group) => {
                    const isExpanded = expandedGroups.has(group._id);
                    const dateObj = new Date(group.createdAt);

                    return (
                      <div
                        key={group._id}
                        className="bg-slate-50 dark:bg-slate-800/50 rounded-sm border border-slate-100 dark:border-slate-800 text-left transition-colors overflow-hidden"
                      >
                        <div
                          className={`p-4 ${group.count > 1 ? "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors" : ""}`}
                          onClick={() =>
                            group.count > 1 && toggleGroup(group._id)
                          }
                        >
                          {/* 🚀 FIXED: Added min-w-0 and flex-1 so the name truncates safely on mobile screens */}
                          <div className="flex justify-between items-start mb-2 gap-3">
                            <div className="flex items-start gap-2 min-w-0 flex-1">
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                                  {group.adminId?.firstName}{" "}
                                  {group.adminId?.lastName}
                                </p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                  {group.adminId?.fileNumber}
                                </p>
                              </div>
                              {group.count > 1 && (
                                <span className="bg-[#1b5e3a]/10 text-[#1b5e3a] dark:bg-emerald-500/10 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap mt-0.5 flex-shrink-0">
                                  {group.count} times
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col items-end flex-shrink-0">
                              <span className="text-[10px] text-slate-400 dark:text-slate-400 whitespace-nowrap bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm">
                                {`${dateObj.toLocaleString("en-US", { month: "short" })}/${dateObj.getDate().toString().padStart(2, "0")}/${dateObj.getFullYear()}`}
                              </span>
                              {group.count > 1 && (
                                <span className="text-[10px] mt-1.5 text-slate-400 dark:text-slate-500 flex items-center gap-1 font-semibold">
                                  {isExpanded ? "Hide details" : "View all"}
                                  <svg
                                    className={`w-3 h-3 transform transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 9l-7 7-7-7"
                                    />
                                  </svg>
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {group.description}
                          </p>
                        </div>

                        {/* Collapsible Dropdown for duplicates */}
                        {isExpanded && group.count > 1 && (
                          <div className="bg-white dark:bg-[#1B1B25] border-t border-slate-100 dark:border-slate-800 p-3 flex flex-col gap-2">
                            {group.subLogs.map((sub: any) => {
                              const subDate = new Date(sub.createdAt);
                              return (
                                <div
                                  key={sub._id}
                                  className="flex justify-between items-center text-[11px] py-1 border-b border-slate-50 dark:border-slate-800/50 last:border-0"
                                >
                                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                                    {subDate.toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      second: "2-digit",
                                    })}{" "}
                                    -{" "}
                                    {`${subDate.toLocaleString("en-US", { month: "short" })}/${subDate.getDate().toString().padStart(2, "0")}/${subDate.getFullYear()}`}
                                  </span>
                                  <span className="text-slate-400 dark:text-slate-500">
                                    Action logged
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
