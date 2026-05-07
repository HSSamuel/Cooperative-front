"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email)
      return toast.error("Please enter your registered email address.");

    setIsSubmitting(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
        { email },
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
    <div className="min-h-screen bg-[#f8f9fe] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 flex justify-center">
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-80 transition"
        >
          <Image
            src="/ascon-logo.png"
            alt="ASCON Logo"
            width={40}
            height={40}
            className="object-contain w-auto h-auto"
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-[10px] tracking-tight text-slate-500 uppercase leading-tight">
              System Demo
            </span>
            <span className="font-bold text-lg tracking-tight text-[#2B2F42] leading-tight">
              Co-operative
            </span>
          </div>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:p-10 shadow-sm border border-slate-200 rounded-sm mx-4 sm:mx-0">
          {isSuccess ? (
            <div className="text-center animate-fade-in-up">
              <div className="mx-auto flex items-center justify-center h-12 w-12 bg-emerald-50 text-[#1b5e3a] rounded-sm mb-4 border border-emerald-100">
                <svg
                  className="h-6 w-6"
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
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                Check your inbox
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                If an account exists for{" "}
                <span className="font-semibold text-slate-700">{email}</span>,
                we have sent a secure password reset link.
              </p>
              <Link
                href="/login"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-sm shadow-sm text-sm font-bold text-[#1b5e3a] bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                  Forgot your password?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Enter your email to receive a secure reset link.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-bold text-slate-700 mb-1.5"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-[#1b5e3a] transition-colors"
                    placeholder="Enter your registered email"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2.5 px-4 text-sm font-bold text-white bg-[#1b5e3a] hover:bg-[#124228] rounded-sm shadow-sm transition-colors disabled:opacity-70"
                  >
                    {isSubmitting ? "Sending Link..." : "Send Reset Link"}
                  </button>
                </div>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-600">
                  Remember your password?{" "}
                  <Link
                    href="/login"
                    className="font-bold text-[#1b5e3a] hover:underline transition"
                  >
                    Return to secure login
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
