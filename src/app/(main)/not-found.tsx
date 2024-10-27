/**
 * A special file that takes overrides the content of default 404 page.
 * Make sure you name the file as `not-found.tsx`. You can create as many
 * special files as you want, I mean, like for each page one.
 */

export default function NotFound() {
  return (
    <main className="my-12 w-full space-y-3 text-center">
      <h1 className="text-3xl font-bold">Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </main>
  );
}
