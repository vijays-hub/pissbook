"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import Post from "@/components/posts/Post";
import PostsLoadingSkeleton from "@/components/posts/PostsLoadingSkeleton";
import kyInstance from "@/lib/ky";
import { PostsPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export const POST_FEED_CACHE_KEY = ["post-feed", "following"];

export default function FollowingFeed() {
  // This is a callback function that will be called by useInfiniteQuery to fetch the posts.
  const fetchPosts = async ({ pageParam }: { pageParam: string | null }) =>
    kyInstance
      .get(
        "/api/posts/following",
        pageParam
          ? {
              searchParams: { cursor: pageParam },
            }
          : {}
      )
      .json<PostsPage>();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    // Adding a generic "post-feed" key to the queryKey. We'll use this for all our post feed queries.
    queryKey: POST_FEED_CACHE_KEY,
    // No need to handle any error states. kyInstance will throw an error if the request fails.
    queryFn: fetchPosts,
    /**
     * The first page will have a null cursor. Also, we have strictly typed this to
     * be a string or null. This is because the cursor can be string or null. If it is
     * null, it means there are no more posts available.
     */
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  /**
   * 'data' object looks like this: (Initially only one object will be present, but as we scroll, more objects will be added to the pages array)
   * { pages: [{ posts: PostData[], nextCursor: string | null }, ...], pageParams: string[] }
   *
   * So we need to flatten the 'pages' array to get all the posts.
   *
   * What is flatten? -- It is a process of converting a 2D array to a 1D array.
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat
   *
   * flatMap is a combination of map and flat. It maps each element using the map function.
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap
   *
   * We are using flatMap to flatten the 'pages' array and then map over each page to get the posts.
   * The posts array present in each object of pages is what we are trying to flatten.̊
   *
   */
  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  if (status === "pending") {
    return <PostsLoadingSkeleton />;
  }

  // When there are no posts and there are no more posts to fetch, we can show a message.
  if (status === "success" && posts.length === 0 && !hasNextPage) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Such empty! Start following people you know to see their pissing
        experiences.
      </p>
    );
  }

  if (status === "error") {
    return <p>Failed to fetch the feed for you. Please try again later.</p>;
  }

  //   When data is available, we can render the posts.
  return (
    <InfiniteScrollContainer
      className="space-y-5"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}

      {/* No need of skeleton here! Usually that's meant only for initial load. */}
      {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
    </InfiniteScrollContainer>
  );
}
