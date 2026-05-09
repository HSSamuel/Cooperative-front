"use client";

import { useState, Suspense } from "react";
// 🚀 FIX: Import useSearchParams
import { useRouter, useSearchParams } from "next/navigation";
import apiClient from "@/lib/axios";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";

// 🚀 FIX: Extract the form logic into a sub-component so it can be wrapped in Suspense
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [fileNumber, setFileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await apiClient.post("/auth/login", {
        fileNumber,
        password,
      });

      // 1. Save ONLY the user profile data to local storage.
      // The browser has already automatically saved the HttpOnly token cookie!
      localStorage.setItem("coop_user", JSON.stringify(response.data.user));

      toast.success("Welcome back!");

      const redirectUrl = searchParams.get("redirect");

      // 2. Redirect using window.location.href to force a hard navigation,
      // ensuring the browser attaches the new cookie to subsequent requests.
      if (redirectUrl) {
        window.location.href = decodeURIComponent(redirectUrl);
      } else if (
        response.data.user.role === "ADMIN" ||
        response.data.user.role === "SUPER_ADMIN"
      ) {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleLogin}>
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
          ASCON File Number
        </label>
        <input
          type="text"
          required
          value={fileNumber}
          onChange={(e) => setFileNumber(e.target.value)}
          placeholder="ASCON-001"
          className="block w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 rounded-sm text-sm focus:outline-none focus:border-[#1b5e3a] dark:focus:border-emerald-500 transition-colors"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-[#1b5e3a] dark:text-emerald-400 hover:text-[#124228] dark:hover:text-emerald-300"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
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

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 px-4 bg-[#1b5e3a] hover:bg-[#124228] text-white text-sm font-bold rounded-sm shadow-sm transition-colors disabled:opacity-70 mt-2"
      >
        {isLoading ? "Authenticating..." : "Login"}
      </button>
    </form>
  );
}

export default function LoginPage() {
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

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[#1B1B25] py-8 px-6 sm:p-10 shadow-sm border border-slate-200 dark:border-slate-800 rounded-sm mx-4 sm:mx-0 transition-colors">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 text-center mb-6">
            Sign In
          </h2>

          {/* 🚀 FIX: Wrap the form in Suspense to prevent build errors with useSearchParams */}
          <Suspense fallback={<div className="text-center py-4 text-slate-500 font-bold">Verifying security parameters...</div>}>
            <LoginForm />
          </Suspense>

          <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-bold text-[#1b5e3a] dark:text-emerald-400 hover:underline"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}