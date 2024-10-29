"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
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

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...validatedValues,
    },
    select: getUserDataSelect(user.id),
  });

  return updatedUser;
}
