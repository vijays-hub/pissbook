import { z } from "zod";

const requiredString = z.string().trim().min(1, "This field is required");

export const signupSchema = z.object({
  email: requiredString.email("Invalid email address"),
  name: requiredString.min(3, "Name must be at least 3 characters"),
  username: requiredString.regex(
    /^[a-zA-Z0-9._-]+$/,
    "Invalid Username! No special characters allowed, except for underscore(_), period (.) and hyphens(-)"
  ),
  password: requiredString.min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  username: requiredString,
  password: requiredString,
});

export type SignUpConfig = z.infer<typeof signupSchema>;
export type LoginConfig = z.infer<typeof loginSchema>;

// Posts ---> START
export const createPostSchema = z.object({
  content: requiredString,
  mediaIds: z
    .array(z.string())
    .max(5, "You can upload at most 5 pissing files"),
});
// Posts ---> END

// Uploadthing ---> START
export const updateUserProfileSchema = z.object({
  displayName: requiredString,
  bio: z.string().max(1000, "Bio must be less than 1000 characters"),
});

export type UpdateUserProfileConfig = z.infer<typeof updateUserProfileSchema>;
// Uploadthing ---> END
