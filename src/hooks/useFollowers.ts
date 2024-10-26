import kyInstance from "@/lib/ky";
import { FollowerInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

/**
 * A custom hook to fetch the number of followers for a user and the currently logged in user's
 * follow status with the user. We are also receiving the initial state of the followers to
 * initialize the state of the hook. This is useful when we are using SSR and we want to
 * pre populate the state of the hook.
 */
export default function useFollowers(
  userId: string,
  initialState: FollowerInfo
) {
  const query = useQuery({
    // Each user has different followers. So, we are using the userId as the key to cache the data.
    queryKey: ["followers-info", userId],
    queryFn: () =>
      kyInstance.get(`/api/users/${userId}/followers`).json<FollowerInfo>(),
    initialData: initialState,
    /**
     * We don't want to refetch this data unless the user manually refreshes the page.
     * It would be very jarring to see the number of followers change in real time or the
     * state of the button to be revalidated every time we jump across pages/feed.
     * Hence we revalidate this data only when the user manually refreshes the page or we
     * toggle the button to follow/un-follow the user.
     */
    staleTime: Infinity,
  });

  return query;
}
