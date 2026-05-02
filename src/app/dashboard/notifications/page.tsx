"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function NotificationsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("coop_token");
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Map MongoDB document to our UI structure
      const formattedNotifs = res.data.map((n: any) => {
        const dateObj = new Date(n.createdAt);
        return {
          id: n._id,
          title: n.title,
          message: n.message,
          // E.g. "May 2, 2026"
          date: dateObj.toLocaleDateString(undefined, {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
          // E.g. "02:23 AM"
          time: dateObj.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          }),
          unread: !n.isRead,
          type: n.type || "info",
        };
      });

      setNotifications(formattedNotifs);
    } catch (error) {
      console.error("Failed to load notifications", error);
      toast.error("Failed to sync latest alerts.");
    } finally {
      setIsLoading(false);
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
      toast.success("All notifications marked as read.");
    } catch (error) {
      toast.error("Failed to update status on server.");
    }
  };

  const handleMarkAsRead = async (id: string) => {
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
      toast.error("Failed to mark as read.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("coop_token");
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setNotifications(notifications.filter((n) => n.id !== id));
      toast.success("Alert permanently deleted.");
    } catch (error) {
      toast.error("Failed to delete notification.");
    }
  };

  const filteredNotifications =
    filter === "ALL" ? notifications : notifications.filter((n) => n.unread);

  // Dynamically renders icons based on the backend Notification schema 'type' enum
  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return (
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        );
      case "financial":
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
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
        );
      case "system":
        return (
          <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
            </svg>
          </div>
        );
      case "danger":
        return (
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        );
      default:
        // Default "info" styling
        return (
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
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
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
    }
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
    <div className="animate-fade-in-up pb-10 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            Notification Center
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Manage your personal alerts and system updates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-slate-200/50 rounded-xl border border-slate-200">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === "ALL" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("UNREAD")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === "UNREAD" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Unread
            </button>
          </div>

          <button
            onClick={handleMarkAllRead}
            disabled={!notifications.some((n) => n.unread)}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-[#1b5e3a] hover:border-[#1b5e3a]/30 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group"
            title="Mark all as read"
          >
            <svg
              className="w-5 h-5 group-hover:scale-110 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-slate-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-700">
              You're all caught up!
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              There are no {filter === "UNREAD" ? "unread " : ""}notifications
              to display right now.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-6 sm:p-8 flex flex-col sm:flex-row gap-4 sm:gap-6 transition-colors group relative ${notif.unread ? "bg-emerald-50/20" : "hover:bg-slate-50/50"}`}
              >
                {/* Unread Indicator Dot */}
                {notif.unread && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                )}

                {/* Left Side: Icon */}
                {getIcon(notif.type)}

                {/* Middle: Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4 mb-2">
                    <h3
                      className={`text-base sm:text-lg ${notif.unread ? "font-bold text-slate-800" : "font-semibold text-slate-700"}`}
                    >
                      {notif.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 whitespace-nowrap">
                      <span>{notif.date}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span>{notif.time}</span>
                    </div>
                  </div>
                  <p
                    className={`text-sm leading-relaxed ${notif.unread ? "text-slate-600" : "text-slate-500"}`}
                  >
                    {notif.message}
                  </p>
                </div>

                {/* Right Side: Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between mt-4 sm:mt-0 pt-4 sm:pt-0 border-t border-slate-100 sm:border-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity gap-2">
                  {notif.unread ? (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                    >
                      Mark Read
                    </button>
                  ) : (
                    <span className="text-xs font-medium text-slate-400 px-3 py-1.5">
                      Read
                    </span>
                  )}

                  <button
                    onClick={() => handleDelete(notif.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete permanently"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
