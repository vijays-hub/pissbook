/**
 * We would ne needing some client side utilities later. Hence, marking this a client
 * component.
 */
"use client";

import { Session, User } from "lucia";
import { createContext, useContext } from "react";

interface SessionProviderConfig {
  user: User;
  session: Session;
}

const SessionContext = createContext<SessionProviderConfig | null>(null);

export default function SessionProvider({
  children,
  value,
}: React.PropsWithChildren<{ value: SessionProviderConfig }>) {
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

/**
 * A custom hook to use the session context. Eliminated the need to use the useContext
 * and SessionContext in every component. Also, no need to check if the context
 * is null or not. Extremely useful.
 */
export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    /**
     * This makes sure that the hook is used within the SessionProvider. If not, it
     * will throw an error. This would likely occur when the hook is used outside
     * the SessionProvider. Again, this is likely a developer error. So, it would be
     * better to throw an error so that the developer can fix it.
     *
     * ! NOTE: We will absolutely have a session when we are inside the SessionProvider.
     */
    throw new Error("useSession must be used within a SessionProvider");
  }

  return context;
}
