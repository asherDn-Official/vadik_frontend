import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Megaphone, 
  Trash2, 
  Edit3, 
  LayoutTemplate,
  ChevronRight,
  AlertCircle,
  X,
  Save,
  Info,
  Image as ImageIcon,
  Video,
  FileText,
  Upload
} from "lucide-react";
import api from "../../api/apiconfig";
import { toast } from "react-toastify";

const CampaignManager = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // Create/Edit State
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    templateId: "",
    variables: {},
    mediaUrl: "",
    mediaType: ""
  });
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    fetchCampaigns();
    fetchTemplates();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setFetching(true);
      const res = await api.get("/api/integrationManagement/whatsapp/campaigns");
      if (res.data.status) {
        setCampaigns(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setFetching(false);
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

  const handleTemplateSelect = (templateId) => {
    const template = templates.find(t => t._id === templateId);
    setSelectedTemplate(template);
    
    // Extract variables
    const allText = template.components.map(c => c.text || "").join(" ");
    const vars = allText.match(/\{\{(\d+)\}\}/g) || [];
    const uniqueVars = [...new Set(vars)];
    
    const initialValues = {};
    uniqueVars.forEach(v => {
      initialValues[v] = "";
    });

    const header = template.components.find(c => c.type === "HEADER");
    
    setNewCampaign({
      ...newCampaign,
      templateId,
      variables: initialValues,
      mediaType: header && ["IMAGE", "VIDEO", "DOCUMENT"].includes(header.format) ? header.format : ""
    });
  };

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Size checks
    const maxSize = newCampaign.mediaType === "VIDEO" ? 64 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return toast.error(`File too large. Max ${maxSize / (1024 * 1024)}MB.`);
    }

    const formData = new FormData();
    formData.append('file', file);
    
    try {
      setUploadingMedia(true);
      const res = await api.post("/api/integrationManagement/whatsapp/media/upload", formData);
      if (res.data.status) {
        setNewCampaign({ ...newCampaign, mediaUrl: res.data.url });
        toast.success("Media uploaded successfully");
      }
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleSaveCampaign = async () => {
    if (!newCampaign.name.trim()) return toast.error("Please enter a campaign name");
    if (!newCampaign.templateId) return toast.error("Please select a template");

    setLoading(true);
    try {
      const res = await api.post("/api/integrationManagement/whatsapp/campaigns", newCampaign);
      if (res.data.status) {
        toast.success("Campaign saved successfully");
        setIsCreating(false);
        setNewCampaign({ name: "", templateId: "", variables: {}, mediaUrl: "", mediaType: "" });
        setSelectedTemplate(null);
        fetchCampaigns();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save campaign");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!window.confirm("Are you sure you want to delete this campaign?")) return;
    try {
      const res = await api.delete(`/api/integrationManagement/whatsapp/campaigns/${id}`);
      if (res.data.status) {
        toast.success("Campaign deleted");
        fetchCampaigns();
      }
    } catch (error) {
      toast.error("Failed to delete campaign");
    }
  };

  const filteredCampaigns = campaigns.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTemplateVariables = (template) => {
    if (!template) return [];
    const allText = template.components.map(c => c.text || "").join(" ");
    const vars = allText.match(/\{\{(\d+)\}\}/g) || [];
    return [...new Set(vars)].sort();
  };

  if (isCreating) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create New Campaign</h2>
            <p className="text-sm text-gray-500">Save a template with predefined values for quick sending.</p>
          </div>
          <button 
            onClick={() => setIsCreating(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-all"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Campaign Name</label>
                <input 
                  type="text"
                  placeholder="e.g., Happy New Year 2024"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#313166]/20"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Select Template</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#313166]/20"
                  value={newCampaign.templateId}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                >
                  <option value="">Choose a template...</option>
                  {templates.map(t => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {selectedTemplate && (
                <div className="space-y-4 pt-4 border-t border-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Variables</label>
                    <div className="flex items-center gap-1 text-[10px] text-[#313166] bg-[#313166]/5 px-2 py-0.5 rounded-full font-bold">
                      <Info size={10} />
                      Use &#123;&#123;customer_name&#125;&#125; for dynamic names
                    </div>
                  </div>
                  
                  {getTemplateVariables(selectedTemplate).map(v => (
                    <div key={v} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-gray-400">{v}</label>
                        <button 
                          onClick={() => setNewCampaign({
                            ...newCampaign,
                            variables: { ...newCampaign.variables, [v]: (newCampaign.variables[v] || "") + "{{customer_name}}" }
                          })}
                          className="text-[10px] text-[#313166] hover:bg-[#313166]/5 px-2 py-0.5 rounded transition-all font-bold flex items-center gap-1"
                        >
                          <Plus size={10} /> Add Customer Name
                        </button>
                      </div>
                      <input 
                        type="text"
                        placeholder={`Value for ${v}...`}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#313166]/20"
                        value={newCampaign.variables[v] || ""}
                        onChange={(e) => setNewCampaign({
                          ...newCampaign,
                          variables: { ...newCampaign.variables, [v]: e.target.value }
                        })}
                      />
                    </div>
                  ))}
                  
                  {newCampaign.mediaType && (
                    <div className="space-y-3 pt-2">
                      <label className="text-xs font-bold text-gray-500 uppercase">Default {newCampaign.mediaType}</label>
                      <div className="flex items-center gap-3">
                        <input 
                          type="text"
                          readOnly
                          placeholder={`Upload or enter ${newCampaign.mediaType.toLowerCase()} URL...`}
                          className="flex-1 px-4 py-2 border border-gray-100 rounded-xl focus:outline-none bg-gray-50 text-xs"
                          value={newCampaign.mediaUrl}
                        />
                        <div className="relative">
                          <input 
                            type="file" 
                            id="campaign-media-upload"
                            className="hidden"
                            accept={newCampaign.mediaType === "IMAGE" ? "image/*" : newCampaign.mediaType === "VIDEO" ? "video/*" : ".pdf"}
                            onChange={handleMediaUpload}
                          />
                          <label 
                            htmlFor="campaign-media-upload"
                            className="px-4 py-2 bg-[#313166] text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-[#3d3b83] transition-all flex items-center gap-2"
                          >
                            {uploadingMedia ? (
                              <div className="w-3 h-3 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                            ) : (
                              <Upload size={14} />
                            )}
                            {newCampaign.mediaUrl ? "Change" : "Upload"}
                          </label>
                        </div>
                      </div>
                      <input 
                        type="text"
                        placeholder="...or paste URL here"
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#313166]/20 text-xs"
                        value={newCampaign.mediaUrl}
                        onChange={(e) => setNewCampaign({ ...newCampaign, mediaUrl: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleSaveCampaign}
              disabled={loading || !newCampaign.name || !newCampaign.templateId}
              className="w-full py-3 bg-[#313166] text-white font-bold rounded-xl hover:bg-[#3d3b83] transition-all shadow-lg shadow-[#313166]/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
              ) : (
                <>
                  <Save size={18} />
                  Save Campaign
                </>
              )}
            </button>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8 flex flex-col items-center">
             <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">Preview</h3>
             {selectedTemplate ? (
               <div className="w-full max-w-[280px] bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                 <div className="bg-[#075e54] p-2 text-white text-[10px] font-medium">WhatsApp Preview</div>
                 <div className="p-3 bg-[#e5ddd5]" style={{ backgroundImage: "url('/whatsapp-bg.png')", backgroundSize: '150px' }}>
                    <div className="bg-white rounded-lg p-2 shadow-sm relative">
                       {/* Header Component */}
                       {(() => {
                          const header = selectedTemplate.components.find(c => c.type === "HEADER");
                          if (!header) return null;
                          if (header.format === "TEXT") return <div className="mb-1 font-bold text-[11px]">{header.text}</div>;
                          
                          const previewUrl = newCampaign.mediaUrl || header.mediaUrl;
                          
                          return (
                            <div className="bg-gray-100 min-h-[100px] rounded flex flex-col items-center justify-center text-gray-400 overflow-hidden mb-2">
                               {previewUrl ? (
                                  header.format === "IMAGE" ? (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="flex flex-col items-center gap-1 p-2">
                                       {header.format === "VIDEO" ? <Video size={16} /> : <FileText size={16} />}
                                       <span className="text-[6px] text-center break-all">{previewUrl}</span>
                                    </div>
                                  )
                               ) : (
                                 <>
                                   {header.format === "IMAGE" && <ImageIcon size={20} />}
                                   {header.format === "VIDEO" && <Video size={20} />}
                                   {header.format === "DOCUMENT" && <FileText size={20} />}
                                   <span className="text-[8px] mt-1">{header.format} Header</span>
                                 </>
                               )}
                            </div>
                          );
                       })()}

                       {selectedTemplate.components.find(c => c.type === "BODY") && (
                         <div className="text-[11px] text-gray-800 whitespace-pre-wrap">
                            {(() => {
                              let text = selectedTemplate.components.find(c => c.type === "BODY").text;
                              Object.entries(newCampaign.variables).forEach(([key, val]) => {
                                const regex = new RegExp(`\\{\\{${key.match(/\d+/)[0]}\\}\\}`, 'g');
                                text = text.replace(regex, val || key);
                              });
                              return text;
                            })()}
                         </div>
                       )}
                       <div className="flex justify-end mt-1">
                        <span className="text-[8px] text-gray-300">12:00 PM</span>
                      </div>
                    </div>
                 </div>
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2 text-center">
                 <LayoutTemplate size={48} className="opacity-20" />
                 <p className="text-xs">Select a template to see preview</p>
               </div>
             )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Saved Campaigns</h2>
          <p className="text-sm text-gray-500">Manage your pre-configured messaging campaigns.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-6 py-2 bg-[#313166] text-white rounded-xl text-sm font-bold hover:bg-[#3d3b83] transition-all shadow-md shadow-[#313166]/10"
        >
          <Plus size={18} />
          New Campaign
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search campaigns..."
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#313166]/20"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {fetching ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#313166] border-t-transparent animate-spin rounded-full"></div>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-200 text-center">
          <div className="p-4 bg-gray-50 rounded-full w-fit mx-auto mb-4">
            <Megaphone className="text-gray-300" size={32} />
          </div>
          <p className="text-gray-500">No campaigns found. Create your first campaign to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map(campaign => (
            <div 
              key={campaign._id}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Megaphone size={16} />
                </div>
                <button 
                  onClick={() => handleDeleteCampaign(campaign._id)}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <h4 className="font-bold text-gray-900 mb-1">{campaign.name}</h4>
              <div className="flex items-center gap-1.5 mb-4">
                <LayoutTemplate size={12} className="text-gray-400" />
                <span className="text-[10px] text-gray-500 font-medium truncate">
                  {campaign.templateId?.name || "Deleted Template"}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {Object.entries(campaign.variables || {}).slice(0, 3).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-400 font-bold uppercase tracking-wider">{key}:</span>
                    <span className="text-gray-600 font-medium truncate max-w-[120px]">{val || "Empty"}</span>
                  </div>
                ))}
                {Object.keys(campaign.variables || {}).length > 3 && (
                  <p className="text-[9px] text-gray-400 italic">+{Object.keys(campaign.variables).length - 3} more variables</p>
                )}
              </div>

              <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                <span className="text-[10px] text-gray-400">
                  {new Date(campaign.createdAt).toLocaleDateString()}
                </span>
                {/* We can add a "Send Now" shortcut here later */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CampaignManager;
