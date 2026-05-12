import apiClient from "@/lib/axios";
import toast from "react-hot-toast";

interface IdentityTabProps {
  selectedMember: any;
  memberAccount: any;
}

export default function IdentityTab({
  selectedMember,
  memberAccount,
}: IdentityTabProps) {
  const executePasswordReset = async () => {
    try {
      await apiClient.post("/auth/forgot-password", {
        email: selectedMember.email,
      });
      toast.success("Password reset link sent to member's email.");
    } catch (error) {
      toast.error("Failed to send reset link.");
    }
  };

  const handlePasswordResetTrigger = () => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } max-w-sm w-full bg-white dark:bg-[#1B1B25] shadow-2xl rounded-2xl pointer-events-auto flex flex-col ring-1 ring-black/5 dark:ring-white/10 border border-slate-100 dark:border-slate-800 p-5`}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Send Reset Link
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Are you sure you want to email a secure password reset link to{" "}
                <span className="font-semibold">{selectedMember.email}</span>?
              </p>
            </div>
          </div>
          <div className="mt-5 flex gap-3 justify-end">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                executePasswordReset();
              }}
              className="px-4 py-2 text-xs font-bold text-white rounded-lg transition-colors shadow-sm bg-blue-500 hover:bg-blue-600"
            >
              Yes, Send Link
            </button>
          </div>
        </div>
      ),
      { duration: Infinity, id: `confirm-reset-${selectedMember?._id}` },
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="bg-white dark:bg-[#1B1B25] p-5 rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            Bio-Data
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                First Name
              </p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {selectedMember.firstName}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                Other Name
              </p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {selectedMember.otherName || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                Surname
              </p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {selectedMember.lastName}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                Gender
              </p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {selectedMember.gender || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                Mobile
              </p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {selectedMember.mobile || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white dark:bg-[#1B1B25] p-5 rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            Security & Access
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Password Reset
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Send a secure recovery link.
                </p>
              </div>
              <button
                onClick={handlePasswordResetTrigger}
                className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold px-3 py-1.5 rounded-sm transition-colors"
              >
                Send Link
              </button>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  System Role
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Current access level.
                </p>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider ${
                  selectedMember.role.includes("ADMIN")
                    ? "bg-[#2B2F42] text-white"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                {selectedMember.role.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
