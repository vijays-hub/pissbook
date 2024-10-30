"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataSelect } from "@/lib/types";
import { createPostSchema } from "@/lib/validations";

export async function createPost(input: {
  content: string;
  mediaIds: string[];
}) {
  const { user } = await validateRequest();

  //   If user is not authenticated, throw Unauthorized error
  if (!user) throw new Error("Unauthorized");

  const { content, mediaIds } = createPostSchema.parse(input);

  const newPost = await prisma.post.create({
    data: {
      content,
      userId: user.id,
      attachments: {
        /**
         * Connects the mediaIds to the post.
         * ! READ:
         * ! https://www.prisma.io/docs/orm/reference/prisma-client-reference#connect
         * ! https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries#connect-multiple-records
         */
        connect: mediaIds.map((id) => ({ id })),
      },
    },
    include: getPostDataSelect(user.id),
  });

  return newPost;
}
