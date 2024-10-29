/**
 * We will use uploadthing to handle file uploads in our application.
 *
 * Read More: https://docs.uploadthing.com/getting-started/appdir
 */

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { createUploadthing, FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";

const uploadInstance = createUploadthing();

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

      const newAvatarUrl = file.url.replace(
        "/f/",
        `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`
      );

      await prisma.user.update({
        where: { id: metadata.user.id },
        data: {
          avatarUrl: newAvatarUrl,
        },
      });

      return { avatarUrl: newAvatarUrl };
    }),
} satisfies FileRouter;

export type AppFileRouter = typeof fileRouter;
