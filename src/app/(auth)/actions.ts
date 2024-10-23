// A server action for logout

"use server";

import { luciaAuth, storeCookieInHeaders, validateRequest } from "@/auth";

import { redirect } from "next/navigation";

// Does not return anything since this is logging out!
export async function logout() {
  const { session } = await validateRequest();

  if (!session) {
    throw new Error("Unauthorized: Please log in to continue");
  }

  //   If there is a session, we destroy it which logs the user out
  await luciaAuth.invalidateSession(session.id);

  //   https://lucia-auth.com/reference/main/Lucia/createBlankSessionCookie
  const sessionCookie = luciaAuth.createBlankSessionCookie();

  storeCookieInHeaders(sessionCookie);

  //   If you have a custom public page (probably a landing page), you can redirect to it as well. But for now, we'll just redirect to the login page!
  redirect("/login");
}
