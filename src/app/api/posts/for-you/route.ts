import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { postDataInclude, PostsPage } from "@/lib/types";
import { NextRequest } from "next/server";

/**
 * This responds to a GET request to /api/posts/for-you. This is equivalent to the
 * traditional BE server endpoint that would return posts for the user, like how you would
 * write in a REST API, probably using Express.
 *
 * This endpoint returns all the posts of all users including the user's posts, as it is a
 * "for you" feed. Hence, we are not filtering the posts based on the user's ID.
 *
 * We accept 'cursor' query parameter to paginate the posts. The cursor is the ID of the post.
 * We can use this cursor to fetch the next set of posts.
 *
 * While fetching the next set of posts we always fetch one extra post than the limit. This is
 * to check if there are more posts available. If there are more posts available, we return the
 * next cursor. If there are no more posts available, we return null as the next cursor.
 */
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

    const posts = await prisma.post.findMany({
      include: postDataInclude,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE + 1, // Fetch one extra post to check if there are more posts available
      cursor: cursor ? { id: cursor } : undefined,
    });

    // Check if there are more posts available
    const nextCursor = posts.length > PAGE_SIZE ? posts[PAGE_SIZE].id : null;

    // data to be returned (Modify the response as needed...)
    const postsData: PostsPage = {
      posts: posts.slice(0, PAGE_SIZE), // Return only the required number of posts, which is PAGE_SIZE
      nextCursor,
    };

    return Response.json(postsData);
  } catch (error) {
    console.error("Error while getting posts for you", error);
    // TODO: Try having a common error handler
    return Response.json(
      { error: "Error while getting posts for you" },
      { status: 500 }
    );
  }
}
