"use client";

import { FollowerInfo } from "@/lib/types";
import { Button } from "./ui/button";
import useFollowers from "@/hooks/useFollowers";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { toast } from "@/hooks/use-toast";

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
  const queryKey: QueryKey = ["followers-info", userId];
  const { mutate } = useMutation({
    mutationFn: () =>
      data.isFollowedByUser
        ? kyInstance.delete(`/api/users/${userId}/followers`)
        : kyInstance.post(`/api/users/${userId}/followers`),
    /**
     * We use onMutate to perform something when the mutation is triggered. In this case,
     * we want to do an optimistic update (an update hoping that the server will respond with
     * success). This is a pre-mature update, and if the server responds with an error, we can
     * rollback the changes.
     */
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<FollowerInfo>(queryKey);

      queryClient.setQueryData<FollowerInfo>(queryKey, () => {
        return {
          followers:
            (previousState?.followers || 0) +
            // If the user is following, then decrement the followers count, else increment.
            (previousState?.isFollowedByUser ? -1 : 1),
          isFollowedByUser: !previousState?.isFollowedByUser,
        };
      });

      return { previousState };
    },
    onError: (error, variables, context) => {
      // On error, rollback the changes
      queryClient.setQueryData(queryKey, context?.previousState);
      console.error(error);

      toast({
        variant: "destructive",
        description: "Something's not right. Please try again later.",
      });
    },
  });
  // Component Utils ---> END

  //   Misc Helpers ---> START
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
