"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function SystemSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // System Settings State (Mocked for MVP - To be wired to backend in Phase 2)
  const [settings, setSettings] = useState({
    interestRate: 5.0,
    creditMultiplier: 2.0,
    maintenanceMode: false,
    allowRegistrations: true,
  });

  // Mock Audit Logs
  const auditLogs = [
    {
      id: 1,
      action: "Approved Loan Request #ASCON-104",
      admin: "Super Admin",
      time: "2 hours ago",
      type: "success",
    },
    {
      id: 2,
      action: "Downloaded Monthly Payroll CSV",
      admin: "Super Admin",
      time: "5 hours ago",
      type: "info",
    },
    {
      id: 3,
      action: "Rejected Loan Request #ASCON-099",
      admin: "Super Admin",
      time: "1 day ago",
      type: "danger",
    },
    {
      id: 4,
      action: "Manually Credited ₦50,000 to ASCON-042",
      admin: "Super Admin",
      time: "2 days ago",
      type: "warning",
    },
  ];

  useEffect(() => {
    // Simulate fetching settings from the server
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Simulate API call to save global configuration
    setTimeout(() => {
      setIsSaving(false);
      toast.success("System configurations updated successfully.");
    }, 1500);
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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
    <div className="animate-fade-in-up">
      {/* HEADER */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
          System Configuration
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage global cooperative parameters and monitor administrative
          actions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: SETTINGS FORMS */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSaveSettings}>
            {/* Financial Parameters Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/40 border border-slate-100 mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-50 text-[#1b5e3a] rounded-xl flex items-center justify-center">
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Financial Parameters
                  </h3>
                  <p className="text-xs text-slate-500">
                    Global rules for all cooperators.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Flat Interest Rate (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={settings.interestRate}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          interestRate: parseFloat(e.target.value),
                        })
                      }
                      className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1b5e3a]/30 focus:border-[#1b5e3a] transition-all"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 font-bold">
                      %
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    Applied automatically to all new loans.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Credit Limit Multiplier
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      value={settings.creditMultiplier}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          creditMultiplier: parseFloat(e.target.value),
                        })
                      }
                      className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1b5e3a]/30 focus:border-[#1b5e3a] transition-all"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 font-bold">
                      x Savings
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    Determines max borrowing capacity.
                  </p>
                </div>
              </div>
            </div>

            {/* Platform Controls Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/40 border border-slate-100 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
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
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Platform Controls
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live operational switches.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Toggle 1 */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      Allow New Registrations
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Permit new staff members to sign up via the portal.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSetting("allowRegistrations")}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.allowRegistrations ? "bg-emerald-500" : "bg-slate-300"}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.allowRegistrations ? "translate-x-5" : "translate-x-0"}`}
                    />
                  </button>
                </div>

                {/* Toggle 2: Danger Zone */}
                <div
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${settings.maintenanceMode ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-100"}`}
                >
                  <div>
                    <h4
                      className={`text-sm font-bold ${settings.maintenanceMode ? "text-red-700" : "text-slate-800"}`}
                    >
                      Maintenance / Audit Mode
                    </h4>
                    <p
                      className={`text-xs mt-0.5 ${settings.maintenanceMode ? "text-red-500" : "text-slate-500"}`}
                    >
                      Temporarily disable all new loan applications and
                      guarantor requests.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSetting("maintenanceMode")}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.maintenanceMode ? "bg-red-500" : "bg-slate-300"}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.maintenanceMode ? "translate-x-5" : "translate-x-0"}`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full flex justify-center py-4 px-4 rounded-xl shadow-lg shadow-[#1b5e3a]/20 text-sm font-bold text-white bg-[#1b5e3a] hover:bg-[#124228] transition-all duration-200 disabled:opacity-70 transform hover:-translate-y-0.5"
              >
                {isSaving ? "Saving Configuration..." : "Apply Global Settings"}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: SECURITY AUDIT LOG */}
        <div className="lg:col-span-5">
          <div className="bg-[#0f3420] rounded-3xl p-6 shadow-xl shadow-emerald-900/10 border border-[#1b5e3a] h-full flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

            <div className="relative z-10 border-b border-[#1b5e3a] pb-4 mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Security Audit Log
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </h3>
              <p className="text-xs text-emerald-200/70 mt-1">
                Read-only ledger of management actions.
              </p>
            </div>

            <div className="relative z-10 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-6">
                {auditLogs.map((log, index) => (
                  <div key={log.id} className="relative flex gap-4">
                    {/* Timeline Line */}
                    {index !== auditLogs.length - 1 && (
                      <div className="absolute left-4 top-8 bottom-[-24px] w-0.5 bg-[#1b5e3a]/50"></div>
                    )}

                    {/* Icon based on type */}
                    <div
                      className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-[#0f3420] ${
                        log.type === "success"
                          ? "bg-emerald-500 text-white"
                          : log.type === "danger"
                            ? "bg-red-500 text-white"
                            : log.type === "warning"
                              ? "bg-amber-500 text-white"
                              : "bg-blue-500 text-white"
                      }`}
                    >
                      {log.type === "success" && (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                      {log.type === "danger" && (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      )}
                      {log.type === "warning" && (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      )}
                      {log.type === "info" && (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-emerald-50 leading-tight">
                        {log.action}
                      </p>
                      <p className="text-[10px] text-emerald-200/50 mt-1 uppercase tracking-widest">
                        {log.admin} • {log.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 mt-6 pt-4 border-t border-[#1b5e3a] text-center">
              <p className="text-[10px] text-emerald-200/40 uppercase tracking-widest">
                Logs are immutable and encrypted.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
