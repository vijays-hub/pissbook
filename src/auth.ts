import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import prisma from "./lib/prisma";
import { Cookie, Lucia, Session, User } from "lucia";
import { cache, use } from "react";
import { cookies } from "next/headers";

const adapter = new PrismaAdapter(prisma.session, prisma.user);

// https://lucia-auth.com/getting-started/nextjs-app
// https://lucia-auth.com/tutorials/username-and-password/nextjs-app

export const luciaAuth = new Lucia(adapter, {
  sessionCookie: {
    expires: false, // Meaning we keep the session cookie forever, but if if you want this disabled, you can set it to true
    attributes: {
      // Secure only in production, since in development we are using http
      secure: process.env.NODE_ENV === "production",
    },
  },
  //   Every time we fetch for the session, we will get these currently logged in user's attributes, so we need not fetch them again from the database
  getUserAttributes: (userAttributes) => {
    return {
      id: userAttributes.id,
      username: userAttributes.username,
      displayName: userAttributes.displayName,
      avatarUrl: userAttributes.avatarUrl,
      googleId: userAttributes.googleId,
    };
  },
});

// Register the interfaces with lucia-auth
declare module "lucia" {
  interface Register {
    Lucia: typeof luciaAuth;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

// Refer to the User schema in the Prisma schema
interface DatabaseUserAttributes {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  googleId: string | null;
}

//

/**
 * Look for validateRequest() in this documentation -- https://lucia-auth.com/tutorials/username-and-password/nextjs-app
 *
 * ? Why cache:
 * The cache() function from react is used to cache the session data for the user. This is useful
 * because we don't want to fetch the user's data from the database every time we need it in
 * different parts of the application. When we refresh the page, this cache is cleared and the
 * session data is fetched from the database and is cached for the user again. So this way we only
 * make one database call per session for user data.
 */
export const validateRequest = cache(
  async (): Promise<
    // NOTE: User and Session are imported from the lucia package and not the prisma schema
    { user: User; session: Session } | { user: null; session: null }
  > => {
    const sessionId = cookies().get(luciaAuth.sessionCookieName)?.value ?? null;

    if (!sessionId) {
      return { user: null, session: null };
    }

    const result = await luciaAuth.validateSession(sessionId);

    // next.js throws when you attempt to set cookie when rendering page
    try {
      if (result.session && result.session.fresh) {
        const sessionCookie = luciaAuth.createSessionCookie(result.session.id);
        storeCookieInHeaders(sessionCookie);
      }

      if (!result.session) {
        const sessionCookie = luciaAuth.createBlankSessionCookie();
        storeCookieInHeaders(sessionCookie);
      }
    } catch (error) {}

    return result;
  }
);

export const createSessionFromUserId = async (userId: string) => {
  const session = await luciaAuth.createSession(userId, {});
  const sessionCookie = luciaAuth.createSessionCookie(session.id);

  storeCookieInHeaders(sessionCookie);
};

export const storeCookieInHeaders = (sessionCookie: Cookie) => {
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
};
