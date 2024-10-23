// This will only be applicable for / route as it's inside a Grouped route (main)

import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import SessionProvider from "./SessionProvider";
import Navbar from "./Navbar";
import { MenuBar } from "./MenuBar";

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
  return (
    <SessionProvider value={session}>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="mx-auto max-w-7xl p-5 flex w-full grow gap-5">
          {/* The top=5.25rem is the height of Navbar (64px - 4rem) + some padding */}
          <MenuBar className="sticky top-[5.25rem] h-fit hidden sm:block flex-none space-y-3 rounded-2xl bg-card px-3 py-5 md:px-5 shadow-sm lg:w-80" />
          {children}
        </div>

        {/* For very smaller screens (<640px), show the Menu at the bottom */}
        <MenuBar className="sm:hidden sticky bottom-0 flex w-full justify-center gap-5 border-t bg-card p-3" />
      </div>
    </SessionProvider>
  );
}
