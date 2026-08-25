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
} from "lucide-react";
import api from "../../api/apiconfig";
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

const TemplatePhonePreview = ({ template, variables = {} }) => {
  if (!template) return null;
  const header = template.components?.find((c) => c.type === "HEADER");
  const body = template.components?.find((c) => c.type === "BODY");
  const footer = template.components?.find((c) => c.type === "FOOTER");
  const buttons = getTemplateButtons(template);

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
      {/* Phone shell */}
      <div className="relative w-full max-w-[200px] bg-slate-900 rounded-[20px] border-[4px] border-slate-800 shadow-xl overflow-hidden">
        {/* Status bar */}
        <div className="bg-[#075e54] h-8 px-3 flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-white/20 flex-shrink-0" />
          <span className="text-white text-[9px] font-medium truncate">{template.name}</span>
        </div>
        {/* Chat area */}
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
                  <div className="bg-gray-100 h-14 rounded flex flex-col items-center justify-center text-gray-400 overflow-hidden">
                    {header.format === "IMAGE" ? (
                      header.mediaUrl || header.example?.header_handle?.[0] ? (
                        <img
                          src={header.mediaUrl || header.example?.header_handle?.[0]}
                          alt="Media"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon size={14} />
                      )
                    ) : header.format === "VIDEO" ? (
                      <Video size={14} />
                    ) : (
                      <FileText size={14} />
                    )}
                    {!header.mediaUrl && !header.example?.header_handle?.[0] && (
                      <span className="text-[7px] mt-0.5">{header.format || "Media"}</span>
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

  const handleTemplateSelect = (ruleId, templateName) => {
    const tpl = approvedTemplates.find((t) => t.name === templateName);
    if (!tpl) {
      updateRule(ruleId, { templateName, templateLanguage: "en_US", templateVariables: {} });
      return;
    }
    // Auto-initialise variable map from template body/header placeholders
    const indices = extractVariableIndices(tpl);
    const templateVariables = {};
    indices.forEach((n) => { templateVariables[`{{${n}}}`] = ""; });

    updateRule(ruleId, {
      templateName,
      templateLanguage: tpl.language || "en_US",
      templateVariables,
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
    </div>
  );
};

export default AutoReplyRules;
