import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { notificationsInclude, NotificationsPage } from "@/lib/types";
import { NextRequest } from "next/server";

// Have a look at the FOR-YOU endpoint in the posts folder to understand what's happening here.
// The only difference is that we are fetching notifications instead of posts.
const PAGE_SIZE = 5;
export async function GET(request: NextRequest) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the cursor from the query parameters
    const cursor = request.nextUrl.searchParams.get("cursor") as
      | string
      | undefined;

    const notifications = await prisma.notification.findMany({
      where: {
        recipientId: user.id,
      },
      include: notificationsInclude,
      orderBy: {
        createdAt: "desc",
      },
      take: PAGE_SIZE + 1,
      cursor: cursor
        ? {
            id: cursor,
          }
        : undefined,
    });

    const nextCursor =
      notifications.length > PAGE_SIZE ? notifications[PAGE_SIZE].id : null;

    const data: NotificationsPage = {
      nextCursor,
      notifications: notifications.slice(0, PAGE_SIZE),
    };

    return Response.json(data);
  } catch (error) {
    console.error("Error while getting notifications for you", error);
    // TODO: Try having a common error handler
    return Response.json(
      { error: "Error while getting notifications for you" },
      { status: 500 }
    );
  }
}
