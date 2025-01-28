/**
 * A hook to initialize the chat SDK of Stream for consumption in the app.
 */

import { useEffect, useState } from "react";
import { useSession } from "../SessionProvider";
import { StreamChat } from "stream-chat";
import kyInstance from "@/lib/ky";

const useStreamChatClient = async () => {
  const { user } = useSession();

  const [streamChatClient, setStreamChatClient] = useState<StreamChat | null>();

  useEffect(() => {
    if (!user) return;

    /**
     * Let's initialize the Stream Chat SDK on page load.
     *
     * !Ref: https://getstream.io/chat/docs/react/init_and_users/
     *
     * When setting up the client on the client-side, best practice is to never expose
     * the Stream Chat API secret. Hence, we are using only the key for init and the
     * secret will be used by the Server client we have setup (src/lib/stream.ts), for
     * performing Admin actions.
     */
    const client = StreamChat.getInstance(
      process.env.NEXT_PUBLIC_STREAM_API_KEY!
    );

    /**
     * Once initialized, we would need to connect the user to the client.
     *
     * The `connectUser` accepts two parameters:
     * - The user to connect
     * - The token for stream SDK. This will be the generated auth token against the user.
     */
    client
      .connectUser(
        {
          id: user.id,
          username: user.username,
          name: user.displayName,
          image: user.avatarUrl,
        },

        //   Using .then for simplicity. This can be converted to async/await if needed.
        async () =>
          kyInstance
            .get("/api/get-stream-token")
            .json<{ token: string }>()
            .then(({ token }) => token)
      )
      .catch((error) =>
        console.error(
          "Error connecting user to Stream Chat on the client",
          error
        )
      )
      .then(() => setStreamChatClient(client)); // Set the client to the state.

    //   Cleanup
    return () => {
      setStreamChatClient(null);

      // Disconnect the user from the client.
      client
        .disconnectUser()
        .catch((error) => {
          console.error(
            "Error disconnecting user from Stream Chat on the client",
            error
          );
        })
        .then(() =>
          console.log("User disconnected from Stream Chat on the client")
        );
    };
  }, [user]); // ? Do we need to pass only relevant dependencies like id, username, etc.?

  return streamChatClient;
};

export default useStreamChatClient;
