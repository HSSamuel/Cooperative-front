"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/axios";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [fileNumber, setFileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // 🚀 Clean apiClient call
      const response = await apiClient.post("/auth/login", {
        fileNumber,
        password,
      });

      // 🚀 Token is now securely stored in an HttpOnly cookie by the backend!
      // We only store the non-sensitive user profile data in localStorage.
      localStorage.setItem("coop_user", JSON.stringify(response.data.user));

      toast.success("Welcome back!");
      if (
        response.data.user.role === "ADMIN" ||
        response.data.user.role === "SUPER_ADMIN"
      )
        router.push("/admin");
      else router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fe] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
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
            <span className="font-black text-sm sm:text-base tracking-widest text-slate-500 uppercase leading-tight">
              ASCON
            </span>
            <span className="font-bold text-xl sm:text-2xl tracking-tight text-[#1b5e3a] leading-tight">
              Co-operative
            </span>
          </div>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:p-10 shadow-sm border border-slate-200 rounded-sm mx-4 sm:mx-0">
          <h2 className="text-xl font-bold text-slate-800 text-center mb-6">
            Sign In
          </h2>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ASCON File Number
              </label>
              <input
                type="text"
                required
                value={fileNumber}
                onChange={(e) => setFileNumber(e.target.value)}
                placeholder="ASCON-001"
                className="block w-full px-4 py-2.5 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-[#1b5e3a]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-[#1b5e3a] hover:text-[#124228]"
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
                  className="block w-full pl-4 pr-10 py-2.5 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-[#1b5e3a]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
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

          <p className="mt-8 text-center text-xs text-slate-500">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-bold text-[#1b5e3a] hover:underline"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
