"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState({
    firstName: "Admin",
    lastName: "",
    role: "ADMIN",
    fileNumber: "",
  });
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("coop_user");
    if (!storedUser) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(storedUser);
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      router.push("/dashboard");
      return;
    }

    setAdminUser(user);
  }, [router]);

  const handleExitConsole = () => {
    router.push("/dashboard");
  };

  const navItems = [
    {
      name: "Command Center",
      href: "/admin",
      icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
    },
    {
      name: "Member Directory",
      href: "/admin/members",
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    },
    {
      name: "HR Reports",
      href: "/admin/reports",
      icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    },
    {
      name: "System Settings",
      href: "/admin/settings",
      icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* MOBILE BACKDROP */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ADMIN SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-[#23232F] text-white flex flex-col border-r border-[#1B1B25] group overflow-hidden transition-all duration-300 ease-in-out flex-shrink-0
          w-72 lg:w-64 lg:sticky lg:top-0 lg:h-screen
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="h-20 flex items-center justify-center px-4 border-b border-[#313140] flex-shrink-0 bg-white">
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition w-full"
          >
            <Image
              src="/ascon-logo.png"
              alt="ASCON Logo"
              width={44}
              height={44}
              className="object-contain w-auto h-auto"
            />
            <div className="flex flex-col">
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
                    ? "bg-slate-100 text-slate-800 border-l-4 border-[#1b5e3a] font-bold"
                    : "text-slate-400 border-l-4 border-transparent hover:bg-white/5 hover:text-white font-medium"
                }`}
              >
                <svg
                  className={`w-5 h-5 flex-shrink-0 transition-colors ${
                    isActive ? "text-[#1b5e3a]" : "text-slate-500"
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
                <span className="whitespace-nowrap">{item.name}</span>
              </Link>
            );
          })}

          <div className="my-4 border-t border-[#313140] mx-4"></div>

          <button
            onClick={handleExitConsole}
            className="flex items-center justify-start gap-4 w-full px-6 py-3.5 transition-all duration-200 border-l-4 border-transparent text-[#00B5E2] hover:bg-white/5 hover:text-[#00B5E2] font-medium"
          >
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
            <span className="whitespace-nowrap">Exit to Coop View</span>
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 h-screen overflow-y-auto">
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
            <h1 className="text-base sm:text-lg font-bold text-slate-700 tracking-tight hidden sm:block">
              {pathname === "/admin"
                ? "Command Center"
                : pathname.includes("members")
                  ? "Member Directory"
                  : pathname.includes("settings")
                    ? "System Architecture"
                    : "Admin"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-800">
                {adminUser.lastName} {adminUser.firstName}
              </p>
              <p className="text-[10px] font-bold text-[#1b5e3a] uppercase tracking-widest">
                {adminUser.role.replace("_", " ")}
              </p>
            </div>
            <div className="h-9 w-9 rounded-sm bg-[#1b5e3a] text-white flex items-center justify-center font-bold shadow-sm">
              {adminUser.lastName.charAt(0) || "A"}
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
