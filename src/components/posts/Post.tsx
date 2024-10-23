/**
 * import { Post as PostSchema } from "@prisma/client";
 * interface PostConfig {
 *      post: PostSchema;
 * }
 *
 * The default type the @prisma/client library returns won't have the relations (include) data.
 * That is, with the above code, for a post, there is a relation between the post and the user.
 * But when you try to read the data of 'post', the user won't be included. To fix this, we
 * are creating a new type for ourselves that includes the user data. This also helps us to
 * re-use the type in multiple places. So, whenever we are querying for posts, we can simply
 * specify this type in the include field of findMany query of posts.
 *
 * Checkout the PostData type in src/lib/types.ts file. It is a type that includes the user data
 * along with the post data. This is the type we are using in the Post component.
 *
 * interface PostConfig {
 *     post: PostData;
 * }
 *
 */

import { PostData } from "@/lib/types";
import Link from "next/link";
import UserAvatar from "../UserAvatar";
import { formatRelativeDate, getSanitizedDisplayName } from "@/lib/utils";

interface PostConfig {
  post: PostData;
}

export default function Post({ post }: PostConfig) {
  return (
    <article className="space-y-3 bg-card rounded-2xl p-5 shadow-sm">
      <div className="flex flex-wrap gap-3">
        <Link href={`/users/${post.user.username}`}>
          <UserAvatar avatarUrl={post.user.avatarUrl} />
        </Link>

        <div>
          <Link
            href={`/users/${post.user.username}`}
            className="block font-medium hover:underline capitalize"
          >
            {getSanitizedDisplayName(post.user.displayName)}
          </Link>
          <Link
            href={`/posts/${post.id}`}
            className="block text-sm text-muted-foreground hover:underline"
          >
            {formatRelativeDate(post.createdAt)}
          </Link>
        </div>
      </div>

      <div className="whitespace-pre-line break-words">{post.content}</div>
    </article>
  );
}
