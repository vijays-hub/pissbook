import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { postDataInclude } from "@/lib/types";

/**
 * This responds to a GET request to /api/posts/for-you. This is equivalent to the
 * traditional BE server endpoint that would return posts for the user, like how you would
 * write in a REST API, probably using Express.
 *
 * This endpoint returns all the posts of all users including the user's posts, as it is a
 * "for you" feed. Hence, we are not filtering the posts based on the user's ID.
 */
export async function GET() {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const posts = await prisma.post.findMany({
      include: postDataInclude,
      orderBy: { createdAt: "desc" },
    });

    return Response.json(posts); // Modify the response as needed...
  } catch (error) {
    console.error("Error while getting posts for you", error);
    // TODO: Try having a common error handler
    return Response.json(
      { error: "Error while getting posts for you" },
      { status: 500 }
    );
  }
}
