/**
 * The `useMutation` hook from react-query gives us a ability to perform (mutate)
 * something when a particular event occurs. In this case, we are using it to create
 * a new post and also refresh the posts list after the mutation is successful.
 *
 * Prior to this, we were simply creating a post using a server action (createPost in actions.ts)
 *  and were needed to refresh the page to see the new post. But now, we can create a post
 * and see it in the list without refreshing the page.
 *
 * There are more capabilities of the `useMutation` hook that we can explore here:
 * https://tanstack.com/query/latest/docs/framework/react/reference/useMutation#usemutation
 */

import { toast } from "@/hooks/use-toast";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { createPost } from "./actions";
import { POST_FEED_CACHE_KEY } from "@/app/(main)/ForYouFeed";
import { PostsPage } from "@/lib/types";
import { useSession } from "@/app/(main)/SessionProvider";

export function usePostSubmitMutation() {
  const queryClient = useQueryClient();

  const { user } = useSession();

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: async (newPost) => {
      /**
       * This is a right place to invalidate the query cache for the posts list.
       *
       * This is how you usually invalidate the cache for a query:
       * queryClient.invalidateQueries(POST_FEED_CACHE_KEY);
       *
       * But wait, do we need to invalidate the entire posts list cache? No, we don't.
       * Let's see why:
       *
       * We are using useInfiniteQuery in ForYouFeed.tsx to fetch the posts. This means that this
       * hook fetches the pages in succession. So, let's say we have loaded around 10 pages, and
       * now if we try to invalidate the cache, it will refetch all the 10 pages again. Which means
       * it takes a lot of time to load the posts again. This is not a good user experience.
       *
       * To test this, comment out the code below and add this single line:
       * queryClient.invalidateQueries(POST_FEED_CACHE_KEY);
       *
       * Now try to create a post and see how long it takes to load the posts again. Check for the
       * network requests in the browser's dev tools (or in console of terminal).
       *
       * Our entire goal for invalidating the cache when a post is created is to show the new post
       * without refreshing the page. So, logically, we just simply need to insert the newly created
       * post (returned from our createPost server action) into the cache ourselves.
       * This way, we can show the new post without refreshing the page and also not refetch all
       * the pages again.
       *
       * Steps:
       * 1. Prepare a queryFilter that helps identify the query cache key for the posts list.
       * 2. Cancel all the ongoing queries for the posts list. This is to avoid bugs when appending
       *   the new post to the cache. The cancelQueries function of our client will cancel the
       *  ongoing queries for the posts list, with the help of the queryFilter.
       * 3. Append the new post to the cache. This is done using the setQueryData function of
       * our client. Here, we are using setQueriesData because we would need to modify multiple
       * posts later on (Like putting the post on Profile etc).
       *
       * https://tanstack.com/query/latest/docs/reference/QueryClient#queryclientsetqueriesdata
       *
       *  */

      /**
       * Update: We have introduced Profile page and we are displaying user posts in that page.
       * Hence, when we create a post and the author of the post is the same as the logged in user,
       * we would need to append the new post to the Profile page as well, like, we are revalidating
       * the cache of the posts list in the Profile page as well. To achieve multiple invalidations
       * we take the help of predicate function when defining our queryFilter.
       * 
       * When we do this, there will be realtime updates in the ForYouFeed page and the Profile page!
       *
       * Also, we are changing the type of queryFilter to "satisfies QueryFilter" type. This is to
       * avoid typescript shouting that it can't find predicate in the invalidateQueries function below.
       *
       * Without this, ie., when const queryFilter: QueryFilters -> typescript will throw an error saying:
       * 'queryFilter.predicate' is possibly 'undefined'. ts(18048)
       * Cannot invoke an object which is possibly 'undefined'. ts(2722)
       */
      const queryFilter = {
        queryKey: ["post-feed"],
        predicate: (query) => {
          // We are checking if the query is for the posts list in the ForYouFeed page or the Profile page.
          return (
            query.queryKey.includes("for-you") ||
            // We need to make sure we are ONLY invalidating the cache for the logged in user's posts list.
            (query.queryKey.includes("user-posts") &&
              query.queryKey.includes(user.id))
          );
        },
      } satisfies QueryFilters;

      queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          /**
           * Have a look at the ForYouFeed.tsx file to understand the structure of the data.
           *
           * Our goal is to find the first page of the posts list and append the new post to it.
           */

          const firstPage = oldData?.pages[0];

          if (!firstPage) return oldData;

          return {
            pageParams: oldData.pageParams, // Pass the pageParams as it is...
            pages: [
              {
                posts: [newPost, ...firstPage.posts], // Add the new post to the top of the list, and then add the rest of the posts in the first page.
                nextCursor: firstPage.nextCursor, // The nextCursor remains the same.
              },
              ...oldData.pages.slice(1), // We are omitting the first page because we are modifying it above.
            ],
          };
        }
      );

      /**
       * There can be a very very rare case, where the user tries to submit a post even before the
       * existing posts are loaded. In this case, since we are cancelling the ongoing queries, the
       * feed will not be loaded at all and only the new post will be shown. This is not a good user
       * experience. So, we need to invalidate the cache for the posts list in such cases.
       *
       * Again, this is a very rare case and you might not even notice it. But it's good to have it.
       *
       * UPDATE:
       * We have introduced Profile page where we are displaying user posts. Hence, we need to
       * invalidate the cache for the Profile page as well, if the rare case occurs. To do this
       * we simply check for predicate defined in our queryFilter. We have already defined this
       * predicate function while defining the queryFilter. So, when we call it by passing the 
       * query object, it will return true if the query is for the posts list in the ForYouFeed
       * page or the Profile page.
       * 
       * To summarize, we are invalidating the cache, for the posts list in the ForYouFeed page 
       * and the Profile page only if the data is not present in the cache, which occurs rarely
       * when the user tries to submit a post even before the existing posts are loaded.
       */
      queryClient.invalidateQueries({
        queryKey: queryFilter.queryKey,
        // This is a predicate function that helps us to invalidate the cache only if the data is not present.
        predicate: (query) => queryFilter.predicate(query) && !query.state.data,
      });



      //   Show a success toast message
      toast({
        description: "Your pissing experience is recorded",
      });
    },
    onError: (error) => {
      console.error("Error while creating post", error);
      toast({
        variant: "destructive",
        description: "Error while creating your post",
      });
    },
  });

  return mutation;
}
