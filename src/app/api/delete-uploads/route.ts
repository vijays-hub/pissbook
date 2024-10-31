/**
 * An endpoint that is triggered by a cron job. You can also use this manually as well.
 *
 * Goal of this endpoint is to delete all the uploads that are not attached to a post. That
 * is, this deletes all the orphaned uploads.
 */

import prisma from "@/lib/prisma";
import { UTApi } from "uploadthing/server";
import { SECURE_FILE_PATH } from "../uploadthing/core";

export const GET = async (req: Request) => {
  try {
    const authHeaders = req.headers.get("Authorization");

    if (!authHeaders || authHeaders !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error("Missing the CRON_SECRET");
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    /**
     * The idea here is that we are fetching all the uploads that are not attached to any post.
     * We can do this by querying the attachments table and checking if the post ID is null.
     */
    const unusedUploads = await prisma.attachment.findMany({
      where: {
        // Or postId: null can also be used
        postId: {
          equals: null,
        },
        /**
         * Ideally, we should delete the uploads that are older than a certain period. This is
         * to ensure that we are not deleting the uploads that are being used in a post that is
         * being created at the moment. So, let's check if the post is older than 1 day.
         *
         * Also, it's a good practice to delete these only on the production environment.
         */
        ...(process.env.NODE_ENV === "production"
          ? {
              createdAt: {
                lte: new Date(Date.now() - 24 * 60 * 60 * 1000),
              },
            }
          : {}),
      },
      select: {
        id: true,
        url: true,
      },
    });

    /**
     * Once we have the unused uploads, we can delete them from the uploads directory, which is
     * nothing but our uploadthing data store.
     */
    new UTApi().deleteFiles(
      unusedUploads.map((upload) => upload.url.split(SECURE_FILE_PATH)[1]) // Get the file key
    );

    /**
     * Post deletion, we can delete the attachments from the database as well.
     */
    await prisma.attachment.deleteMany({
      where: {
        id: {
          in: unusedUploads.map((upload) => upload.id),
        },
      },
    });

    return new Response("Deleted unused uploads", { status: 200 });
  } catch (error) {
    console.error("Error while deleting uploads", error);
    return Response.json(
      { error: "Error while deleting uploads" },
      { status: 500 }
    );
  }
};
