/** @type {import('next').NextConfig} */
const nextConfig = {
  /*
        Key Elements:
        1. experimental block: Next.js occasionally introduces new features under the experimental key, which allows developers to try out features that are not yet fully stable or officially released.
        2. staleTimes configuration: The staleTimes configuration likely relates to the caching or data-fetching mechanisms in Next.js. It specifies how long cached data should be considered “fresh” before it’s deemed “stale” and needs to be refetched.
        3. dynamic: 30: The dynamic: 30 means that dynamic data (likely fetched during SSR or ISR—Server-Side Rendering or Incremental Static Regeneration) will be considered stale after 30 seconds. After this period, Next.js will likely trigger a re-fetch to update the data.

        ? Why would you need it?

        ! This kind of configuration is useful when working with dynamic content that doesn’t change too frequently. By setting a staleTime, you can avoid unnecessary network requests while keeping your content fairly up-to-date. For example: If you are displaying data from an API that updates every few minutes or less frequently, setting a staleTime of 30 seconds would ensure that the data is only re-fetched if it’s stale, improving performance while ensuring some level of freshness.

        In short, you would use this feature when you want to manage dynamic data caching efficiently, balancing between content freshness and performance by avoiding excessive re-fetching.
    */
  experimental: {
    staleTimes: {
      dynamic: 30, // 30 seconds
    },
  },
  /**
   * ? Why would you need serverExternalPackages?
   * This is essential when you want to use native Node.js modules in your Next.js application.
   * By default, Next.js does not support native Node.js modules, but you can enable them by
   * adding the serverExternalPackages configuration.
   *
   * ! what's argon2?
   * Argon2 is a password-hashing function.
   * ? More: https://www.npmjs.com/package/@node-rs/argon2
   */
  serverExternalPackages: ["@node-rs/argon2"],
  // Whitelist image domains
  images: {
    remotePatterns: [
      // Custom uploadthing domain -> src/app/api/uploadthing/core.ts
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/*`,
      },
      // Post attachments of uploadthing domain -> src/app/api/uploadthing/core.ts
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: `/f/*`,
      },
    ],
  },
};

export default nextConfig;
