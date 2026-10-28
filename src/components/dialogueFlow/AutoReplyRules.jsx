import React, { useState, useMemo, useEffect } from "react";
import {
  Plus,
  X,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Info,
  Eye,
  EyeOff,
  Smartphone,
  Video,
  Image as ImageIcon,
  FileText,
  ExternalLink,
  Phone,
  Layers,
  RefreshCw,
  Tag,
  FolderPlus,   // ✅ Added for Media Library
  UploadCloud,
} from "lucide-react";
import api from "../../api/apiconfig";
import MediaPickerModal from "../common/MediaPickerModal";
import { renderWhatsAppFormattedText } from "../../utils/whatsappTextFormatter";

// ─── helpers ────────────────────────────────────────────────────────────────

/** Extract {{1}}, {{2}} … placeholder indices from a template's text components. */
const extractVariableIndices = (template) => {
  if (!template?.components) return [];
  const allText = template.components.map((c) => c.text || "").join(" ");
  const matches = allText.match(/\{\{(\d+)\}\}/g) || [];
  const indices = [...new Set(matches.map((m) => parseInt(m.replace(/\D/g, ""), 10)))];
  return indices.sort((a, b) => a - b);
};

/** Replace {{n}} with the filled value (or highlight it if empty). */
const applyVariables = (text = "", vars = {}) => {
  return text.replace(/\{\{(\d+)\}\}/g, (_, n) => {
    const key = `{{${n}}}`;
    return vars[key] ? `<strong>${vars[key]}</strong>` : `<mark class="bg-yellow-200 text-yellow-800 rounded px-0.5">{{${n}}}</mark>`;
  });
};

/** Buttons from either BUTTONS component or direct type entries. */
const getTemplateButtons = (template) => {
  if (!template?.components) return [];
  const buttonsComp = template.components.find((c) => c.type === "BUTTONS");
  if (buttonsComp && Array.isArray(buttonsComp.buttons)) return buttonsComp.buttons;
  return template.components.filter((c) =>
    ["QUICK_REPLY", "URL", "PHONE_NUMBER", "FLOW", "CATALOG", "OTP", "COPY_CODE"].includes(c.type)
  );
};

// ─── Mini WhatsApp phone preview ────────────────────────────────────────────

// const TemplatePhonePreview = ({ template, variables = {} }) => {
//   if (!template) return null;
//   const header = template.components?.find((c) => c.type === "HEADER");
//   const body = template.components?.find((c) => c.type === "BODY");
//   const footer = template.components?.find((c) => c.type === "FOOTER");
//   const buttons = getTemplateButtons(template);

//   const renderText = (text) => {
//     const withVars = applyVariables(text || "", variables);
//     return renderWhatsAppFormattedText
//       ? renderWhatsAppFormattedText(withVars, { highlightVariables: true, variableClassName: "text-blue-600 font-bold" })
//       : withVars;
//   };

//   return (
//     <div className="mt-3 flex flex-col items-center">
//       <div className="text-[8px] font-bold text-gray-400 uppercase mb-2 tracking-wider flex items-center gap-1">
//         <Smartphone size={9} /> WhatsApp Preview
//       </div>
//       {/* Phone shell */}
//       <div className="relative w-full max-w-[200px] bg-slate-900 rounded-[20px] border-[4px] border-slate-800 shadow-xl overflow-hidden">
//         {/* Status bar */}
//         <div className="bg-[#075e54] h-8 px-3 flex items-center gap-2">
//           <div className="w-4 h-4 rounded-full bg-white/20 flex-shrink-0" />
//           <span className="text-white text-[9px] font-medium truncate">{template.name}</span>
//         </div>
//         {/* Chat area */}
//         <div className="bg-[#e5ddd5] p-2 min-h-[80px]">
//           <div className="bg-white rounded-lg shadow-sm overflow-hidden text-[10px] text-gray-800">
//             {/* Header */}
//             {header && (
//               <div className="p-2 pb-0">
//                 {header.format === "TEXT" ? (
//                   <div
//                     className="font-bold text-gray-800 text-[11px]"
//                     dangerouslySetInnerHTML={{ __html: renderText(header.text) }}
//                   />
//                 ) : (
//                   <div className="bg-gray-100 h-14 rounded flex flex-col items-center justify-center text-gray-400 overflow-hidden">
//                     {header.format === "IMAGE" ? (
//                       header.mediaUrl || header.example?.header_handle?.[0] ? (
//                         <img
//                           src={header.mediaUrl || header.example?.header_handle?.[0]}
//                           alt="Media"
//                           className="w-full h-full object-cover"
//                         />
//                       ) : (
//                         <ImageIcon size={14} />
//                       )
//                     ) : header.format === "VIDEO" ? (
//                       <Video size={14} />
//                     ) : (
//                       <FileText size={14} />
//                     )}
//                     {!header.mediaUrl && !header.example?.header_handle?.[0] && (
//                       <span className="text-[7px] mt-0.5">{header.format || "Media"}</span>
//                     )}
//                   </div>
//                 )}
//               </div>
//             )}
//             {/* Body */}
//             <div className="p-2 leading-relaxed">
//               <div dangerouslySetInnerHTML={{ __html: renderText(body?.text) }} />
//             </div>
//             {/* Footer */}
//             {footer && (
//               <div
//                 className="px-2 pb-2 text-[8px] text-gray-400"
//                 dangerouslySetInnerHTML={{ __html: renderText(footer.text) }}
//               />
//             )}
//             {/* Buttons */}
//             {buttons.length > 0 && (
//               <div className="border-t border-gray-100">
//                 {buttons.slice(0, 3).map((btn, i) => (
//                   <div
//                     key={i}
//                     className="py-1.5 px-2 text-center border-b border-gray-50 last:border-0 text-[#00a884] font-medium text-[10px] flex items-center justify-center gap-1"
//                   >
//                     {btn.type === "URL" && <ExternalLink size={8} />}
//                     {btn.type === "PHONE_NUMBER" && <Phone size={8} />}
//                     {btn.type === "FLOW" && <Layers size={8} />}
//                     <span>{btn.text || "Button"}</span>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };



const TemplatePhonePreview = ({ template, variables = {}, overrideMediaUrl = "", overrideThumbnailUrl = "" }) => {
  if (!template) return null;
  const header = template.components?.find((c) => c.type === "HEADER");
  const body = template.components?.find((c) => c.type === "BODY");
  const footer = template.components?.find((c) => c.type === "FOOTER");
  const buttons = getTemplateButtons(template);

  const activeMediaUrl = overrideMediaUrl || header?.mediaUrl || header?.example?.header_handle?.[0] || "";

  const renderText = (text) => {
    const withVars = applyVariables(text || "", variables);
    return renderWhatsAppFormattedText
      ? renderWhatsAppFormattedText(withVars, { highlightVariables: true, variableClassName: "text-blue-600 font-bold" })
      : withVars;
  };

  return (
    <div className="mt-3 flex flex-col items-center">
      <div className="text-[8px] font-bold text-gray-400 uppercase mb-2 tracking-wider flex items-center gap-1">
        <Smartphone size={9} /> WhatsApp Preview
      </div>
      <div className="relative w-full max-w-[200px] bg-slate-900 rounded-[20px] border-[4px] border-slate-800 shadow-xl overflow-hidden">
        <div className="bg-[#075e54] h-8 px-3 flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-white/20 flex-shrink-0" />
          <span className="text-white text-[9px] font-medium truncate">{template.name}</span>
        </div>
        <div className="bg-[#e5ddd5] p-2 min-h-[80px]">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden text-[10px] text-gray-800">
            {/* Header */}
            {header && (
              <div className="p-2 pb-0">
                {header.format === "TEXT" ? (
                  <div
                    className="font-bold text-gray-800 text-[11px]"
                    dangerouslySetInnerHTML={{ __html: renderText(header.text) }}
                  />
                ) : (
                  <div className="bg-gray-100 h-24 rounded flex flex-col items-center justify-center text-gray-400 overflow-hidden relative">
                    {header.format === "IMAGE" ? (
                      activeMediaUrl ? (
                        <img
                          src={activeMediaUrl}
                          alt="Media Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      ) : (
                        <ImageIcon size={20} />
                      )
                    ) : header.format === "VIDEO" ? (
                      activeMediaUrl ? (
                        <video src={activeMediaUrl} controls className="w-full h-full object-cover" />
                      ) : (
                        <Video size={20} />
                      )
                    ) : (
                      /* DOCUMENT with Thumbnail Fallback */
                      overrideThumbnailUrl ? (
                        <div className="relative w-full h-full bg-slate-800 flex flex-col justify-between p-1.5 overflow-hidden">
                          <img
                            src={overrideThumbnailUrl}
                            alt="Document Thumbnail"
                            className="absolute inset-0 w-full h-full object-cover opacity-80"
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                          <div className="relative z-10 flex justify-end">
                            <span className="px-1 py-0.2 bg-black/70 text-white text-[7px] font-bold rounded">PDF</span>
                          </div>
                          <div className="relative z-10 bg-black/60 p-1 rounded backdrop-blur-xs flex items-center gap-1">
                            <FileText size={10} className="text-cyan-300 shrink-0" />
                            <span className="text-white text-[8px] truncate">{activeMediaUrl ? activeMediaUrl.split("/").pop() : "Document"}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[9px] font-mono p-2 bg-purple-50/80 w-full h-full">
                          <FileText size={16} className="text-[#CB376D] shrink-0" />
                          <span className="truncate">{activeMediaUrl ? activeMediaUrl.split("/").pop() : "Document"}</span>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            )}
            {/* Body */}
            <div className="p-2 leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: renderText(body?.text) }} />
            </div>
            {/* Footer */}
            {footer && (
              <div
                className="px-2 pb-2 text-[8px] text-gray-400"
                dangerouslySetInnerHTML={{ __html: renderText(footer.text) }}
              />
            )}
            {/* Buttons */}
            {buttons.length > 0 && (
              <div className="border-t border-gray-100">
                {buttons.slice(0, 3).map((btn, i) => (
                  <div
                    key={i}
                    className="py-1.5 px-2 text-center border-b border-gray-50 last:border-0 text-[#00a884] font-medium text-[10px] flex items-center justify-center gap-1"
                  >
                    {btn.type === "URL" && <ExternalLink size={8} />}
                    {btn.type === "PHONE_NUMBER" && <Phone size={8} />}
                    {btn.type === "FLOW" && <Layers size={8} />}
                    <span>{btn.text || "Button"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main component ──────────────────────────────────────────────────────────

/**
 * AutoReplyRules
 * Props:
 *  - node          : currently selected screen node
 *  - templates     : array of WhatsApp templates from backend
 *  - onUpdate      : callback(newAutoReplies[])
 */
const AutoReplyRules = ({ node, templates = [], onUpdate }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedPreview, setExpandedPreview] = useState(null); // rule id with preview open
  const [internalTemplates, setInternalTemplates] = useState([]);
  const [fetchingTemplates, setFetchingTemplates] = useState(false);

  const autoReplies = node?.data?.autoReplies || [];


  // ✅ Media Picker & File Upload State
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [activeRuleForMedia, setActiveRuleForMedia] = useState(null);
  const [mediaPickerType, setMediaPickerType] = useState("image");
  const [uploadingMediaRuleId, setUploadingMediaRuleId] = useState(null);

  // ✅ Open Media Library Modal
  const handleOpenMediaPicker = (ruleId, format = "IMAGE") => {
    setActiveRuleForMedia(ruleId);
    setMediaPickerType(format.toLowerCase());
    setShowMediaPicker(true);
  };

  // ✅ Handle Media Selection from Library
  // ✅ Handle Media Selection from Library (with Thumbnail Support)
  const handleMediaPickerSelect = (media) => {
    const cleanUrl = typeof media === "string" ? media : (media?.s3Url || media?.url || "");
    const cleanThumbnailUrl = typeof media === "object" && media?.thumbnailUrl ? media.thumbnailUrl : "";
    
    if (activeRuleForMedia && cleanUrl) {
      updateRule(activeRuleForMedia, { 
        templateMediaUrl: cleanUrl,
        templateThumbnailUrl: cleanThumbnailUrl 
      });
    }
    setShowMediaPicker(false);
    setActiveRuleForMedia(null);
  };

  // ✅ Direct File Upload Handler
  const handleHeaderFileUpload = async (ruleId, file, reqFormat = "IMAGE") => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("expectedType", reqFormat);

    try {
      setUploadingMediaRuleId(ruleId);
      const res = await api.post("/api/media-library/upload", formData);
      const url = res.data?.url || res.data?.s3Url;

      if (res.data?.status && url) {
        updateRule(ruleId, { templateMediaUrl: url });
      } else {
        // Fallback Base64 reader if needed
        const reader = new FileReader();
        reader.onloadend = () => {
          updateRule(ruleId, { templateMediaUrl: reader.result });
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploadingMediaRuleId(null);
    }
  };

  // Choice fields for trigger dropdowns
  const choiceFields = (node?.data?.fields || []).filter((f) =>
    ["radio", "select", "checkbox"].includes(f.type)
  );

  // All screen fields for variable chips
  const allScreenFields = node?.data?.fields || [];

  const loadTemplates = async () => {
    try {
      setFetchingTemplates(true);
      const res = await api.get("/api/integrationManagement/whatsapp/custom-templates");
      const list = res.data?.data || res.data || [];
      if (Array.isArray(list)) {
        setInternalTemplates(list);
      }
    } catch (err) {
      console.warn("[AutoReplyRules] Error fetching templates:", err?.message);
    } finally {
      setFetchingTemplates(false);
    }
  };

  useEffect(() => {
    if (templates && templates.length > 0) {
      setInternalTemplates(templates);
    } else {
      loadTemplates();
    }
  }, [templates]);

  // Approved templates list (case-insensitive fallback)
  const approvedTemplates = useMemo(() => {
    const list = internalTemplates && internalTemplates.length > 0 ? internalTemplates : templates;
    return (list || []).filter((t) => !t.status || String(t.status).toUpperCase() === "APPROVED");
  }, [internalTemplates, templates]);

  // ─── Rule CRUD ───────────────────────────────────────────────────────────

  const addRule = () => {
    const defaultField = choiceFields[0];
    const newRule = {
      id: Date.now(),
      triggerType: choiceFields.length > 0 ? "option" : "submit",
      fieldName: defaultField?.name || defaultField?.label || "",
      triggerValue: defaultField?.options?.[0]?.value || defaultField?.options?.[0]?.label || "",
      replyType: "static",
      staticMessage: "",
      templateName: "",
      templateLanguage: "en_US",
      templateVariables: {}, // { "{{1}}": "", "{{2}}": "" … }
    };
    onUpdate([...autoReplies, newRule]);
    setExpandedPreview(newRule.id);
  };

  const updateRule = (ruleId, changes) =>
    onUpdate(autoReplies.map((r) => (r.id === ruleId ? { ...r, ...changes } : r)));

  const removeRule = (ruleId) =>
    onUpdate(autoReplies.filter((r) => r.id !== ruleId));

  // ─── Template selection ──────────────────────────────────────────────────

  // const handleTemplateSelect = (ruleId, templateName) => {
  //   const tpl = approvedTemplates.find((t) => t.name === templateName);
  //   if (!tpl) {
  //     updateRule(ruleId, { templateName, templateLanguage: "en_US", templateVariables: {} });
  //     return;
  //   }
  //   // Auto-initialise variable map from template body/header placeholders
  //   const indices = extractVariableIndices(tpl);
  //   const templateVariables = {};
  //   indices.forEach((n) => { templateVariables[`{{${n}}}`] = ""; });

  //   updateRule(ruleId, {
  //     templateName,
  //     templateLanguage: tpl.language || "en_US",
  //     templateVariables,
  //   });
  // };

  const handleTemplateSelect = (ruleId, templateName) => {
    const tpl = approvedTemplates.find((t) => t.name === templateName);
    if (!tpl) {
      updateRule(ruleId, {
        templateName,
        templateLanguage: "en_US",
        templateVariables: {},
        headerFormat: null,
        templateMediaUrl: "",
        templateThumbnailUrl: "",
      });
      return;
    }

    const headerComp = tpl.components?.find((c) => c.type === "HEADER");
    const headerFormat = headerComp?.format?.toUpperCase() || null;
    const isMedia = ["IMAGE", "VIDEO", "DOCUMENT"].includes(headerFormat);
    const defaultMediaUrl = headerComp?.mediaUrl || (Array.isArray(headerComp?.example?.header_handle) ? headerComp.example.header_handle[0] : "") || "";
    const defaultThumbnailUrl = headerComp?.thumbnailUrl || "";

    const indices = extractVariableIndices(tpl);
    const templateVariables = {};
    indices.forEach((n) => { templateVariables[`{{${n}}}`] = ""; });

    updateRule(ruleId, {
      templateName,
      templateLanguage: tpl.language || "en_US",
      templateVariables,
      headerFormat: isMedia ? headerFormat : null,
      templateMediaUrl: defaultMediaUrl,
      templateThumbnailUrl: defaultThumbnailUrl,
    });
  };



  const updateTemplateVariable = (ruleId, key, value) => {
    const rule = autoReplies.find((r) => r.id === ruleId);
    if (!rule) return;
    updateRule(ruleId, {
      templateVariables: { ...(rule.templateVariables || {}), [key]: value },
    });
  };

  // Get options for the chosen field
  const getOptionsForField = (fieldName) => {
    const field = choiceFields.find((f) => (f.name || f.label) === fieldName);
    return field?.options || [];
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="pt-4 border-t border-gray-100">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="flex items-center gap-2 flex-1 text-left group"
        >
          <MessageSquare size={12} className="text-[#CB376D]" />
          <span className="text-[10px] font-bold text-gray-400 uppercase group-hover:text-gray-600">Auto-Reply Rules</span>
          {autoReplies.length > 0 && (
            <span className="text-[9px] font-bold text-[#CB376D] bg-[#CB376D]/10 px-1.5 py-0.5 rounded-full">
              {autoReplies.length}
            </span>
          )}
          {collapsed ? (
            <ChevronDown size={12} className="text-gray-400 ml-1" />
          ) : (
            <ChevronUp size={12} className="text-gray-400 ml-1" />
          )}
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={loadTemplates}
            disabled={fetchingTemplates}
            title="Refresh WhatsApp Templates from Meta"
            className="p-1 text-gray-400 hover:text-[#CB376D] hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
          >
            <RefreshCw size={11} className={fetchingTemplates ? "animate-spin text-[#CB376D]" : ""} />
          </button>
          <button
            type="button"
            onClick={addRule}
            className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-white bg-[#CB376D] rounded hover:bg-[#b52d5e] transition-colors flex-shrink-0"
          >
            <Plus size={10} /> ADD RULE
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="space-y-3">
          {/* Info banner */}
          <div className="flex items-start gap-2 p-2.5 bg-blue-50 border border-blue-100 rounded-lg">
            <Info size={12} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-[9px] text-blue-600 leading-relaxed">
              Auto-replies are sent as normal WhatsApp messages <strong>after</strong> the user
              submits this screen. They do <strong>not</strong> affect the Meta flow definition.
            </p>
          </div>

          {autoReplies.length === 0 && (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-4 text-[10px] text-gray-400 text-center">
              No auto-reply rules yet. Click "ADD RULE" to create one.
            </div>
          )}

          {autoReplies.map((rule, ruleIdx) => {
            const selectedTemplate = approvedTemplates.find((t) => t.name === rule.templateName);
            const varIndices = selectedTemplate ? extractVariableIndices(selectedTemplate) : [];
            const previewOpen = expandedPreview === rule.id;

            return (
              <div
                key={rule.id}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200 relative hover:border-[#CB376D]/30 transition-colors"
              >
                {/* Delete */}
                <button
                  type="button"
                  onClick={() => removeRule(rule.id)}
                  className="absolute -top-2 -right-2 p-1 bg-white border border-gray-200 rounded-full text-red-500 shadow-sm hover:bg-red-50 z-10"
                >
                  <X size={10} />
                </button>

                <div className="space-y-2.5">
                  <div className="text-[9px] font-bold text-gray-400 uppercase">Rule {ruleIdx + 1}</div>

                  {/* ── Trigger ── */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-gray-500 uppercase block">Trigger When</label>
                    <select
                      value={rule.triggerType}
                      onChange={(e) => {
                        const tt = e.target.value;
                        updateRule(rule.id, {
                          triggerType: tt,
                          fieldName: tt === "option" ? (choiceFields[0]?.name || choiceFields[0]?.label || "") : "",
                          triggerValue: tt === "option" ? (choiceFields[0]?.options?.[0]?.value || "") : "",
                        });
                      }}
                      className="w-full text-[10px] bg-white border border-gray-200 px-2 py-1.5 rounded font-semibold text-gray-700 focus:ring-1 focus:ring-[#CB376D] outline-none"
                    >
                      <option value="submit">User taps Submit button</option>
                      {choiceFields.length > 0 && (
                        <option value="option">User selects an option (radio / dropdown)</option>
                      )}
                    </select>

                    {rule.triggerType === "option" && choiceFields.length > 0 && (
                      <div className="flex gap-2 mt-1">
                        <div className="flex-1">
                          <label className="text-[8px] font-bold text-gray-400 uppercase mb-0.5 block">Field</label>
                          <select
                            value={rule.fieldName}
                            onChange={(e) => {
                              const newField = choiceFields.find((f) => (f.name || f.label) === e.target.value);
                              updateRule(rule.id, {
                                fieldName: e.target.value,
                                triggerValue: newField?.options?.[0]?.value || "",
                              });
                            }}
                            className="w-full text-[10px] bg-white border border-gray-200 px-1.5 py-1 rounded text-gray-700 focus:ring-1 focus:ring-[#CB376D] outline-none"
                          >
                            {choiceFields.map((f) => (
                              <option key={f.id} value={f.name || f.label}>{f.label || f.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="text-[8px] font-bold text-gray-400 uppercase mb-0.5 block">When value is</label>
                          <select
                            value={rule.triggerValue}
                            onChange={(e) => updateRule(rule.id, { triggerValue: e.target.value })}
                            className="w-full text-[10px] bg-white border border-gray-200 px-1.5 py-1 rounded text-gray-700 focus:ring-1 focus:ring-[#CB376D] outline-none"
                          >
                            {getOptionsForField(rule.fieldName).map((opt, i) => (
                              <option key={i} value={opt.value || opt.label}>{opt.label}</option>
                            ))}
                            {getOptionsForField(rule.fieldName).length === 0 && (
                              <option value="">No options defined</option>
                            )}
                          </select>
                        </div>
                      </div>
                    )}

                    {rule.triggerType === "option" && choiceFields.length === 0 && (
                      <p className="text-[9px] text-amber-600 bg-amber-50 border border-amber-100 rounded p-2">
                        No radio/select/checkbox fields on this screen. Add a choice field to use option triggers.
                      </p>
                    )}
                  </div>

                  {/* ── Reply Type toggle ── */}
                  <div>
                    <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1.5">Reply Type</label>
                    <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateRule(rule.id, { replyType: "static" })}
                        className={`flex-1 py-1.5 text-[10px] font-bold transition-colors ${rule.replyType === "static" ? "bg-[#CB376D] text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                      >
                        Static Text
                      </button>
                      <button
                        type="button"
                        onClick={() => updateRule(rule.id, { replyType: "template" })}
                        className={`flex-1 py-1.5 text-[10px] font-bold transition-colors ${rule.replyType === "template" ? "bg-[#CB376D] text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                      >
                        Template
                      </button>
                    </div>
                  </div>

                  {/* ── Static message ── */}
                  {rule.replyType === "static" && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[9px] font-bold text-gray-500 uppercase">Message Text</label>
                        <button
                          type="button"
                          onClick={() => setExpandedPreview((prev) => (prev === rule.id ? null : rule.id))}
                          className="flex items-center gap-1 text-[9px] font-bold text-[#CB376D] hover:underline"
                        >
                          {previewOpen ? <EyeOff size={10} /> : <Eye size={10} />}
                          {previewOpen ? "Hide Preview" : "Show Preview"}
                        </button>
                      </div>

                      <textarea
                        placeholder="e.g. Thank you {user_name}! We received your response."
                        value={rule.staticMessage || ""}
                        onChange={(e) => updateRule(rule.id, { staticMessage: e.target.value })}
                        rows={3}
                        className="w-full bg-white px-2 py-1.5 border border-gray-200 rounded text-[11px] text-gray-700 focus:ring-1 focus:ring-[#CB376D] outline-none resize-none leading-relaxed"
                      />

                      {/* Screen field chips for static message */}
                      {allScreenFields.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap pt-0.5">
                          <span className="text-[8px] text-gray-400 font-bold uppercase flex items-center gap-0.5">
                            <Tag size={8} /> Insert:
                          </span>
                          {allScreenFields.map((f, i) => {
                            const fieldKey = f.name || f.label;
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  const current = rule.staticMessage || "";
                                  updateRule(rule.id, {
                                    staticMessage: current ? `${current} {${fieldKey}}` : `{${fieldKey}}`,
                                  });
                                }}
                                className="text-[8px] px-1.5 py-0.5 bg-white hover:bg-[#CB376D]/10 hover:text-[#CB376D] text-gray-600 rounded border border-gray-200 font-mono transition-colors"
                              >
                                {`{${fieldKey}}`}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Phone preview for static message */}
                      {previewOpen && (
                        <TemplatePhonePreview
                          template={{
                            name: "Custom Auto-Reply",
                            components: [{ type: "BODY", text: rule.staticMessage || "Your auto-reply message" }],
                          }}
                          variables={{}}
                        />
                      )}
                    </div>
                  )}

                  {/* ── Template message ── */}
                  {rule.replyType === "template" && (
                    <div className="space-y-2">
                      {/* Template selector */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[9px] font-bold text-gray-500 uppercase">
                            Choose Meta Template
                          </label>
                          {fetchingTemplates && (
                            <span className="text-[8px] text-[#CB376D] animate-pulse font-medium">Syncing...</span>
                          )}
                        </div>

                        {approvedTemplates.length === 0 ? (
                          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-[9px] text-amber-700 space-y-1">
                            <p className="font-semibold">No approved WhatsApp templates found.</p>
                            <p>
                              Go to <strong>Integration → WhatsApp → Templates</strong> to sync approved templates from Meta.
                            </p>
                            <button
                              type="button"
                              onClick={loadTemplates}
                              className="mt-1 text-[8.5px] font-bold text-[#CB376D] hover:underline flex items-center gap-1"
                            >
                              <RefreshCw size={9} /> Re-check now
                            </button>
                          </div>
                        ) : (
                          <select
                            value={rule.templateName || ""}
                            onChange={(e) => handleTemplateSelect(rule.id, e.target.value)}
                            className="w-full text-[10px] bg-white border border-gray-200 px-2 py-1.5 rounded text-gray-700 focus:ring-1 focus:ring-[#CB376D] outline-none font-medium"
                          >
                            <option value="">— Select an Approved Template ({approvedTemplates.length}) —</option>
                            {approvedTemplates.map((t) => (
                              <option key={t._id || t.name} value={t.name}>
                                {t.name} ({t.category || "UTILITY"} • {t.language || "en_US"})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Selected template info badges */}
                      {selectedTemplate && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[8px] font-bold uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                            {selectedTemplate.status || "APPROVED"}
                          </span>
                          <span className="text-[8px] font-bold uppercase bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                            {selectedTemplate.category || "UTILITY"}
                          </span>
                          <span className="text-[8px] font-bold bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                            {selectedTemplate.language || "en_US"}
                          </span>
                        </div>
                      )}

                      {/* Language code (auto-filled, editable) */}
                      {rule.templateName && (
                        <div>
                          <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Language Code</label>
                          <input
                            type="text"
                            value={rule.templateLanguage || "en_US"}
                            onChange={(e) => updateRule(rule.id, { templateLanguage: e.target.value })}
                            className="w-full bg-white px-2 py-1 border border-gray-200 rounded text-[10px] text-gray-700 focus:ring-1 focus:ring-[#CB376D] outline-none"
                          />
                        </div>
                      )}


                      {/* ⬇️ ADD YOUR SNIPPET RIGHT HERE ⬇️ */}
                      {/* Header Media Picker Controls if Template has IMAGE / VIDEO / DOCUMENT */}
{selectedTemplate && (() => {
  const headerComp = selectedTemplate.components?.find((c) => c.type === "HEADER");
  const headerFormat = (rule.headerFormat || headerComp?.format || "").toUpperCase();
  const isMediaHeader = ["IMAGE", "VIDEO", "DOCUMENT"].includes(headerFormat);

  if (!isMediaHeader) return null;

  return (
    <div className="p-2.5 bg-purple-50/70 border border-purple-200/80 rounded-lg space-y-2 mt-2">
      <div className="flex items-center justify-between">
        <label className="text-[9px] font-bold text-[#313166] uppercase tracking-wider flex items-center gap-1">
          {headerFormat === "IMAGE" ? <ImageIcon size={12} /> : headerFormat === "VIDEO" ? <Video size={12} /> : <FileText size={12} />}
          <span>Header {headerFormat}</span>
        </label>
        <span className="text-[8px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded uppercase">
          Locked to {headerFormat}
        </span>
      </div>

      {/* Media Preview */}
      {rule.templateMediaUrl ? (
        <div className="relative rounded-lg overflow-hidden border border-purple-200 bg-white">
          {headerFormat === "IMAGE" ? (
            <img src={rule.templateMediaUrl} alt="Header" className="w-full h-20 object-cover" />
          ) : headerFormat === "VIDEO" ? (
            <video src={rule.templateMediaUrl} controls className="w-full h-20 object-cover bg-black" />
          ) : (
            /* Document Preview: Show Thumbnail if available, else default bar */
            rule.templateThumbnailUrl ? (
              <div className="relative h-20 w-full bg-slate-900 overflow-hidden">
                <img src={rule.templateThumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 p-2 bg-gradient-to-t from-black/80 to-transparent flex items-end">
                  <div className="flex items-center gap-1 text-[9px] text-white font-mono truncate">
                    <FileText size={14} className="text-cyan-300 shrink-0" />
                    <span className="truncate">{rule.templateMediaUrl.split("/").pop()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-2 text-[10px] flex items-center gap-1.5 text-gray-700 font-mono">
                <FileText size={16} className="text-[#CB376D] shrink-0" />
                <span className="truncate flex-1">{rule.templateMediaUrl.split("/").pop()}</span>
              </div>
            )
          )}
          <button
            type="button"
            onClick={() => updateRule(rule.id, { templateMediaUrl: "", templateThumbnailUrl: "" })}
            className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors"
            title="Remove Media"
          >
            <X size={10} />
          </button>
        </div>
      ) : (
        <p className="text-[9px] text-purple-700 italic">
          No media attached. Select from library or upload below.
        </p>
      )}

      {/* Media Action Buttons */}
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={() => handleOpenMediaPicker(rule.id, headerFormat)}
          className="px-2 py-1.5 bg-[#313166] hover:bg-[#252550] text-white rounded text-[9px] font-bold transition-all flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
        >
          <FolderPlus size={11} className="text-pink-300" />
          <span>Media Library</span>
        </button>

        <label className="px-2 py-1.5 bg-white hover:bg-purple-100/50 border border-purple-200 rounded text-[9px] font-bold text-[#313166] cursor-pointer transition-colors flex items-center justify-center gap-1 shadow-2xs">
          {uploadingMediaRuleId === rule.id ? (
            <span className="animate-pulse text-[#CB376D]">Uploading...</span>
          ) : (
            <>
              <UploadCloud size={11} className="text-[#CB376D]" />
              <span>Upload File</span>
            </>
          )}
          <input
            type="file"
            className="hidden"
            accept={
              headerFormat === "IMAGE" ? "image/*" : headerFormat === "VIDEO" ? "video/*" : ".pdf,.doc,.docx"
            }
            disabled={uploadingMediaRuleId === rule.id}
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleHeaderFileUpload(rule.id, e.target.files[0], headerFormat);
              }
            }}
          />
        </label>
      </div>

      {/* ✅ Disabled URL Input Display */}
      <input
        type="url"
        disabled
        value={rule.templateMediaUrl || ""}
        placeholder={`No ${headerFormat.toLowerCase()} selected...`}
        className="w-full text-[9px] bg-gray-100 border border-gray-200 px-2 py-1 rounded text-gray-500 cursor-not-allowed focus:outline-none"
      />
    </div>
  );
})()}
                      {/* ⬆️ END OF SNIPPET ⬆️ */}

                      {/* Template variables — auto-extracted from body/header placeholders */}
                      {rule.templateName && varIndices.length > 0 && (
                        <div className="space-y-1.5 p-2.5 bg-white border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <label className="text-[9px] font-bold text-gray-600 uppercase">
                              Template Variables ({varIndices.length})
                            </label>
                            <span className="text-[7.5px] text-gray-400">Static text or {'{field}'}</span>
                          </div>

                          <div className="space-y-2">
                            {varIndices.map((n) => {
                              const key = `{{${n}}}`;
                              return (
                                <div key={n} className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] text-[#CB376D] font-mono font-bold bg-[#CB376D]/10 px-1.5 py-0.5 rounded flex-shrink-0">
                                      {key}
                                    </span>
                                    <input
                                      type="text"
                                      placeholder={`Value for ${key} (e.g. John or {user_name})`}
                                      value={rule.templateVariables?.[key] || ""}
                                      onChange={(e) => updateTemplateVariable(rule.id, key, e.target.value)}
                                      className="flex-1 bg-white px-2 py-1 border border-gray-200 rounded text-[10px] text-gray-700 focus:ring-1 focus:ring-[#CB376D] outline-none"
                                    />
                                  </div>

                                  {/* Screen field chips for template variable */}
                                  {allScreenFields.length > 0 && (
                                    <div className="flex items-center gap-1 pl-7 flex-wrap">
                                      <span className="text-[7px] text-gray-400 font-bold uppercase">Insert:</span>
                                      {allScreenFields.map((f, i) => {
                                        const fieldKey = f.name || f.label;
                                        return (
                                          <button
                                            key={i}
                                            type="button"
                                            onClick={() => updateTemplateVariable(rule.id, key, `{${fieldKey}}`)}
                                            className="text-[7.5px] px-1 py-0.2 bg-gray-50 hover:bg-[#CB376D]/10 hover:text-[#CB376D] text-gray-500 rounded border border-gray-200 font-mono transition-colors"
                                          >
                                            {`{${fieldKey}}`}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {rule.templateName && varIndices.length === 0 && selectedTemplate && (
                        <p className="text-[8px] text-gray-400 italic">
                          This template has no {"{{n}}"} variables.
                        </p>
                      )}

                      {/* Preview toggle */}
                      {selectedTemplate && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedPreview((prev) => (prev === rule.id ? null : rule.id))
                          }
                          className="flex items-center gap-1.5 text-[10px] font-bold text-[#CB376D] hover:underline mt-1"
                        >
                          {previewOpen ? <EyeOff size={11} /> : <Eye size={11} />}
                          {previewOpen ? "Hide Live Preview" : "Show Live Preview"}
                        </button>
                      )}

                      {/* Phone preview */}
                      {previewOpen && selectedTemplate && (
                        <TemplatePhonePreview
                          template={selectedTemplate}
                          variables={rule.templateVariables || {}}
                          overrideMediaUrl={rule.templateMediaUrl} // ✅ Pass selected media override
                          overrideThumbnailUrl={rule.templateThumbnailUrl}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Media Picker Modal */}
      {showMediaPicker && (
        <MediaPickerModal
          onClose={() => {
            setShowMediaPicker(false);
            setActiveRuleForMedia(null);
          }}
          mediaType={mediaPickerType}
          lockType={true}
          onSelect={handleMediaPickerSelect}
        />
      )}
    </div>
  );
};

export default AutoReplyRules;
