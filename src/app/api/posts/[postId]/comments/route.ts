import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { CommentsPage, getCommentDataInclude } from "@/lib/types";
import { NextRequest } from "next/server";

// The number of comments to retrieve per page.
const COMMENTS_PER_PAGE = 5;

/**
 * Retrieves comments for a post.
 * @param postId The ID of the post to retrieve comments for.
 * @param cursor The cursor to start retrieving comments from.
 * @returns The comments for the post.
 * @throws If the user is not authenticated.
 */
export async function GET(
  req: NextRequest,
  { params: { postId } }: { params: { postId: string } }
) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: getCommentDataInclude(user.id),
      orderBy: { createdAt: "asc" }, // So that the latest comments come last.
      /**
       * Why are we passing negative value for `take`?
       * This is because we want to retrieve comments in reverse order. So, we will retrieve the
       * comments before the cursor. This is helpful for infinite scrolling in reverse order.
       *
       * ! READ MORE ON REVERSE CURSOR PAGINATION: https://www.prisma.io/docs/orm/prisma-client/queries/pagination#example-paging-backwards-with-cursor-based-pagination
       *
       * So essentially, what we are doing is, when we fetch comments, we fetch one extra comment
       * than the number of comments we want to display on the page. If we get more comments than
       * the number of comments we want to display, we know there are more comments to fetch. And the
       * cursor for the next page will be the ID of the first comment we fetched.
       */
      take: -COMMENTS_PER_PAGE - 1,
      // if no cursor is provided, we will fetch the latest comments
      cursor: cursor ? { id: cursor } : undefined,
    });

    /**
     * Unlike for-you feed where the cursor was the ID of the last post, here the cursor is the ID
     * of the first comment. This is because we are fetching comments in reverse order. Hence, naming
     * it as `previousCursor`. Of course, the comments have to be greater than the number of
     * comments per page to have a previous cursor.
     */
    const previousCursor =
      comments.length > COMMENTS_PER_PAGE ? comments[0].id : null;

    const data: CommentsPage = {
      /**
       * Slicing out the first comment because we fetched one extra comment than the number of
       * comments we want to display on the page. This extra comment comes in handy to check if
       * there are more comments available. If there are more comments available.
       *
       * If the comments are not greater than the number of comments per page, we don't need to
       * slice out the first comment, since there are no more comments to fetch.
       */
      comments:
        comments.length > COMMENTS_PER_PAGE ? comments.slice(1) : comments,
      previousCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
