import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { PostLikeData } from "@/lib/types";

/**
 * Have a look at the Followers endpoint to understand and process the below code.
 */

export async function GET(
  req: Request,
  { params: { postId } }: { params: { postId: string } }
) {
  try {
    // TODO: Move the validateRequest function to a separate file and export it.
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        likes: {
          where: {
            userId: loggedInUser.id,
          },
          //   Don't need anything else from the likes table. So, we don't need to select anything.
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    const data: PostLikeData = {
      likes: post._count.likes,
      isLikedByUser: !!post.likes.length,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

const getPostById = async (postId: string) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      userId: true,
    },
  });
  return post;
};

/**
 * Have a look at the Followers endpoint to understand and process the below code.
 */
export async function POST(
  req: Request,
  { params: { postId } }: { params: { postId: string } }
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await getPostById(postId);
    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    /**
     * Why didn't we decouple both like and notification into separate queries?
     *
     * In theory, there can be cases where the like operation is successful but the
     * notification operation fails, OR, vice versa. In such cases, the data will be
     * inconsistent. Hence, wrapping them inside a transaction so that both operations
     * succeed or fail together. This way, we can ensure data consistency, because,
     * if one operation fails, the other operation will also be rolled back, and we see
     * an error response.
     */
    await prisma.$transaction([
      prisma.like.upsert({
        where: {
          userId_postId: {
            userId: loggedInUser.id,
            postId,
          },
        },
        create: {
          userId: loggedInUser.id,
          postId,
        },
        update: {},
      }),
      // Send a notification to the post owner
      ...(loggedInUser.id !== post.userId
        ? [
            prisma.notification.create({
              data: {
                issuerId: loggedInUser.id,
                recipientId: post.userId,
                postId,
                type: "LIKE",
              },
            }),
          ]
        : []),
    ]);

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Have a look at the Followers endpoint to understand and process the below code.
 */
export async function DELETE(
  req: Request,
  { params: { postId } }: { params: { postId: string } }
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await getPostById(postId);
    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    // Similar to the POST method, we are wrapping both the like and notification operations inside a transaction.
    await prisma.$transaction([
      // Delete the like
      prisma.like.deleteMany({
        where: {
          userId: loggedInUser.id,
          postId,
        },
      }),
      // Delete the notification
      prisma.notification.deleteMany({
        where: {
          issuerId: loggedInUser.id,
          recipientId: post.userId,
          postId,
          type: "LIKE",
        },
      }),
    ]);

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
