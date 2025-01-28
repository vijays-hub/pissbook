import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const unreadNotificationsCount = await prisma.notification.count({
      where: {
        recipientId: user.id,
        isRead: false,
      },
    });

    return Response.json({
      unreadNotificationsCount,
    });
  } catch (error) {
    console.error("Error while getting unread notifications count", error);
    // TODO: Try having a common error handler
    return Response.json(
      { error: "Error while getting unread notifications count" },
      { status: 500 }
    );
  }
}
