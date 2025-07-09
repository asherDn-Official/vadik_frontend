import React, { useState } from "react";
import { Plus, Send, Store, Trash2 } from "lucide-react";

const StoreRecommendation = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      content: "Denim jeans are hot selling, need to maintain the stock !",
      timestamp: new Date(),
    },
    {
      id: 2,
      type: "user",
      content: "Are there any new dress arrivals this week?",
      timestamp: new Date(),
    },
    {
      id: 3,
      type: "ai",
      content:
        "Yes! We just received a new collection of floral and casual dresses. They are available in various colors and sizes. Would you like me to send you some photos or details?",
      timestamp: new Date(),
    },
    {
      id: 4,
      type: "user",
      content: "Please send me details about the floral dresses.",
      timestamp: new Date(),
    },
    {
      id: 5,
      type: "ai",
      content:
        "Sure! The floral dresses start at $50 and come in sizes XS to XL. They feature lightweight fabric perfect for spring. I can also help you place an order if you want.",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeSidebarItem, setActiveSidebarItem] = useState(null);

  const sidebarItems = [
    "Store Stocks",
    "Birthday Invites",
    "Current Stock Availability",
    "Store Opening Hours",
    "Bulk Stock Purchase",
    "Previous 7 Days",
    "Seasonal Textile ...",
    "Anniversary Special Offers",
    "Upcoming Birthday ...",
    "Birthday Gifts",
  ];

  const handleSidebarItemClick = (item) => {
    setActiveSidebarItem(item);

    // Check if this chat already exists
    const existingChat = chatHistory.find((chat) => chat.title === item);

    if (existingChat) {
      // Load existing chat
      setMessages(existingChat.messages);
      setActiveChatId(existingChat.id);
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: item,
      timestamp: new Date(),
    };

    let aiResponse;
    switch (item) {
      case "Store Stocks":
        aiResponse = {
          id: Date.now() + 1,
          type: "ai",
          content:
            "Current stock levels:\n\n• Denim Jeans: 142 units (Low stock)\n• T-Shirts: 356 units\n• Dresses: 189 units\n• Accessories: 420 units\n\nWould you like to generate a restock order?",
          timestamp: new Date(),
        };
        break;
      case "Birthday Invites":
        aiResponse = {
          id: Date.now() + 1,
          type: "ai",
          content:
            "Birthday campaign options:\n\n1. 15% discount for birthday customers\n2. Free gift with $50+ purchase\n3. VIP early access to new collections\n\nWhich would you like to implement?",
          timestamp: new Date(),
        };
        break;
      default:
        aiResponse = {
          id: Date.now() + 1,
          type: "ai",
          content: `I'll analyze our ${item} data and provide specific recommendations. Please give me a moment...`,
          timestamp: new Date(),
        };
    }

    const newChat = {
      id: Date.now(),
      title: item,
      messages: [userMessage, aiResponse],
      timestamp: new Date(),
    };

    setMessages([userMessage, aiResponse]);
    setActiveChatId(newChat.id);
    setChatHistory((prev) => [
      newChat,
      ...prev.filter((chat) => chat.title !== item),
    ]);
  };

  const handleAboutStoresClick = () => {
    const title = "About Our Stores";
    const existingChat = chatHistory.find((chat) => chat.title === title);

    if (existingChat) {
      setMessages(existingChat.messages);
      setActiveChatId(existingChat.id);
      setActiveSidebarItem(null);
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: title,
      timestamp: new Date(),
    };

    const aiResponse = {
      id: Date.now() + 1,
      type: "ai",
      content:
        "Here's an overview of our store performance:\n\n• Total Stores: 12 locations\n• Top Performing Store: Downtown Branch (35% of total sales)\n• Inventory Status: 85% stocked across all locations\n• Customer Satisfaction: 4.7/5 average rating\n• Monthly Growth: +12% compared to last month\n\nWould you like detailed insights about any specific store or metric?",
      timestamp: new Date(),
    };

    const newChat = {
      id: Date.now(),
      title: title,
      messages: [userMessage, aiResponse],
      timestamp: new Date(),
    };

    setMessages([userMessage, aiResponse]);
    setActiveChatId(newChat.id);
    setChatHistory((prev) => [
      newChat,
      ...prev.filter((chat) => chat.title !== title),
    ]);
    setActiveSidebarItem(null);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    const aiResponse = {
      id: Date.now() + 1,
      type: "ai",
      content:
        "I'll analyze your store context and provide insights based on your request. Let me gather the relevant information about inventory, sales trends, and customer preferences to give you actionable recommendations.",
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage, aiResponse];
    setMessages(newMessages);
    setInputMessage("");

    if (activeChatId) {
      // Update existing chat
      setChatHistory((prev) =>
        prev.map((chat) =>
          chat.id === activeChatId
            ? { ...chat, messages: newMessages, timestamp: new Date() }
            : chat
        )
      );
    } else {
      // Create new chat from user input
      const title =
        inputMessage.slice(0, 20) + (inputMessage.length > 20 ? "..." : "");
      const newChat = {
        id: Date.now(),
        title: title,
        messages: [userMessage, aiResponse],
        timestamp: new Date(),
      };
      setActiveChatId(newChat.id);
      setChatHistory((prev) => [
        newChat,
        ...prev.filter((chat) => chat.title !== title),
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setActiveSidebarItem(null);
    setActiveChatId(null);
    setInputMessage("");
  };

  const loadChatFromHistory = (chat) => {
    setMessages(chat.messages);
    setActiveChatId(chat.id);
    setActiveSidebarItem(null);
  };

  const removeChatFromHistory = (chatId, e) => {
    e.stopPropagation();
    setChatHistory((prev) => prev.filter((chat) => chat.id !== chatId));
    if (activeChatId === chatId) {
      setMessages([]);
      setActiveChatId(null);
    }
  };

  // Get unique chats sorted by timestamp (newest first)
  const uniqueChatHistory = Array.from(
    new Map(chatHistory.map((chat) => [chat.title, chat])).values()
  ).sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="max-w-7xl mx-auto flex h-[calc(100vh-200px)]">
      {/* Sidebar */}
      <div className="w-80 bg-[#3131660A] border-r border-gray-200 flex flex-col">
        {/* New Chat Button */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={handleNewChat}
            className="flex items-center w-full px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Recent Chats
            </h4>
            {uniqueChatHistory.map((chat) => (
              <div
                key={chat.id}
                onClick={() => loadChatFromHistory(chat)}
                className={`group py-2 px-3 text-sm rounded cursor-pointer mb-1 flex justify-between items-center ${
                  activeChatId === chat.id
                    ? "bg-blue-100 text-blue-800"
                    : "text-slate-600 hover:bg-gray-50"
                }`}
              >
                <div>
                  <div className="truncate max-w-[180px]">{chat.title}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(chat.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <button
                  onClick={(e) => removeChatFromHistory(chat.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Recent Chats (previously Quick Actions) */}
          <div className="p-4 border-t border-gray-200">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Recent Chats
            </h4>
            {sidebarItems.map((item, index) => (
              <div
                key={index}
                onClick={() => handleSidebarItemClick(item)}
                className={`py-2 px-3 text-sm rounded cursor-pointer mb-1 ${
                  activeSidebarItem === item
                    ? "bg-pink-100 text-pink-600"
                    : "text-slate-600 hover:bg-gray-50"
                }`}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 bg-[#3131660A]">
          <div className="flex items-center">
            <button
              onClick={handleAboutStoresClick}
              className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                activeSidebarItem === null && activeChatId
                  ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              {/* <Store className="w-4 h-4 mr-2" /> */}
              <img
                src="../assets/about-our-story-icon.png"
                alt=""
                className="w-7 h-7 mr-2"
              />
              About Our Stores
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#3131660A]">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-slate-800 mb-2">
                  Start a new conversation
                </h3>
                <p className="text-gray-600">
                  Select a recent chat or type your message below
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex items-start space-x-3 max-w-2xl ${
                      message.type === "user"
                        ? "flex-row-reverse space-x-reverse"
                        : ""
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                        message.type === "user" ? "bg-gray-600" : "bg-pink-600"
                      }`}
                    >
                      {message.type === "user" ? "Me" : "V"}
                    </div>
                    <div
                      className={`px-4 py-3 rounded-lg ${
                        message.type === "user"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-white border border-gray-200 text-gray-800"
                      }`}
                    >
                      <div className="whitespace-pre-line">
                        {message.content}
                      </div>
                      {message.type === "ai" && message.id === 1 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Vadik Ai
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-[#3131660A]">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
            />
            <button
              onClick={handleSendMessage}
              className="p-3 bg-[#004AAC] text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreRecommendation;
