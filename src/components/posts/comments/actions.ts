"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getCommentDataInclude, PostData } from "@/lib/types";
import { createCommentSchema } from "@/lib/validations";

/**
 * Submits a new comment to a post.
 * @param post The post to comment on.
 * @param content The content of the comment.
 * @returns The new comment.
 * @throws If the user is not authenticated.
 */
export async function submitComment({
  post,
  content,
}: {
  post: PostData; // Having entire post data can come in handy for some use cases, like sending notifications to the post author.
  content: string;
}) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const { content: contentValidated } = createCommentSchema.parse({ content });

  /**
   * [UPDATE]: Notifications Feature
   *
   * Have a look at the POST endpoint of the post likes folder to see the intention behind using
   * the transaction method.
   */
  const [newComment] = await prisma.$transaction([
    prisma.comment.create({
      data: {
        content: contentValidated,
        postId: post.id,
        userId: user.id,
      },
      include: getCommentDataInclude(user.id),
    }),
    ...(post.user.id !== user.id
      ? [
          prisma.notification.create({
            data: {
              issuerId: user.id,
              recipientId: post.user.id,
              type: "COMMENT",
              postId: post.id,
            },
          }),
        ]
      : []),
  ]);

  return newComment;
}

/**
 * Deletes a comment.
 * @param id The ID of the comment to delete.
 * @returns The deleted comment.
 * @throws If the user is not authenticated, the comment is not found, or the user is not the author of the comment.
 */
export async function deleteComment(id: string) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const comment = await prisma.comment.findUnique({
    where: { id },
  });

  if (!comment) throw new Error("Comment not found");

  if (comment.userId !== user.id) throw new Error("Unauthorized");

  const deletedComment = await prisma.comment.delete({
    where: { id },
    include: getCommentDataInclude(user.id),
  });

  return deletedComment;
}
