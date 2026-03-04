import React, { useState, useEffect } from "react";
import { 
  Send, 
  Filter,
  Users, 
  LayoutTemplate, 
  Megaphone,
  Search,
  ChevronRight,
  ChevronLeft,
  Info,
  Type,
  X,
  CheckCircle2,
  Video,
  FileText,
  Image as ImageIcon,
  Upload,
  Plus
} from "lucide-react";
import api from "../../api/apiconfig";
import { toast } from "react-toastify";

const SendCampaign = ({ initialMode }) => {
  const [templates, setTemplates] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  const [sendMode, setSendMode] = useState(initialMode || "direct"); // "direct" (template) or "saved" (campaign)
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  
  const [headerVariables, setHeaderVariables] = useState({});
  const [bodyVariables, setBodyVariables] = useState({});
  const [media, setMedia] = useState({ url: "", type: "" });
  
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [fetchingCustomers, setFetchingCustomers] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  
  // Pagination & Search
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [topCustomers, setTopCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const customersPerPage = 10;

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, customerSearch, selectedFilter]);

  const fetchInitialData = async () => {
    try {
      setFetchingData(true);
      const [tempRes, campRes, clvRes] = await Promise.all([
        api.get("/api/integrationManagement/whatsapp/custom-templates"),
        api.get("/api/integrationManagement/whatsapp/campaigns"),
        api.get("/api/performanceTracking/clvSummary")
      ]);
      
      if (tempRes.data.status) {
        setTemplates(tempRes.data.data.filter(t => t.status === "APPROVED"));
      }
      if (campRes.data.status) {
        setCampaigns(campRes.data.data);
      }
      if (clvRes.data.topCustomers) {
        setTopCustomers(clvRes.data.topCustomers);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast.error("Failed to load templates or campaigns");
    } finally {
      setFetchingData(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      setFetchingCustomers(true);
      const retailerId = localStorage.getItem('retailerId');
      
      let url = `/api/customers/all?retailerId=${retailerId}&search=${customerSearch}&page=${currentPage}&limit=${customersPerPage}`;
      
      if (selectedFilter !== "all" && selectedFilter !== "top") {
        url += `&source=${selectedFilter}`;
      }

      const res = await api.get(url);
      if (res.data) {
        let fetchedCustomers = res.data.customers || [];
        
        // If filter is "top", we filter the fetched customers to only include those in topCustomers
        // This is a bit limited by pagination, but we'll show what we have.
        // Better: if filter is "top", we use the topCustomers list directly or fetch specifically.
        if (selectedFilter === "top") {
          // Fetching specifically for top customers by their mobile numbers if possible, 
          // or just using the 5 we already have.
          setCustomers(topCustomers.map(tc => {
             // Try to find full customer data if it happens to be in the current page
             const found = fetchedCustomers.find(c => c.mobileNumber === tc.mobile || c.mobileNumber === tc.mobile?.replace("+91", ""));
             if (found) return found;
             // Otherwise return a partial object (might need more fields for the UI)
             return {
                _id: tc.mobile, // use mobile as ID for selection if not found
                firstname: tc.name,
                mobileNumber: tc.mobile?.replace("+91", ""),
                countryCode: "91"
             };
          }));
          setTotalPages(1);
          setTotalCustomers(topCustomers.length);
        } else {
          setCustomers(fetchedCustomers);
          setTotalPages(res.data.pagination?.totalPages || 1);
          setTotalCustomers(res.data.pagination?.totalItems || 0);
        }
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setFetchingCustomers(false);
    }
  };

  const handleModeChange = (mode) => {
    setSendMode(mode);
    setSelectedTemplate(null);
    setSelectedCampaign(null);
    setHeaderVariables({});
    setBodyVariables({});
    setMedia({ url: "", type: "" });
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setSelectedCampaign(null);
    
    // Extract header variables
    const header = template.components.find(c => c.type === "HEADER");
    const hText = header?.text || "";
    const hVars = hText.match(/\{\{(\d+)\}\}/g) || [];
    const hInitial = {};
    [...new Set(hVars)].forEach(v => hInitial[v] = "");
    setHeaderVariables(hInitial);

    // Extract body variables
    const body = template.components.find(c => c.type === "BODY");
    const bText = body?.text || "";
    const bVars = bText.match(/\{\{(\d+)\}\}/g) || [];
    const bInitial = {};
    [...new Set(bVars)].forEach(v => bInitial[v] = "");
    setBodyVariables(bInitial);

    setMedia({ 
      url: "", 
      type: header && ["IMAGE", "VIDEO", "DOCUMENT"].includes(header.format) ? header.format : "" 
    });
  };

  const handleCampaignSelect = (campaign) => {
    setSelectedCampaign(campaign);
    setSelectedTemplate(campaign.templateId);
    
    // Distribute variables from campaign.variables (if it was a simple flat map)
    const vars = campaign.variables || {};
    const template = campaign.templateId;
    
    if (template && template.components) {
      const header = template.components.find(c => c.type === "HEADER");
      const hText = header?.text || "";
      const hVars = [...new Set(hText.match(/\{\{(\d+)\}\}/g) || [])];
      const hVals = {};
      hVars.forEach(v => hVals[v] = vars[v] || "");
      setHeaderVariables(hVals);

      const body = template.components.find(c => c.type === "BODY");
      const bText = body?.text || "";
      const bVars = [...new Set(bText.match(/\{\{(\d+)\}\}/g) || [])];
      const bVals = {};
      bVars.forEach(v => bVals[v] = vars[v] || "");
      setBodyVariables(bVals);
    }
    
    setMedia({ 
      url: campaign.mediaUrl || "", 
      type: campaign.mediaType || "" 
    });
  };

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = media.type === "VIDEO" ? 64 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return toast.error(`File too large. Max ${maxSize / (1024 * 1024)}MB.`);
    }

    const formData = new FormData();
    formData.append('file', file);
    
    try {
      setUploadingMedia(true);
      const res = await api.post("/api/integrationManagement/whatsapp/media/upload", formData);
      if (res.data.status) {
        setMedia({ ...media, url: res.data.url });
        toast.success("Media uploaded successfully");
      }
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploadingMedia(false);
    }
  };

  const toggleCustomer = (customer) => {
    const exists = selectedCustomers.find(c => c._id === customer._id);
    if (exists) {
      setSelectedCustomers(selectedCustomers.filter(c => c._id !== customer._id));
    } else {
      setSelectedCustomers([...selectedCustomers, customer]);
    }
  };

  const selectAllLoaded = () => {
    const allIds = customers.map(c => c._id);
    const selectedIds = selectedCustomers.map(c => c._id);
    const allLoadedSelected = allIds.every(id => selectedIds.includes(id));

    if (allLoadedSelected) {
      setSelectedCustomers(selectedCustomers.filter(c => !allIds.includes(c._id)));
    } else {
      const newToSelect = customers.filter(c => !selectedIds.includes(c._id));
      setSelectedCustomers([...selectedCustomers, ...newToSelect]);
    }
  };

  const handleSendMessage = async () => {
    if (selectedCustomers.length === 0) return toast.error("Select at least one customer");
    if (!selectedTemplate) return toast.error("Select a template or campaign");

    // Validate variables
    const hVars = Object.keys(headerVariables);
    const bVars = Object.keys(bodyVariables);
    const missingHVars = hVars.filter(v => !headerVariables[v]?.trim());
    const missingBVars = bVars.filter(v => !bodyVariables[v]?.trim());
    
    if (missingHVars.length > 0 || missingBVars.length > 0) {
      return toast.error(`Please fill all variables`);
    }

    if (media.type && !media.url) return toast.error(`Please provide ${media.type.toLowerCase()} URL or upload media`);

    setLoading(true);
    try {
      // For each customer, replace dynamic placeholders
      const recipients = selectedCustomers.map(customer => {
        const replaceDynamic = (val) => {
          return (val || "").replace(/\{\{customer_name\}\}/g, customer.firstname || "Customer");
        };

        const orderedHVars = hVars.sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]))
          .map(key => replaceDynamic(headerVariables[key]));

        const orderedBVars = bVars.sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]))
          .map(key => replaceDynamic(bodyVariables[key]));

        return {
          phone: `${customer.countryCode}${customer.mobileNumber}`,
          headerVariables: orderedHVars,
          bodyVariables: orderedBVars,
          // Support old backend flat structure just in case
          variables: [...orderedHVars, ...orderedBVars]
        };
      });

      const payload = {
        templateName: selectedTemplate.name,
        languageCode: selectedTemplate.language,
        recipients,
        media: media.url ? { url: media.url, type: media.type } : null
      };

      const res = await api.post("/api/integrationManagement/whatsapp/campaign/send", payload);
      if (res.data.status) {
        toast.success(`Message sent to ${selectedCustomers.length} customers!`);
        setSelectedCustomers([]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send messages");
    } finally {
      setLoading(false);
    }
  };

  const getTemplateVariables = (template) => {
    if (!template) return [];
    const allText = template.components.map(c => c.text || "").join(" ");
    const vars = allText.match(/\{\{(\d+)\}\}/g) || [];
    return [...new Set(vars)].sort();
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {!initialMode && (
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => handleModeChange("direct")}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${sendMode === "direct" ? "bg-white text-[#313166] shadow-sm" : "text-gray-500"}`}
            >
              Direct Template
            </button>
            <button 
              onClick={() => handleModeChange("saved")}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${sendMode === "saved" ? "bg-white text-[#313166] shadow-sm" : "text-gray-500"}`}
            >
              Saved Campaign
            </button>
          </div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Messenger Activity
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
        {/* STEP 1: Selection Area */}
        <div className="lg:col-span-3 flex flex-col gap-6 overflow-hidden">
           {/* Template/Campaign Selection */}
           <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 rounded-full bg-[#313166] text-white flex items-center justify-center text-[10px] font-bold">1</div>
                <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                  {sendMode === "direct" ? <LayoutTemplate size={16} /> : <Megaphone size={16} />}
                  Select {sendMode === "direct" ? "Template" : "Campaign"}
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {sendMode === "direct" ? (
                  templates.map(t => (
                    <div 
                      key={t._id}
                      onClick={() => handleTemplateSelect(t)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${selectedTemplate?._id === t._id ? "border-[#313166] bg-[#313166]/5" : "border-gray-50 hover:border-gray-200"}`}
                    >
                      <p className="text-xs font-bold text-gray-800">{t.name}</p>
                      <p className="text-[10px] text-gray-500">{t.category}</p>
                    </div>
                  ))
                ) : (
                  campaigns.map(c => (
                    <div 
                      key={c._id}
                      onClick={() => handleCampaignSelect(c)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${selectedCampaign?._id === c._id ? "border-[#313166] bg-[#313166]/5" : "border-gray-50 hover:border-gray-200"}`}
                    >
                      <p className="text-xs font-bold text-gray-800">{c.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{c.templateId?.name}</p>
                    </div>
                  ))
                )}
                {(sendMode === "direct" ? templates : campaigns).length === 0 && (
                  <p className="text-center text-gray-400 py-10 text-xs">No {sendMode}s found.</p>
                )}
              </div>
           </div>
        </div>

        {/* STEP 2: Configuration & Preview */}
        <div className="lg:col-span-5 flex flex-col gap-6 overflow-hidden">
           {selectedTemplate ? (
             <>
               <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 flex flex-col overflow-hidden">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full bg-[#313166] text-white flex items-center justify-center text-[10px] font-bold">2</div>
                    <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                      <Type size={16} /> Configure Message
                    </h3>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
                    {/* Header Variables */}
                    {Object.keys(headerVariables).length > 0 && (
                      <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Header Variables</p>
                        {Object.keys(headerVariables).sort().map(v => (
                          <div key={`h-${v}`} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-bold text-gray-500">{v}</label>
                              <button 
                                onClick={() => setHeaderVariables({ ...headerVariables, [v]: (headerVariables[v] || "") + "{{customer_name}}" })}
                                className="text-[10px] text-[#313166] hover:bg-[#313166]/5 px-2 py-0.5 rounded transition-all font-bold flex items-center gap-1"
                              >
                                <Plus size={10} /> Add Name
                              </button>
                            </div>
                            <input 
                              type="text"
                              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#313166] bg-white"
                              value={headerVariables[v] || ""}
                              onChange={(e) => setHeaderVariables({ ...headerVariables, [v]: e.target.value })}
                              placeholder={`Value for ${v}...`}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Body Variables */}
                    {Object.keys(bodyVariables).length > 0 && (
                      <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Body Variables</p>
                        {Object.keys(bodyVariables).sort().map(v => (
                          <div key={`b-${v}`} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-bold text-gray-500">{v}</label>
                              <button 
                                onClick={() => setBodyVariables({ ...bodyVariables, [v]: (bodyVariables[v] || "") + "{{customer_name}}" })}
                                className="text-[10px] text-[#313166] hover:bg-[#313166]/5 px-2 py-0.5 rounded transition-all font-bold flex items-center gap-1"
                              >
                                <Plus size={10} /> Add Name
                              </button>
                            </div>
                            <input 
                              type="text"
                              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#313166] bg-white"
                              value={bodyVariables[v] || ""}
                              onChange={(e) => setBodyVariables({ ...bodyVariables, [v]: e.target.value })}
                              placeholder={`Value for ${v}...`}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {media.type && (
                      <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{media.type} Media</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="text"
                            readOnly
                            className="flex-1 px-3 py-2 text-[10px] border border-gray-200 rounded-lg bg-white text-gray-500"
                            value={media.url}
                            placeholder={`Upload or enter ${media.type.toLowerCase()} URL...`}
                          />
                          <div className="relative">
                            <input 
                              type="file" 
                              id="send-media-upload"
                              className="hidden"
                              accept={media.type === "IMAGE" ? "image/*" : media.type === "VIDEO" ? "video/*" : ".pdf"}
                              onChange={handleMediaUpload}
                            />
                            <label 
                              htmlFor="send-media-upload"
                              className="p-2 bg-[#313166] text-white rounded-lg cursor-pointer hover:bg-[#3d3b83] transition-all flex items-center"
                            >
                              {uploadingMedia ? <div className="w-3 h-3 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : <Upload size={14} />}
                            </label>
                          </div>
                        </div>
                        <input 
                          type="text"
                          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#313166] bg-white"
                          value={media.url}
                          onChange={(e) => setMedia({ ...media, url: e.target.value })}
                          placeholder="...or paste URL here"
                        />
                      </div>
                    )}
                  </div>
               </div>

               {/* Live Preview - Integrated into Step 2 */}
               <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center overflow-hidden">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Video size={14} /> Live Preview
                  </h3>
                  
                  <div className="w-full max-w-[300px] bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                      <div className="bg-[#075e54] p-2 flex items-center gap-2">
                         <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                           <Users size={10} className="text-white" />
                         </div>
                         <span className="text-white text-[9px] font-medium">WhatsApp Preview</span>
                      </div>
                      <div className="p-2 bg-[#e5ddd5]" style={{ backgroundImage: "url('/whatsapp-bg.png')", backgroundSize: '120px' }}>
                         <div className="bg-white rounded-lg p-2 shadow-sm max-w-[90%] relative">
                            {(() => {
                              const header = selectedTemplate.components.find(c => c.type === "HEADER");
                              if (!header) return null;
                              if (header.format === "TEXT") {
                                let text = header.text || "";
                                const vars = Object.keys(headerVariables);
                                vars.forEach(v => {
                                  let val = headerVariables[v] || v;
                                  val = val.replace(/\{\{customer_name\}\}/g, "John Doe");
                                  const regex = new RegExp(`\\{\\{${v.match(/\d+/)[0]}\\}\\}`, 'g');
                                  text = text.replace(regex, val);
                                });
                                return <div className="mb-1 font-bold text-[9px]">{text}</div>;
                              }
                              
                              const previewUrl = media.url || header.mediaUrl;
                              
                              return (
                                <div className="bg-gray-100 min-h-[80px] rounded flex flex-col items-center justify-center text-gray-400 overflow-hidden mb-2">
                                   {previewUrl ? (
                                      header.format === "IMAGE" ? (
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="flex flex-col items-center gap-1 p-2">
                                           {header.format === "VIDEO" ? <Video size={12} /> : <FileText size={12} />}
                                           <span className="text-[5px] text-center break-all">{previewUrl}</span>
                                        </div>
                                      )
                                   ) : (
                                     <>
                                       {header.format === "IMAGE" && <ImageIcon size={16} />}
                                       {header.format === "VIDEO" && <Video size={16} />}
                                       {header.format === "DOCUMENT" && <FileText size={16} />}
                                       <span className="text-[7px] mt-1">{header.format} Header</span>
                                     </>
                                   )}
                                </div>
                              );
                            })()}

                            {selectedTemplate.components.find(c => c.type === "BODY") && (
                              <div className="text-[10px] text-gray-800 leading-tight whitespace-pre-wrap">
                                 {(() => {
                                   let text = selectedTemplate.components.find(c => c.type === "BODY").text;
                                   const vars = Object.keys(bodyVariables);
                                   vars.forEach(v => {
                                     let val = bodyVariables[v] || v;
                                     val = val.replace(/\{\{customer_name\}\}/g, "John Doe");
                                     const regex = new RegExp(`\\{\\{${v.match(/\d+/)[0]}\\}\\}`, 'g');
                                     text = text.replace(regex, val);
                                   });
                                   return text;
                                 })()}
                              </div>
                            )}
                            <div className="flex justify-end mt-1">
                              <span className="text-[7px] text-gray-300">12:00 PM</span>
                            </div>
                         </div>
                      </div>
                   </div>
               </div>
             </>
           ) : (
             <div className="flex-1 bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                  <LayoutTemplate size={24} className="opacity-20" />
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">Step 2: Configuration</h4>
                <p className="text-xs max-w-[200px]">Select a template from the left to start configuring your message.</p>
             </div>
           )}
        </div>

        {/* STEP 3: Customer Selection Area */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
           <div className="flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex-1">
             <div className="p-6 border-b border-gray-50">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 rounded-full bg-[#313166] text-white flex items-center justify-center text-[10px] font-bold">3</div>
                  <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                    <Users size={16} /> Select Recipients
                  </h3>
                </div>
                
                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search customers..."
                      className="w-full pl-10 pr-4 py-2 text-xs border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#313166]"
                      value={customerSearch}
                      onChange={(e) => {
                        setCustomerSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>

                  <div className="flex-1 relative">
                      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
                      <select 
                        className="w-full pl-8 pr-4 py-1.5 text-[10px] border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#313166] bg-white appearance-none cursor-pointer font-bold text-gray-600"
                        value={selectedFilter}
                        onChange={(e) => {
                          setSelectedFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        <option value="all">All Customers</option>
                        <option value="top">Best Customers (High Value)</option>
                        <option value="walk-in">Source: Walk-in</option>
                        <option value="website">Source: Website</option>
                        <option value="social-media">Source: Social Media</option>
                        <option value="others">Source: Others</option>
                      </select>
                  </div>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                <div className="flex items-center justify-between px-2 mb-2">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">{totalCustomers} Total</span>
                  <button 
                    onClick={selectAllLoaded}
                    className="text-[10px] font-bold text-[#313166] hover:underline"
                  >
                    {customers.length > 0 && customers.every(c => selectedCustomers.find(sc => sc._id === c._id)) ? "Deselect Page" : "Select Page"}
                  </button>
                </div>

                {fetchingCustomers ? (
                  <div className="flex items-center justify-center py-10">
                     <div className="w-5 h-5 border-2 border-[#313166] border-t-transparent animate-spin rounded-full"></div>
                  </div>
                ) : customers.length === 0 ? (
                  <p className="text-center text-gray-400 py-10 text-[10px]">No customers found.</p>
                ) : (
                  customers.map(customer => {
                    const isSelected = selectedCustomers.find(c => c._id === customer._id);
                    return (
                      <div 
                        key={customer._id}
                        onClick={() => toggleCustomer(customer)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${isSelected ? "border-[#313166] bg-[#313166]/5" : "border-gray-50 hover:border-gray-200"}`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold ${isSelected ? "bg-[#313166] text-white" : "bg-gray-100 text-gray-400"}`}>
                            {customer.firstname?.charAt(0) || "C"}
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-gray-800 leading-none">{customer.firstname || "Unnamed"}</p>
                            <p className="text-[9px] text-gray-500 mt-0.5">+{customer.countryCode}{customer.mobileNumber}</p>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 size={14} className="text-[#313166]" />}
                      </div>
                    );
                  })
                )}
             </div>

             {/* Pagination */}
             <div className="p-3 border-t border-gray-50 flex items-center justify-between bg-gray-50/50">
                <span className="text-[9px] text-gray-500 font-bold">Page {currentPage}/{totalPages}</span>
                <div className="flex items-center gap-1">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="p-1 border border-gray-200 rounded-md hover:bg-white disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft size={12} />
                  </button>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="p-1 border border-gray-200 rounded-md hover:bg-white disabled:opacity-30 transition-all"
                  >
                    <ChevronRight size={12} />
                  </button>
                </div>
             </div>
           </div>

           {/* Send Action */}
           <div className="bg-[#313166] p-6 rounded-2xl shadow-xl shadow-[#313166]/20 text-white space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-sm">Send Message</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-white/10 rounded-full">{selectedCustomers.length} recipients</span>
                </div>
                <p className="text-[10px] text-white/60">Finalize your template and audience above to send now.</p>
              </div>
              
              <button 
                onClick={handleSendMessage}
                disabled={loading || selectedCustomers.length === 0 || !selectedTemplate}
                className="w-full py-3 bg-white text-[#313166] font-bold rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-white/20 disabled:text-white/40"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-[#313166] border-t-transparent animate-spin rounded-full"></div>
                ) : (
                  <>
                    <Send size={16} />
                    Send Now
                  </>
                )}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SendCampaign;
