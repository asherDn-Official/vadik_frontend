import { MessageCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useChatNotification } from "../context/ChatNotificationContext";

const GlobalChatNotification = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide on Customer Rhythm → Live Chat
 if (location.pathname === "/customerrhythm") {
  return null;
}
  const { totalUnread } = useChatNotification();

// console.log("Badge received:", totalUnread);

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <button
        onClick={() => navigate("/customerrhythm?section=live_chat")}
        className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#313166]/95 to-[#313166] shadow-2xl transition-transform hover:scale-105"
      >
        <MessageCircle size={30} className="text-white" />

       {totalUnread > 0 && (
  <span className="absolute -top-1 -right-1 min-w-[24px] h-[24px] rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center px-1 border-2 border-white">
    {totalUnread}
  </span>
)}
      </button>
    </div>
  );
};

export default GlobalChatNotification;