"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [fileNumber, setFileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // NEW STATE
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          fileNumber,
          password,
        },
      );

      localStorage.setItem("coop_token", response.data.token);
      localStorage.setItem("coop_user", JSON.stringify(response.data.user));

      toast.success("Welcome back!");

      if (
        response.data.user.role === "ADMIN" ||
        response.data.user.role === "SUPER_ADMIN"
      ) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Invalid credentials. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-[#1b5e3a]/20">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#1b5e3a]/5 blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link
          href="/"
          className="flex justify-center items-center gap-3 mb-8 hover:opacity-80 transition group"
        >
          <Image
            src="/ascon-logo.png"
            alt="ASCON Logo"
            width={48}
            height={48}
            className="object-contain group-hover:scale-105 transition duration-300"
          />
          <span className="font-bold text-3xl tracking-tight text-slate-900">
            ASCON<span className="text-[#1b5e3a]">Coop</span>
          </span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/60 py-8 px-5 sm:py-10 shadow-2xl shadow-[#1b5e3a]/10 rounded-2xl sm:rounded-3xl sm:px-12 border border-white/60 backdrop-blur-xl mx-4 sm:mx-0">
          <div className="mb-6 sm:mb-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 sm:mt-2">
              Enter your credentials to access your account.
            </p>
          </div>

          <form className="space-y-4 sm:space-y-6" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="fileNumber"
                className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5"
              >
                ASCON File Number
              </label>
              <div className="relative">
                <input
                  id="fileNumber"
                  type="text"
                  required
                  value={fileNumber}
                  onChange={(e) => setFileNumber(e.target.value)}
                  placeholder="ASCON-001"
                  className="appearance-none block w-full px-4 py-3 sm:py-3.5 border border-white/40 rounded-xl shadow-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1b5e3a]/30 focus:border-[#1b5e3a] text-sm sm:text-base transition duration-200 bg-white/40 focus:bg-white/90"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs sm:text-sm font-semibold text-slate-800"
                >
                  Password
                </label>
                <div className="text-xs sm:text-sm">
                  <a
                    href="#"
                    className="font-medium text-[#1b5e3a] hover:text-[#124228] transition"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"} // TOGGLE TYPE
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="appearance-none block w-full pl-4 pr-12 py-3 sm:py-3.5 border border-white/40 rounded-xl shadow-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1b5e3a]/30 focus:border-[#1b5e3a] text-sm sm:text-base transition duration-200 bg-white/40 focus:bg-white/90"
                />
                {/* EYE ICON BUTTON */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 hover:text-[#1b5e3a] transition-colors focus:outline-none"
                >
                  {showPassword ? (
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
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
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
                className="w-full flex justify-center py-3 sm:py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-[#1b5e3a]/20 text-sm font-bold text-white bg-[#1b5e3a] hover:bg-[#124228] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1b5e3a] transition-all duration-200 disabled:opacity-70 transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
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
                    Authenticating...
                  </span>
                ) : (
                  "Sign in securely"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 sm:mt-8 pt-5 border-t border-slate-200/50 text-center">
            <p className="text-xs sm:text-sm text-slate-700">
              New to the Cooperative?{" "}
              <Link
                href="/register"
                className="font-bold text-[#1b5e3a] hover:text-[#124228] transition"
              >
                Create your account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
