"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import apiClient from "@/lib/axios";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import { syncAuthCookie } from "../actions/auth";

function LoginForm({
  isLoading,
  setIsLoading,
}: {
  isLoading: boolean;
  setIsLoading: (state: boolean) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [fileNumber, setFileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 🚀 FIX: Detect if we were forcefully logged out via the URL parameter
  useEffect(() => {
    const clear = searchParams.get("clear");
    const reason = searchParams.get("reason");

    if (clear === "true") {
      localStorage.removeItem("coop_user");
      localStorage.removeItem("coop_token_raw");

      if (reason === "maintenance") {
        toast.error("System is under maintenance. Please try again later.", {
          id: "maintenance-toast",
        });
      } else {
        toast.error("Your session has expired. Please log in again.", {
          id: "expired-toast",
        });
      }

      router.replace("/login"); // Clean up the URL bar
    }
  }, [searchParams, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await apiClient.post("/auth/login", {
        fileNumber,
        password,
      });

      const token = response.data?.token;
      if (!token) {
        toast.error(
          "Backend missing token. Ensure backend changes are deployed.",
        );
        setIsLoading(false);
        return;
      }

      try {
        await syncAuthCookie(token);
      } catch (syncErr) {
        console.warn("Next.js Server Action sync bypassed.");
      }

      localStorage.setItem("coop_user", JSON.stringify(response.data.user));
      localStorage.setItem("coop_token_raw", token);
      toast.success("Welcome back!");

      const redirectUrl = searchParams.get("redirect");

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
      toast.error(
        err.response?.data?.message || err.message || "Invalid credentials.",
      );
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
          onChange={(e) =>
            setFileNumber(e.target.value.replace(/\s+/g, "").toUpperCase())
          }
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
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1b5e3a] hover:bg-[#124228] text-white text-sm font-bold rounded-sm shadow-sm transition-colors disabled:opacity-70 mt-2"
      >
        {isLoading ? "Authenticating..." : "Login"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f9fe] dark:bg-[#12121A] flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors relative">
      {isLoading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/70 dark:bg-[#12121A]/80 backdrop-blur-sm transition-all duration-300">
          <div className="relative flex items-center justify-center w-24 h-24">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-100/50 dark:border-emerald-900/30 border-t-[#1b5e3a] dark:border-t-emerald-400 animate-spin"></div>
            <img
              src="/ascon-logo.png"
              alt="Authenticating..."
              className="w-12 h-12 object-contain animate-[spin_3s_linear_infinite]"
            />
          </div>

          <p className="mt-5 text-sm font-bold text-[#1b5e3a] dark:text-emerald-400 animate-pulse tracking-wide">
            Securing Connection...
          </p>
        </div>
      )}

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

          <Suspense
            fallback={
              <div className="text-center py-4 text-slate-500 font-bold">
                Verifying security parameters...
              </div>
            }
          >
            <LoginForm isLoading={isLoading} setIsLoading={setIsLoading} />
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
