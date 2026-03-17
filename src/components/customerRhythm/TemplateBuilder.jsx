import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Type, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  ExternalLink, 
  Phone, 
  Check, 
  AlertCircle,
  HelpCircle,
  Smartphone,
  Info
} from "lucide-react";
import api from "../../api/apiconfig";
import { toast } from "react-toastify";

const buildCopyName = (name) => {
  if (!name) return "";
  const base = `${name}_copy`;
  return base.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
};

const normalizeTemplateForBuilder = (source) => {
  if (!source) {
    return {
      name: "",
      category: "MARKETING",
      language: "en_US",
      components: [{ type: "BODY", text: "" }]
    };
  }

  const normalizedComponents = (source.components || []).map((comp) => {
    const next = { type: comp.type };
    if (comp.type === "HEADER") {
      next.format = comp.format || "TEXT";
      if (next.format === "TEXT") {
        next.text = comp.text || "";
      } else {
        next.mediaUrl = comp.mediaUrl || comp.example?.header_handle?.[0] || "";
      }
    } else if (comp.type === "BODY") {
      next.text = comp.text || "";
    } else if (comp.type === "FOOTER") {
      next.text = comp.text || "";
    } else if (comp.type === "BUTTONS") {
      next.buttons = (comp.buttons || []).map((btn) => ({
        type: btn.type || "QUICK_REPLY",
        text: btn.text || "",
        url: btn.url,
        phoneNumber: btn.phoneNumber
      }));
    }
    return next;
  });

  const hasBody = normalizedComponents.some((c) => c.type === "BODY");
  if (!hasBody) normalizedComponents.push({ type: "BODY", text: "" });

  return {
    name: buildCopyName(source.name),
    category: source.category || "MARKETING",
    language: source.language || "en_US",
    components: normalizedComponents
  };
};

const buildSampleValuesFromTemplate = (source) => {
  if (!source?.components) return {};

  const samplesMap = {};
  source.components.forEach((comp) => {
    if (comp.type === "BODY" || (comp.type === "HEADER" && comp.format === "TEXT")) {
      const vars = (comp.text || "").match(/\{\{\d+\}\}/g) || [];
      const exampleRow = comp.example?.body_text?.[0] || [];
      vars.forEach((v, i) => {
        if (exampleRow[i] && !samplesMap[v]) {
          samplesMap[v] = exampleRow[i];
        }
      });
    }
  });
  return samplesMap;
};

const TemplateBuilder = ({ onCancel, onSuccess, initialTemplate }) => {
  const [template, setTemplate] = useState(() => normalizeTemplateForBuilder(initialTemplate));

  const [samples, setSamples] = useState(() => buildSampleValuesFromTemplate(initialTemplate));
  const [loading, setLoading] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [nameAvailable, setNameAvailable] = useState(null);
  const [checkingName, setCheckingName] = useState(false);

  // Character limits
  const LIMITS = {
    BODY: 1024,
    HEADER: 60,
    FOOTER: 60,
    BUTTON: 25
  };

  useEffect(() => {
    setTemplate(normalizeTemplateForBuilder(initialTemplate));
    setSamples(buildSampleValuesFromTemplate(initialTemplate));
    setNameAvailable(null);
  }, [initialTemplate]);

  useEffect(() => {
    if (template.name.length > 2) {
      const timer = setTimeout(async () => {
        setCheckingName(true);
        try {
          const res = await api.get(`/api/integrationManagement/whatsapp/custom-templates/check-name?name=${template.name}`);
          setNameAvailable(res.data.available);
        } catch (e) {
          console.error(e);
        } finally {
          setCheckingName(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setNameAvailable(null);
    }
  }, [template.name]);

  const handleNameChange = (e) => {
    const val = e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    setTemplate({ ...template, name: val });
  };

  const addComponent = (type) => {
    if (template.components.some(c => c.type === type && type !== "BUTTONS")) return;
    
    let newComp = { type };
    if (type === "HEADER") newComp.format = "TEXT", newComp.text = "";
    if (type === "FOOTER") newComp.text = "";
    if (type === "BUTTONS") newComp.buttons = [];

    const newComponents = [...template.components];
    if (type === "HEADER") newComponents.unshift(newComp);
    else if (type === "FOOTER" || type === "BUTTONS") newComponents.push(newComp);
    
    setTemplate({ ...template, components: newComponents });
  };

  const removeComponent = (type) => {
    setTemplate({
      ...template,
      components: template.components.filter(c => c.type !== type)
    });
  };

  const updateComponent = (index, updates) => {
    const newComponents = [...template.components];
    newComponents[index] = { ...newComponents[index], ...updates };
    setTemplate({ ...template, components: newComponents });
  };

  const addVariable = (index) => {
    const comp = template.components[index];
    const vars = (comp.text.match(/\{\{\d+\}\}/g) || []);
    const nextVar = `{{${vars.length + 1}}}`;
    updateComponent(index, { text: comp.text + nextVar });
  };

  const addButton = () => {
    const btnIndex = template.components.findIndex(c => c.type === "BUTTONS");
    if (btnIndex === -1) return;
    
    const btns = template.components[btnIndex].buttons || [];
    if (btns.length >= 3) return;

    const newBtn = { type: "QUICK_REPLY", text: "Click here" };
    const newComponents = [...template.components];
    newComponents[btnIndex].buttons = [...btns, newBtn];
    setTemplate({ ...template, components: newComponents });
  };

  const updateButton = (btnIndex, updates) => {
    const compIndex = template.components.findIndex(c => c.type === "BUTTONS");
    const newComponents = [...template.components];
    newComponents[compIndex].buttons[btnIndex] = { 
      ...newComponents[compIndex].buttons[btnIndex], 
      ...updates 
    };
    setTemplate({ ...template, components: newComponents });
  };

  const removeButton = (btnIndex) => {
    const compIndex = template.components.findIndex(c => c.type === "BUTTONS");
    const newComponents = [...template.components];
    newComponents[compIndex].buttons.splice(btnIndex, 1);
    setTemplate({ ...template, components: newComponents });
  };

  const extractVariables = () => {
    const allText = template.components.map(c => c.text || "").join(" ");
    const matches = allText.match(/\{\{(\d+)\}\}/g) || [];
    return [...new Set(matches)].sort();
  };

  const handleSubmit = async () => {
    if (!template.name || nameAvailable === false) {
      toast.error("Please provide a valid, unique name");
      return;
    }
    
    // Prepare payload
    const payload = {
      ...template,
      components: template.components.map(c => {
        const comp = { ...c };
        if (comp.type === "BODY" || (comp.type === "HEADER" && comp.format === "TEXT")) {
          const vars = comp.text.match(/\{\{\d+\}\}/g) || [];
          if (vars.length > 0) {
            comp.example = {
              body_text: [vars.map((v, i) => samples[v] || "Sample")]
            };
          }
        } else if (comp.type === "HEADER" && ["IMAGE", "VIDEO", "DOCUMENT"].includes(comp.format)) {
          // Meta API expects a media ID (header_handle) for example media. 
          // If we only have a URL, we should either upload it or omit header_handle 
          // to avoid "Invalid parameter" if the URL is not a valid handle.
          if (comp.mediaUrl && comp.mediaUrl.startsWith("http")) {
             // For now, let's pass it and hope the backend handles it or it's a valid handle
             // but if it's a raw URL, Meta usually rejects it in createTemplate.
             comp.example = {
               header_handle: [comp.mediaUrl]
             };
          }
        }
        return comp;
      })
    };

    setLoading(true);
    try {
      const res = await api.post("/api/integrationManagement/whatsapp/custom-templates", payload);
      if (res.data.status) {
        toast.success("Template submitted to Meta successfully!");
        onSuccess();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Error creating template";
      toast.error(errorMsg);
      console.error("Template creation failed:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const renderPreview = () => {
    const header = template.components.find(c => c.type === "HEADER");
    const body = template.components.find(c => c.type === "BODY");
    const footer = template.components.find(c => c.type === "FOOTER");
    const buttons = template.components.find(c => c.type === "BUTTONS")?.buttons || [];

    const formatText = (text) => {
      if (!text) return "";
      let formatted = text;
      const vars = text.match(/\{\{(\d+)\}\}/g) || [];
      vars.forEach(v => {
        formatted = formatted.replace(v, `<span class="text-blue-600 font-bold">${samples[v] || v}</span>`);
      });
      return formatted.replace(/\n/g, '<br/>');
    };

    return (
      <div className="relative w-full max-w-[320px] mx-auto h-[600px] bg-slate-900 rounded-[3rem] border-[8px] border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-10"></div>
        
        {/* Top Bar */}
        <div className="bg-[#075e54] h-16 pt-6 px-4 flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Smartphone size={16} className="text-white" />
          </div>
          <div className="text-white text-sm font-medium">WhatsApp Preview</div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 bg-[#e5ddd5] p-3 overflow-y-auto space-y-2" style={{ backgroundImage: "url('/whatsapp-bg.png')" }}>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden max-w-[90%]">
            {header && (
              <div className="p-2 pb-0 font-bold text-sm text-gray-800">
                {header.format === "TEXT" ? (
                  <div dangerouslySetInnerHTML={{ __html: formatText(header.text) }} />
                ) : (
                  <div className="bg-gray-100 min-h-[120px] rounded flex flex-col items-center justify-center text-gray-400 overflow-hidden">
                    {mediaLoading ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-[#313166] border-t-transparent animate-spin rounded-full"></div>
                        <span className="text-[10px] text-[#313166] font-bold">Uploading...</span>
                      </div>
                    ) : header.mediaUrl ? (
                       header.format === "IMAGE" ? (
                        <img src={header.mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                       ) : header.format === "VIDEO" ? (
                        <div className="flex flex-col items-center gap-2">
                           <Video size={32} />
                           <span className="text-[10px]">Video Preview Not Available</span>
                        </div>
                       ) : (
                        <div className="flex flex-col items-center gap-2 p-4 text-center">
                           <FileText size={32} />
                           <span className="text-[10px] break-all">{header.mediaUrl}</span>
                        </div>
                       )
                    ) : (
                      <>
                        {header.format === "IMAGE" && <ImageIcon size={24} />}
                        {header.format === "VIDEO" && <Video size={24} />}
                        {header.format === "DOCUMENT" && <FileText size={24} />}
                        <span className="text-[10px] mt-1">No {header.format} URL provided</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <div className="p-3 text-sm text-gray-800 leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: formatText(body?.text) }} />
            </div>

            {footer && (
              <div className="px-3 pb-2 text-[10px] text-gray-400 uppercase tracking-wide">
                {footer.text}
              </div>
            )}

            {buttons.length > 0 && (
              <div className="border-t border-gray-100">
                {buttons.map((btn, i) => (
                  <div key={i} className="py-2.5 px-3 text-center border-b border-gray-50 last:border-0 text-[#00a884] font-medium text-sm flex items-center justify-center gap-2">
                    {btn.type === "URL" && <ExternalLink size={14} />}
                    {btn.type === "PHONE_NUMBER" && <Phone size={14} />}
                    {btn.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden">
      {/* Builder Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-20">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h2 className="text-lg font-bold text-gray-900">Create New Template</h2>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-all">
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading || !template.name || nameAvailable === false}
            className="px-8 py-2 bg-[#313166] text-white font-medium rounded-xl hover:bg-[#3d3b83] transition-all shadow-md disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit to Meta"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Editor Side */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {/* Basic Info Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <HelpCircle size={14} /> Basic Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Template Name</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. welcome_message"
                    className={`w-full px-4 py-2 border rounded-xl focus:outline-none transition-all ${
                      nameAvailable === true ? 'border-green-500 focus:ring-green-100' :
                      nameAvailable === false ? 'border-red-500 focus:ring-red-100' :
                      'border-gray-200 focus:ring-[#313166]/20'
                    }`}
                    value={template.name}
                    onChange={handleNameChange}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {checkingName && <div className="w-4 h-4 border-2 border-[#313166] border-t-transparent animate-spin rounded-full"></div>}
                    {nameAvailable === true && <Check size={16} className="text-green-500" />}
                    {nameAvailable === false && <AlertCircle size={16} className="text-red-500" />}
                  </div>
                </div>
                <p className="text-[10px] text-gray-400">Lower case letters, numbers, and underscores only.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Category</label>
                <select
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#313166]/20 bg-white"
                  value={template.category}
                  onChange={(e) => setTemplate({ ...template, category: e.target.value })}
                >
                  <option value="MARKETING">Marketing</option>
                  <option value="UTILITY">Utility</option>
                  <option value="AUTHENTICATION">Authentication</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Language</label>
                <select
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#313166]/20 bg-white"
                  value={template.language}
                  onChange={(e) => setTemplate({ ...template, language: e.target.value })}
                >
                  <option value="en_US">English (US)</option>
                  <option value="ta">Tamil</option>
                </select>
              </div>
            </div>
          </section>

          {/* Components Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                Template Components
              </h3>
              <div className="flex gap-2">
                {!template.components.some(c => c.type === "HEADER") && (
                  <button onClick={() => addComponent("HEADER")} className="text-xs px-3 py-1.5 border border-dashed border-[#313166] text-[#313166] rounded-lg hover:bg-[#313166]/5 transition-all flex items-center gap-1">
                    <Plus size={12} /> Add Header
                  </button>
                )}
                {!template.components.some(c => c.type === "FOOTER") && (
                  <button onClick={() => addComponent("FOOTER")} className="text-xs px-3 py-1.5 border border-dashed border-[#313166] text-[#313166] rounded-lg hover:bg-[#313166]/5 transition-all flex items-center gap-1">
                    <Plus size={12} /> Add Footer
                  </button>
                )}
                {!template.components.some(c => c.type === "BUTTONS") && (
                  <button onClick={() => addComponent("BUTTONS")} className="text-xs px-3 py-1.5 border border-dashed border-[#313166] text-[#313166] rounded-lg hover:bg-[#313166]/5 transition-all flex items-center gap-1">
                    <Plus size={12} /> Add Buttons
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {template.components.map((comp, idx) => (
                <div key={idx} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 relative group">
                  {comp.type !== "BODY" && (
                    <button 
                      onClick={() => removeComponent(comp.type)}
                      className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      {comp.type === "HEADER" && <Smartphone size={16} className="text-[#313166]" />}
                      {comp.type === "BODY" && <Type size={16} className="text-[#313166]" />}
                      {comp.type === "FOOTER" && <FileText size={16} className="text-[#313166]" />}
                      {comp.type === "BUTTONS" && <ExternalLink size={16} className="text-[#313166]" />}
                    </div>
                    <span className="font-bold text-gray-800">{comp.type}</span>
                  </div>

                  {comp.type === "HEADER" && (
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        {["TEXT", "IMAGE", "VIDEO", "DOCUMENT"].map(f => (
                          <button
                            key={f}
                            onClick={() => updateComponent(idx, { format: f, text: "" })}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${comp.format === f ? 'bg-[#313166] text-white shadow-md' : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'}`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                      {comp.format === "TEXT" && (
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Enter header text..."
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none bg-white"
                            maxLength={LIMITS.HEADER}
                            value={comp.text}
                            onChange={(e) => updateComponent(idx, { text: e.target.value })}
                          />
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-gray-400">{comp.text.length} / {LIMITS.HEADER}</span>
                            <button onClick={() => addVariable(idx)} className="text-[#313166] font-bold hover:underline">+ Add Variable</button>
                          </div>
                        </div>
                      )}
                      {(comp.format === "IMAGE" || comp.format === "VIDEO" || comp.format === "DOCUMENT") && (
                        <div className="space-y-4">
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Header {comp.format}</label>
                          
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                              <input
                                type="text"
                                placeholder={`Provide a ${comp.format.toLowerCase()} URL...`}
                                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none bg-white text-sm"
                                value={comp.mediaUrl || ""}
                                onChange={(e) => updateComponent(idx, { mediaUrl: e.target.value })}
                              />
                              <div className="relative">
                                <input
                                  type="file"
                                  id="header-media-upload"
                                  className="hidden"
                                  accept={comp.format === "IMAGE" ? "image/*" : comp.format === "VIDEO" ? "video/*" : ".pdf,.doc,.docx"}
                                  onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;

                                    // Check Meta-compliant size limits for template headers
                                    let maxSize = 5 * 1024 * 1024; // Default 5MB (Image/Document fallback)
                                    if (comp.format === "VIDEO") maxSize = 16 * 1024 * 1024; // Meta Template Video Limit: 16MB
                                    else if (comp.format === "DOCUMENT") maxSize = 100 * 1024 * 1024; // Meta Template Document Limit: 100MB

                                    if (file.size > maxSize) {
                                      return toast.error(`File too large. Max ${maxSize / (1024 * 1024)}MB allowed for ${comp.format.toLowerCase()} headers.`);
                                    }

                                    const formData = new FormData();
                                    formData.append('file', file);
                                    
                                    try {
                                      setMediaLoading(true);
                                      const res = await api.post("/api/integrationManagement/whatsapp/media/upload", formData);
                                      if (res.data.status) {
                                        updateComponent(idx, { mediaUrl: res.data.url });
                                      }
                                    } catch (err) {
                                      toast.error("Upload failed: " + (err.response?.data?.message || err.message));
                                    } finally {
                                      setMediaLoading(false);
                                    }
                                  }}
                                />
                                <label 
                                  htmlFor="header-media-upload"
                                  className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all flex items-center gap-2 ${
                                    mediaLoading ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  {mediaLoading ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent animate-spin rounded-full"></div>
                                      Uploading...
                                    </>
                                  ) : (
                                    <>
                                      <Plus size={16} /> Upload
                                    </>
                                  )}
                                </label>
                              </div>
                            </div>
                            
                            <div className="bg-blue-50 p-3 rounded-xl flex items-start gap-2 border border-blue-100">
                               <Info size={14} className="text-blue-500 mt-0.5" />
                               <div className="text-[10px] text-blue-700">
                                  <p className="font-bold">File Limits:</p>
                                  {comp.format === "IMAGE" && <p>• Types: JPG, PNG, WEBP. Max 5MB.</p>}
                                  {comp.format === "VIDEO" && <p>• Types: MP4, 3GP. Max 16MB.</p>}
                                  {comp.format === "DOCUMENT" && <p>• Types: PDF. Max 100MB.</p>}
                                  <p className="mt-1">Meta requires a sample file to approve your template.</p>
                               </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {comp.type === "BODY" && (
                    <div className="space-y-2">
                      <textarea
                        rows="4"
                        placeholder="Type your message here..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none bg-white resize-none"
                        maxLength={LIMITS.BODY}
                        value={comp.text}
                        onChange={(e) => updateComponent(idx, { text: e.target.value })}
                      ></textarea>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-gray-400">{comp.text.length} / {LIMITS.BODY}</span>
                        <button onClick={() => addVariable(idx)} className="text-[#313166] font-bold hover:underline">+ Add Variable</button>
                      </div>
                    </div>
                  )}

                  {comp.type === "FOOTER" && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Enter footer text..."
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none bg-white"
                        maxLength={LIMITS.FOOTER}
                        value={comp.text}
                        onChange={(e) => updateComponent(idx, { text: e.target.value })}
                      />
                      <span className="text-[10px] text-gray-400">{comp.text.length} / {LIMITS.FOOTER}</span>
                    </div>
                  )}

                  {comp.type === "BUTTONS" && (
                    <div className="space-y-4">
                      <div className="grid gap-3">
                        {comp.buttons.map((btn, bIdx) => (
                          <div key={bIdx} className="p-4 bg-white rounded-xl border border-gray-100 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <select 
                                className="text-xs font-bold text-[#313166] bg-transparent outline-none cursor-pointer"
                                value={btn.type}
                                onChange={(e) => updateButton(bIdx, { type: e.target.value })}
                              >
                                <option value="QUICK_REPLY">Quick Reply</option>
                                <option value="URL">Visit Website</option>
                                <option value="PHONE_NUMBER">Call Number</option>
                              </select>
                              <button onClick={() => removeButton(bIdx)} className="text-red-400 hover:text-red-600 transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <input
                              type="text"
                              placeholder="Button Label"
                              className="px-3 py-1.5 border-b border-gray-100 text-sm outline-none w-full"
                              maxLength={LIMITS.BUTTON}
                              value={btn.text}
                              onChange={(e) => updateButton(bIdx, { text: e.target.value })}
                            />
                            {btn.type === "URL" && (
                              <input
                                type="text"
                                placeholder="https://example.com"
                                className="px-3 py-1.5 border-b border-gray-100 text-sm outline-none w-full text-blue-500"
                                value={btn.url || ""}
                                onChange={(e) => updateButton(bIdx, { url: e.target.value })}
                              />
                            )}
                            {btn.type === "PHONE_NUMBER" && (
                              <input
                                type="text"
                                placeholder="+919999999999"
                                className="px-3 py-1.5 border-b border-gray-100 text-sm outline-none w-full"
                                value={btn.phoneNumber || ""}
                                onChange={(e) => updateButton(bIdx, { phoneNumber: e.target.value })}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                      {comp.buttons.length < 3 && (
                        <button onClick={addButton} className="w-full py-3 border border-dashed border-gray-300 rounded-xl text-gray-400 hover:text-[#313166] hover:border-[#313166] hover:bg-[#313166]/5 transition-all flex items-center justify-center gap-2">
                          <Plus size={16} /> Add Another Button
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Variables Manager */}
          {extractVariables().length > 0 && (
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                Sample Values (Mandatory)
              </h3>
              <div className="grid gap-3 p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                {extractVariables().map(v => (
                  <div key={v} className="flex items-center gap-4">
                    <span className="w-12 text-sm font-bold text-blue-600">{v}</span>
                    <input
                      type="text"
                      placeholder={`Sample value for ${v} (e.g. John)`}
                      className="flex-1 px-4 py-2 border border-blue-200 rounded-xl focus:outline-none bg-white text-sm"
                      value={samples[v] || ""}
                      onChange={(e) => setSamples({ ...samples, [v]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Preview Side */}
        <div className="w-[450px] bg-gray-50 border-l border-gray-200 p-12 overflow-y-auto hidden lg:flex flex-col items-center custom-scrollbar">
          <div className="sticky top-12 w-full">
            <h3 className="text-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-12">
              WhatsApp Real-time Preview
            </h3>
            {renderPreview()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateBuilder;
