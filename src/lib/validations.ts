import { z } from "zod";

const requiredString = z.string().trim().min(1, "This field is required");

export const signupSchema = z.object({
  email: requiredString.email("Invalid email address"),
  username: requiredString.regex(
    /^[a-zA-Z0-9_-]+$/,
    "Invalid Username! No special characters allowed, except for _ and -"
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
});
// Posts ---> END
