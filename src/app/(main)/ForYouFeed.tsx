"use client";

import Post from "@/components/posts/Post";
import kyInstance from "@/lib/ky";
import { PostData } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function ForYouFeed() {
  const query = useQuery<PostData[]>({
    // Adding a generic "post-feed" key to the queryKey. We'll use this for all our post feed queries.
    queryKey: ["post-feed", "for-you"],
    // No need to handle any error states. kyInstance will throw an error if the request fails.
    queryFn: kyInstance.get("/api/posts/for-you").json<PostData[]>,
  });

  if (query.status === "pending") {
    return <Loader2 className="mx-auto animate-spin" />;
  }

  if (query.status === "error") {
    return <p>Failed to fetch the feed for you. Please try again later.</p>;
  }

  //   When data is available, we can render the posts.
  return (
    <div className="space-y-5">
      {query.data.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}
