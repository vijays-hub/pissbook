"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { getUserDataSelect } from "@/lib/types";
import {
  UpdateUserProfileConfig,
  updateUserProfileSchema,
} from "@/lib/validations";

export default async function updateUserProfile(
  values: UpdateUserProfileConfig
) {
  const validatedValues = updateUserProfileSchema.parse(values);

  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  /**
   * Take a look here: src/app/(auth)/signup/actions.ts, to understand what's
   * happening here.
   */
  const updatedUser = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: user.id },
      data: {
        ...validatedValues,
      },
      select: getUserDataSelect(user.id),
    });

    await streamServerClient.partialUpdateUser({
      id: updatedUser.id,
      set: {
        name: updatedUser.displayName,
      },
    });

    return updatedUser;
  });

  return updatedUser;
}
