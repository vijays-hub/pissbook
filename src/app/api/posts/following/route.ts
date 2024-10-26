import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataSelect, PostsPage } from "@/lib/types";
import { NextRequest } from "next/server";

/**
 * This endpoint is same as the for-you endpoint, but it returns posts only from the users
 * that the user follows.
 */
const PAGE_SIZE = 5;
export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    /**
     * Fetch posts from users that the logged in user follows.
     */
    const posts = await prisma.post.findMany({
      where: {
        user: {
          followers: {
            some: {
              followerId: user.id,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE + 1,
      cursor: cursor ? { id: cursor } : undefined,
      include: getPostDataSelect(user.id),
    });

    const nextCursor = posts.length > PAGE_SIZE ? posts[PAGE_SIZE].id : null;

    const data: PostsPage = {
      posts: posts.slice(0, PAGE_SIZE),
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
