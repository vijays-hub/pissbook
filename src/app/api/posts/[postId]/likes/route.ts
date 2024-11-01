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

    await prisma.like.upsert({
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
    });

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

    await prisma.like.deleteMany({
      where: {
        userId: loggedInUser.id,
        postId,
      },
    });

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
