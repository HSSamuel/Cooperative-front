"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your registered email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
        {
          email,
        },
      );
      setIsSuccess(true);
      toast.success("Reset link sent!");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to process request.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#1b5e3a]/10 rounded-full blur-3xl"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Forgot your password?
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Or{" "}
          <Link
            href="/login"
            className="font-bold text-[#1b5e3a] hover:text-emerald-600 transition-colors"
          >
            return to secure login
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-slate-100">
          {isSuccess ? (
            <div className="text-center animate-fade-in-up">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 mb-4">
                <svg
                  className="h-6 w-6 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Check your inbox
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                If an account exists for{" "}
                <span className="font-semibold text-slate-800">{email}</span>,
                we have sent a secure password reset link.
              </p>
              <Link
                href="/login"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-[#1b5e3a] bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-bold text-slate-700 mb-2"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1b5e3a] focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                  placeholder="Enter your registered email"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-[#1b5e3a]/20 text-sm font-bold text-white bg-[#1b5e3a] hover:bg-[#124228] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1b5e3a] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending Link..." : "Send Reset Link"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
