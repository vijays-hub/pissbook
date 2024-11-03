import { validateRequest } from "@/auth";
import FollowButton from "@/components/FollowButton";
import FollowerCount from "@/components/FollowerCount";
import TrendingTopics from "@/components/TrendingTopics";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import prisma from "@/lib/prisma";
import { FollowerInfo, getUserDataSelect, UserData } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { formatDate } from "date-fns";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import UserPosts from "./UserPosts";
import Linkify from "@/components/Linkify";
import EditProfileButton from "./EditProfileTrigger";

interface ProfilePageConfig {
  params: { username: string };
  className?: string;
}

const getUser = cache(async (username: string, loggedInUserId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },
    select: getUserDataSelect(loggedInUserId),
  });

  if (!user) notFound(); // 404 Next.js Page

  return user;
});

export async function generateMetadata({
  params: { username },
}: ProfilePageConfig): Promise<Metadata> {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) return {};

  const user = await getUser(username, loggedInUser.id);

  return {
    title: `${user.displayName} (@${user.username})`,
    // More page props as needed.
  };
}

export default async function ProfilePage({
  params: { username },
}: ProfilePageConfig) {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser)
    return <p>You don&apos;t have privileges to view this pisser!</p>;

  const user = await getUser(username, loggedInUser.id);

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <UserProfile user={user} loggedInUserId={loggedInUser.id} />

        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h2 className="text-center text-xl font-bold">
            {user.displayName}&apos;s pissing experience(s)
          </h2>
        </div>

        <UserPosts userId={user.id} />
      </div>
      <TrendingTopics />
    </main>
  );
}

async function UserProfile({
  user,
  loggedInUserId,
}: {
  user: UserData;
  loggedInUserId: string;
}) {
  const followerInfo: FollowerInfo = {
    followers: user._count.followers,
    isFollowedByUser: user.followers.some(
      (follower) => follower.followerId === loggedInUserId
    ),
  };

  return (
    <div className="h-fit w-full space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <UserAvatar
        avatarUrl={user.avatarUrl}
        size={250}
        className="mx-auto size-full max-h-60 max-w-60 rounded-full"
      />

      <div className="flex flex-wrap gap-3 sm:flex-nowrap">
        <div className="me-auto space-y-3">
          <div>
            <h1 className="text-3xl font-bold ">{user.displayName}</h1>
            <div className="text-muted-foreground">@{user.username}</div>
          </div>

          <div>Pissing since: {formatDate(user.createdAt, "MMM d, yyyy")}</div>
          <div className="flex items-center gap-3">
            <span>
              Posts:{" "}
              <span className="font-semibold">
                {formatNumber(user._count.posts)}
              </span>
            </span>

            <FollowerCount userId={user.id} initialState={followerInfo} />
          </div>
        </div>

        {user.id === loggedInUserId ? (
          <EditProfileButton user={user} />
        ) : (
          // Checkout the followers count when the user clicks on the follow/unfollow button
          <FollowButton userId={user.id} initialState={followerInfo} />
        )}
      </div>

      {/* User Bio */}
      {user.bio && (
        <>
          <hr />

          <Linkify>
            <div className="whitespace-pre-line overflow-hidden break-words">
              {user.bio}
            </div>
          </Linkify>
        </>
      )}
    </div>
  );
}
