"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import apiClient from "@/lib/axios";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export default function ProfileBioDataPage() {
  const { account, loans, transactions, status } = useSelector(
    (state: RootState) => state.finance,
  );

  const activeLoansCount = loans.filter(
    (l: any) => l.status === "APPROVED",
  ).length;

  const [user, setUser] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("coop_user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setEditForm(parsedUser);
    }
  }, []);

  const formatNaira = (koboAmount: number) => {
    return new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2 }).format(
      koboAmount / 100,
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not Provided";
    const d = new Date(dateString);
    return `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getFullYear()}`;
  };

  const currentMonthString = new Date().toLocaleString("en-GB", {
    month: "long",
    year: "numeric",
  });
  const currentMonthSavings = transactions
    .filter(
      (txn: any) =>
        txn.type === "CREDIT" && txn.effectiveMonth === currentMonthString,
    )
    .reduce((sum: number, txn: any) => sum + txn.amount, 0);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024)
      return toast.error("Image is too large. Must be less than 5MB.");

    setIsUploadingImage(true);
    try {
      // 1. Get the secure signature from our Node backend
      const { data: sigData } = await apiClient.get("/upload/signature");

      // 2. Prepare payload for Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sigData.apiKey);
      formData.append("timestamp", sigData.timestamp);
      formData.append("signature", sigData.signature);
      formData.append("folder", "ascon_coop_avatars");

      // 3. Upload DIRECTLY to Cloudinary (Bypassing our backend memory)
      const cloudRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`,
        formData,
      );

      setEditForm({ ...editForm, avatarUrl: cloudRes.data.secure_url });
      toast.success("Image uploaded! Don't forget to save your changes.");
    } catch (error: any) {
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await apiClient.put("/auth/profile", editForm);
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

  if (status === "loading" || status === "idle" || !user) {
    return (
      <div className="animate-pulse flex flex-col lg:flex-row gap-6 h-[800px] w-full">
        <div className="w-full lg:w-1/3 bg-slate-200 dark:bg-slate-800 rounded-sm"></div>
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-sm"></div>
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-sm"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up pb-10 relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: PROFILE CARD */}
        <div className="lg:col-span-4 flex flex-col shadow-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1B1B25] rounded-sm overflow-hidden lg:sticky lg:top-6 transition-colors">
          <div className="bg-gradient-to-b from-[#1b5e3a] to-[#0f3420] dark:from-[#114026] dark:to-[#092214] pt-10 pb-8 px-6 flex flex-col items-center text-center text-white relative transition-colors">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg
                width="100%"
                height="100%"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern
                    id="grid"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 40 0 L 0 0 0 40"
                      fill="none"
                      stroke="white"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
            {/* ... inside the Profile Card ... */}
            <div className="relative z-10 w-28 h-28 rounded-full border-4 border-white/20 overflow-hidden mb-4 bg-slate-700 flex items-center justify-center text-4xl font-bold shadow-lg">
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

            {/* 🚀 FIX: Dynamically render Other Name if it exists */}
            <h2 className="relative z-10 text-2xl font-bold tracking-wide mb-1 text-center">
              {user.firstName} {user.otherName ? `${user.otherName} ` : ""}
              {user.lastName}
            </h2>

            <p className="relative z-10 text-sm text-emerald-100/70 mb-2 truncate max-w-full">
              {user.email}
            </p>
            <div className="relative z-10 bg-white/10 px-4 py-2 rounded-full border border-white/20 mb-4 backdrop-blur-sm shadow-sm">
              <p className="text-[10px] text-emerald-100/70 uppercase tracking-wider mb-0.5">
                Membership No
              </p>
              <p className="font-bold text-base text-white tracking-widest">
                {user.fileNumber}
              </p>
            </div>
            <span className="relative z-10 px-5 py-1.5 bg-[#20C997] text-white text-xs font-bold rounded-sm uppercase tracking-wider shadow-sm">
              Active Member
            </span>
          </div>

          <div className="flex flex-col bg-white dark:bg-[#1B1B25] transition-colors">
            <Link
              href="/dashboard"
              className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/50 font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#12121A]/50 flex items-center gap-3 transition-colors"
            >
              <svg
                className="w-5 h-5 text-slate-400 dark:text-slate-500"
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
              Dashboard Overview
            </Link>
            <Link
              href="/dashboard/savings"
              className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/50 font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#12121A]/50 flex items-center gap-3 transition-colors"
            >
              <svg
                className="w-5 h-5 text-slate-400 dark:text-slate-500"
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
              Savings & Withdrawals
            </Link>
            <div className="px-6 py-4 bg-emerald-50/50 dark:bg-emerald-900/20 border-l-4 border-[#1b5e3a] dark:border-emerald-500 font-bold text-[#1b5e3a] dark:text-emerald-400 flex items-center gap-3">
              <svg
                className="w-5 h-5 text-[#1b5e3a] dark:text-emerald-400"
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
              Profile
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white dark:bg-[#1B1B25] rounded-sm grid grid-cols-1 sm:grid-cols-3 gap-0 border border-slate-200 dark:border-slate-800 shadow-sm divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800 transition-colors">
            <div className="p-6 flex flex-col items-center justify-center text-center">
              <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Total Savings
              </p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-sm font-bold text-slate-400 dark:text-slate-500">
                  ₦
                </span>
                <h3 className="text-2xl font-black text-[#1b5e3a] dark:text-emerald-400 tracking-tight truncate max-w-[150px] sm:max-w-full">
                  {formatNaira(account.totalSavings)}
                </h3>
              </div>
            </div>
            <div className="p-6 flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-[#12121A]/50 transition-colors">
              <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Saved This Month
              </p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-sm font-bold text-slate-400 dark:text-slate-500">
                  ₦
                </span>
                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-200 tracking-tight truncate max-w-[150px] sm:max-w-full">
                  {formatNaira(currentMonthSavings)}
                </h3>
              </div>
            </div>
            <div className="p-6 flex flex-col items-center justify-center text-center">
              <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Active Loans
              </p>
              <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight mb-0.5">
                {activeLoansCount}
              </h3>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1B1B25] rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 transition-colors">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4 gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                  Bio Data
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Your registered cooperative information.
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-5 py-2 bg-[#1b5e3a] hover:bg-[#124228] text-white text-xs sm:text-sm font-bold rounded-sm shadow-sm transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 mb-4">
              <div className="bg-slate-50 dark:bg-[#12121A]/50 p-4 rounded-sm border border-slate-100 dark:border-slate-800/50 transition-colors">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  First Name
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 break-words">
                  {user.firstName}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-[#12121A]/50 p-4 rounded-sm border border-slate-100 dark:border-slate-800/50 transition-colors">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  Other Name
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 break-words">
                  {user.otherName || "Not Provided"}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-[#12121A]/50 p-4 rounded-sm border border-slate-100 dark:border-slate-800/50 transition-colors">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  Last Name
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 break-words">
                  {user.lastName}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-[#12121A]/50 p-4 rounded-sm border border-slate-100 dark:border-slate-800/50 transition-colors">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  Gender
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 break-words">
                  {user.gender || "Not Provided"}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-[#12121A]/50 p-4 rounded-sm border border-slate-100 dark:border-slate-800/50 transition-colors">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  Birthday
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 break-words">
                  {formatDate(user.birthday)}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-[#12121A]/50 p-4 rounded-sm border border-slate-100 dark:border-slate-800/50 transition-colors">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  Occupation
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 break-words">
                  {user.occupation || `Staff (${user.role.replace("_", " ")})`}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-[#12121A]/50 p-4 rounded-sm border border-slate-100 dark:border-slate-800/50 transition-colors">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  Email Address
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 break-all">
                  {user.email}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-[#12121A]/50 p-4 rounded-sm border border-slate-100 dark:border-slate-800/50 transition-colors">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  Mobile
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 break-words">
                  {user.mobile || "Not Provided"}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-[#12121A]/50 p-4 rounded-sm border border-slate-100 dark:border-slate-800/50 transition-colors">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  Official Join Date
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 break-words">
                  {formatDate(
                    account?.cooperatorId?.dateJoined ||
                      user.dateJoined ||
                      user.createdAt,
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-900/80 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1B1B25] rounded-sm shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar animate-fade-in-up border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#12121A]/50 sticky top-0 z-10">
              <h3 className="font-bold text-slate-800 dark:text-slate-200">
                Update Bio Data
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-white dark:bg-slate-800 p-1 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 transition-colors"
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

            <form
              onSubmit={handleUpdateProfile}
              className="p-6 sm:p-8 space-y-5"
            >
              <div className="flex flex-col items-center justify-center mb-6">
                <label className="relative cursor-pointer group">
                  <div className="relative w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-700 overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-3xl font-bold text-slate-500 dark:text-slate-400 shadow-sm">
                    {editForm.avatarUrl || user?.avatarUrl ? (
                      <img
                        src={editForm.avatarUrl || user.avatarUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      editForm.lastName?.charAt(0) || "U"
                    )}

                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all">
                      <svg
                        className="w-6 h-6 text-white mb-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="text-[10px] text-white font-bold">
                        Upload
                      </span>
                    </div>
                  </div>

                  <div className="absolute bottom-0 right-0 bg-[#1b5e3a] p-1.5 rounded-full border-2 border-white dark:border-[#1B1B25] shadow-sm">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                    </svg>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploadingImage}
                  />
                </label>

                {isUploadingImage ? (
                  <p className="text-xs text-[#1b5e3a] dark:text-emerald-400 font-bold mt-3 animate-pulse">
                    Uploading image securely...
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-3 uppercase tracking-wider font-semibold">
                    Tap photo to change
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.firstName || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, firstName: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#12121A]/50 border border-slate-200 dark:border-slate-700 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#1b5e3a] dark:focus:border-emerald-500 text-slate-800 dark:text-slate-200 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.lastName || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, lastName: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#12121A]/50 border border-slate-200 dark:border-slate-700 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#1b5e3a] dark:focus:border-emerald-500 text-slate-800 dark:text-slate-200 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Other Name{" "}
                  <span className="text-slate-400 dark:text-slate-500 font-normal">
                    (Optional)
                  </span>
                </label>
                <input
                  type="text"
                  value={editForm.otherName || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, otherName: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#12121A]/50 border border-slate-200 dark:border-slate-700 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#1b5e3a] dark:focus:border-emerald-500 text-slate-800 dark:text-slate-200 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={editForm.email || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#12121A]/50 border border-slate-200 dark:border-slate-700 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#1b5e3a] dark:focus:border-emerald-500 text-slate-800 dark:text-slate-200 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Gender
                  </label>
                  <select
                    value={editForm.gender || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, gender: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#12121A]/50 border border-slate-200 dark:border-slate-700 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#1b5e3a] dark:focus:border-emerald-500 text-slate-800 dark:text-slate-200 transition-all appearance-none"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
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
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#12121A]/50 border border-slate-200 dark:border-slate-700 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#1b5e3a] dark:focus:border-emerald-500 text-slate-800 dark:text-slate-200 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    value={editForm.mobile || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, mobile: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#12121A]/50 border border-slate-200 dark:border-slate-700 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#1b5e3a] dark:focus:border-emerald-500 text-slate-800 dark:text-slate-200 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Occupation
                  </label>
                  <input
                    type="text"
                    value={editForm.occupation || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, occupation: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#12121A]/50 border border-slate-200 dark:border-slate-700 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#1b5e3a] dark:focus:border-emerald-500 text-slate-800 dark:text-slate-200 transition-all"
                  />
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 bg-white dark:bg-[#1B1B25] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isUploadingImage}
                  className="px-6 py-2.5 bg-[#1b5e3a] text-white text-sm font-bold rounded-sm hover:bg-[#124228] shadow-md transition-all disabled:opacity-70 focus:outline-none flex items-center gap-2"
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
