"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import apiClient from "@/lib/axios";
import toast from "react-hot-toast";
import { useSocket } from "../../hooks/useSocket";
import { useDispatch } from "react-redux";
import { fetchFinancialData, clearFinanceData } from "../../store/financeSlice";
import type { AppDispatch } from "../../store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [user, setUser] = useState<any>({
    firstName: "Member",
    lastName: "",
    otherName: "",
    fileNumber: "",
    role: "COOPERATOR",
    avatarUrl: "",
  });

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const socket = useSocket(user?._id || user?.id);

  useEffect(() => {
    if (!socket) return;

    const fetchFreshNotifications = async () => {
      try {
        const res = await apiClient.get("/notifications");

        // 🚀 THE FIX: Filter out Login and Logout notifications
        const formattedNotifs = res.data
          .filter(
            (n: any) =>
              !n.title.toLowerCase().includes("login") &&
              !n.title.toLowerCase().includes("logout"),
          )
          .map((n: any) => {
            const dateObj = new Date(n.createdAt);
            return {
              id: n._id,
              title: n.title,
              message: n.message,
              time:
                dateObj.toLocaleDateString() +
                " " +
                dateObj.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              unread: !n.isRead,
              type: n.type || "info",
            };
          });

        setNotifications(formattedNotifs);
      } catch (error) {
        console.error("Silent fetch failed", error);
      }
    };

    socket.on("new_guarantor_request", fetchFreshNotifications);
    socket.on("update_notifications", fetchFreshNotifications);

    return () => {
      socket.off("new_guarantor_request", fetchFreshNotifications);
      socket.off("update_notifications", fetchFreshNotifications);
    };
  }, [socket]);

  useEffect(() => {
    const storedUser = localStorage.getItem("coop_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      fetchNotifications();

      dispatch(fetchFinancialData());
    } else {
      router.push("/login");
    }
  }, [router, dispatch]);

  const fetchNotifications = async () => {
    try {
      const res = await apiClient.get("/notifications");

      // 🚀 THE FIX: Filter out Login and Logout notifications
      const formattedNotifs = res.data
        .filter(
          (n: any) =>
            !n.title.toLowerCase().includes("login") &&
            !n.title.toLowerCase().includes("logout"),
        )
        .map((n: any) => ({
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

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout error", error);
    }

    localStorage.removeItem("coop_user");
    dispatch(clearFinanceData());
    router.push("/login");
  };

  const handleToggleNotifications = async () => {
    setIsNotificationsOpen(!isNotificationsOpen);

    // If we are opening the panel and there are unread notifications, clear them instantly
    if (!isNotificationsOpen && unreadCount > 0) {
      try {
        await apiClient.put("/notifications/read-all", {});
        // Update local state to remove the red badge immediately
        setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
      } catch (error) {
        console.error("Failed to mark notifications as read", error);
      }
    }
  };

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    },
    {
      name: "Savings",
      href: "/dashboard/savings",
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      name: "Loans",
      href: "/dashboard/loans",
      icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    },
    {
      name: "Guarantors",
      href: "/dashboard/guarantors",
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    },
  ];

  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="min-h-screen bg-[#f8f9fe] flex overflow-hidden">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-[#1b5e3a] text-white flex flex-col border-r border-[#124228] group overflow-hidden transition-all duration-300 ease-in-out flex-shrink-0
          w-72 lg:w-20 lg:hover:w-64 lg:sticky lg:top-0 lg:h-screen
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="h-16 flex items-center justify-center px-4 border-b border-[#124228] flex-shrink-0 bg-white">
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition w-full overflow-hidden"
          >
            <Image
              src="/ascon-logo.png"
              alt="ASCON Logo"
              width={44}
              height={44}
              className="object-contain w-auto h-auto flex-shrink-0"
            />
            <div className="flex flex-col lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 overflow-hidden">
              <span className="font-black text-sm sm:text-base tracking-widest text-slate-500 uppercase leading-tight">
                ASCON
              </span>
              <span className="font-bold text-xl sm:text-2xl tracking-tight text-[#1b5e3a] leading-tight">
                Co-operative
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-4 px-6 py-3.5 transition-all duration-200 ${
                  isActive
                    ? "bg-white text-[#1b5e3a] font-bold shadow-sm"
                    : "text-emerald-100/70 border-l-4 border-transparent hover:bg-white/10 hover:text-white font-medium"
                }`}
              >
                <svg
                  className={`w-5 h-5 flex-shrink-0 transition-colors ${
                    isActive ? "text-[#1b5e3a]" : "text-emerald-300/50"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={isActive ? 2.5 : 2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={item.icon}
                  />
                </svg>
                <span className="whitespace-nowrap lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                  {item.name}
                </span>
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div className="my-4 border-t border-[#124228] mx-4"></div>
              <Link
                href="/admin"
                className="flex items-center gap-4 px-6 py-3.5 transition-all duration-200 border-l-4 border-transparent text-amber-300 hover:bg-white/10 hover:text-amber-200 font-medium"
              >
                <svg
                  className="w-5 h-5 flex-shrink-0 text-amber-300/70"
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
                <span className="whitespace-nowrap lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                  Administration
                </span>
              </Link>
            </>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center justify-start gap-4 w-full px-6 py-3.5 transition-all duration-200 border-l-4 border-transparent text-emerald-100/70 hover:bg-white/10 hover:text-white font-medium mt-auto"
          >
            <svg
              className="w-5 h-5 flex-shrink-0 text-emerald-300/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="whitespace-nowrap lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
              Log Out
            </span>
          </button>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 h-screen overflow-y-auto relative">
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm h-16 flex-shrink-0 px-4 sm:px-6 lg:px-8 flex items-center justify-between mx-4 mt-4 rounded-sm">
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
            <h1 className="text-sm sm:text-base font-bold text-slate-700 tracking-tight hidden sm:block">
              ASCON Staff Multi-Purpose Cooperative
            </h1>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative">
              <button
                onClick={handleToggleNotifications}
                className="relative p-1 text-slate-400 hover:text-[#1b5e3a] transition-colors"
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
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border-2 border-white shadow-sm">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsNotificationsOpen(false)}
                  />
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-sm shadow-xl border border-slate-200 overflow-hidden z-50 animate-fade-in-up">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                      <h3 className="font-bold text-slate-700 text-sm">
                        Notifications
                      </h3>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-500 text-xs font-medium">
                          No new notifications.
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                              notif.unread ? "bg-slate-50/50" : ""
                            }`}
                          >
                            <h4
                              className={`text-xs ${notif.unread ? "font-bold text-slate-800" : "font-medium text-slate-600"}`}
                            >
                              {notif.title}
                            </h4>
                            <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">
                              {notif.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-3 text-center border-t border-slate-100 bg-slate-50">
                      <Link
                        href="/dashboard/notifications"
                        onClick={() => setIsNotificationsOpen(false)}
                        className="text-xs font-bold text-[#1b5e3a] hover:underline"
                      >
                        View all alerts
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="relative cursor-pointer hover:opacity-80 transition-opacity">
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-3"
              >
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-slate-800">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-[10px] font-bold text-[#1b5e3a] uppercase tracking-widest">
                    {user.role ? user.role.replace("_", " ") : "COOPERATOR"}
                  </p>
                </div>

                <div className="h-9 w-9 rounded-full bg-slate-200 border border-slate-300 shadow-sm overflow-hidden flex items-center justify-center font-bold text-slate-500 relative">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.lastName?.charAt(0) || "U"
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#20C997] rounded-full border-2 border-white"></span>
                </div>
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
