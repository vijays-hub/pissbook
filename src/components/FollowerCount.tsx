/**
 * Making this a client component for optimistic updates when user clicks
 * on follow/unfollow button. Remember we have a reusable hook for this?
 * Checkout: src/hooks/useFollowers.ts and src/components/FollowButton.tsx
 */

"use client";

import useFollowers from "@/hooks/useFollowers";
import { FollowerInfo } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

interface FollowerCountProps {
  userId: string;
  initialState: FollowerInfo;
}

export default function FollowerCount({
  userId,
  initialState,
}: FollowerCountProps) {
  const { data } = useFollowers(userId, initialState);

  return (
    <span>
      Followers:{" "}
      <span className="font-semibold">{formatNumber(data.followers)}</span>
    </span>
  );
}
