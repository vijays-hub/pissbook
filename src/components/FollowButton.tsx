"use client";

import { FollowerInfo } from "@/lib/types";
import { Button } from "./ui/button";
import useFollowers from "@/hooks/useFollowers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";

interface FollowButtonProps {
  userId: string;
  initialState: FollowerInfo;
}

export default function FollowButton({
  userId,
  initialState,
}: FollowButtonProps) {
  // Component Utils ---> START
  const queryClient = useQueryClient(); // For optimistic updates by invalidating the query

  const { data } = useFollowers(userId, initialState);

  /**
   *  Mutation for following/unfollowing. We could also call server endpoint directly, but we might
   * need to do some extra workaround for loading state, error handling, and optimistic updates.
   * But with react-query, we can easily handle all these cases, as it gives the success, error
   * callbacks, and using the queryClient we can invalidate the query to refetch the data, if needed.
   */
  const { mutate } = useMutation({
    mutationFn: () =>
      data.isFollowedByUser ? unfollowUser(userId) : followUser(userId),
  });
  // Component Utils ---> END

  //   Misc Helpers ---> START
  const unfollowUser = async (userId: string) => {
    kyInstance.delete(`/api/users/${userId}/followers`);
  };

  const followUser = async (userId: string) => {
    kyInstance.post(`/api/users/${userId}/followers`);
  };
  // Misc Helpers ---> END

  return (
    <Button
      variant={data.isFollowedByUser ? "secondary" : "default"}
      onClick={() => mutate()}
    >
      {data.isFollowedByUser ? "Unfollow" : "Follow"}
    </Button>
  );
}
