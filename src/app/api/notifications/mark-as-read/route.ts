import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

/**
 * An endpoint to mark all notifications as read. We could use a server action for
 * this as well. But server actions have a weird behavior where they always run in
 * succession, which means that the next server action will only run after the
 * previous one has completed. Additionally, they block the navigation as well, ie.,
 * when one server action is running, you can't navigate to another page. This is ideal
 * for something like creating a post, where you want to wait for the post to be created,
 * but not for marking notifications as read. So, we are using an endpoint here. So,
 * now NextJs will run this async (in the background) and the user can navigate to
 * notifications page without waiting for this to complete.
 *
 * TODO: Add provision to mark only a specific notification as read. Take the notification
 * id as a query parameter and mark that notification as read. Make sure you validate the
 * query cache accordingly in the Notification component.
 */
export async function PATCH(req: Request) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.notification.updateMany({
      where: {
        recipientId: user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
