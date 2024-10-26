import { Prisma } from "@prisma/client";

export const userDataSelect = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;

export const postDataInclude = {
  // Add more fields as needed
  user: {
    select: userDataSelect,
  },
} satisfies Prisma.PostInclude; // Explore more on "satisfies" keyword in TypeScript -- https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator

// This is the type we are using in the Post component. Checkout some comments in the Post component file regarding this type.
export type PostData = Prisma.PostGetPayload<{
  include: typeof postDataInclude;
}>;

export interface PostsPage {
  posts: PostData[];
  nextCursor: string | null;
}
