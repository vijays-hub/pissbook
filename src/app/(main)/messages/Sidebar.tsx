import { ChannelList } from "stream-chat-react";
import { useSession } from "../SessionProvider";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ! https://getstream.io/chat/docs/sdk/react/components/core-components/channel_list/
 *
 * ? NOTE:
 * The list of channels are filtered by the logged-in user. This means that we will
 * get only those channels where the logged-in user has a active connection.
 *
 * In development, you could simulate this by having different users and connecting
 * them to different channels.
 *
 * Here's what you should do:
 * Open different tabs with localhost in different browser - log in with different users and now open
 * the messages page. You should see the channels displayed now. Jot something down!
 */
export default function ChatSidebar({
  showSidebar,
  toggleSidebar,
}: {
  showSidebar: boolean;
  toggleSidebar: () => void;
}) {
  const { user } = useSession();

  return (
    <div
      className={cn(
        "size-full md:flex flex-col border-e md:w-72",
        showSidebar ? "flex" : "hidden"
      )}
    >
      <ChatActions toggleSidebar={toggleSidebar} />
      <ChannelList
        filters={{
          type: "messaging",
          members: { $in: [user?.id] },
        }}
        showChannelSearch
        options={{
          state: true,
          presence: true,
          limit: 10,
        }}
        sort={{
          last_message_at: -1, // Sort by last message sent
        }}
        // For the ability to search for group chats!
        additionalChannelSearchProps={{
          searchForChannels: true,
          searchQueryParams: {
            channelFilters: {
              filters: {
                members: { $in: [user?.id] },
              },
            },
          },
        }}
      />
    </div>
  );
}

const ChatActions = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  return (
    <div className="flex items-center gap-3 p-2">
      {/* Action to toggle sidebar in smaller screens! */}
      <div className="h-full md:hidden">
        <Button variant={"ghost"} size={"icon"} onClick={toggleSidebar}>
          <X className="size-5" />
        </Button>
      </div>
    </div>
  );
};
