/**
 * This showcases the hot topics that are trending on the platform. Usually will be
 * shown in the feed section of the platform. Hence this is not inside a layout and
 * is a standalone component.
 *
 * Notice that this is a server component, because we would need to fetch data and display
 * directly.
 */

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { userDataSelect } from "@/lib/types";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import UserAvatar from "./UserAvatar";
import { Button } from "./ui/button";
import { getSanitizedDisplayName } from "@/lib/utils";

export default async function TrendingTopics() {
  return (
    <div className="sticky top-[5.25rem] hidden md:block h-fit lg:w-80 w-72 flex-none space-y-5">
      {/* 
            Wrapping the follow suggestions inside a Suspense component to make sure that the
            component is loaded only when the data is ready. This is important because we are
            fetching data inside the component, and this is a server component. 

            Without this, the page keeps loading until the data is fetched, which is not a good 
            user experience.
      */}
      <Suspense fallback={<Loader2 className="mx-auto animate-spin" />}>
        <FollowSuggestions />
      </Suspense>
    </div>
  );
}

/**
 * Suggests the users to follow based on the user's interests and the people they are
 * following. Currently, we are simply returning 5 user suggestions (excluding the logged in user of course),
 * but we will refine this based on Follow Suggestions algorithm later.
 */
async function FollowSuggestions() {
  const { user } = await validateRequest();

  if (!user) return null;

  //   TODO: Move this to a separate function.
  const usersToFollow = await prisma.user.findMany({
    where: {
      NOT: {
        id: user.id,
      },
    },
    select: userDataSelect,
    take: 5,
  });

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">You may know:</div>
      {usersToFollow.map((user) => (
        <div key={user.id} className="flex items-center justify-center gap-6">
          <Link
            href={`/user/${user.username}`}
            className="flex items-center gap-3"
          >
            <UserAvatar
              avatarUrl={user.avatarUrl}
              size={40}
              className="flex-none"
            />

            <div>
              <p className="line-clamp-1 break-all font-semibold hover:underline text-sm capitalize">
                {getSanitizedDisplayName(user.displayName)}
              </p>
              <p className="line-clamp-1 break-all text-muted-foreground text-xs">
                @{user.username}
              </p>
            </div>
          </Link>

          <Button>Follow</Button>
        </div>
      ))}
    </div>
  );
}
