/**
 * All the non-create mutations for posts. The create mutation is in the editor folder.
 */

import { PostData } from "@/lib/types";

import { toast } from "@/hooks/use-toast";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { deletePost } from "./actions";
import { POST_FEED_CACHE_KEY } from "@/app/(main)/ForYouFeed";
import { PostsPage } from "@/lib/types";
import { usePathname, useRouter } from "next/navigation";

export function usePostDeleteMutation() {
  const queryClient = useQueryClient();

  const router = useRouter();
  const pathname = usePathname();

  const mutation = useMutation({
    mutationFn: deletePost,
    onSuccess: async (deletedPost) => {
      const queryFilter: QueryFilters = { queryKey: [POST_FEED_CACHE_KEY[0]] }; // We only need the generic "posts-feed" key

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.filter((p) => p.id !== deletedPost.id),
            })),
          };
        }
      );

      toast({
        description: "Your pissing experience is deleted",
      });

      /**
       * Once we delete a post, let's redirect them back.
       * The useRouter hook from next/navigation helps us with this.
       *
       * You can redirect to wherever you want. In this case, we are redirecting to the
       * user's profile, where we can see all the posts of the user.
       */
      if (pathname === `/posts/${deletedPost.id}`) {
        router.push(`/users/${deletedPost.user.username}`);
      }
    },
    onError: (error) => {
      console.error("Error while deleting post", error);
      toast({
        variant: "destructive",
        description: "Error while deleting your pissing experience",
      });
    },
  });

  return mutation;
}
