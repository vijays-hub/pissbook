import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import {
  Channel,
  ChannelHeader,
  ChannelHeaderProps,
  MessageInput,
  MessageList,
  Window,
} from "stream-chat-react";

// ! https://getstream.io/chat/docs/sdk/react/basics/getting_started/#your-first-app-with-stream-chat-react
export default function ChatChannel({
  showChannel,
  toggleSidebar,
}: {
  showChannel: boolean;
  toggleSidebar: () => void;
}) {
  return (
    <div className={cn("w-full md:block", !showChannel && "hidden")}>
      <Channel>
        <Window>
          <CustomChannelHeader toggleSidebar={toggleSidebar} />
          <MessageList />
          <MessageInput />
        </Window>
      </Channel>
    </div>
  );
}

interface CustomChannelHeaderConfig extends ChannelHeaderProps {
  toggleSidebar: () => void;
}

const CustomChannelHeader = ({
  toggleSidebar,
  ...rest
}: CustomChannelHeaderConfig) => {
  return (
    <div className="flex items-center gap-3">
      {/* Only show in small screens */}
      <div className="h-full p-2 md:hidden">
        <Button onClick={toggleSidebar} size={"icon"} variant={"ghost"}>
          <Menu className="size-5" />
        </Button>
      </div>
      <ChannelHeader {...rest} />
    </div>
  );
};
