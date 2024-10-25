"use client";

import Post from "@/components/posts/Post";
import { PostData } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function ForYouFeed() {
  const query = useQuery<PostData[]>({
    // Adding a generic "post-feed" key to the queryKey. We'll use this for all our post feed queries.
    queryKey: ["post-feed", "for-you"],
    queryFn: async () => {
      // We'll use a common util for network requests later. For now, we'll use fetch.
      const response = await fetch("/api/posts/for-you");
      if (!response.ok) {
        throw new Error(
          `Failed to fetch the feed. Errored with status code ${response.status}`
        );
      }
      return response.json();
    },
  });

  if (query.status === "pending") {
    return <Loader2 className="mx-auto animate-spin" />;
  }

  if (query.status === "error") {
    return <p>Failed to fetch the feed for you. Please try again later.</p>;
  }

  //   When data is available, we can render the posts.
  return (
    <>
      {query.data.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </>
  );
}
