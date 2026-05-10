"use server";

import { cookies } from "next/headers";

export async function syncAuthCookie(token: string) {
  try {
    const cookieStore = await cookies();
    cookieStore.set("coop_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60, // 1 day
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to set Next.js auth cookie:", error);
    return { success: false };
  }
}

// 🚀 NEW: Add this function to securely destroy the cookie
export async function clearAuthCookie() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("coop_token");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete Next.js auth cookie:", error);
    return { success: false };
  }
}
