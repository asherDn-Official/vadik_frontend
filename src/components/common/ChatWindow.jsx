import { X } from "lucide-react";
import LiveChat from "../customerRhythm/LiveChat";

const ChatWindow = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[9998] bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Centered Popup */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div
          onClick={(e) => e.stopPropagation()}
          className="
            flex
            flex-col
            w-full
            max-w-6xl
            h-[90vh]
            max-h-[850px]
            bg-white
            rounded-2xl
            shadow-2xl
            overflow-hidden
            border
            border-gray-200
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
            <h2 className="text-xl font-semibold text-[#313166]">
              Live Chat
            </h2>

            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat */}
          <div className="flex-1 overflow-hidden">
            <LiveChat />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatWindow;