"use server";

import { cookies } from "next/headers";
import { localeCookieName, normalizeLocale } from "./i18n";

export async function setLocaleAction(locale: string) {
  const cookieStore = await cookies();

  cookieStore.set(localeCookieName, normalizeLocale(locale), {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });
}
