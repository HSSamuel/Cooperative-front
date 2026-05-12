"use client";

import { useState, useEffect } from "react";
import apiClient from "@/lib/axios";
import toast from "react-hot-toast";
import MemberDetailModal from "./components/MemberDetailModal";

export default function MemberDirectoryPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [allLoans, setAllLoans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

const fetchInitialData = async () => {
  try {
    const [membersRes, loansRes] = await Promise.all([
      // 🚀 FIX: Increased limit from 50 to 5000 to capture ALL cooperators in the directory
      apiClient.get("/auth/all-members?page=1&limit=5000"),
      apiClient.get("/loans/all").catch(() => ({ data: [] })),
    ]);
    setMembers(membersRes.data.users || membersRes.data);
    setAllLoans(loansRes.data);
  } catch (error) {
    toast.error("Failed to load member directory.");
  } finally {
    setIsLoading(false);
  }
};

  const filteredMembers = members
    .filter((member) => {
      const term = searchQuery.toLowerCase();
      return (
        (member.firstName?.toLowerCase() || "").includes(term) ||
        (member.lastName?.toLowerCase() || "").includes(term) ||
        (member.fileNumber?.toLowerCase() || "").includes(term)
      );
    })
    .sort((a, b) => {
      const aIsAdmin = a.role?.includes("ADMIN");
      const bIsAdmin = b.role?.includes("ADMIN");

      if (aIsAdmin && !bIsAdmin) return -1; // Move a up
      if (!aIsAdmin && bIsAdmin) return 1; // Move b up
      return 0;
    });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-sm"></div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-sm"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="bg-white dark:bg-[#1B1B25] rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm p-6 transition-colors">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">
              Member Directory
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage {members.length} registered staff members.
            </p>
          </div>
          <input
            type="text"
            placeholder="Search name or file no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-slate-500 dark:focus:border-slate-400 w-full sm:w-72 transition-colors"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold transition-colors">
                <th className="py-3 px-4">PROFILE</th>
                <th className="py-3 px-4">FILE NUMBER</th>
                <th className="py-3 px-4">SYSTEM ROLE</th>
                <th className="py-3 px-4">JOINED DATE</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-slate-500 dark:text-slate-400"
                  >
                    No members match your search.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr
                    key={member._id}
                    onClick={() => setSelectedMember(member)}
                    className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-[#12121A]/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm bg-[#2B2F42] text-white flex items-center justify-center font-bold text-xs overflow-hidden shadow-sm">
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          member.lastName?.charAt(0) || "U"
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {member.lastName} {member.firstName}{" "}
                          {member.otherName || ""}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {member.email}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">
                      {member.fileNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider ${member.role.includes("ADMIN") ? "bg-[#2B2F42] text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"}`}
                      >
                        {member.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      {new Date(
                        member.dateJoined || member.createdAt,
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedMember && (
        <MemberDetailModal
          selectedMember={selectedMember}
          allLoans={allLoans}
          closeModal={() => setSelectedMember(null)}
          refreshInitialData={fetchInitialData}
        />
      )}
    </div>
  );
}
