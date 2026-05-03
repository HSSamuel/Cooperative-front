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

  // 🚀 NEW: State to hold the deep financial account data (specifically the dateJoined)
  const [userAccountData, setUserAccountData] = useState<any>(null);

  // UI States
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Profile Edit Form State
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    otherName: "",
    email: "",
  });

  // Interactive Notification State
  const [notifications, setNotifications] = useState<any[]>([]);

  // Password Change States
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });

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
      fetchNotifications();
      fetchAccountData(); // 🚀 NEW: Fetch the official records
    } else {
      router.push("/login");
    }
  }, [router]);

  // 🚀 NEW: Function to get the locked official date
  const fetchAccountData = async () => {
    try {
      const token = localStorage.getItem("coop_token");
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/account/my-account`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setUserAccountData(res.data);
    } catch (error) {
      console.error("Failed to load account data for profile drawer.");
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("coop_token");
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const formattedNotifs = res.data.map((n: any) => ({
        id: n._id,
        title: n.title,
        message: n.message,
        time: new Date(n.createdAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        unread: !n.isRead,
        type: n.type || "info",
      }));
      setNotifications(formattedNotifs);
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  };

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
    fileInputRef.current?.click();
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
      const profileRes = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/profile`,
        { ...editForm, avatarUrl: newAvatarUrl },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      localStorage.setItem("coop_user", JSON.stringify(profileRes.data));
      setUser(profileRes.data);
      toast.success("Profile picture updated!");
    } catch (error: any) {
      console.error("FULL ERROR DETECTED:", error);
      const realErrorMessage =
        error.response?.data?.message || error.message || "Unknown Error";
      toast.error(`Upload Failed: ${realErrorMessage}`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error("Please enter both your current and new passwords.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const token = localStorage.getItem("coop_token");
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/update-password`,
        passwordData,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success("Security credentials successfully updated.");
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: "", newPassword: "" });
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update password.",
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem("coop_token");
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setNotifications(notifications.map((n) => ({ ...n, unread: false })));
      toast.success("All caught up!");
    } catch (error) {
      toast.error("Failed to update status on server.");
    }
  };

  const handleNotificationClick = async (id: string) => {
    try {
      const token = localStorage.getItem("coop_token");
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, unread: false } : n)),
      );
    } catch (error) {
      console.error("Failed to mark as read");
    }
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("coop_token");
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const handleViewAllAlerts = () => {
    setIsNotificationsOpen(false);
    router.push("/dashboard/notifications");
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

  // Helper to determine the official join date string
  const getOfficialDateString = () => {
    if (!userAccountData?.cooperatorId) return "Loading...";
    const dateToUse =
      userAccountData.cooperatorId.dateJoined ||
      userAccountData.cooperatorId.createdAt;
    if (!dateToUse) return "Not Set";
    return new Date(dateToUse).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

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
        className={`fixed inset-y-0 left-0 z-50 bg-slate-900 text-white flex flex-col border-r border-slate-800/60 group overflow-hidden transition-all duration-300 ease-in-out flex-shrink-0
          w-72 lg:w-20 lg:hover:w-72 lg:sticky lg:top-0 lg:h-screen
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="h-20 flex items-center px-5 border-b border-slate-800/60 flex-shrink-0">
          <Link href="/dashboard" className="flex items-center gap-4 w-full">
            <div className="bg-white p-1.5 rounded-lg flex-shrink-0">
              <Image
                src="/ascon-logo.png"
                alt="ASCON Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div className="whitespace-nowrap transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-100">
              <span className="font-bold text-xl tracking-tight text-white block leading-tight">
                ASCON<span className="text-emerald-400">Coop</span>
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-4 px-3 py-3.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-[#1b5e3a] text-white shadow-lg shadow-[#1b5e3a]/20 font-semibold"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <svg
                  className={`w-6 h-6 flex-shrink-0 transition-colors ${
                    isActive ? "text-emerald-300" : "text-slate-500"
                  }`}
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
                <span className="whitespace-nowrap transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-100 lg:group-hover:delay-100">
                  {item.name}
                </span>
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div className="my-4 border-t border-slate-800/60 mx-2"></div>
              <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-100 whitespace-nowrap">
                Management
              </p>
              <Link
                href="/admin"
                className="flex items-center gap-4 px-3 py-3.5 rounded-xl transition-all duration-200 text-amber-400 hover:bg-amber-400/10 font-semibold"
              >
                <svg
                  className="w-6 h-6 flex-shrink-0 text-amber-500"
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
                <span className="whitespace-nowrap transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-100 lg:group-hover:delay-100">
                  Admin Page
                </span>
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800/60 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center justify-start gap-4 w-full px-3 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors overflow-hidden"
          >
            <svg
              className="w-6 h-6 flex-shrink-0"
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
            <span className="font-medium whitespace-nowrap transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-100 lg:group-hover:delay-100">
              Secure Logout
            </span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 h-screen overflow-y-auto relative">
        <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 h-20 flex-shrink-0 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
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

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileDrawerOpen(false);
                }}
                className="relative p-2 text-slate-500 hover:text-[#1b5e3a] transition-colors rounded-full hover:bg-slate-100 focus:outline-none z-50"
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
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsNotificationsOpen(false)}
                />
              )}

              {isNotificationsOpen && (
                <div className="fixed inset-x-4 top-20 sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-3 w-auto sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-fade-in-up">
                  <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider cursor-pointer hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-[60vh] sm:max-h-[300px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-sm font-medium">
                        You have no new notifications.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif.id)}
                          className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group relative ${
                            notif.unread ? "bg-emerald-50/30" : ""
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1 pr-6">
                            <h4
                              className={`text-sm ${notif.unread ? "font-bold text-slate-800" : "font-medium text-slate-600"}`}
                            >
                              {notif.title}
                            </h4>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                              {notif.time}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2 pr-6">
                            {notif.message}
                          </p>
                          <button
                            onClick={(e) =>
                              handleDeleteNotification(notif.id, e)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
                            title="Delete notification"
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
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 text-center border-t border-slate-100 bg-slate-50">
                    <button
                      onClick={handleViewAllAlerts}
                      className="text-xs font-bold text-[#1b5e3a] hover:underline"
                    >
                      View all alerts
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

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

          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 group z-10">
            <div className="w-24 h-24 bg-white rounded-full p-1 shadow-xl">
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

        <div className="pt-16 px-6 pb-5 border-b border-slate-100 flex-shrink-0 flex flex-col items-center text-center">
          <h2 className="text-xl font-bold text-slate-800 leading-tight mb-1 w-full truncate">
            {displayName}
          </h2>
          <p className="text-sm text-slate-500 font-medium mb-3">
            {user.email}
          </p>
          <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-3 py-1.5 rounded-md uppercase tracking-wider border border-slate-200">
            {user.role.replace("_", " ")}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 custom-scrollbar">
          <form onSubmit={handleProfileUpdate} className="flex flex-col h-full">
            {/* 🚀 NEW: LOCKED OFFICIAL RECORDS PANEL */}
            <div className="bg-slate-200/50 rounded-2xl p-5 border border-slate-200 shadow-inner mb-6 flex-shrink-0">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Official Records
                </h3>
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                    ASCON File Number
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user.fileNumber || ""}
                    className="w-full px-3 py-2 bg-slate-200/50 border border-slate-200 rounded-lg text-sm text-slate-600 font-bold cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                    Official Date Joined
                  </label>
                  <input
                    type="text"
                    disabled
                    value={getOfficialDateString()}
                    className="w-full px-3 py-2 bg-slate-200/50 border border-slate-200 rounded-lg text-sm text-slate-600 font-bold cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm mb-6 flex-shrink-0">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Editable Details
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

            {showPasswordForm && (
              <div className="bg-slate-800 rounded-2xl p-5 shadow-inner mb-6 flex-shrink-0 animate-fade-in-up">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Update Security Key
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(false)}
                    className="text-slate-400 hover:text-white transition-colors"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Current Password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                      className="w-full pl-3 pr-10 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400 focus:outline-none"
                    >
                      {showCurrentPassword ? (
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
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.275 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="New Password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      className="w-full pl-3 pr-10 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400 focus:outline-none"
                    >
                      {showNewPassword ? (
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
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.275 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handlePasswordUpdate}
                    disabled={isUpdatingPassword}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl transition-colors disabled:opacity-70 text-sm mt-2"
                  >
                    {isUpdatingPassword
                      ? "Encrypting..."
                      : "Confirm New Password"}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-auto pt-2 pb-2">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className={`w-full sm:w-1/2 py-3 px-4 border rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm ${
                    showPasswordForm
                      ? "bg-slate-100 border-slate-300 text-slate-400"
                      : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7z"
                    />
                  </svg>
                  {showPasswordForm ? "Cancel" : "Password"}
                </button>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full sm:w-1/2 bg-[#1b5e3a] hover:bg-[#124228] text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-[#1b5e3a]/20 transition-colors disabled:opacity-70 flex items-center justify-center text-sm"
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
                    "Save Profile"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
