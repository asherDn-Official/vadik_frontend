import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { useChatNotification } from "../context/ChatNotificationContext";
import ChatWindow from "./common/ChatWindow";

const GlobalChatNotification = () => {
  const { totalUnread } = useChatNotification();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[9999]">
        <button
          onClick={() => setOpen(true)}
          className="
            relative
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-full
            bg-gradient-to-r
            from-[#313166]/95
            to-[#313166]
            shadow-2xl
            transition-transform
            hover:scale-105
          "
        >
          <MessageCircle
            size={30}
            className="text-white"
          />

          {totalUnread > 0 && (
            <span
              className="
                absolute
                -top-1
                -right-1
                min-w-[24px]
                h-[24px]
                rounded-full
                bg-red-500
                text-white
                text-xs
                font-bold
                flex
                items-center
                justify-center
                px-1
                border-2
                border-white
              "
            >
              {totalUnread}
            </span>
          )}
        </button>
      </div>

      <ChatWindow
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export default GlobalChatNotification;