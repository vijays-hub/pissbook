- [Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)

  - Allows to logically group our routes and project files without affetcing the URL path structure!
  - Let's say you want to implement authentication with Login, Register, Forgot Password.
    - Even though you could create separate folder for each and use the different routes, it's fine.
    - But this is not easily maintainable. So we can put all these folders in one folder, say `auth`.
    - Now the code is more structured and easily maintainable. And every feature is accessible with
      `/auth/<feature>`. For ex, if you want to login, you can navigate to `auth/login`.
  - There can be cases where you might not want to include the grouped folder name in the URL path. In such cases, we should wrap the folder within `()` to indicate NextJs that we are grouping all the routes within that folder and don't include it in the URL. For ex, if you do `(auth)`, now you no longer need to do `auth/login` to access login, you can simply hit `/login` and it works.
