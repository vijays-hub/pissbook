/**
 * A common component to convert anything into a link.
 * Uses the react-linkify-it library.
 */
import Link from "next/link";
import { LinkIt, LinkItUrl } from "react-linkify-it";
import UserLinkWithTooltip from "./UserLinkWithTooltip";

interface LinkifyConfig {
  children: React.ReactNode;
}

export default function Linkify({ children }: LinkifyConfig) {
  return (
    <LinkifyUsername>
      <LinkifyHashtag>
        <LinkifyUrl>{children}</LinkifyUrl>
      </LinkifyHashtag>
    </LinkifyUsername>
  );
}

function LinkifyUrl({ children }: LinkifyConfig) {
  return (
    <LinkItUrl className="text-primary hover:underline">{children}</LinkItUrl>
  );
}

/**
 * This component will convert any username into a link, that can be navigated to
 * the user's profile.
 * 
 * Before Tooltip we used to return the following snippet inside component param:
 * 
 *    <Link
        href={`/users/${username}`}
        className="text-primary hover:underline"
      >
        {match}
      </Link>
 * 
 *
 * Now, this is also a good place to add our newly introduced UserTooltip component.
 * But wait, the children for this component is a mere string and we don't have access
 * to the user's data. Hence, we are using a separate endpoint to fetch the user's data.
 * Using react-query to cache the user's data, so that we need not fetch the same user's
 * data again and again.
 *
 * Checkout -> src/components/UserLinkWithTooltip.tsx
 */
function LinkifyUsername({ children }: LinkifyConfig) {
  return (
    <LinkIt
      regex={/(@[a-zA-Z0-9_-]+)/}
      component={(match, key) => {
        const username = match.slice(1); // remove the @ from the username

        return (
          <UserLinkWithTooltip username={username} key={key}>
            {match}
          </UserLinkWithTooltip>
        );
      }}
    >
      {children}
    </LinkIt>
  );
}

function LinkifyHashtag({ children }: LinkifyConfig) {
  return (
    <LinkIt
      regex={/(#[a-zA-Z0-9_-]+)/}
      component={(match, key) => {
        const hashtag = match.slice(1); // remove the # from the hashtag

        return (
          <Link
            href={`/hashtag/${hashtag}`}
            className="text-primary hover:underline"
          >
            {match}
          </Link>
        );
      }}
    >
      {children}
    </LinkIt>
  );
}
