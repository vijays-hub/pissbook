import { Button } from "@/components/ui/button";
import { Bell, Bookmark, Home, Mail } from "lucide-react";
import Link from "next/link";
import NotificationsButton from "./NotificationsButton";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

interface MenuBarConfig {
  className?: string;
}

export const MenuBar = async ({ className }: MenuBarConfig) => {
  const { user } = await validateRequest();

  if (!user) return null;

  const [unreadNotificationsCount] = await Promise.all([
    prisma.notification.count({
      where: {
        recipientId: user.id,
        isRead: false,
      },
    }),
  ]);

  return (
    <div className={className}>
      <Button
        variant={"ghost"}
        className="flex items-center justify-start gap-3"
        title="Home"
        asChild
      >
        <Link href={"/"}>
          <Home />
          <span className="hidden md:inline">Home</span>
        </Link>
      </Button>
      <NotificationsButton
        initialState={{
          unreadNotificationsCount,
        }}
      />
      <Button
        variant={"ghost"}
        className="flex items-center justify-start gap-3"
        title="Messages"
        asChild
      >
        <Link href={"/messages"}>
          <Mail />
          <span className="hidden md:inline">Messages</span>
        </Link>
      </Button>
      <Button
        variant={"ghost"}
        className="flex items-center justify-start gap-3"
        title="Bookmarks"
        asChild
      >
        <Link href={"/bookmarks"}>
          <Bookmark />
          <span className="hidden md:inline">Bookmarks</span>
        </Link>
      </Button>
    </div>
  );
};
