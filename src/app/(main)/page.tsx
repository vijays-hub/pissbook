import PostEditor from "@/components/posts/editor/PostEditor";
import Post from "@/components/posts/Post";
import TrendingTopics from "@/components/TrendingTopics";
import prisma from "@/lib/prisma";
import { postDataInclude } from "@/lib/types";

export default async function Home() {
  // TEMP: Displaying Posts directly. Will be refactoring this later.
  const posts = await prisma.post.findMany({
    include: postDataInclude,
    orderBy: {
      createdAt: "desc", // show the latest posts first
    },
  });

  return (
    <main className="w-full min-w-0 flex gap-5">
      <div className="w-full min-w-0 space-y-5">
        <PostEditor />

        {posts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </div>

      <TrendingTopics />
    </main>
  );
}
