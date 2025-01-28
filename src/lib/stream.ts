/**
 * Config file to manage the Stream SDK.
 */
import { StreamChat } from "stream-chat";

// ! Ref: https://getstream.io/chat/docs/react/tokens_and_authentication/
const streamServerClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY!,
  process.env.STREAM_API_SECRET!
);

export default streamServerClient;
