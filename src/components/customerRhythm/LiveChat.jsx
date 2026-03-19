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
  Info
} from "lucide-react";
import api from "../../api/apiconfig";
import { toast } from "react-toastify";
import { format } from "date-fns";

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
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchCustomers();
    fetchTemplates();
    
    // Set up polling for new messages
    const interval = setInterval(() => {
      if (selectedCustomer) {
        syncMessages(selectedCustomer.mobileNumber, false);
      }
      fetchCustomers(false); // Update customer list for new message indicators
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedCustomer]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchCustomers = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const retailerId = localStorage.getItem('retailerId');
      // Fetch customers and also recent message logs to identify who to chat with
      const [customerRes, logRes] = await Promise.all([
        api.get(`/api/customers/all?retailerId=${retailerId}&limit=100`),
        api.get(`/api/integrationManagement/whatsapp/logs?limit=100`)
      ]);

      if (customerRes.data && logRes.data.status) {
        const allCustomers = customerRes.data.customers || [];
        const logs = logRes.data.data || [];

        // Identify customers who have messages
        const customerMap = new Map();
        
        // Initialize with all customers
        allCustomers.forEach(c => {
          customerMap.set(c.mobileNumber, {
            ...c,
            lastMessage: null,
            unreadCount: 0
          });
        });

        // Add info from logs
        logs.forEach(log => {
          const mobile = log.mobileNumber.replace(/^\+/, '');
          const existing = customerMap.get(mobile) || customerMap.get(log.mobileNumber);
          
          if (existing) {
            if (!existing.lastMessage || new Date(log.timestamp) > new Date(existing.lastMessage.timestamp)) {
              existing.lastMessage = log;
            }
          } else {
            // Log from unknown customer
            customerMap.set(log.mobileNumber, {
              mobileNumber: log.mobileNumber,
              firstname: log.firstname || "Unknown",
              lastname: log.lastname || "",
              lastMessage: log,
              unreadCount: 0,
              _id: log.customerId || log.mobileNumber
            });
          }
        });

        const sortedCustomers = Array.from(customerMap.values())
          .filter(c => c.lastMessage) // Only show customers with message history
          .sort((a, b) => {
            const dateA = a.lastMessage ? new Date(a.lastMessage.timestamp) : 0;
            const dateB = b.lastMessage ? new Date(b.lastMessage.timestamp) : 0;
            return dateB - dateA;
          });

        setCustomers(sortedCustomers);
      }
    } catch (error) {
      console.error("Error fetching customers for chat:", error);
    } finally {
      if (showLoading) setLoading(false);
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
      const res = await api.get(`/api/integrationManagement/whatsapp/logs?search=${mobileNumber}&limit=50`);
      if (res.data.status) {
        const sortedMessages = res.data.data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setMessages(sortedMessages);
        
        // Check 24-hour window
        const lastInbound = [...sortedMessages].reverse().find(m => m.status === 'received');
        if (lastInbound) {
          const lastInboundTime = new Date(lastInbound.timestamp);
          const now = new Date();
          const diffInHours = (now - lastInboundTime) / (1000 * 60 * 60);
          setIsWindowOpen(diffInHours < 24);
        } else {
          setIsWindowOpen(false);
        }
      }
    } catch (error) {
      console.error("Error syncing messages:", error);
    } finally {
      if (showLoading) setLoadingMessages(false);
    }
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    syncMessages(customer.mobileNumber);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedCustomer) return;

    try {
      const payload = {
        to: selectedCustomer.mobileNumber.startsWith('+') ? selectedCustomer.mobileNumber : `+${selectedCustomer.countryCode || ''}${selectedCustomer.mobileNumber}`.replace('++', '+'),
        message: newMessage
      };

      const res = await api.post("/api/integrationManagement/whatsapp/text", payload);
      if (res.data) {
        setNewMessage("");
        syncMessages(selectedCustomer.mobileNumber, false);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.response?.data?.error || "Failed to send message");
    }
  };

  const handleSendTemplate = async (template) => {
    try {
      const payload = {
        to: selectedCustomer.mobileNumber.startsWith('+') ? selectedCustomer.mobileNumber : `+${selectedCustomer.countryCode || ''}${selectedCustomer.mobileNumber}`.replace('++', '+'),
        templateName: template.name
      };

      const res = await api.post("/api/integrationManagement/whatsapp/template", payload);
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

  const filteredCustomers = customers.filter(c => 
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

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Left Sidebar - Customer List */}
      <div className={`w-full md:w-80 border-r border-gray-100 flex flex-col bg-gray-50/30 ${selectedCustomer ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-100 bg-white">
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
            <div className="p-8 text-center text-gray-400 text-sm">No chats found</div>
          ) : (
            filteredCustomers.map((customer) => (
              <div 
                key={customer._id}
                onClick={() => handleSelectCustomer(customer)}
                className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-white transition-colors border-b border-gray-50 ${selectedCustomer?._id === customer._id ? 'bg-white border-l-4 border-l-[#313166]' : ''}`}
              >
                <div className="w-12 h-12 rounded-full bg-[#313166]/10 flex items-center justify-center text-[#313166] font-bold shrink-0">
                  {customer.firstname?.charAt(0) || <User size={20} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <h4 className="font-bold text-gray-900 truncate text-sm">
                      {customer.firstname} {customer.lastname}
                    </h4>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      {customer.lastMessage && format(new Date(customer.lastMessage.timestamp), 'HH:mm')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                    {customer.lastMessage?.status !== 'received' && getStatusIcon(customer.lastMessage?.status)}
                    {customer.lastMessage?.messageContent || "No messages yet"}
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
                <h3 className="font-bold text-gray-900 text-sm">{selectedCustomer.firstname} {selectedCustomer.lastname}</h3>
                <p className="text-[10px] text-gray-500 flex items-center gap-1">
                  <Phone size={10} /> {selectedCustomer.mobileNumber}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
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

          {/* Messages Window */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F4F5F9]/30">
            {loadingMessages ? (
              <div className="flex justify-center p-4">
                <RefreshCcw size={24} className="animate-spin text-gray-300" />
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMine = msg.status !== 'received';
                return (
                  <div key={msg._id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm relative ${isMine ? 'bg-[#313166] text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.messageContent}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${isMine ? 'text-[#ffffff90]' : 'text-gray-400'}`}>
                        {format(new Date(msg.timestamp), 'HH:mm')}
                        {isMine && getStatusIcon(msg.status)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-100 bg-white">
            {!isWindowOpen ? (
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
                   <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
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
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
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
    </div>
  );
};

export default LiveChat;
