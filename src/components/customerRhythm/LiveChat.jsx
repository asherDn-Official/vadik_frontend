import { useState, useEffect, useRef } from "react";
import { 
  Search, 
  Send, 
  User, 
  Clock, 
  AlertCircle, 
  LayoutTemplate,
  CheckCheck,
  Check,
  Phone,
  ArrowLeft,
  RefreshCcw,
  MessageCircle,
  MoreVertical,
  Paperclip,
  Smile,
  Info,
  UploadCloud,
  Trash2,
  X
} from "lucide-react";
import api from "../../api/apiconfig";
import { toast } from "react-toastify";
import { format, isToday } from "date-fns";

const LiveChat = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [activeTab, setActiveTab] = useState("requesting");
  const [isIntervening, setIsIntervening] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [mediaLibrary, setMediaLibrary] = useState([]);
  const [mediaLibraryLoading, setMediaLibraryLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaCaption, setMediaCaption] = useState("");
  const [mediaUsage, setMediaUsage] = useState(null);
  const [pendingMediaMessages, setPendingMediaMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const customersAbortRef = useRef(null);
  const customersFetchInFlightRef = useRef(false);
  const lastCustomersFetchRef = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      customersAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    fetchCustomers();
    fetchTemplates();
    fetchMediaUsage();
    
    // Set up polling for new messages
    const interval = setInterval(() => {
      if (selectedCustomer) {
        syncMessages(selectedCustomer.mobileNumber, false);
      }
      fetchCustomers(false); // Update customer list for new message indicators
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedCustomer]);

  const fetchMediaUsage = async () => {
    try {
      const res = await api.get("/api/subscriptions/credit/usage");
      if (res.data?.usage?.mediaStorage) {
        setMediaUsage(res.data.usage.mediaStorage);
      }
    } catch (error) {
      console.error("Error fetching media usage:", error);
    }
  };

  const fetchMediaLibrary = async () => {
    try {
      setMediaLibraryLoading(true);
      const res = await api.get("/api/integrationManagement/whatsapp/media?limit=200");
      if (res.data?.status) {
        setMediaLibrary(res.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching media library:", error);
      toast.error("Failed to load media library");
    } finally {
      setMediaLibraryLoading(false);
    }
  };

  useEffect(() => {
    // When selected customer changes, update isWindowOpen
    if (selectedCustomer && messages.length > 0) {
      const lastInbound = [...messages].reverse().find(m => m.status === 'received');
      if (lastInbound) {
        const lastInboundTime = new Date(lastInbound.timestamp);
        const now = new Date();
        const diffInHours = (now - lastInboundTime) / (1000 * 60 * 60);
        setIsWindowOpen(diffInHours < 24);
      } else {
        setIsWindowOpen(false);
      }
    }
  }, [selectedCustomer, messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchCustomers = async (showLoading = true) => {
    if (customersFetchInFlightRef.current) return;
    const now = Date.now();
    if (!showLoading && now - lastCustomersFetchRef.current < 4000) return;

    customersFetchInFlightRef.current = true;
    lastCustomersFetchRef.current = now;

    if (customersAbortRef.current) {
      customersAbortRef.current.abort();
    }
    const controller = new AbortController();
    customersAbortRef.current = controller;

    try {
      if (showLoading && isMountedRef.current) setLoading(true);
      const retailerId = localStorage.getItem('retailerId');
      
      const res = await api.get(
        `/api/customers/all?retailerId=${retailerId}&limit=200&fields=chat&chatOnly=true&skipCount=true`,
        { signal: controller.signal }
      );

      if (res.data) {
        const allCustomers = res.data.customers || [];

        // Sort by last activity
        const sortedCustomers = allCustomers
          .filter(c => c.lastInboundMessageAt || c.lastOutboundMessageAt)
          .sort((a, b) => {
            const timeA = Math.max(
              new Date(a.lastInboundMessageAt || 0).getTime(), 
              new Date(a.lastOutboundMessageAt || 0).getTime()
            );
            const timeB = Math.max(
              new Date(b.lastInboundMessageAt || 0).getTime(), 
              new Date(b.lastOutboundMessageAt || 0).getTime()
            );
            return timeB - timeA;
          });

        if (isMountedRef.current) setCustomers(sortedCustomers);
      }
    } catch (error) {
      if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") {
        return;
      }
      console.error("Error fetching customers for chat:", error);
    } finally {
      if (showLoading && isMountedRef.current) setLoading(false);
      customersFetchInFlightRef.current = false;
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await api.get("/api/integrationManagement/whatsapp/custom-templates");
      if (res.data.status) {
        setTemplates(res.data.data.filter(t => t.status === "APPROVED"));
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const syncMessages = async (mobileNumber, showLoading = true) => {
    try {
      if (showLoading) setLoadingMessages(true);
      const res = await api.get(`/api/whatsappMessage/logs?search=${mobileNumber}&limit=50`);
      if (res.data.status) {
        const sortedMessages = res.data.data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setMessages(sortedMessages);
      }
    } catch (error) {
      console.error("Error syncing messages:", error);
    } finally {
      if (showLoading) setLoadingMessages(false);
    }
  };

  const handleIntervene = async () => {
    if (!selectedCustomer) return;
    try {
      setIsIntervening(true);
      const res = await api.post("/api/whatsappMessage/intervene", { 
        customerId: selectedCustomer._id 
      });
      if (res.data.status) {
        toast.success("Joined conversation");
        setSelectedCustomer(res.data.data);
        fetchCustomers(false);
      }
    } catch (error) {
      console.error("Error intervening:", error);
      toast.error("Failed to join conversation");
    } finally {
      setIsIntervening(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedCustomer) return;
    try {
      setIsIntervening(true);
      const res = await api.post("/api/whatsappMessage/resolve", { 
        customerId: selectedCustomer._id 
      });
      if (res.data.status) {
        toast.success("Conversation resolved");
        setSelectedCustomer(null);
        fetchCustomers(false);
      }
    } catch (error) {
      console.error("Error resolving:", error);
      toast.error("Failed to resolve conversation");
    } finally {
      setIsIntervening(false);
    }
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    syncMessages(customer.mobileNumber);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedCustomer || isUploading) return;

    try {
      const payload = {
        to: selectedCustomer.mobileNumber.startsWith('+') ? selectedCustomer.mobileNumber : `+${selectedCustomer.countryCode || ''}${selectedCustomer.mobileNumber}`.replace('++', '+'),
        message: newMessage
      };

      const res = await api.post("/api/whatsappMessage/text", payload);
      if (res.data) {
        setNewMessage("");
        syncMessages(selectedCustomer.mobileNumber, false);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.response?.data?.error || "Failed to send message");
    }
  };


  const openMediaLibrary = async () => {
    setShowMediaModal(true);
    setSelectedMedia(null);
    setMediaCaption("");
    await fetchMediaLibrary();
    await fetchMediaUsage();
  };

  const handleMediaLibraryUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setMediaLibraryLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/api/integrationManagement/whatsapp/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data?.status) {
        toast.success("Media uploaded");
        await fetchMediaLibrary();
        await fetchMediaUsage();
      } else {
        toast.error(res.data?.message || "Upload failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setMediaLibraryLoading(false);
      event.target.value = "";
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    try {
      await api.delete(`/api/integrationManagement/whatsapp/media/${mediaId}`);
      toast.success("Media deleted");
      await fetchMediaLibrary();
      await fetchMediaUsage();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete media");
    }
  };

  const handleSendSelectedMedia = async () => {
    if (!selectedMedia || !selectedCustomer) return;

    const toNumber = selectedCustomer.mobileNumber.startsWith('+')
      ? selectedCustomer.mobileNumber
      : `+${selectedCustomer.countryCode || ''}${selectedCustomer.mobileNumber}`.replace('++', '+');

    const tempId = `pending-${Date.now()}`;
    const pendingItem = {
      id: tempId,
      mediaUrl: selectedMedia.s3Url,
      messageType: selectedMedia.mimeType?.startsWith("image/")
        ? "image"
        : selectedMedia.mimeType?.startsWith("video/")
        ? "video"
        : selectedMedia.mimeType?.startsWith("audio/")
        ? "audio"
        : "document",
      messageContent: mediaCaption.trim(),
      status: "sending",
      timestamp: new Date()
    };

    setPendingMediaMessages((prev) => [...prev, pendingItem]);
    setShowMediaModal(false);
    setSelectedMedia(null);
    setMediaCaption("");

    try {
      setIsUploading(true);
      await api.post("/api/whatsappMessage/media-url", {
        to: toNumber,
        caption: pendingItem.messageContent,
        mediaUrl: selectedMedia.s3Url,
        mimeType: selectedMedia.mimeType,
        fileName: selectedMedia.fileName,
        mediaSizeBytes: selectedMedia.sizeBytes || 0
      });
      setPendingMediaMessages((prev) => prev.filter((p) => p.id !== tempId));
      syncMessages(selectedCustomer.mobileNumber, false);
    } catch (error) {
      setPendingMediaMessages((prev) =>
        prev.map((p) => (p.id === tempId ? { ...p, status: "failed" } : p))
      );
      toast.error(error.response?.data?.error || "Failed to send media");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendTemplate = async (template) => {
    try {
      const payload = {
        to: selectedCustomer.mobileNumber.startsWith('+') ? selectedCustomer.mobileNumber : `+${selectedCustomer.countryCode || ''}${selectedCustomer.mobileNumber}`.replace('++', '+'),
        templateName: template.name
      };

      const res = await api.post("/api/whatsappMessage/template", payload);
      if (res.data) {
        toast.success("Template sent successfully");
        setShowTemplateModal(false);
        syncMessages(selectedCustomer.mobileNumber, false);
      }
    } catch (error) {
      console.error("Error sending template:", error);
      toast.error(error.response?.data?.error || "Failed to send template");
    }
  };

  const filteredCustomersByTab = customers.filter(c => {
    if (activeTab === "requesting") return c.chatStatus === "requesting";
    if (activeTab === "intervened") return c.chatStatus === "intervened";
    return true; // "all"
  });

  const filteredCustomers = filteredCustomersByTab.filter(c => 
    `${c.firstname} ${c.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.mobileNumber.includes(searchTerm)
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent': return <Check size={14} className="text-gray-400" />;
      case 'delivered': return <CheckCheck size={14} className="text-gray-400" />;
      case 'read': return <CheckCheck size={14} className="text-blue-500" />;
      case 'failed': return <AlertCircle size={14} className="text-red-500" />;
      default: return null;
    }
  };

  const mediaLimit = mediaUsage?.allowed || 0;
  const mediaUsed = mediaUsage?.used || 0;
  const mediaRemaining = Math.max(0, mediaLimit - mediaUsed);
  const isNearMediaLimit = mediaLimit > 0 && mediaRemaining / mediaLimit <= 0.1;

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Left Sidebar - Customer List */}
      <div className={`w-full md:w-80 border-r border-gray-100 flex flex-col bg-gray-50/30 ${selectedCustomer ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-100 bg-white">
          <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-xl">
             {["requesting", "intervened", "all"].map(tab => (
               <button 
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${activeTab === tab ? 'bg-white text-[#313166] shadow-sm' : 'text-gray-400'}`}
               >
                 {tab}
               </button>
             ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search chats..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#313166]/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading && customers.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading chats...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No chats in {activeTab}</div>
          ) : (
            filteredCustomers.map((customer) => (
              <div 
                key={customer._id}
                onClick={() => handleSelectCustomer(customer)}
                className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-white transition-colors border-b border-gray-50 ${selectedCustomer?._id === customer._id ? 'bg-white border-l-4 border-l-[#313166]' : ''}`}
              >
                <div className="w-12 h-12 rounded-full bg-[#313166]/10 flex items-center justify-center text-[#313166] font-bold shrink-0 relative">
                  {customer.firstname?.charAt(0) || <User size={20} />}
                  {customer.chatStatus === 'requesting' && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <h4 className="font-bold text-gray-900 truncate text-sm">
                      {customer.firstname} {customer.lastname}
                    </h4>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      {(() => {
                        const lastTime = customer.lastInboundMessageAt || customer.lastOutboundMessageAt;
                        if (!lastTime) return "";
                        const lastDate = new Date(lastTime);
                        return isToday(lastDate)
                          ? format(lastDate, "HH:mm")
                          : format(lastDate, "dd MMM, HH:mm");
                      })()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                    {customer.lastMessageContent || "No messages yet"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      {selectedCustomer ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="w-10 h-10 rounded-full bg-[#313166]/10 flex items-center justify-center text-[#313166] font-bold">
                {selectedCustomer.firstname?.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 text-sm">{selectedCustomer.firstname} {selectedCustomer.lastname}</h3>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase ${selectedCustomer.chatStatus === 'intervened' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                    {selectedCustomer.chatStatus === 'intervened' ? 'Live' : 'Bot'}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 flex items-center gap-1">
                  <Phone size={10} /> {selectedCustomer.mobileNumber}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedCustomer.chatStatus === 'requesting' ? (
                <button 
                  onClick={handleIntervene}
                  disabled={isIntervening}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-[#313166] text-white rounded-lg text-xs font-bold hover:bg-[#3d3b83] transition-all disabled:opacity-50"
                >
                  <MessageCircle size={14} />
                  Intervene
                </button>
              ) : selectedCustomer.chatStatus === 'intervened' && (
                <button 
                  onClick={handleResolve}
                  disabled={isIntervening}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition-all disabled:opacity-50"
                >
                  <Check size={14} />
                  Resolve
                </button>
              )}
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${isWindowOpen ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                <Clock size={12} />
                {isWindowOpen ? '24h Window Open' : '24h Window Closed'}
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                <Info size={20} />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>

          {isNearMediaLimit && (
            <div className="mx-4 mt-3 mb-2 flex items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2">
              <div className="text-xs text-amber-700">
                Media storage is almost full. {mediaUsed.toFixed(2)}MB used of {mediaLimit.toFixed(2)}MB.
              </div>
              <button
                className="text-xs font-bold text-amber-700 underline"
                onClick={openMediaLibrary}
              >
                Manage Media
              </button>
            </div>
          )}

          {/* Messages Window */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F4F5F9]/30">
            {loadingMessages ? (
              <div className="flex justify-center p-4">
                <RefreshCcw size={24} className="animate-spin text-gray-300" />
              </div>
            ) : (
              [...messages, ...pendingMediaMessages].map((msg, idx) => {
                const isMine = msg.status !== 'received';
                return (
                  <div key={msg._id || msg.id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm relative ${isMine ? 'bg-[#313166] text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}`}>
                      {msg.mediaUrl && String(msg.mediaUrl).startsWith("http") && (
                        <div className="mb-2">
                          {msg.messageType === "image" && (
                            <img src={msg.mediaUrl} alt="media" className="max-w-full rounded-xl" />
                          )}
                          {msg.messageType === "video" && (
                            <video src={msg.mediaUrl} controls className="max-w-full rounded-xl" />
                          )}
                          {msg.messageType === "audio" && (
                            <audio src={msg.mediaUrl} controls className="w-full" />
                          )}
                          {msg.messageType === "document" && (
                            <a href={msg.mediaUrl} target="_blank" rel="noreferrer" className={`text-xs underline ${isMine ? 'text-white' : 'text-[#313166]'}`}>
                              View document
                            </a>
                          )}
                        </div>
                      )}
                      {msg.messageContent && (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.messageContent}</p>
                      )}
                      <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${isMine ? 'text-[#ffffff90]' : 'text-gray-400'}`}>
                        {msg.status === "sending" ? "Sending..." : (() => {
                          const msgDate = new Date(msg.timestamp);
                          return isToday(msgDate)
                            ? format(msgDate, "HH:mm")
                            : format(msgDate, "dd MMM, HH:mm");
                        })()}
                        {isMine && getStatusIcon(msg.status)}
                      </div>
                      {msg.status === "failed" && (
                        <div className="mt-1 text-[10px] text-red-200">
                          Failed to send
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-100 bg-white">
            {selectedCustomer.chatStatus === 'requesting' ? (
              <div className="flex flex-col items-center justify-center p-6 bg-[#313166]/5 rounded-2xl border border-dashed border-[#313166]/20">
                <p className="text-sm text-[#313166] font-medium mb-3">Customer is waiting for a response</p>
                <button 
                  onClick={handleIntervene}
                  disabled={isIntervening}
                  className="flex items-center gap-2 px-8 py-2.5 bg-[#313166] text-white rounded-xl text-sm font-bold hover:bg-[#3d3b83] transition-all shadow-lg shadow-[#313166]/20 disabled:opacity-50"
                >
                  <MessageCircle size={18} />
                  Intervene to Chat
                </button>
              </div>
            ) : !isWindowOpen ? (
              <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <AlertCircle size={24} className="text-amber-500 mb-2" />
                <p className="text-sm text-gray-600 text-center mb-4">
                  The 24-hour customer service window has expired. You can only send an approved template to re-engage this customer.
                </p>
                <button 
                  onClick={() => setShowTemplateModal(true)}
                  className="flex items-center gap-2 px-6 py-2 bg-[#313166] text-white rounded-xl text-sm font-bold hover:bg-[#3d3b83] transition-all"
                >
                  <LayoutTemplate size={18} />
                  Send Template Message
                </button>
              </div>
            ) : (
              <div className="flex items-end gap-3">
                <div className="flex gap-2 mb-2">
                   <button 
                     className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                     onClick={openMediaLibrary}
                     disabled={isUploading}
                     title="Attach media"
                   >
                     <Paperclip size={20} />
                   </button>
                   <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                     <Smile size={20} />
                   </button>
                </div>
                <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-100 focus-within:ring-2 focus-within:ring-[#313166]/20 transition-all p-1 flex items-end">
                  <textarea 
                    rows="1"
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm p-2.5 max-h-32 resize-none"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={isUploading}
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isUploading}
                    className="p-2 bg-[#313166] text-white rounded-xl hover:bg-[#3d3b83] transition-all disabled:opacity-50 mb-1 mr-1"
                  >
                    <Send size={18} />
                  </button>
                </div>
                <button 
                  onClick={() => setShowTemplateModal(true)}
                  className="p-3 bg-white border border-gray-200 text-[#313166] rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                  title="Send Template"
                >
                  <LayoutTemplate size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden md:flex flex-col items-center justify-center text-center p-12 bg-gray-50/30">
          <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center text-[#313166] mb-6">
            <MessageCircle size={40} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Select a Conversation</h2>
          <p className="text-gray-500 max-w-xs">
            Choose a customer from the list on the left to start chatting and managing their WhatsApp communications.
          </p>
        </div>
      )}

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Select Template</h3>
                <p className="text-xs text-gray-500">Choose an approved Meta template to send</p>
              </div>
              <button 
                onClick={() => setShowTemplateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <RefreshCcw size={20} className="text-gray-400" />
              </button>
            </div>
            
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div 
                    key={template._id}
                    onClick={() => handleSendTemplate(template)}
                    className="p-4 border border-gray-100 rounded-2xl hover:border-[#313166] hover:bg-[#313166]/5 cursor-pointer transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-[#313166] bg-[#313166]/10 px-2 py-0.5 rounded-lg uppercase">
                        {template.category}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-[#313166]">{template.name}</h4>
                    <p className="text-xs text-gray-500 line-clamp-3 italic">
                      {template.components.find(c => c.type === 'BODY')?.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setShowTemplateModal(false)}
                className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Library Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Media Library</h3>
                <p className="text-xs text-gray-500">Upload once and reuse in chat</p>
              </div>
              <button
                onClick={() => setShowMediaModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
              <div className="text-xs text-gray-500">
                {mediaUsage
                  ? `Storage: ${mediaUsed.toFixed(2)}MB / ${mediaLimit.toFixed(2)}MB`
                  : "Storage usage loading..."}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-[#313166] text-white rounded-xl text-xs font-bold hover:bg-[#3d3b83] transition-all"
                >
                  <UploadCloud size={16} />
                  Upload Media
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleMediaLibraryUpload}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 max-h-[65vh] overflow-y-auto">
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {mediaLibraryLoading ? (
                  <div className="text-sm text-gray-400">Loading media...</div>
                ) : mediaLibrary.length === 0 ? (
                  <div className="text-sm text-gray-400">No media uploaded yet.</div>
                ) : (
                  mediaLibrary.map((media) => {
                    const isSelected = selectedMedia?._id === media._id;
                    const isImage = media.mimeType?.startsWith("image/");
                    return (
                      <div
                        key={media._id}
                        onClick={() => setSelectedMedia(media)}
                        className={`border rounded-2xl p-3 cursor-pointer transition-all ${isSelected ? "border-[#313166] bg-[#313166]/5" : "border-gray-100 hover:border-[#313166]/40"}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-[10px] font-bold text-[#313166] uppercase">
                            {media.mimeType?.split("/")[0] || "file"}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMedia(media._id);
                            }}
                            className="text-gray-400 hover:text-red-500"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="mt-2 h-28 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden">
                          {isImage ? (
                            <img src={media.s3Url} alt="media" className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-xs text-gray-400">{media.fileName || "Media file"}</span>
                          )}
                        </div>
                        <div className="mt-2 text-xs text-gray-600 truncate">
                          {media.fileName || "Untitled"}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {media.sizeBytes ? `${(media.sizeBytes / (1024 * 1024)).toFixed(2)}MB` : "—"}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="border border-gray-100 rounded-2xl p-4 h-fit">
                <h4 className="text-sm font-bold text-gray-900 mb-2">Selected Media</h4>
                {!selectedMedia ? (
                  <div className="text-xs text-gray-400">Select a media file to preview and send.</div>
                ) : (
                  <>
                    <div className="rounded-xl bg-gray-50 p-3 mb-3">
                      {selectedMedia.mimeType?.startsWith("image/") && (
                        <img src={selectedMedia.s3Url} alt="selected" className="rounded-lg w-full object-cover" />
                      )}
                      {selectedMedia.mimeType?.startsWith("video/") && (
                        <video src={selectedMedia.s3Url} controls className="w-full rounded-lg" />
                      )}
                      {selectedMedia.mimeType?.startsWith("audio/") && (
                        <audio src={selectedMedia.s3Url} controls className="w-full" />
                      )}
                      {!selectedMedia.mimeType?.startsWith("image/") &&
                        !selectedMedia.mimeType?.startsWith("video/") &&
                        !selectedMedia.mimeType?.startsWith("audio/") && (
                          <a href={selectedMedia.s3Url} target="_blank" rel="noreferrer" className="text-xs underline text-[#313166]">
                            View document
                          </a>
                        )}
                    </div>
                    <label className="text-xs text-gray-500">Caption (optional)</label>
                    <textarea
                      rows="3"
                      className="w-full mt-1 text-sm p-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#313166]/20"
                      value={mediaCaption}
                      onChange={(e) => setMediaCaption(e.target.value)}
                      placeholder="Type a caption..."
                    />
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={handleSendSelectedMedia}
                        disabled={!selectedCustomer || isUploading}
                        className="flex-1 px-4 py-2 bg-[#313166] text-white rounded-xl text-xs font-bold hover:bg-[#3d3b83] transition-all disabled:opacity-50"
                      >
                        Send Media
                      </button>
                      <button
                        onClick={() => {
                          setSelectedMedia(null);
                          setMediaCaption("");
                        }}
                        className="px-3 py-2 text-xs font-bold text-gray-500 hover:text-gray-700"
                      >
                        Clear
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveChat;
