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

/**
 * This component is rendered in the ForYouPage component, which is a client component.
 * We need not specify the "use client" directive for every child component of a client component.
 * But no harm in specifying it.
 */
"use client";

import { PostData, PostLikeData } from "@/lib/types";
import Link from "next/link";
import UserAvatar from "../UserAvatar";
import { formatRelativeDate, getSanitizedDisplayName } from "@/lib/utils";
import { useSession } from "@/app/(main)/SessionProvider";
import PostActionsMenu from "./PostActionsMenu";
import Linkify from "../Linkify";
import UserTooltip from "../UserTooltip";
import React from "react";
import PostLikeButton from "./PostLikeButton";
import BookmarkButton from "./BookmarkButton";
import MediaCarousel from "../MediaCarousel";

interface PostConfig {
  post: PostData;
}

export default function Post({ post }: PostConfig) {
  const { user } = useSession();

  const likesData: PostLikeData = {
    likes: post._count.likes,
    isLikedByUser: post.likes.length > 0,
  };

  return (
    /**
     * Tailwind gives us a ability to style based on the parent state using the group class.
     * https://tailwindcss.com/docs/hover-focus-and-other-states#styling-based-on-parent-state
     *
     * This is helpful for our use case here. We need to display the Post actions menu when
     * hovered anywhere on the Post.
     *
     * The PostActionsMenu component initially will have 0 opacity and when hovered on the Post,
     * we will change the opacity to 100%.
     *
     * NOTE:
     * We can also name the groups. This is helpful when we have multiple group classes. We can name the group classes and use them in the child classes.
     * For ex: we are naming the Post group as group/post . Now we can use this group name in for our needs.
     */
    <article className="group/post space-y-3 bg-card rounded-2xl p-5 shadow-sm">
      <div className="flex justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <UserTooltip user={post.user}>
            <Link href={`/users/${post.user.username}`}>
              <UserAvatar avatarUrl={post.user.avatarUrl} />
            </Link>
          </UserTooltip>

          <div>
            <UserTooltip user={post.user}>
              <Link
                href={`/users/${post.user.username}`}
                className="block font-medium hover:underline capitalize"
              >
                {getSanitizedDisplayName(post.user.displayName)}
              </Link>
            </UserTooltip>
            <Link
              href={`/posts/${post.id}`}
              className="block text-sm text-muted-foreground hover:underline italic"
              /**
               * TEMP: Remove this when we have a fix for the hydration warning!
               * 
               * This is a special case where user created a post and he clicks on the
               * post to view it. So in such cases, we can suppress the hydration warning.
               * 
               * ! HERE IS THE ERROR:
               * 
               * Hydration failed because the server rendered HTML didn't match the client. 
               * As a result this tree will be regenerated on the client. This can happen if a 
               * SSR-ed Client Component used
                  See more info here: https://nextjs.org/docs/messages/react-hydration-error

                  - A server/client branch `if (typeof window !== 'undefined')`.
                  - Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
                  - Date formatting in a user's locale which doesn't match the server.
                  - External changing data without sending a snapshot of it along with the HTML.
                  - Invalid HTML tag nesting.

                  It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.


                  ...
                  +  14 seconds ago
                  -  13 seconds ago
               */
              suppressHydrationWarning
            >
              {/* TEMP: Commenting this out for time being. When we return the posts data from the 
                      endpoint we made today (posts/for-you), we will have the createdAt field 
                      in string format as Response.JSON converts the Date object to string.

                We'll fix this shortly. -- Solved it using kyInstance in src/lib/ky.ts
            
            */}
              {formatRelativeDate(post.createdAt)}
            </Link>
          </div>
        </div>

        {post.user.id === user?.id && (
          <PostActionsMenu
            post={post}
            // Check the comment above to understand the group/post class
            className="opacity-0 transition-opacity group-hover/post:opacity-100"
          />
        )}
      </div>

      <Linkify>
        <div className="whitespace-pre-line break-words">{post.content}</div>
      </Linkify>

      {/* TODO: Convert this to a carousel */}
      {!!post.attachments.length && (
        <MediaCarousel
          attachments={[
            ...post.attachments,
            ...post.attachments,
            ...post.attachments,
          ]}
        />
      )}

      <hr className="text-muted-foreground" />
      <div className="flex justify-between gap-5">
        <PostLikeButton postId={post.id} initialState={likesData} />
        <BookmarkButton
          postId={post.id}
          initialState={{
            isBookmarkedByUser: post.bookmarks.some(
              (bookmark) => bookmark.userId === user?.id
            ),
          }}
        />
      </div>
    </article>
  );
}
