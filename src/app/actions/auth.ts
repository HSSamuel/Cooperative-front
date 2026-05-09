"use server";

import { cookies } from "next/headers";

export async function syncAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("coop_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60, // 1 day
  });
}
