import { Prisma } from "@prisma/client";

export const postDataInclude = {
  // Add more fields as needed
  user: {
    select: {
      // Include more data as needed
      username: true,
      displayName: true,
      avatarUrl: true,
    },
  },
} satisfies Prisma.PostInclude; // Explore more on "satisfies" keyword in TypeScript -- https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator

// This is the type we are using in the Post component. Checkout some comments in the Post component file regarding this type.
export type PostData = Prisma.PostGetPayload<{
  include: typeof postDataInclude;
}>;
