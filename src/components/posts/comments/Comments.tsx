import { CommentsPage, PostData } from "@/lib/types";
import CommentInput from "./CommentInput";
import { useInfiniteQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Comment from "./Comment";

/**
 * Take a look a the For You feed component to digest what's happening here.
 *
 * src/app/(main)/ForYouFeed.tsx
 * 
 * TODO: Support for nested comments
 */
export default function Comments({ post }: { post: PostData }) {
  const { data, fetchNextPage, hasNextPage, isFetching, status } =
    useInfiniteQuery({
      queryKey: ["comments", post.id],
      queryFn: ({ pageParam }) =>
        kyInstance
          .get(
            `/api/posts/${post.id}/comments`,
            pageParam ? { searchParams: { cursor: pageParam } } : {}
          )
          .json<CommentsPage>(),
      initialPageParam: null as string | null,
      getNextPageParam: (firstPage) => firstPage.previousCursor,
      /**
       * This is similar to our regular JS map function. It is used to transform the data
       * before it is returned to the component. In this case, we are reversing the pages
       * and pageParams arrays. This is because we are fetching comments in reverse order.
       *
       * ! https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries#what-if-i-want-to-show-the-pages-in-reversed-order
       */
      select: (data) => ({
        // Creating new arrays instead of mutating the existing ones. Helps in reactivity.
        pages: [...data.pages].reverse(),
        pageParams: [...data.pageParams].reverse(),
      }),
    });

  const comments = data?.pages.flatMap((page) => page.comments) || [];

  return (
    <div className="space-y-3">
      <CommentInput post={post} />
      {/* 
            Unlike the posts feed, we are not loading infinite loading for the comments.
            This is because it would be odd to have infinite loading for comments. Instead,
            we simply have a button to load previous comments.
      */}
      {hasNextPage && (
        <Button
          variant="link"
          className="mx-auto block"
          disabled={isFetching}
          onClick={() => fetchNextPage()}
        >
          Expand previous opinions
        </Button>
      )}

      {/* We could add these checks using an if condition on the top before return() as well, but I am lazy!! */}
      {status === "pending" && <Loader2 className="mx-auto animate-spin" />}
      {status === "success" && !comments.length && (
        <p className="text-center text-muted-foreground">
          No opinions yet. Care to drop one?
        </p>
      )}
      {status === "error" && (
        <p className="text-center text-destructive">
          Something's not right! Failed to load opinions. Please try again.
        </p>
      )}

      {/* divide-y simply adds a border-top and border-bottom accordingly on it's children */}
      <div className="divide-y">
        {comments.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}
