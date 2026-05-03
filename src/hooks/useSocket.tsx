"use client";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";

export const useSocket = (userId: string | undefined) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;

    // 🚀 THE FIX: Ensure we connect to the server root, not the /api route
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const socketBaseUrl = apiUrl.replace(/\/api\/?$/, ""); 

    // Connect to the backend
    const socketInstance = io(socketBaseUrl);
    setSocket(socketInstance);

    // Register this user's DB ID with their socket session
    socketInstance.emit("register_user", userId);

    // LISTEN FOR LIVE GUARANTOR REQUESTS
    socketInstance.on("new_guarantor_request", (data) => {
      // 🚀 THE UX UPGRADE: Added a dismiss button to the custom toast
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-2xl rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-emerald-500`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-slate-800">
                  Action Required
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {data.message}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-slate-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-emerald-600 hover:text-emerald-500 focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      ), { duration: 8000, position: "top-right" });
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [userId]);

  return socket;
};