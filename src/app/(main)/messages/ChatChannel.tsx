import {
  Channel,
  ChannelHeader,
  MessageInput,
  MessageList,
  Window,
} from "stream-chat-react";

// ! https://getstream.io/chat/docs/sdk/react/basics/getting_started/#your-first-app-with-stream-chat-react
export default function ChatChannel() {
  return (
    <div className="w-full">
      <Channel>
        <Window>
          <ChannelHeader />
          <MessageList />
          <MessageInput />
        </Window>
      </Channel>
    </div>
  );
}
