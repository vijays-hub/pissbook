/**
 * This showcases the hot topics that are trending on the platform. Usually will be
 * shown in the feed section of the platform. Hence this is not inside a layout and
 * is a standalone component.
 *
 * Notice that this is a server component, because we would need to fetch data and display
 * directly.
 */

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import UserAvatar from "./UserAvatar";
import { Button } from "./ui/button";
import { formatNumber, getSanitizedDisplayName } from "@/lib/utils";
import { unstable_cache } from "next/cache";
import FollowButton from "./FollowButton";
import { getUserDataSelect } from "@/lib/types";

export default async function TrendingTopics() {
  return (
    <div className="sticky top-[5.25rem] hidden md:block h-fit lg:w-80 w-72 flex-none space-y-5">
      {/* 
            Wrapping the follow suggestions inside a Suspense component to make sure that the
            component is loaded only when the data is ready. This is important because we are
            fetching data inside the component, and this is a server component. 

            Without this, the page keeps loading until the data is fetched, which is not a good 
            user experience.

            Likewise for the trending topics.
      */}
      <Suspense fallback={<Loader2 className="mx-auto animate-spin" />}>
        <FollowSuggestions />
        <TrendingTopicsDisplay />
      </Suspense>
    </div>
  );
}

/**
 * Suggests the users to follow based on the user's interests and the people they are
 * following. Currently, we are simply returning 5 user suggestions (excluding the logged in user of course),
 * but we will refine this based on Follow Suggestions algorithm later.
 */
async function FollowSuggestions() {
  const { user } = await validateRequest();

  if (!user) return null;

  //   TODO: Move this to a separate function.
  const usersToFollow = await prisma.user.findMany({
    where: {
      //  ensures that the current user doesn’t see themselves in the list of follow suggestions.
      NOT: {
        id: user.id,
      },
      /**
       * This condition filters out users who the current user is already following.
       * The condition checks that there should be no entry in the followers relation
       * where followerId matches the user.id. Essentially, this ensures that the users
       * in the result have not been followed by the current user.
       */
      followers: {
        none: {
          followerId: user.id,
        },
      },
    },
    select: getUserDataSelect(user.id),
    take: 5,
  });

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">You may know:</div>
      {usersToFollow.map((user) => (
        <div key={user.id} className="flex items-center justify-center gap-6">
          <Link
            href={`/user/${user.username}`}
            className="flex items-center gap-3"
          >
            <UserAvatar
              avatarUrl={user.avatarUrl}
              size={40}
              className="flex-none"
            />

            <div>
              <p className="line-clamp-1 break-all font-semibold hover:underline text-sm capitalize">
                {getSanitizedDisplayName(user.displayName)}
              </p>
              <p className="line-clamp-1 break-all text-muted-foreground text-xs">
                @{user.username}
              </p>
            </div>
          </Link>

          <FollowButton
            userId={user.id}
            initialState={{
              followers: user._count.followers,
              isFollowedByUser: user.followers.some(
                ({ followerId }) => followerId === user.id
              ),
            }}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Since the trending topics has to be shown for all users, it doesn't make sense to
 * fetch the data for each user. Instead, we can fetch the data once and cache it for
 * a certain period of time. This is a good use case for caching.
 *
 * NexJs gives us an experimental function called unstable_cache that we can use to cache
 * the data for a certain period of time. This is still not stable, but it works just fine.
 */
const getTrendingTopics = unstable_cache(
  async () => {
    /**
     * Prisma ORM has some limitations for fetching the hashtags. So, we are using raw SQL query instead.
     *
     * The following raw_query is suggested by ChatGPT, because, let's face it, you are not an expert in SQL.
     *
     * Here's the breakdown on what this query does:
     * 
     * SELECT LOWER(unnest(regexp_matches(content, '#[[:alnum:]_]+', 'g'))) AS hashtag:
     *   - regexp_matches(content, '#[[:alnum:]_]+', 'g'):
     *       - This part finds all substrings in the content column (which presumably contains 
     *         text like post content) that match the pattern for hashtags.
     *       - #[[:alnum:]_]+:
     *          •	#: The query looks for the # symbol to identify hashtags.
	              •	[[:alnum:]_]+: This is a POSIX character class that matches alphanumeric 
                    characters and underscores, which are typical in hashtags.
	              •	'g': The g flag is for global matching, meaning the regular expression 
                    will find all occurrences of hashtags in the text, not just the first.
     *   - unnest(): is used to “flatten” an array or set of matches into individual rows. 
                    Each hashtag found in the content will be extracted as a separate row.
     *  - LOWER(): function converts the extracted hashtag to lowercase, ensuring that hashtags 
                    are case-insensitive (e.g., #React and #react are treated the same).
     * - AS hashtag: This assigns the resulting value (the lowercase version of the hashtag) to a new column alias named hashtag.
     *
     * 
     * COUNT(*) AS count:
     *    - This part counts the number of times each hashtag appears in the content across all posts.
     *    - The result will return the count alongside each hashtag.
     * 
     * FROM posts: 
     *    - This specifies that the query should look for hashtags in the posts table.
     * 
     * GROUP BY (hashtag):
     *    - This groups the results by the hashtag column. All identical hashtags (case-insensitive due to LOWER) 
     *        will be grouped together, allowing the COUNT(*) to sum up how many times each hashtag occurs.
     * 
     * ORDER BY count DESC, hashtag ASC:
     *    - This orders the results first by the count in descending order (highest count first) and then by the hashtag in ascending order.
     * 
     * LIMIT 5: 
     *    - This limits the results to the top 5 most popular hashtags.
     * 
     * Example result format:
          [
            { hashtag: '#react', count: 42 },
            { hashtag: '#nodejs', count: 35 },
            { hashtag: '#webdev', count: 30 },
            { hashtag: '#javascript', count: 28 },
            { hashtag: '#prisma', count: 20 }
          ]
     * 
     * This is how it would look in a table format:
     * 
        | hashtag      | count |
        |--------------|-------|
        | #react       | 42    |
        | #nodejs      | 35    |
        | #webdev      | 30    |
        | #javascript  | 28    |
        | #prisma      | 20    |
     *
     * Too much to process? I know right! But that's why ChatGPT is here to help you out. 
     *
     */

    const result = await prisma.$queryRaw<{ hashtag: string; count: bigint }[]>`
      SELECT LOWER(unnest(regexp_matches(content, '#[[:alnum:]_]+', 'g'))) AS hashtag, COUNT(*) AS count
      FROM posts
      GROUP BY (hashtag)
      ORDER BY count DESC, hashtag ASC
      LIMIT 5
    `;

    return result.map((row) => ({
      hashtag: row.hashtag,
      count: Number(row.count), // can't return bigint to the client, hence converting to number.
    }));
  },
  ["trending-topics"],
  {
    revalidate: 60 * 60, // revalidate every 1 hour. Change this as needed.
  }
);

export async function TrendingTopicsDisplay() {
  const trendingTopics = await getTrendingTopics();

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">Trending Now</div>
      {trendingTopics.map(({ hashtag, count }) => {
        const title = hashtag.split("#")[1];
        return (
          <Link href={`/hashtag/${title}`} key={title} className="block">
            <p
              className="line-clamp-1 break-all font-semibold hover:underline"
              title={hashtag}
            >
              {hashtag}
            </p>

            <p className="text-sm text-muted-foreground">
              {formatNumber(count)} {count === 1 ? "post" : "posts"}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
