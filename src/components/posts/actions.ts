/**
 * All the server actions related to posts apart from CREATE.
 * The actions for CREATE are in the editor folder.
 */
"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { postDataInclude } from "@/lib/types";

// Delete a post
export const deletePost = async (id: string) => {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const post = await prisma.post.findUnique({ where: { id } });

  if (!post) throw new Error("Post not found");

  //   Ensure the user is the owner of the post
  if (post && post.userId !== user.id) throw new Error("Unauthorized");

  const deletedPost = await prisma.post.delete({
    where: { id },
    include: postDataInclude,
  });

  return deletedPost;
};
