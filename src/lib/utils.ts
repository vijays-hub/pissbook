import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { luciaAuth } from "@/auth";
import { cookies } from "next/headers";
import { Cookie } from "lucia";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const createSessionFromUserId = async (userId: string) => {
  const session = await luciaAuth.createSession(userId, {});
  const sessionCookie = luciaAuth.createSessionCookie(session.id);

  // Set the session cookie for the user
  setCookiesInHeaders(sessionCookie);
};

export const setCookiesInHeaders = (sessionCookie: Cookie) => {
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
};
