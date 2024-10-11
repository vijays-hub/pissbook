// Server Actions File.
"use server";

import { luciaAuth } from "@/auth";
import prisma from "@/lib/prisma";
import { SignUpConfig, signupSchema } from "@/lib/validations";
import { hash } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { isRedirectError } from "next/dist/client/components/redirect";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signup(config: SignUpConfig): Promise<{ error: string }> {
  try {
    // Extra validation on the server, as the user can bypass the client-side validation.
    const { email, username, password } = signupSchema.parse(config);

    // Now the values are validated and safe to use.

    // https://www.npmjs.com/package/@node-rs/argon2
    const passwordHash = await hash(password, {
      memoryCost: 19456, // The amount of memory to be used by the hash function, in kilobytes
      timeCost: 2, // The time cost is the amount of passes (iterations) used by the hash function. It increases hash strength at the cost of time required to compute.
      outputLen: 32, // The length of the hash in bytes
      parallelism: 1, // The number of threads to use
    });

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

    // Create a new user
    await prisma.user.create({
      data: {
        id: userId,
        email,
        username,
        passwordHash,
      },
    });

    // We would have to log in the user after he signs up. The goal is to avoid the user from having to log in after signing up.
    const session = await luciaAuth.createSession(userId, {});
    const sessionCookie = luciaAuth.createSessionCookie(session.id);

    // Set the session cookie for the user
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
