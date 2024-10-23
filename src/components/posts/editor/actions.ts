"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { createPostSchema } from "@/lib/validations";

export async function createPost({ content }: { content: string }) {
  const { user } = await validateRequest();

  //   If user is not authenticated, throw Unauthorized error
  if (!user) throw new Error("Unauthorized");

  const {} = createPostSchema.parse({ content });

  await prisma.post.create({
    data: {
      content,
      userId: user.id,
    },
  });
}