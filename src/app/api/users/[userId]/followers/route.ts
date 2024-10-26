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
