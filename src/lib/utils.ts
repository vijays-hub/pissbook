import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDate, formatDistanceToNowStrict } from "date-fns";

// https://medium.com/@naglaafouz4/enhancing-component-reusability-in-tailwind-css-with-clsx-and-tailwind-merge-986aa4e1fe76
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * We are using date-fns library to format the date.
 *
 * Read more:
 * 1. https://date-fns.org/v4.1.0/docs/formatDistanceToNowStrict
 * 2. https://date-fns.org/v4.1.0/docs/format
 */
export function formatRelativeDate(from: Date) {
  const currentDate = new Date();

  if (currentDate.getTime() - from.getTime() < 24 * 60 * 60 * 1000) {
    // The post was created today, hence show the relative time like "2 hours ago"
    return formatDistanceToNowStrict(from, { addSuffix: true });
  } else {
    /**
     * The post was created on a different day, hence show the date like "Jul 12" if
     * the post was created in the current year, or show the date like "Jul 12, 2022"
     * if the post was created in a different year.
     */
    if (currentDate.getFullYear() === from.getFullYear()) {
      return formatDate(from, "MMM d");
    } else {
      return formatDate(from, "MMM d, yyyy");
    }
  }
}

export function formatNumber(num: number) {
  // Format the number using the Intl.NumberFormat API with compact notation
  // This will convert large numbers into a more readable format, e.g., 1,200 becomes 1.2K
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num);
}
