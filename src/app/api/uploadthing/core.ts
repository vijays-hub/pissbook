/**
 * We will use uploadthing to handle file uploads in our application.
 *
 * Read More: https://docs.uploadthing.com/getting-started/appdir
 */

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { createUploadthing, FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";

const uploadInstance = createUploadthing({
  errorFormatter: (error) => {
    console.log({ error });
    return {
      message: error.message,
    };
  },
});

/**
 * The default file URL that uploadthing generates is not a secure one.
 * To make it secure, they advice us to use the APP_ID in the URL.
 * Hence, we construct the URL ourselves.
 *
 * This is the default URL: https://utfs.io/f/<FILE_KEY>
 *
 * We replace the `f` with the APP_ID to make it secure. Uploadthing suggests this
 * URL for security -> https://utfs.io/a/<APP_ID>/<FILE_KEY>
 *
 * Also, to use such URLs in NextJs, make sure you whitelist the domain in the `next.config.js` file.
 * This is needed when you are using the `Image` component from NextJs.
 *
 *
 * Learn more: Learn more on working with files -> https://docs.uploadthing.com/working-with-files
 */
export const SECURE_FILE_PATH = `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`;
const generateSecureUrl = (url: string) => {
  url.replace("/f/", SECURE_FILE_PATH);
  return url;
};

export const fileRouter = {
  avatarUploader: uploadInstance({
    image: { maxFileSize: "512KB" },
  })
    .middleware(async () => {
      const { user } = await validateRequest();

      if (!user) throw new UploadThingError("Unauthorized");

      return { user };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      /**
       * Since we can have only one Avatar for a user, there is no point keeping them
       * in the upload thing files database (you can check that in the dashboard). So
       * when user is trying to upload a new avatar, we will delete the old one using the
       * key of the old avatar.
       */
      const oldAvatarUrl = metadata.user.avatarUrl;

      if (oldAvatarUrl) {
        // Check below comment to understand this.
        const key = oldAvatarUrl.split(
          `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`
        )[1];

        await new UTApi().deleteFiles(key);
      }

      const newAvatarUrl = generateSecureUrl(file.url);

      /**
       * Take a look here: src/app/(auth)/signup/actions.ts, to understand what's
       * happening here.
       *
       * Notice that we are not using prisma transaction here. This is because it
       * doesn't make sense to rollback the user's avatar update just because the
       * StreamChat update failed. We can live with the user having an updated avatar,
       * since the stream chat will have the updated avatar when the user logs in next time
       * or on a new session.
       *
       * So, we are using Promise.all to execute both the prisma update and the stream chat
       * update in parallel.
       */
      await Promise.all([
        await prisma.user.update({
          where: { id: metadata.user.id },
          data: {
            avatarUrl: newAvatarUrl,
          },
        }),
        await streamServerClient.partialUpdateUser({
          id: metadata.user.id,
          set: {
            image: newAvatarUrl,
          },
        }),
      ]);

      return { avatarUrl: newAvatarUrl };
    }),
  postAttachmentUploader: uploadInstance({
    image: { maxFileSize: "4MB", maxFileCount: 5 },
    video: { maxFileSize: "64MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const { user } = await validateRequest();

      if (!user) throw new UploadThingError("Unauthorized");

      return { userId: user.id };
    })
    .onUploadComplete(async ({ file }) => {
      const media = await prisma.attachment.create({
        data: {
          url: generateSecureUrl(file.url),
          type: file.type.startsWith("image") ? "IMAGE" : "VIDEO",
        },
      });

      // Essential to return the mediaId so that the client can associate the media with the post.
      return { mediaId: media.id };
    }),
} satisfies FileRouter;

export type AppFileRouter = typeof fileRouter;
