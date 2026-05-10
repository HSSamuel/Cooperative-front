"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/axios";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otherName, setOtherName] = useState("");
  const [email, setEmail] = useState("");
  const [fileNumber, setFileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiClient.post("/auth/register", {
        firstName,
        lastName,
        otherName,
        email,
        fileNumber,
        password,
      });
      toast.success("Account created successfully! Please log in.");
      router.push("/login");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Failed to create account. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fe] dark:bg-[#12121A] flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 flex justify-center">
        <Link
          href="/"
          className="flex items-center justify-center gap-3 hover:opacity-80 transition w-full"
        >
          <Image
            src="/ascon-logo.png"
            alt="ASCON Logo"
            width={44}
            height={44}
            className="object-contain w-auto h-auto"
          />
          <div className="flex flex-col">
            <span className="font-black text-sm sm:text-base tracking-widest text-slate-500 dark:text-slate-400 uppercase leading-tight">
              ASCON
            </span>
            <span className="font-bold text-xl sm:text-2xl tracking-tight text-[#1b5e3a] dark:text-emerald-400 leading-tight">
              Co-operative
            </span>
          </div>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white dark:bg-[#1B1B25] py-8 px-6 sm:p-10 shadow-sm border border-slate-200 dark:border-slate-800 rounded-sm mx-4 sm:mx-0 transition-colors">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">
              Create your account
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Join the cooperative and start saving today.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleRegister}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Surname
                </label>
                <input
                  id="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="block w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 rounded-sm text-sm focus:outline-none focus:border-[#1b5e3a] dark:focus:border-emerald-500 transition-colors"
                />
              </div>
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="block w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 rounded-sm text-sm focus:outline-none focus:border-[#1b5e3a] dark:focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="otherName"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Other Name{" "}
                <span className="text-slate-400 dark:text-slate-500 font-normal">
                  (Optional)
                </span>
              </label>
              <input
                id="otherName"
                type="text"
                value={otherName}
                onChange={(e) => setOtherName(e.target.value)}
                className="block w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 rounded-sm text-sm focus:outline-none focus:border-[#1b5e3a] dark:focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                // 🚀 FIX: Auto-lowercase and trim spaces for emails
                onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
                className="block w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 rounded-sm text-sm focus:outline-none focus:border-[#1b5e3a] dark:focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="fileNumber"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                ASCON File Number
              </label>
              <input
                id="fileNumber"
                type="text"
                required
                value={fileNumber}
                // 🚀 FIX: Auto-uppercase and trim spaces as the user types
                onChange={(e) =>
                  setFileNumber(e.target.value.trim().toUpperCase())
                }
                placeholder="ASCON-001"
                className="block w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 rounded-sm text-sm focus:outline-none focus:border-[#1b5e3a] dark:focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a secure password"
                  className="block w-full pl-4 pr-10 py-2.5 border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 rounded-sm text-sm focus:outline-none focus:border-[#1b5e3a] dark:focus:border-emerald-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                >
                  {showPassword ? (
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  ) : (
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
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#1b5e3a] hover:bg-[#124228] text-white text-sm font-bold rounded-sm shadow-sm transition-colors disabled:opacity-70 mt-2"
              >
                {isLoading ? "Creating account..." : "Complete Registration"}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Already a member?{" "}
              <Link
                href="/login"
                className="font-bold text-[#1b5e3a] dark:text-emerald-400 hover:underline transition"
              >
                Sign in to your account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
