### What is this api folder?

- This is equivalent to our traditional servers (looking at you, Node.js)
- Any folder with a `route.js` (or .ts) file put inside becomes an API end-point. For ex: api/posts/route.ts responds to `api/posts` endpoint. Another example: api/blog/[...slug]/route.ts responds to `api/blog/<dynamic_slug>/` endpoint.
- Don't confuse these with the server actions. Even without the `api` folder the server actions can do the BE stuff and also the endpoint will be the name of the folder where `actions.ts` is present. But the key difference is that with `api` folder you can expose the endpoints for public use (like usage by other FE apps or other android or IOS apps for the BE logic, etc), while server actions are meant for internal component utils. Also, we can have the ability to cache using `api` folder.
- Get proper clarity and differences between server actions vs API folder from various resources.
    - Here's a reddit thread - https://www.reddit.com/r/nextjs/comments/1dzv16g/when_should_i_use_the_api_folder_and_when_should/#:~:text=The%20purpose%20of%20the%20API,be%20calling%20functions%20server%20side).
    - Resource 2 - https://medium.com/@shavaizali159/next-js-api-routes-vs-server-actions-which-one-to-use-and-why-809f09d5069b
