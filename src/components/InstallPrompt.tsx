"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { usePathname } from "next/navigation";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [hasShown, setHasShown] = useState(false);
  const pathname = usePathname();

  // 1. Capture the installation event whenever the browser fires it (usually on first load)
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile natively
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  // 2. Trigger or hide the custom toast based on the current route
  useEffect(() => {
    // Restrict prompt strictly to these routes (Landing and Savings added)
    const allowedPaths = [
      "/",
      "/dashboard",
      "/dashboard/profile",
      "/dashboard/savings",
    ];
    const isAllowed = allowedPaths.includes(pathname);

    if (deferredPrompt && isAllowed && !hasShown) {
      setHasShown(true); // Ensure we only trigger it once per session to avoid spamming

      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-md w-full bg-white dark:bg-[#1B1B25] shadow-2xl rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-emerald-100 dark:border-emerald-900/50 mt-4`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <img
                    className="h-10 w-10 rounded-full object-contain"
                    src="/ascon-logo.png"
                    alt="App Logo"
                  />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Install ASCON Coop App
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Install this application on your home screen for quick and
                    easy access.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col border-l border-slate-200 dark:border-slate-700">
              <button
                onClick={async () => {
                  toast.dismiss(t.id);
                  if (deferredPrompt) {
                    // Trigger the native browser install prompt
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    if (outcome === "accepted") {
                      setDeferredPrompt(null);
                    }
                  }
                }}
                className="w-full border border-transparent rounded-none rounded-tr-xl p-3 flex items-center justify-center text-sm font-bold text-[#1b5e3a] dark:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Install
              </button>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-br-xl p-3 flex items-center justify-center text-xs font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-t border-slate-200 dark:border-slate-700"
              >
                Not Now
              </button>
            </div>
          </div>
        ),
        {
          id: "pwa-install-prompt",
          duration: Infinity,
          position: "top-center", // Display at the top instead of the bottom
        },
      );
    } else if (!isAllowed) {
      // Cleanly dismiss the toast if the user navigates away to loans/settings/etc.
      toast.dismiss("pwa-install-prompt");
    }
  }, [pathname, deferredPrompt, hasShown]);

  return null;
}
