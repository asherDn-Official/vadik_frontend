import React, { useState } from "react";
import { Plus, Send, Store } from "lucide-react";

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

  const handleAboutStoresClick = () => {
    const userMessage = {
      id: Date.now(),
      type: "user",
      content: "About Our Stores",
      timestamp: new Date(),
    };

    const aiResponse = {
      id: Date.now() + 1,
      type: "ai",
      content:
        "Here's an overview of our store performance:\n\n• Total Stores: 12 locations\n• Top Performing Store: Downtown Branch (35% of total sales)\n• Inventory Status: 85% stocked across all locations\n• Customer Satisfaction: 4.7/5 average rating\n• Monthly Growth: +12% compared to last month\n\nWould you like detailed insights about any specific store or metric?",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage, aiResponse]);
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
        "I'll analyze your store data and provide insights based on your request. Let me gather the relevant information about inventory, sales trends, and customer preferences to give you actionable recommendations.",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage, aiResponse]);
    setInputMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
  };

  return (
    <div className="max-w-7xl mx-auto flex h-[calc(100vh-200px)]">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
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

        {/* Sidebar Items */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {sidebarItems.map((item, index) => (
              <div
                key={index}
                className="py-2 px-3 text-sm text-slate-600 hover:bg-gray-50 rounded cursor-pointer"
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
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-center">
            <button
              onClick={handleAboutStoresClick}
              className="flex items-center px-4 py-2 bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              <Store className="w-4 h-4 mr-2" />
              About Our Stores
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6">
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
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
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
                    <div className="whitespace-pre-line">{message.content}</div>
                    {message.type === "ai" && message.id === 1 && (
                      <div className="text-xs text-gray-500 mt-1">Vadik Ai</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-white">
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
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
