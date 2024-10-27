/**
 * A common component to convert anything into a link.
 * Uses the react-linkify-it library.
 */
import Link from "next/link";
import { LinkIt, LinkItUrl } from "react-linkify-it";

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

function LinkifyUsername({ children }: LinkifyConfig) {
  return (
    <LinkIt
      regex={/(@[a-zA-Z0-9_-]+)/}
      component={(match, key) => {
        const username = match.slice(1); // remove the @ from the username

        return (
          <Link
            href={`/users/${username}`}
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

function LinkifyHashtag({ children }: LinkifyConfig) {
  return (
    <LinkIt
      regex={/(#[a-zA-Z0-9]+)/}
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
