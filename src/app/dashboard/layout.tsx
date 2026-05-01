"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import toast from "react-hot-toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // User State
  const [user, setUser] = useState<any>({
    firstName: "Member",
    lastName: "",
    otherName: "",
    fileNumber: "",
    role: "COOPERATOR",
  });

  // UI States
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Profile Edit Form State
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    otherName: "",
    email: "",
  });

  // Mock Notifications
  const notifications = [
    {
      id: 1,
      title: "System Update",
      message: "Welcome to the new ASCON Cooperative portal.",
      time: "1 hr ago",
      unread: true,
    },
    {
      id: 2,
      title: "Guarantor Status",
      message: "Your recent loan application is awaiting guarantor approval.",
      time: "3 hrs ago",
      unread: true,
    },
    {
      id: 3,
      title: "Savings Alert",
      message: "Your monthly deduction was successfully processed.",
      time: "2 days ago",
      unread: false,
    },
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("coop_user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setEditForm({
        firstName: parsedUser.firstName || "",
        lastName: parsedUser.lastName || "",
        otherName: parsedUser.otherName || "",
        email: parsedUser.email || "",
      });
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("coop_token");
    localStorage.removeItem("coop_user");
    router.push("/login");
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const token = localStorage.getItem("coop_token");
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/profile`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Update local storage and UI instantly
      localStorage.setItem("coop_user", JSON.stringify(res.data));
      setUser(res.data);
      toast.success("Profile updated successfully");
      setIsProfileDrawerOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click(); // Triggers the hidden file input
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const token = localStorage.getItem("coop_token");

      // 1. Upload the image to Cloudinary via our new backend route
      const uploadRes = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const newAvatarUrl = uploadRes.data.url;

      // 2. Automatically update the user's profile with the new URL
      const profileRes = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/profile`,
        { ...editForm, avatarUrl: newAvatarUrl },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      localStorage.setItem("coop_user", JSON.stringify(profileRes.data));
      setUser(profileRes.data);
      toast.success("Profile picture updated!");
    } catch (error: any) {
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const navItems = [
    {
      name: "Overview",
      href: "/dashboard",
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    },
    {
      name: "My Savings",
      href: "/dashboard/savings",
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      name: "Loan Center",
      href: "/dashboard/loans",
      icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    },
    {
      name: "Guarantor Requests",
      href: "/dashboard/guarantors",
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    },
  ];

  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  const unreadCount = notifications.filter((n) => n.unread).length;
  const displayName =
    `${user.lastName} ${user.firstName} ${user.otherName ? user.otherName : ""}`.trim();

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* MOBILE SIDEBAR BACKDROP */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-20 flex items-center px-6 border-b border-slate-800/60">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-lg">
              <Image
                src="/ascon-logo.png"
                alt="ASCON Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              ASCON<span className="text-emerald-400">Coop</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? "bg-[#1b5e3a] text-white shadow-lg shadow-[#1b5e3a]/20 font-semibold" : "text-slate-400 hover:bg-slate-800/50 hover:text-white"}`}
              >
                <svg
                  className={`w-5 h-5 transition-colors ${isActive ? "text-emerald-300" : "text-slate-500 group-hover:text-emerald-400"}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={item.icon}
                  />
                </svg>
                {item.name}
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div className="my-4 border-t border-slate-800/60 mx-2"></div>
              <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Management
              </p>
              <Link
                href="/admin"
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-amber-400 hover:bg-amber-400/10 font-semibold"
              >
                <svg
                  className="w-5 h-5 text-amber-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                Admin Console
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800/60">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="font-medium">Secure Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300 h-screen overflow-y-auto relative">
        {/* TOP NAVIGATION HEADER */}
        <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
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
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight hidden sm:block">
              Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 relative">
            {/* NOTIFICATION BELL & DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileDrawerOpen(false);
                }}
                className="relative p-2 text-slate-500 hover:text-[#1b5e3a] transition-colors rounded-full hover:bg-slate-100 focus:outline-none"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                  />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-fade-in-up">
                  <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Notifications</h3>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider cursor-pointer hover:underline">
                      Mark all read
                    </span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${notif.unread ? "bg-emerald-50/30" : ""}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4
                            className={`text-sm ${notif.unread ? "font-bold text-slate-800" : "font-medium text-slate-600"}`}
                          >
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                            {notif.time}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {notif.message}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 text-center border-t border-slate-100">
                    <button className="text-xs font-bold text-[#1b5e3a] hover:underline">
                      View all alerts
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

            {/* USER PROFILE TRIGGERS */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-800 max-w-[150px] truncate">
                  {displayName}
                </p>
                <p className="text-xs font-medium text-slate-500">
                  {user.fileNumber}
                </p>
              </div>

              <button
                onClick={() => {
                  setIsProfileDrawerOpen(true);
                  setIsNotificationsOpen(false);
                }}
                className="h-10 w-10 rounded-full bg-[#1b5e3a] text-white flex items-center justify-center font-bold shadow-md shadow-[#1b5e3a]/20 border-2 border-emerald-100 hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                title="View Profile"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  user.lastName.charAt(0) || "U"
                )}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>

      {/* ========================================== */}
      {/* COOPERATOR PROFILE SLIDE-OVER DRAWER       */}
      {/* ========================================== */}

      {isProfileDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsProfileDrawerOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-slate-200 flex flex-col ${
          isProfileDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header & Cover */}
        <div className="relative h-32 bg-[#1b5e3a] flex-shrink-0">
          <button
            onClick={() => setIsProfileDrawerOpen(false)}
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

          {/* Interactive Avatar Upload */}
          <div className="absolute -bottom-10 left-6 relative group">
            <div className="w-24 h-24 bg-white rounded-full p-1 shadow-xl">
              {/* HIDDEN FILE INPUT */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              <button
                onClick={handleAvatarClick}
                disabled={isUploadingImage}
                className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center text-4xl font-bold text-white relative overflow-hidden focus:outline-none"
              >
                {isUploadingImage ? (
                  <svg
                    className="animate-spin h-8 w-8 text-emerald-400"
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
                ) : user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.lastName.charAt(0) || "U"
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg
                    className="w-6 h-6 text-white mb-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-[9px] font-bold text-white uppercase tracking-wider">
                    Update
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Profile Overview */}
        <div className="pt-14 px-6 pb-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-slate-800 leading-none mb-1 truncate">
                {displayName}
              </h2>
              <p className="text-sm text-slate-500 font-medium">{user.email}</p>
            </div>
            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border border-slate-200">
              {user.fileNumber}
            </span>
          </div>
        </div>

        {/* Edit Form Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <form onSubmit={handleProfileUpdate} className="space-y-5">
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Personal Details
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Surname
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.lastName}
                      onChange={(e) =>
                        setEditForm({ ...editForm, lastName: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1b5e3a]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.firstName}
                      onChange={(e) =>
                        setEditForm({ ...editForm, firstName: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1b5e3a]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Other Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={editForm.otherName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, otherName: e.target.value })
                    }
                    placeholder="Middle name"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1b5e3a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1b5e3a]"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Security
              </h3>
              <button
                type="button"
                className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7z"
                  />
                </svg>
                Change Password
              </button>
            </div>

            <div className="pt-2 pb-6">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="w-full bg-[#1b5e3a] hover:bg-[#124228] text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-[#1b5e3a]/20 transition-colors disabled:opacity-70 flex items-center justify-center"
              >
                {isSavingProfile ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                ) : (
                  "Save Profile Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
