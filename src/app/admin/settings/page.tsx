"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function SystemSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState({
    interestRate: 5.0,
    creditMultiplier: 2.0,
    maintenanceMode: false,
    allowRegistrations: true,
  });

  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchSystemData();
  }, []);

  const fetchSystemData = async () => {
    try {
      // Simulate API call for settings
      setTimeout(() => setIsLoading(false), 600);
    } catch (error) {
      toast.error("Failed to load system configurations.");
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success("Global algorithms and security parameters updated.");
    } catch (error) {
      toast.error("Failed to save configurations.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-40 bg-slate-200 rounded-sm"></div>
        <div className="h-64 bg-slate-200 rounded-sm"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-700">
          System Architecture
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Configure core financial algorithms and access security protocols.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SETTINGS FORMS */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="bg-white rounded-sm p-6 shadow-sm border border-slate-200">
              <h3 className="text-base font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
                Core Financial Engine
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Standard Interest Rate (%)
                  </label>
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
                    className="block w-full px-4 py-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Borrowing Multiplier
                  </label>
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
                    className="block w-full px-4 py-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-slate-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-sm p-6 shadow-sm border border-slate-200">
              <h3 className="text-base font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
                Operational Security Controls
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-sm border border-slate-100">
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">
                      Open Portal Enrollment
                    </h4>
                    <p className="text-xs text-slate-500">
                      Allow new personnel to register accounts.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSetting("allowRegistrations")}
                    className={`relative inline-flex h-6 w-11 rounded-full transition-colors focus:outline-none ${settings.allowRegistrations ? "bg-[#20C997]" : "bg-slate-300"}`}
                  >
                    <span
                      className={`inline-block h-5 w-5 mt-0.5 transform rounded-full bg-white transition ${settings.allowRegistrations ? "translate-x-5" : "translate-x-0.5"}`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 rounded-sm border border-red-100">
                  <div>
                    <h4 className="text-sm font-bold text-red-700">
                      Strict Audit Lockout
                    </h4>
                    <p className="text-xs text-red-500">
                      Freeze all member-facing operations (Maintenance Mode).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSetting("maintenanceMode")}
                    className={`relative inline-flex h-6 w-11 rounded-full transition-colors focus:outline-none ${settings.maintenanceMode ? "bg-red-500" : "bg-red-200"}`}
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
              className="w-full bg-[#6A5AE0] hover:bg-[#5b4bc4] text-white text-sm font-bold py-3 rounded-sm transition-colors disabled:opacity-70"
            >
              {isSaving ? "Synchronizing..." : "Apply Global Policy"}
            </button>
          </form>
        </div>

        {/* SECURITY AUDIT LOG */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-sm border border-slate-200 shadow-sm h-full flex flex-col min-h-[400px]">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-700">System Logs</h3>
              <p className="text-xs text-slate-500">
                Recent configuration changes.
              </p>
            </div>
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
              {auditLogs.length === 0 ? (
                <>
                  <svg
                    className="w-10 h-10 text-slate-300 mb-3"
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
                  <p className="text-sm font-semibold text-slate-600">
                    No Activity Found
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                    Configuration overrides will be permanently logged here.
                  </p>
                </>
              ) : (
                <div className="w-full space-y-4">
                  {/* Map actual logs here when backend is wired */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
