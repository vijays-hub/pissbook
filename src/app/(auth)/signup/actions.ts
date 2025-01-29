// Server Actions File.
"use server";

import { createSessionFromUserId, luciaAuth } from "@/auth";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { SignUpConfig, signupSchema } from "@/lib/validations";
import { hashingConfig } from "@/utils/constants";
import { hash } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { isRedirectError } from "next/dist/client/components/redirect";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// TODO: Support email verification and password reset
export async function signup(config: SignUpConfig): Promise<{ error: string }> {
  try {
    // Extra validation on the server, as the user can bypass the client-side validation.
    const { email, username, password, name } = signupSchema.parse(config);

    // Now the values are validated and safe to use.

    // https://www.npmjs.com/package/@node-rs/argon2
    const passwordHash = await hash(password, hashingConfig);

    // https://lucia-auth.com/reference/main/generateIdFromEntropySize
    const userId = generateIdFromEntropySize(10); // 16-characters long

    const existingUsername = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });

    if (existingUsername) {
      return {
        error: "Username is already taken",
      };
    }

    const existingEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (existingEmail) {
      return {
        error: "Email is already taken",
      };
    }

    /**
     * UPDATE - Jan 29, 2025.
     *
     * We started using Stream SDK to support direct messaging in our app.
     * As part of this, we would need to connect the signed-up user to StreamChat.
     * The reason for doing this inside the signup action is to ensure that we don't
     * have many connections every time user logs in. We also have the connection hook 
     * to connect (src/app/(main)/messages/useStreamChatClient.ts) the user, but this will 
     * connect the user only when they access the messages page. This is not ideal, as we are 
     * depending on the user for creating connections to StreamChat. Hence, we are adding the 
     * connection logic to the signup action as well. The whole idea is to get the ability to 
     * see the signed up user's channel right away (or search them) and any unread messages 
     * instead of waiting for the user to log in and then connect to StreamChat SDK.
     * 
     * Additionally, whenever we are updating the user's profile, we would need to update the 
     * user's info in StreamChat as well. Handled this here:
     * - src/app/(main)/users/[username]/actions.ts
     * - src/app/api/uploadthing/core.ts
     *
     * To test this:
     * Just signup a new user, and then move to the place where you have your session open
     * and see if the new user is connected to StreamChat and you can search them.
     *
     * Additionally, we should make sure that the connection happens only if the user
     * signs up successfully. So, we could rely on prisma transactions to ensure that.
     * But wait, the Stream SDK is not associated with prisma, it has nothing to do with
     * prisma. So, we can't use the regular transactions like we used to (for ex, here- src/app/api/users/[userId]/followers/route.ts)
     *
     * But what do we do now? We can't use transactions, but we need to ensure that the
     * user is connected to StreamChat only if he signs up successfully. To help with this
     * we could use something called as interactive transactions. This is provided by prisma
     * to help gain control over what queries execute within a transaction. Ofcourse this is
     * more like a hack, but let's live with it for now.
     *
     * !Ref: https://www.prisma.io/docs/orm/prisma-client/queries/transactions#interactive-transactions
     *
     */

    await prisma.$transaction(async (tx) => {
      /**
       * Create a new user. Notice that we are using `tx` instead of `prisma`
       * this would ensure that if the user creation fails, the transaction would
       * be rolled back, and the user won't be created.
       */
      await tx.user.create({
        data: {
          id: userId,
          email,
          username,
          displayName: name,
          passwordHash,
        },
      });

      /**
       * Now, it's safe to connect the user to StreamChat, because if the above operation fails,
       * the user won't be created, and hence we don't need to connect him to StreamChat.
       *
       * We will update this info when we update user profile. Checkout src/app/(main)/users/[username]/actions.ts
       */
      await streamServerClient.upsertUser({
        id: userId,
        name: username,
        username,
      });
    });

    // We would have to log in the user after he signs up. The goal is to avoid the user from having to log in after signing up.
    // TODO: Figure out why cookies won't be set using a common function (createSessionFromUserId)
    const session = await luciaAuth.createSession(userId, {});
    const sessionCookie = luciaAuth.createSessionCookie(session.id);

    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    // Take the user to the home page
    redirect("/"); // Since redirect returns "never", we don't need to return the error object required by the function.
  } catch (error) {
    /**
     * The redirect throws a error called isRedirectError, which is caught by the error handler.
     * Funny thing is that we won't be redirected if we don't handle this error. We would need to
     * throw the error again to be redirected.
     *
     *  * You can try commenting out the if block and see what happens. You will see the "An error occurred while signing up" message, and user won't be redirected.
     *
     * ! MUST READ: https://nextjs.org/docs/app/api-reference/functions/redirect.. This says:
     *      In Server Actions and Route Handlers, redirect should be called after the try/catch block.
     *
     * ! https://nextjs.org/docs/app/api-reference/functions/redirect#why-does-redirect-use-307-and-308
     */
    if (isRedirectError(error)) throw error;

    console.error(error);
    return {
      error: "An error occurred while signing up",
    };
  }
}
