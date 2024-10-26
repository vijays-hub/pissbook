import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { FollowerInfo } from "@/lib/types";

/**
 * Have used normal Request type here. If needed, you can also use the NextRequest type.
 *
 * The Goal of this endpoint is to return the number of followers the user has. This user is
 * determined by the userId in the URL. Additionally, we would also return the currently
 * logged in user's follow status with the user. Like, if the currently logged in user is
 * following the user, then we would return true, else false. This helps us to decide the
 * state of the follow button in the UI.
 */
export async function GET(
  req: Request,
  { params: { userId } }: { params: { userId: string } }
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Fetch the user from the database using the userId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        /**
         * There can be multiple followers for a user. But, we only care about the currently
         * logged in user. So, we filter the followers array to only include the follower
         * whose id is the same as the currently logged in user's id. If the array is empty,
         * then the loggedIn user is not following the user. If the array is not empty, then the
         * loggedIn user is following the user. We can use this information to decide the state
         * of the follow button in the UI.
         *
         */
        followers: {
          where: {
            followerId: loggedInUser.id,
          },
          select: {
            followerId: true,
          },
        },
        // Gets the count of followers for the user being queried for
        _count: {
          select: {
            followers: true,
          },
        },
      },
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    const data: FollowerInfo = {
      followers: user._count.followers,
      //   Double bang for converting the value to boolean. Like if the array is empty, i.e., length is 0, then it would be false, else true.
      isFollowedByUser: !!user.followers.length,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return new Response("Internal server error", { status: 500 });
  }
}

/**
 * An endpoint to follow a user. The currently logged in user would follow the user whose id is
 * passed in the URL. The currently logged in user is determined by validateRequest function.
 */
export async function POST(
  req: Request,
  { params: { userId } }: { params: { userId: string } }
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return new Response("Unauthorized", { status: 401 });
    }

    /**
     * We have used upsert method instead of create. This is because, if the user is already following
     * the user, then we don't want to create a new record. Instead, we would just update the existing
     * record. If the user is not following the user, then we would create a new record.
     *
     * More on upsert: https://www.prisma.io/docs/orm/prisma-client/queries/crud#update-or-create-records
     */
    await prisma.follow.upsert({
      where: {
        // This is the unique constraint we defined in the Prisma schema for Follow model.
        followerId_followingId: {
          followerId: loggedInUser.id,
          followingId: userId,
        },
      },
      create: {
        followerId: loggedInUser.id,
        followingId: userId,
      },
      // We are ignoring the update object because we don't need to update anything, as we are just following the user.
      update: {},
    });

    return new Response("Success", { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Internal server error", { status: 500 });
  }
}

/**
 * We could have simply sent a boolean value in the POST endpoint to follow or un-follow a user.
 * But it's more RESTful to use the DELETE method to un-follow a user. So, this endpoint is used
 * to un-follow a user. The currently logged in user would un-follow the user whose id is
 * passed in the URL.
 */
export async function DELETE(
  req: Request,
  { params: { userId } }: { params: { userId: string } }
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return new Response("Unauthorized", { status: 401 });
    }

    /**
     * We are using deleteMany method instead of delete just like upsert method in the POST endpoint.
     * This is because, if the user is not following the user, then we don't want to do anything.
     * It doesn't make sense to throw an error if the user is not following the user. So, we just
     * ignore the delete operation if the user is not following the user.
     *
     * This also comes in handy when there is a race condition of deleting (un following) the same
     * user multiple times. If we use delete method, then it would throw an error if the user is not
     * following the user. But, if we use deleteMany method, then it would just ignore the delete
     * operation if the user is not following the user.
     */
    await prisma.follow.deleteMany({
      where: {
        followerId: loggedInUser.id,
        followingId: userId,
      },
    });

    return new Response("Success", { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Internal server error", { status: 500 });
  }
}
