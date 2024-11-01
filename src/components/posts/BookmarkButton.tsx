/**
 * Have a look at the FollowButton (src/components/FollowButton.tsx) to digest what's
 * happening here.
 */

import { useToast } from "@/hooks/use-toast";
import kyInstance from "@/lib/ky";
import { BookmarkInfo } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Bookmark } from "lucide-react";

interface BookmarkButtonProps {
  postId: string;
  initialState: BookmarkInfo;
}

export default function BookmarkButton({
  postId,
  initialState,
}: BookmarkButtonProps) {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const queryKey: QueryKey = ["bookmark-info", postId];

  const { data } = useQuery({
    queryKey,
    queryFn: () =>
      kyInstance.get(`/api/posts/${postId}/bookmark`).json<BookmarkInfo>(),
    initialData: initialState,
    staleTime: Infinity,
  });

  const { mutate } = useMutation({
    mutationFn: () =>
      data.isBookmarkedByUser
        ? kyInstance.delete(`/api/posts/${postId}/bookmark`)
        : kyInstance.post(`/api/posts/${postId}/bookmark`),
    onMutate: async () => {
      const action = data.isBookmarkedByUser ? "remove" : "add";
      const isRemoving = action === "remove";

      toast({
        description: `${isRemoving ? "Removed" : "Added"} this pissing experience ${isRemoving ? "from" : "to"} bookmarks`,
      });

      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<BookmarkInfo>(queryKey);

      /**
       * Here, when a post is bookmarked, we need not update our cache immediately. The whole purpose
       * of bookmarking is to store the post for later. So, we can leave the cache updating part here.
       * Also, when a post is un bookmarked, we need not remove the post from bookmarks immediately.
       * User might have clicked the button by mistake. So, we can leave the cache updating part here as 
       * well.
       * Of course, if the user refreshes the page, the cache will be updated.
       */
      queryClient.setQueryData<BookmarkInfo>(queryKey, () => ({
        isBookmarkedByUser: !previousState?.isBookmarkedByUser,
      }));

      return { previousState };
    },
    onError(error, variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState);
      console.error(error);
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again.",
      });
    },
  });

  return (
    <button onClick={() => mutate()} className="flex items-center gap-2">
      <Bookmark
        className={cn(
          "size-5",
          data.isBookmarkedByUser && "fill-primary text-primary"
        )}
      />
    </button>
  );
}
