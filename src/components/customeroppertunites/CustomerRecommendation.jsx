import React, { useState } from "react";
import { Plus, Send, Heart, Calendar } from "lucide-react";

const CustomerRecommendation = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedButton, setSelectedButton] = useState(null);

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

  const quickButtons = [
    {
      id: "special-days",
      label: "Special Days",
      icon: Heart,
      color: "bg-pink-100 text-pink-600 border-pink-200",
    },
    {
      id: "event-reminders",
      label: "Event Reminders",
      icon: Calendar,
      color: "bg-orange-100 text-orange-600 border-orange-200",
    },
  ];

  const handleQuickButtonClick = (buttonId) => {
    setSelectedButton(buttonId);

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: buttonId === "special-days" ? "Special Days" : "Event Reminders",
      timestamp: new Date(),
    };

    let aiResponse;
    if (buttonId === "special-days") {
      aiResponse = {
        id: Date.now() + 1,
        type: "ai",
        content:
          "Based on your customer data, I found 15 customers with special days coming up this month:\n\n• 8 customers have birthdays in the next 2 weeks\n• 4 customers have anniversaries this month\n• 3 customers have other special occasions\n\nWould you like me to create personalized campaigns for these customers?",
        timestamp: new Date(),
      };
    } else {
      aiResponse = {
        id: Date.now() + 1,
        type: "ai",
        content:
          "Here are the upcoming events and reminders for your customers:\n\n• Valentine's Day - 12 customers interested in romantic gifts\n• Mother's Day - 25 customers with purchase history of gifts\n• Summer Collection Launch - 45 customers who bought seasonal items last year\n\nShall I help you create targeted campaigns for these events?",
        timestamp: new Date(),
      };
    }

    setMessages([userMessage, aiResponse]);
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
        "I understand your request. Let me analyze your customer data and provide personalized recommendations based on their behavior and preferences. This will help you create more targeted and effective campaigns.",
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
    setSelectedButton(null);
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
          <div className="flex items-center justify-center space-x-4">
            {quickButtons.map((button) => (
              <button
                key={button.id}
                onClick={() => handleQuickButtonClick(button.id)}
                className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                  selectedButton === button.id
                    ? button.color
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <button.icon className="w-4 h-4 mr-2" />
                {button.label}
              </button>
            ))}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-slate-800 mb-2">
                  What can I help with?
                </h3>
                <p className="text-gray-600">
                  Select a quick action above or type your message below
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
                      <div className="whitespace-pre-line">
                        {message.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
              className="p-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerRecommendation;
