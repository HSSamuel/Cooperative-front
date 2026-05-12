import { useState } from "react";
import apiClient from "@/lib/axios";
import toast from "react-hot-toast";

interface CommsTabProps {
  selectedMember: any;
}

export default function CommsTab({ selectedMember }: CommsTabProps) {
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  const [isSendingNotice, setIsSendingNotice] = useState(false);

  const handleSendNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle || !noticeMessage)
      return toast.error("Please fill out the message.");
    setIsSendingNotice(true);
    try {
      await apiClient.post("/notifications/admin-send", {
        targetUserId: selectedMember._id,
        title: noticeTitle,
        message: noticeMessage,
        type: "system",
      });

      toast.success("In-app notification sent to the member.");
      setNoticeTitle("");
      setNoticeMessage("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send notice.");
    } finally {
      setIsSendingNotice(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1B1B25] rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#12121A]/50">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
          Direct Notice Hub
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Push an immediate in-app alert to {selectedMember.firstName}'s
          dashboard.
        </p>
      </div>
      <form onSubmit={handleSendNotice} className="p-6 space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Notice Title
          </label>
          <input
            type="text"
            required
            value={noticeTitle}
            onChange={(e) => setNoticeTitle(e.target.value)}
            placeholder="E.g. Action Required: Update Guarantor"
            className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 rounded-sm text-sm focus:outline-none focus:border-[#1b5e3a] dark:focus:border-emerald-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Detailed Message
          </label>
          <textarea
            required
            rows={4}
            value={noticeMessage}
            onChange={(e) => setNoticeMessage(e.target.value)}
            placeholder="Type your official administrative message here..."
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 rounded-sm text-sm focus:outline-none focus:border-[#1b5e3a] dark:focus:border-emerald-500 transition-colors resize-none"
          ></textarea>
        </div>
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSendingNotice}
            className="px-6 py-2.5 bg-[#1b5e3a] hover:bg-[#124228] text-white text-sm font-bold rounded-sm shadow-md transition-all disabled:opacity-70 flex items-center gap-2"
          >
            {isSendingNotice ? "Dispatching..." : "Send Official Notice"}
            {!isSendingNotice && (
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
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
