/**
 * A special file that takes care of the loading state of all the pages inside the
 * app folder (unless there is loading.tsx for each of the pages). This acts as a fallback
 * for the components that are being loaded immediately after the user navigates to a page.
 * This is built on top of React Suspense and we need not write the Suspense ourselves.
 *
 * You can simply put how your loading state should look like in this file and
 * the components inside the (main) folder will automatically use this loading state.
 *
 * ! READ: https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming
 */
import { Loader2 } from "lucide-react";

export default function Loading() {
  return <Loader2 className="mx-auto my-3 animate-spin" />;
}
