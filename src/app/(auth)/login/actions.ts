"use server";

import prisma from "@/lib/prisma";
import { LoginConfig, loginSchema } from "@/lib/validations";
import { isRedirectError } from "next/dist/client/components/redirect";
import { verify } from "@node-rs/argon2";
import { redirect } from "next/navigation";
import { hashingConfig } from "@/utils/constants";
import { createSessionFromUserId, luciaAuth } from "@/auth";
import { cookies } from "next/headers";

export async function login(
  credentials: LoginConfig
): Promise<{ error: string }> {
  try {
    const { password, username } = loginSchema.parse(credentials);

    // Now the values are validated and safe to use.

    // Validate the password and username

    // Check if the user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });

    if (!existingUser || !existingUser.passwordHash) {
      return {
        error: "Invalid username or password",
      };
    }

    // Check if the password is correct
    const validPassword = await verify(
      existingUser.passwordHash,
      password,
      hashingConfig
    );

    if (!validPassword) {
      return {
        /**
         * Returning a generic error message to avoid user from knowing if
         * the username or password is incorrect, because that would be a security risk,
         * as he can brute force the login.
         */
        error: "Invalid username or password",
      };
    }

    // TODO: Figure out why cookies won't be set using a common function (createSessionFromUserId)
    const session = await luciaAuth.createSession(existingUser.id, {});
    const sessionCookie = luciaAuth.createSessionCookie(session.id);

    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    redirect("/");
  } catch (error) {
    // Checkout sign up actions for more information on this error handling
    if (isRedirectError(error)) throw error;
    console.error(error);
    return {
      error: "Error logging in. That's on us. Please try again later.",
    };
  }
}
