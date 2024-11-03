/**
 * A component that is displayed when hovering over the user icon or his name.
 * Usually this is on posts feed or comments feed. But, you can extend this
 * component to be used in other places, if needed.
 */
"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { FollowerInfo, UserData } from "@/lib/types";
import { PropsWithChildren } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import Link from "next/link";
import UserAvatar from "./UserAvatar";
import FollowButton from "./FollowButton";
import Linkify from "./Linkify";
import FollowerCount from "./FollowerCount";

interface UserTooltipConfig extends PropsWithChildren {
  user: UserData;
}

export default function UserTooltip({ user, children }: UserTooltipConfig) {
  const { user: loggedInUser } = useSession();

  const followerStatus: FollowerInfo = {
    followers: user._count.followers,
    isFollowedByUser: user.followers.some(
      (follower) => follower.followerId === loggedInUser?.id
    ),
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <div className="flex max-w-80 gap-3 flex-col break-words px-1 py-2.5 md:min-w-52">
            <div className="flex items-center justify-between gap-2">
              <Link href={`/users/${user.username}`}>
                <UserAvatar size={70} avatarUrl={user.avatarUrl} />
              </Link>
              {loggedInUser?.id !== user.id && (
                <FollowButton userId={user.id} initialState={followerStatus} />
              )}
            </div>

            <div>
              <Link href={`/users/${user.username}`}>
                <div className="text-lg font-semibold hover:underline">
                  {user.displayName}
                </div>
                <div className="text-muted-foreground">@{user.username}</div>
              </Link>
            </div>

            {user.bio && (
              <Linkify>
                <div className="line-clamp-4 whitespace-pre-line">
                  {user.bio}
                </div>
              </Linkify>
            )}

            <FollowerCount userId={user.id} initialState={followerStatus} />
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
