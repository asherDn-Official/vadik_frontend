import React, { useState, useEffect, useRef } from "react";
import { Plus, Send, Trash } from "lucide-react";
import Markdown from "react-markdown";
import api, { API_BASE_URL } from "../../api/apiconfig";
const token = localStorage.getItem("token");
const StoreRecommendation = () => {
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

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch all threads on component mount
  useEffect(() => {
    if (retailerId) {
      fetchAllThreads();
    }
  }, [retailerId]);

  const fetchAllThreads = async (selectMostRecent = false) => {
    try {
      const response = await api.get(
        `/api/staffChat/get-all-threads?userId=${retailerId}`
      );
      const fetchedThreads = response.data.threads;
      setThreads(fetchedThreads);

      if (fetchedThreads.length > 0 && (!currentThreadId || selectMostRecent)) {
        const sortedThreads = [...fetchedThreads].sort(
          (a, b) => new Date(b.lastActivity) - new Date(a.lastActivity)
        );
        const mostRecentThread = sortedThreads[0];
        fetchThreadMessages(mostRecentThread._id);
      }
    } catch (error) {
      console.error("Error fetching threads:", error);
    }
  };

  const createNewThread = async () => {
    if (!newChatTitle.trim()) return;

    try {
      await api.post(`/api/staffChat/create-thread`, {
        userId: retailerId,
        title: newChatTitle,
      });

      setMessages([]);
      setShowNewChatModal(false);
      setNewChatTitle("");
      fetchAllThreads(true);
    } catch (error) {
      console.error("Error creating thread:", error);
    }
  };

  const deleteThread = async (threadId, e) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this thread?")) return;

    try {
      await api.delete(
        `/api/staffChat/delete-thread/${threadId}?userId=${retailerId}`
      );

      if (currentThreadId === threadId) {
        setCurrentThreadId(null);
        setMessages([]);
      }
      fetchAllThreads();
    } catch (error) {
      console.error("Error deleting thread:", error);
      alert("Failed to delete thread. Please try again.");
    }
  };

  const fetchThreadMessages = async (threadId) => {
    try {
      const response = await api.get(
        `/api/staffChat/get-thread-messages/${threadId}?userId=${retailerId}`
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

  // ---------- STREAM HELPERS ----------
  const processStream = async (response, aiMessageId) => {
    if (!response.body) throw new Error("ReadableStream not supported");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let assistantText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter((line) => line.trim() !== "");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.replace("data: ", "");
          if (data === "[DONE]") return;

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              assistantText += parsed.content;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiMessageId ? { ...msg, content: assistantText } : msg
                )
              );
            }
          } catch (err) {
            console.error("Error parsing stream chunk:", data);
          }
        }
      }
    }
  };

  // ---------- SEND MESSAGE ----------
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentThreadId) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    const aiMessageId = Date.now() + 1;
    const aiMessage = {
      id: aiMessageId,
      type: "ai",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage, aiMessage]);
    setInputMessage("");
    setIsStreaming(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/staffChat/chat-stream/${currentThreadId}`,
        {
          method: "POST",
          headers: {
             "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`  
            },
          body: JSON.stringify({ userId: retailerId, message: inputMessage }),
        }
      );

      await processStream(response, aiMessageId);
    } catch (error) {
      console.error("Error during streaming:", error);
    } finally {
      setIsStreaming(false);
    }
  };

  // ---------- SIDEBAR ITEM ----------
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

    const aiMessageId = Date.now() + 1;
    const aiMessage = { id: aiMessageId, type: "ai", content: "", timestamp: new Date() };

    setMessages((prev) => [...prev, userMessage, aiMessage]);
    setIsStreaming(true);

    try {
      const response = await fetch(
        `/api/staffChat/chat-stream/${currentThreadId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: retailerId, message: item }),
        }
      );

      await processStream(response, aiMessageId);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsStreaming(false);
    }
  };

  // ---------- QUICK BUTTON ----------
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

    const aiMessageId = Date.now() + 1;
    const aiMessage = { id: aiMessageId, type: "ai", content: "", timestamp: new Date() };

    setMessages((prev) => [...prev, userMessage, aiMessage]);
    setIsStreaming(true);

    try {
      const response = await fetch(
        `/api/staffChat/chat-stream/${currentThreadId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: retailerId, message: messageContent }),
        }
      );

      await processStream(response, aiMessageId);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isStreaming) handleSendMessage();
  };

  return (
    <div className="rounded-[40px] mx-auto flex h-[calc(100vh-200px)]">
      {/* Sidebar */}
      <div className="w-80 bg-[#3131660A] border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => setShowNewChatModal(true)}
            className="flex items-center w-full px-4 py-2 text-[#313166] font-[600] hover:text-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">
              Previous Chats
            </h3>
            {threads.map((thread) => (
              <div
                key={thread._id}
                onClick={() => fetchThreadMessages(thread._id)}
                className={`py-2 px-3 text-sm rounded cursor-pointer mb-1 ${
                  currentThreadId === thread._id
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
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
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
                      className={` min-w-10 min-h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
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
                      <div className="prose prose-sm prose space-y-1">
                        <Markdown>{message.content}</Markdown>
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
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message"
              className="w-full resize-none px-4 py-3 bg-white focus:outline-none text-gray-800 placeholder-gray-500 min-h-[100px]"
              disabled={isStreaming || !currentThreadId}
            />
            <button
              onClick={handleSendMessage}
              disabled={isStreaming || !currentThreadId}
              className={`p-3 rounded-lg transition-colors ${
                isStreaming || !currentThreadId
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

export default StoreRecommendation;
