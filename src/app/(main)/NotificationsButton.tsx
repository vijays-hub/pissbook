"use client";

import { Button } from "@/components/ui/button";
import kyInstance from "@/lib/ky";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import Link from "next/link";

export const UNREAD_NOTIFICATIONS_QUERY_KEY = "unread-notification-count";

export default function NotificationsButton({
  initialState,
}: {
  initialState: { unreadNotificationsCount: number };
}) {
  const { data } = useQuery({
    queryKey: ["unread-notification-count"],
    queryFn: () =>
      kyInstance
        .get("/api/notifications/unread-count")
        .json<{ unreadNotificationsCount: number }>(),
    initialData: initialState,
    // Refresh the data every 60 seconds
    refetchInterval: 60 * 1000,
  });

  return (
    <Button
      variant={"ghost"}
      className="flex items-center justify-start gap-3"
      title="Notifications"
      asChild
    >
      <Link href={"/notifications"}>
        <div className="relative">
          <Bell />
          {!!data.unreadNotificationsCount && (
            <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1 text-xs font-medium tabular-nums text-primary-foreground">
              {data.unreadNotificationsCount}
            </span>
          )}
        </div>
        <span className="hidden md:inline">Notifications</span>
      </Link>
    </Button>
  );
}
