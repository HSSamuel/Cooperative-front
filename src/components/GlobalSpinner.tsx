"use client";

interface GlobalSpinnerProps {
  isLoading: boolean;
  text?: string;
}

export function GlobalSpinner({
  isLoading,
  text = "Processing...",
}: GlobalSpinnerProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/70 dark:bg-[#12121A]/80 backdrop-blur-sm transition-all duration-300">
      <div className="relative flex items-center justify-center w-24 h-24">
        {/* Outer spinning track */}
        <div className="absolute inset-0 rounded-full border-4 border-emerald-100/50 dark:border-emerald-900/30 border-t-[#1b5e3a] dark:border-t-emerald-400 animate-spin"></div>

        {/* ASCON Logo */}
        <img
          src="/ascon-logo.png"
          alt={text}
          className="w-12 h-12 object-contain animate-[spin_3s_linear_infinite]"
        />
      </div>

      <p className="mt-5 text-sm font-bold text-[#1b5e3a] dark:text-emerald-400 animate-pulse tracking-wide">
        {text}
      </p>
    </div>
  );
}
