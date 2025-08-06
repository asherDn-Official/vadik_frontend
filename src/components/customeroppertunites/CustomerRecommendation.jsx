import React, { useState, useEffect, useRef } from "react";
import { Plus, Send, Heart, CalendarDays, Delete, Trash } from "lucide-react";
import axios from "axios";

const CustomerRecommendation = () => {
  const [retailerId, setRetailerId] = useState(() => {
    return localStorage.getItem("retailerId") || "";
  });
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedButton, setSelectedButton] = useState(null);
  const [activeSidebarItem, setActiveSidebarItem] = useState(null);
  const [threads, setThreads] = useState([]);
  const [currentThreadId, setCurrentThreadId] = useState(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);

  const BASE_URL = "https://app.vadik.ai";

  const sidebarItems = [
    "Store Stocks",
    "Birthday Invites",
    "Current Stock Availability",
    "Store Opening Hours",
    "Bulk Stock Purchase",
    "Seasonal Textile ...",
    "Anniversary Special Offers",
    "Upcoming Birthday ...",
    "Birthday Gifts",
  ];

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch all threads on component mount
  useEffect(() => {
    if (retailerId) {
      fetchAllThreads();
    }
  }, [retailerId]);

  const fetchAllThreads = async (selectMostRecent = false) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/customerChat/get-all-threads?userId=${retailerId}`
      );
      const fetchedThreads = response.data.threads;
      setThreads(fetchedThreads);

      // Auto-select the most recent thread if no thread is currently selected OR if explicitly requested
      if (fetchedThreads.length > 0 && (!currentThreadId || selectMostRecent)) {
        // Sort threads by lastActivity to find the most recent one
        const sortedThreads = [...fetchedThreads].sort((a, b) =>
          new Date(b.lastActivity) - new Date(a.lastActivity)
        );
        const mostRecentThread = sortedThreads[0];

        // Automatically load the most recent thread
        fetchThreadMessages(mostRecentThread._id);
      }
    } catch (error) {
      console.error("Error fetching threads:", error);
    }
  };

  const createNewThread = async () => {
    if (!newChatTitle.trim()) return;

    try {
      const response = await axios.post(
        `${BASE_URL}/api/customerChat/create-thread`,
        {
          userId: retailerId,
          title: newChatTitle,
        }
      );

      // Clear current state
      setMessages([]);
      setShowNewChatModal(false);
      setNewChatTitle("");

      // Refresh threads and auto-select the most recent one (which will be the newly created thread)
      fetchAllThreads(true);
    } catch (error) {
      console.error("Error creating thread:", error);
    }
  };

  const deleteThread = async (threadId, e) => {
    e.stopPropagation(); // Prevent thread selection when clicking delete

    if (!confirm("Are you sure you want to delete this thread?")) {
      return;
    }

    try {
      await axios.delete(
        `${BASE_URL}/api/customerChat/delete-thread/${threadId}?userId=${retailerId}`
      );

      // If the deleted thread was the current one, clear the current state
      if (currentThreadId === threadId) {
        setCurrentThreadId(null);
        setMessages([]);
      }

      // Refresh threads list
      fetchAllThreads();
    } catch (error) {
      console.error("Error deleting thread:", error);
      alert("Failed to delete thread. Please try again.");
    }
  };

  const fetchThreadMessages = async (threadId) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/customerChat/get-thread-messages/${threadId}?userId=${retailerId}`

      );
      setMessages(
        response.data.messages.map((msg) => ({
          id: Date.now() + Math.random(),
          type: msg.role === "user" ? "user" : "ai",
          content: msg.content,
          timestamp: new Date(msg.timestamp),
        }))
      );
      setCurrentThreadId(threadId);
      setActiveSidebarItem(null);
      setSelectedButton(null);
    } catch (error) {
      console.error("Error fetching thread messages:", error);
    }
  };

  const handleNewChat = () => {
    setShowNewChatModal(true);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentThreadId) return;

    // Create user message
    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    // Create AI message placeholder
    const aiMessageId = Date.now() + 1;
    const aiMessage = {
      id: aiMessageId,
      type: "ai",
      content: "",
      timestamp: new Date(),
    };

    // Update messages state
    setMessages((prev) => [...prev, userMessage, aiMessage]);
    setInputMessage("");

    try {
      setIsStreaming(true);

      const response = await fetch(
        `${BASE_URL}/api/customerChat/chat-stream/${currentThreadId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: retailerId,
            message: inputMessage,
          }),
        }
      );

      if (!response.ok) throw new Error("Stream request failed");
      if (!response.body) throw new Error("ReadableStream not supported");

      const reader = response.body
        .pipeThrough(new TextDecoderStream())
        .getReader();

      let assistantText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        // Process the streamed chunks
        const chunks = value
          .replaceAll(/^data: /gm, "") // Remove "data: " prefix
          .split("\n") // Split into individual chunks
          .filter((c) => Boolean(c.length) && c !== "[DONE]") // Remove empty chunks and "[DONE]"
          .map((c) => {
            try {
              return JSON.parse(c); // Parse each chunk as JSON
            } catch (err) {
              console.error("Failed to parse chunk:", c);
              return null;
            }
          })
          .filter((c) => c !== null && c.content); // Remove invalid chunks and get only content

        // Append new content to the assistant text
        chunks.forEach((chunk) => {
          if (chunk.content) {
            assistantText += chunk.content;
          }
        });

        // Update the AI message with new content
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId ? { ...msg, content: assistantText } : msg
          )
        );
      }

      // Finalize the AI message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId ? { ...msg, content: assistantText } : msg
        )
      );

    } catch (error) {
      console.error("Error during streaming:", error);
      // Update the AI message with error state
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
              ...msg,
              content: "Error processing request. Please try again.",
            }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
      // fetchAllThreads(); // Refresh threads to update last activity
    }
  };

  const handleSidebarItemClick = async (item) => {
    if (!currentThreadId) {
      alert("Please create or select a thread first");
      return;
    }

    setActiveSidebarItem(item);
    setSelectedButton(null);

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: item,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      setIsStreaming(true);
      const response = await fetch(
        `${BASE_URL}/api/customerChat/chat-stream/${currentThreadId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: retailerId,
            message: item,
          }),
        }
      );

      if (!response.ok) throw new Error("Stream request failed");
      if (!response.body) throw new Error("ReadableStream not supported");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: "",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              setIsStreaming(false);
              fetchAllThreads(); // Refresh threads to update last activity
              return;
            }

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n").filter((line) => line.trim() !== "");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.replace("data: ", "");
                if (data === "[DONE]") {
                  setIsStreaming(false);
                  fetchAllThreads(); // Refresh threads to update last activity
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.done) {
                    setIsStreaming(false);
                    fetchAllThreads(); // Refresh threads to update last activity
                    return;
                  }

                  if (parsed.content) {
                    setMessages((prev) => {
                      const lastMessage = prev[prev.length - 1];
                      if (lastMessage.type === "ai") {
                        return [
                          ...prev.slice(0, -1),
                          {
                            ...lastMessage,
                            content: lastMessage.content + parsed.content,
                          },
                        ];
                      }
                      return prev;
                    });
                  }
                } catch (e) {
                  console.error("Error parsing stream data:", e);
                }
              }
            }
          }
        } catch (error) {
          console.error("Error reading stream:", error);
          setIsStreaming(false);
        }
      };

      processStream();
    } catch (error) {
      console.error("Error sending message:", error);
      setIsStreaming(false);
    }
  };

  const handleQuickButtonClick = async (buttonId) => {
    if (!currentThreadId) {
      alert("Please create or select a thread first");
      return;
    }

    setSelectedButton(buttonId);
    setActiveSidebarItem(null);

    const messageContent =
      buttonId === "special-days" ? "Special Days" : "Event Reminders";
    const userMessage = {
      id: Date.now(),
      type: "user",
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      setIsStreaming(true);
      const response = await fetch(
        `${BASE_URL}/api/customerChat/chat-stream/${currentThreadId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: retailerId,
            message: messageContent,
          }),
        }
      );

      if (!response.ok) throw new Error("Stream request failed");
      if (!response.body) throw new Error("ReadableStream not supported");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: "",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              setIsStreaming(false);
              fetchAllThreads(); // Refresh threads to update last activity
              return;
            }

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n").filter((line) => line.trim() !== "");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.replace("data: ", "");
                if (data === "[DONE]") {
                  setIsStreaming(false);
                  fetchAllThreads(); // Refresh threads to update last activity
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.done) {
                    setIsStreaming(false);
                    fetchAllThreads(); // Refresh threads to update last activity
                    return;
                  }

                  if (parsed.content) {
                    setMessages((prev) => {
                      const lastMessage = prev[prev.length - 1];
                      if (lastMessage.type === "ai") {
                        return [
                          ...prev.slice(0, -1),
                          {
                            ...lastMessage,
                            content: lastMessage.content + parsed.content,
                          },
                        ];
                      }
                      return prev;
                    });
                  }
                } catch (e) {
                  console.error("Error parsing stream data:", e);
                }
              }
            }
          }
        } catch (error) {
          console.error("Error reading stream:", error);
          setIsStreaming(false);
        }
      };

      processStream();
    } catch (error) {
      console.error("Error sending message:", error);
      setIsStreaming(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isStreaming) {
      handleSendMessage();
    }
  };

  return (
    <div className="rounded-[40px] mx-auto flex h-[calc(100vh-200px)]">
      {/* Sidebar */}
      <div className="w-80 bg-[#3131660A] border-r border-gray-200 flex flex-col">
        {/* New Chat Button */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={handleNewChat}
            className="flex items-center w-full px-4 py-2 text-[#313166] font-[600] hover:text-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </button>
        </div>

        {/* Threads List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">
              Previous Chats
            </h3>
            {threads.map((thread) => (
              <div
                key={thread._id}
                onClick={() => fetchThreadMessages(thread._id)}
                className={`py-2 px-3 text-sm rounded cursor-pointer mb-1 ${currentThreadId === thread._id
                  ? "bg-pink-100 text-pink-600"
                  : "text-slate-600 hover:bg-gray-50"
                  }`}
              >
                <div className=" flex items-center justify-between">
                  <div>
                    <div className="font-medium truncate">{thread.title}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(thread.lastActivity).toLocaleDateString()}
                    </div>
                  </div>
                  <div
                    className=" text-red-300 hover:text-red-500 cursor-pointer p-1"
                    onClick={(e) => deleteThread(thread._id, e)}
                  >
                    <Trash className=" w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Items */}
          {/* <div className="p-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">
                Quick Actions
              </h3>
              {sidebarItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleSidebarItemClick(item)}
                  className={`py-2 px-3 text-sm rounded cursor-pointer ${
                    activeSidebarItem === item
                      ? "bg-pink-100 text-pink-600"
                      : "text-slate-600 hover:bg-gray-50"
                  }`}
                >
                  {item}
                </div>
              ))}
            </div> */}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#3131660A]">
          {messages.length === 0 && !currentThreadId ? (
            <div className="flex items-center justify-center h-80">
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-slate-800 mb-2">
                  Start a new chat
                </h3>
                <p className="text-gray-600">
                  Select "New Chat" to begin a conversation
                </p>
              </div>
            </div>
          ) : messages.length === 0 && currentThreadId ? (
            <div className="flex items-center justify-center h-80">
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-slate-800 mb-2">
                  What can I help with?
                </h3>
                <p className="text-gray-600">
                  Select a quick action or type your message below
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"
                    }`}
                >
                  <div
                    className={`flex items-start space-x-3 max-w-2xl ${message.type === "user"
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                      }`}
                  >
                    <div
                      className={` min-w-10 min-h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${message.type === "user" ? "bg-gray-600" : "bg-pink-600"
                        }`}
                    >
                      {message.type === "user" ? "Me" : "V"}
                    </div>
                    <div
                      className={`px-4 py-3 rounded-lg ${message.type === "user"
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
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-[#3131660A]">
          <div className="flex items-center space-x-3">
            <textarea
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message"
              // className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
              // className="w-full resize-none bg-transparent focus:outline-none rounded-lg text-gray-800 placeholder-gray-500 min-h-[100px] focus:ring-2 focus:ring-pink-500"
              className="w-full resize-none px-4 py-3 bg-white focus:outline-none text-gray-800 placeholder-gray-500 min-h-[100px]"
              disabled={isStreaming || !currentThreadId}
            />
            <button
              onClick={handleSendMessage}
              disabled={isStreaming || !currentThreadId}
              className={`p-3 rounded-lg transition-colors ${isStreaming || !currentThreadId
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-pink-600 hover:bg-pink-700 text-white"
                }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Create New Chat</h3>
            <input
              type="text"
              value={newChatTitle}
              onChange={(e) => setNewChatTitle(e.target.value)}
              placeholder="Enter chat title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
              onKeyPress={(e) => {
                if (e.key === "Enter") createNewThread();
              }}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowNewChatModal(false);
                  setNewChatTitle("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={createNewThread}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerRecommendation;