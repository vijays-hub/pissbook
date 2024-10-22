// This will only be applicable for / route as it's inside a Grouped route (main)

import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import SessionProvider from "./SessionProvider";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  /**
   * If you notice, the validateRequest returns the response from cache() function
   * whenever it is being called inside the Server components. But when we actually
   * make the same call inside the Client components, it returns a new response and
   * will be a fresh call to the database. This is because it will be a different
   * request. Hence, storing the session inside a Context API or a global state
   * management library is a good idea. Hence, wrapping this component inside a
   * SessionProvider context.
   */
  const session = await validateRequest();

  if (!session.user) redirect("/login"); // No need to return when redirecting

  /**
   * ! NOTE: Even though the SessionProvider is a client component, we can still use
   * ! server components as Children. Props to Next.js for making this possible.
   */
  return <SessionProvider value={session}>{children}</SessionProvider>;
}
