"use client";

import { Loader2 } from "lucide-react";
import useStreamChatClient from "./useStreamChatClient";
import { Chat as StreamChat } from "stream-chat-react";
import ChatSidebar from "./Sidebar";
import ChatChannel from "./ChatChannel";
import { useTheme } from "next-themes";

// ! https://getstream.io/chat/docs/sdk/react/basics/getting_started/#your-first-app-with-stream-chat-react
export default function ChatInit() {
  const chatClient = useStreamChatClient();

  const { resolvedTheme } = useTheme();

  if (!chatClient) return <Loader2 className="mx-auto my-3 animate-spin" />;

  return (
    <main className="relative w-full overflow-hidden rounded-2xl bg-card shadow-sm">
      <div className="absolute bottom-0 top-0 flex w-full">
        <StreamChat
          client={chatClient}
          // ! https://getstream.io/chat/docs/sdk/react/theming/themingv2/#dark-and-light-themes
          theme={
            resolvedTheme === "dark"
              ? "str-chat__theme-dark"
              : "str-chat__theme-light"
          }
        >
          <ChatSidebar />
          <ChatChannel />
        </StreamChat>
      </div>
    </main>
  );
}
