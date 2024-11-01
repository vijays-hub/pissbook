/**
 * Have a look at the FollowButton (src/components/FollowButton.tsx) to digest what's
 * happening here.
 */

import { toast } from "@/hooks/use-toast";
import kyInstance from "@/lib/ky";
import { PostLikeData } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Heart } from "lucide-react";

interface LikeButtonConfig {
  postId: string;
  initialState: PostLikeData;
}

export default function PostLikeButton({
  postId,
  initialState,
}: LikeButtonConfig) {
  const queryClient = useQueryClient();

  const queryKey: QueryKey = ["like-info", postId];

  const { data } = useQuery({
    queryKey,
    queryFn: () =>
      kyInstance.get(`/api/posts/${postId}/likes`).json<PostLikeData>(),
    initialData: initialState,
    staleTime: Infinity,
  });

  const { mutate } = useMutation({
    mutationFn: () =>
      data.isLikedByUser
        ? kyInstance.delete(`/api/posts/${postId}/likes`)
        : kyInstance.post(`/api/posts/${postId}/likes`),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<PostLikeData>(queryKey);

      queryClient.setQueryData<PostLikeData>(queryKey, () => ({
        likes:
          (previousState?.likes || 0) + (previousState?.isLikedByUser ? -1 : 1),
        isLikedByUser: !previousState?.isLikedByUser,
      }));

      return { previousState };
    },
    onError(error, variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState);
      console.error(error);
      toast({
        variant: "destructive",
        description: "Error liking this pissing experience. Please try again.",
      });
    },
  });

  return (
    <button onClick={() => mutate()} className="flex items-center gap-2">
      <Heart
        className={cn(
          "size-5",
          data.isLikedByUser && "fill-red-500 text-red-500"
        )}
      />
      <span className="text-sm font-medium tabular-nums">{data.likes}</span>
    </button>
  );
}
