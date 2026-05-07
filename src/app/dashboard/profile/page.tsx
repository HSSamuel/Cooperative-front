"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";

export default function ProfileBioDataPage() {
  const [account, setAccount] = useState({
    totalSavings: 0,
    availableCreditLimit: 0,
    customMonthlySavings: 0,
  });
  const [activeLoansCount, setActiveLoansCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [user, setUser] = useState<any>({
    firstName: "Loading...",
    lastName: "",
    email: "",
    fileNumber: "",
    avatarUrl: "",
    dateJoined: new Date().toISOString(),
    gender: "",
    birthday: "",
    mobile: "",
    occupation: "Staff",
  });

  const [editForm, setEditForm] = useState({ ...user });

  useEffect(() => {
    const storedUser = localStorage.getItem("coop_user");
    const token = localStorage.getItem("coop_token");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setEditForm(parsedUser);
    }

    const fetchAccountData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [accountRes, loansRes] = await Promise.all([
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/account/my-account`,
            config,
          ),
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/loans/my-loans`,
            config,
          ),
        ]);

        setAccount(accountRes.data);
        setActiveLoansCount(
          loansRes.data.filter((l: any) => l.status === "APPROVED").length,
        );
      } catch (error) {
        console.error("Error fetching account data", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchAccountData();
  }, []);

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2 }).format(
      amount,
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not Provided";
    const d = new Date(dateString);
    return `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getFullYear()}`;
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem("coop_token");
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/profile`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      localStorage.setItem("coop_user", JSON.stringify(res.data));
      setUser(res.data);
      toast.success("Bio Data updated successfully!");
      setIsEditModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse flex gap-6 h-[800px]">
        <div className="w-1/3 bg-slate-200 rounded-sm"></div>
        <div className="w-2/3 flex flex-col gap-6">
          <div className="h-40 bg-slate-200 rounded-sm"></div>
          <div className="h-64 bg-slate-200 rounded-sm"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up pb-10 relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: PROFILE CARD */}
        <div className="lg:col-span-4 flex flex-col shadow-sm border border-slate-200 bg-white rounded-sm overflow-hidden">
          <div className="bg-[#1b5e3a] pt-10 pb-8 px-6 flex flex-col items-center text-center text-white">
            <div className="w-32 h-32 rounded-full border-4 border-white/10 overflow-hidden mb-4 bg-slate-700 flex items-center justify-center text-4xl font-bold">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                user.lastName?.charAt(0) || "U"
              )}
            </div>
            <h2 className="text-xl font-semibold tracking-wide mb-1">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-sm text-emerald-100/70 mb-1">{user.email}</p>
            <p className="text-sm text-emerald-100/70 mb-6">
              Membership No: <br />
              <span className="font-bold text-lg text-white">
                {user.fileNumber}
              </span>
            </p>
            <span className="px-5 py-1.5 bg-[#20C997] text-white text-xs font-bold rounded-sm uppercase tracking-wider shadow-sm">
              Active
            </span>
          </div>

          <div className="flex flex-col bg-white">
            <Link
              href="/dashboard"
              className="px-6 py-4 border-b border-slate-100 font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-3"
            >
              <svg
                className="w-5 h-5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Dashboard
            </Link>
            <Link
              href="/dashboard/savings"
              className="px-6 py-4 border-b border-slate-100 font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-3"
            >
              <svg
                className="w-5 h-5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Savings / Withdrawals
            </Link>
            <Link
              href="/dashboard/loans"
              className="px-6 py-4 border-b border-slate-100 font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-3"
            >
              <svg
                className="w-5 h-5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Loan Transactions
            </Link>
            <div className="px-6 py-4 bg-slate-100 border-l-4 border-[#1b5e3a] font-semibold text-slate-700 flex items-center gap-3">
              <svg
                className="w-5 h-5 text-[#1b5e3a]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Profile / Bio Data
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Top 3 Stat Cards */}
          <div className="bg-[#1b5e3a] p-6 rounded-sm grid grid-cols-1 sm:grid-cols-3 gap-6 shadow-md border border-[#124228]">
            <div className="bg-white rounded-sm p-6 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="flex items-start justify-center gap-1 mb-2">
                <span className="text-xl font-medium text-slate-500 mt-1">
                  ₦
                </span>
                <h3 className="text-3xl font-bold text-slate-700 tracking-tight">
                  {formatNaira(account.totalSavings / 100)}
                </h3>
              </div>
              <p className="text-sm text-slate-500 italic">Account Balance</p>
            </div>
            <div className="bg-white rounded-sm p-6 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="flex items-start justify-center gap-1 mb-2">
                <span className="text-xl font-medium text-slate-500 mt-1">
                  ₦
                </span>
                <h3 className="text-3xl font-bold text-slate-700 tracking-tight">
                  {formatNaira((account.customMonthlySavings || 150000) / 100)}
                </h3>
              </div>
              <p className="text-sm text-slate-500 italic">
                Agreed Monthly Savings
              </p>
            </div>
            <div className="bg-white rounded-sm p-6 flex flex-col items-center justify-center text-center shadow-sm">
              <h3 className="text-3xl font-bold text-slate-700 tracking-tight mb-2">
                {activeLoansCount}
              </h3>
              <p className="text-sm text-slate-500 italic">
                Total no of Active Loans
              </p>
            </div>
          </div>

          {/* Bio Data Section */}
          <div className="bg-white rounded-sm border border-slate-200 shadow-sm p-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">
              Bio Data
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 mb-8">
              {/* Perfectly Aligned 3-column Grid with break-all applied */}
              <div className="grid grid-cols-[110px_10px_1fr] gap-2 items-start min-w-0">
                <span className="text-sm font-medium text-slate-500">
                  First Name
                </span>
                <span className="text-sm font-medium text-slate-400">:</span>
                <span className="text-sm font-bold text-slate-800 break-words">
                  {user.firstName}
                </span>
              </div>
              <div className="grid grid-cols-[110px_10px_1fr] gap-2 items-start min-w-0">
                <span className="text-sm font-medium text-slate-500">
                  Last Name
                </span>
                <span className="text-sm font-medium text-slate-400">:</span>
                <span className="text-sm font-bold text-slate-800 break-words">
                  {user.lastName}
                </span>
              </div>

              <div className="grid grid-cols-[110px_10px_1fr] gap-2 items-start min-w-0">
                <span className="text-sm font-medium text-slate-500">
                  Gender
                </span>
                <span className="text-sm font-medium text-slate-400">:</span>
                <span className="text-sm font-bold text-slate-800 break-words">
                  {user.gender || "Not Provided"}
                </span>
              </div>
              <div className="grid grid-cols-[110px_10px_1fr] gap-2 items-start min-w-0">
                <span className="text-sm font-medium text-slate-500">
                  Birthday
                </span>
                <span className="text-sm font-medium text-slate-400">:</span>
                <span className="text-sm font-bold text-slate-800 break-words">
                  {formatDate(user.birthday)}
                </span>
              </div>

              <div className="grid grid-cols-[110px_10px_1fr] gap-2 items-start min-w-0">
                <span className="text-sm font-medium text-slate-500">
                  Occupation
                </span>
                <span className="text-sm font-medium text-slate-400">:</span>
                <span className="text-sm font-bold text-slate-800 break-words">
                  {user.occupation || `Staff (${user.role})`}
                </span>
              </div>
              <div className="grid grid-cols-[110px_10px_1fr] gap-2 items-start min-w-0">
                <span className="text-sm font-medium text-slate-500">
                  Email
                </span>
                <span className="text-sm font-medium text-slate-400">:</span>
                {/* 🚀 THE FIX: break-all forces long emails to wrap securely inside the box */}
                <span className="text-sm font-bold text-slate-800 break-all">
                  {user.email}
                </span>
              </div>

              <div className="grid grid-cols-[110px_10px_1fr] gap-2 items-start min-w-0">
                <span className="text-sm font-medium text-slate-500">
                  Mobile
                </span>
                <span className="text-sm font-medium text-slate-400">:</span>
                <span className="text-sm font-bold text-slate-800 break-words">
                  {user.mobile || "Not Provided"}
                </span>
              </div>
              <div className="grid grid-cols-[110px_10px_1fr] gap-2 items-start min-w-0">
                <span className="text-sm font-medium text-slate-500">
                  Join Date
                </span>
                <span className="text-sm font-medium text-slate-400">:</span>
                <span className="text-sm font-bold text-slate-800 break-words">
                  {formatDate(user.dateJoined || user.createdAt)}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-6">
              <div className="flex gap-4">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-6 py-2.5 bg-[#1b5e3a] hover:bg-[#124228] text-white text-sm font-semibold rounded-sm shadow-sm transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Login Activities Section */}
          <div className="bg-white rounded-sm border border-slate-200 shadow-sm p-6 flex items-center gap-6">
            <div className="text-[#1b5e3a]">
              <svg
                className="w-12 h-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">
                Login Activities
              </h3>
              <p className="text-sm text-slate-500 font-medium">
                Last login on {new Date().toISOString().split("T")[0]}{" "}
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800">Update Bio Data</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
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
            </div>

            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.firstName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, firstName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-[#1b5e3a]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.lastName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, lastName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-[#1b5e3a]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-[#1b5e3a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={editForm.gender}
                    onChange={(e) =>
                      setEditForm({ ...editForm, gender: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-[#1b5e3a] bg-white"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Birthday
                  </label>
                  <input
                    type="date"
                    value={
                      editForm.birthday ? editForm.birthday.split("T")[0] : ""
                    }
                    onChange={(e) =>
                      setEditForm({ ...editForm, birthday: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-[#1b5e3a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    value={editForm.mobile}
                    onChange={(e) =>
                      setEditForm({ ...editForm, mobile: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-[#1b5e3a]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Occupation
                  </label>
                  <input
                    type="text"
                    value={editForm.occupation}
                    onChange={(e) =>
                      setEditForm({ ...editForm, occupation: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-[#1b5e3a]"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 text-sm font-bold rounded-sm hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-[#1b5e3a] text-white text-sm font-bold rounded-sm hover:opacity-90 transition-colors disabled:opacity-70"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
