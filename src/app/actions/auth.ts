"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation"; // 🚀 Import redirect

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

// Keep the old one just in case it's used elsewhere, but add the new Redirecting version
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

// 🚀 THE FIX: Clear the cookie and perform the redirect on the server
export async function clearAuthCookieAndRedirect() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("coop_token");
  } catch (error) {
    console.error("Failed to delete Next.js auth cookie:", error);
  }

  // This tells Next.js to navigate safely without triggering the client-side Turbopack bug
  redirect("/login");
}
