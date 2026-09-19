import React, { useState, useEffect, useMemo } from "react";
import {
  Zap,
  Plus,
  ArrowRight,
  GitFork,
  MessageCircle,
  Smartphone,
  CheckCircle2,
  Clock,
  AlertCircle,
  PauseCircle,
  Play,
  Pause,
  Trash2,
  Edit3,
  Copy,
  RefreshCw,
  Search,
  ChevronRight,
  ChevronDown,
  Layers,
  Sparkles,
  Bot,
  Send,
  HelpCircle,
  X,
  FileText,
  Check,
  Tag,
  Calendar,
  UserPlus,
  Users,
  Webhook,
  Activity,
  Filter,
  BarChart3,
  TrendingUp,
  Eye,
} from "lucide-react";
import api from "../../api/apiconfig";
import Loader from "../../utils/Loader";
import { toast } from "react-toastify";
import TemplateFlowCanvas from "./flowBuilder/TemplateFlowCanvas";

// Instant Blueprints
const PRESET_BLUEPRINTS = [
  {
    id: "metro",
    title: "Chennai Metro WhatsApp Bot",
    badge: "Public Transit & Booking",
    desc: "Language selection ➔ Multi-language welcome ➔ Ticket booking options ➔ Confirmation QR template.",
    triggerKeyword: "HI, METRO, TICKET",
    stepsCount: 4,
    sampleJourney: ["Language Picker", "Welcome & Options", "Ticket Booking", "QR Confirmation"],
  },
  {
    id: "restaurant",
    title: "Restaurant Menu & Table Bot",
    badge: "Dining & Hospitality",
    desc: "Welcome greetings ➔ View Menu / Reserve Table ➔ Table Options ➔ Instant Table Confirmation.",
    triggerKeyword: "BOOK, TABLE, MENU",
    stepsCount: 4,
    sampleJourney: ["Welcome Concierge", "Table Options / Menu", "Booking Confirmed"],
  },
  {
    id: "blank",
    title: "Custom Template Flow",
    badge: "Blank Canvas",
    desc: "Build any custom conversational flow by visually chaining pre-approved WhatsApp templates and quick reply buttons.",
    triggerKeyword: "HI, START",
    stepsCount: 2,
    sampleJourney: ["Trigger Node", "Template Node", "+ Connect Any Template"],
  },
];

const AdvancedTemplateAutomation = () => {
  const [automations, setAutomations] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncingTemplates, setSyncingTemplates] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Visual Flow Builder Canvas View State
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [currentEditingAutomation, setCurrentEditingAutomation] = useState(null);

  // Individual Analytics State
  const [analyticsModalAutomation, setAnalyticsModalAutomation] = useState(null);
  const [executions, setExecutions] = useState([]);
  const [loadingExecutions, setLoadingExecutions] = useState(false);

  // Load Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [autoRes, tempRes] = await Promise.all([
        api.get("/api/retention-automations").catch(() => ({ data: { data: [] } })),
        api.get("/api/integrationManagement/whatsapp/custom-templates").catch(() => ({ data: { data: [] } })),
      ]);

      if (autoRes.data?.data) {
        // FILTER: Only show actual Advanced Template Automations created in this module!
        const advancedAutomations = autoRes.data.data.filter(
          (a) => a.journeyType === "advanced_template" || a.flowGraph?.nodes?.length > 0
        );
        setAutomations(advancedAutomations);
      }
      if (tempRes.data?.data) {
        setTemplates(tempRes.data.data);
      }
    } catch (err) {
      console.error("Error loading automation data:", err);
      toast.error("Failed to load automation data");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAnalytics = async (auto) => {
    setAnalyticsModalAutomation(auto);
    try {
      setLoadingExecutions(true);
      const res = await api.get(`/api/retention-automations/${auto._id}/executions`);
      if (res.data?.status) {
        setExecutions(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load executions:", err);
      toast.error("Could not fetch execution history");
    } finally {
      setLoadingExecutions(false);
    }
  };

  const handleRefreshExecutions = async () => {
    if (!analyticsModalAutomation) return;
    try {
      setLoadingExecutions(true);
      const res = await api.get(`/api/retention-automations/${analyticsModalAutomation._id}/executions`);
      if (res.data?.status) {
        setExecutions(res.data.data || []);
      }
      // Also refresh automation object
      const autoRes = await api.get("/api/retention-automations");
      if (autoRes.data?.data) {
        const updated = autoRes.data.data.find((a) => a._id === analyticsModalAutomation._id);
        if (updated) setAnalyticsModalAutomation(updated);
      }
    } catch (err) {
      console.error("Refresh executions error:", err);
    } finally {
      setLoadingExecutions(false);
    }
  };

  const syncTemplatesFromMeta = async () => {
    try {
      setSyncingTemplates(true);
      const res = await api.post("/api/integrationManagement/whatsapp/custom-templates/sync");
      if (res.data?.status) {
        setTemplates(res.data.data);
        toast.success("Templates synchronized with latest Meta status!");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Sync failed");
    } finally {
      setSyncingTemplates(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Launch Canvas with a blueprint or existing automation
  const handleCreateNew = (presetId = "metro") => {
    setCurrentEditingAutomation({
      presetId,
      name:
        presetId === "metro"
          ? "Chennai Metro WhatsApp Bot"
          : presetId === "restaurant"
          ? "Restaurant Menu & Table Bot"
          : "New Template Automation",
      status: "draft",
      journeyType: "advanced_template",
    });
    setIsCanvasOpen(true);
  };

  const handleEdit = (auto) => {
    setCurrentEditingAutomation(JSON.parse(JSON.stringify(auto)));
    setIsCanvasOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Automation?")) return;
    try {
      await api.delete(`/api/retention-automations/${id}`);
      setAutomations((prev) => prev.filter((a) => a._id !== id));
      toast.success("Automation deleted");
    } catch (err) {
      toast.error("Failed to delete automation");
    }
  };

  const handleToggleStatus = async (auto) => {
    const nextStatus = auto.status === "active" ? "paused" : "active";

    // If attempting to activate, ensure all templates in this flow are approved by Meta
    if (nextStatus === "active") {
      const templateNodes = auto.flowGraph?.nodes?.filter((n) => n.type === "template") || [];
      const templateNamesToCheck =
        templateNodes.length > 0
          ? templateNodes.map((n) => n.data?.templateName).filter(Boolean)
          : [auto.actionConfig?.templateName].filter(Boolean);

      const unapproved = templateNamesToCheck.filter((name) => {
        const found = templates.find((t) => t.name === name || t._id === name);
        return !found || found.status !== "APPROVED";
      });

      if (unapproved.length > 0) {
        toast.warning(
          `Cannot activate: Template(s) "${unapproved.join(", ")}" are not yet approved by Meta. Keep as Draft until approved.`
        );
        return;
      }
    }

    try {
      const res = await api.patch(`/api/retention-automations/${auto._id}/status`, { status: nextStatus });
      if (res.data?.status) {
        setAutomations((prev) => prev.map((a) => (a._id === auto._id ? { ...a, status: nextStatus } : a)));
        toast.success(`Automation ${nextStatus === "active" ? "activated" : "paused"}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  // Save Canvas Automation
  const handleSaveFlowCanvas = async (payload, asActive = false) => {
    try {
      if (payload._id) {
        const res = await api.put(`/api/retention-automations/${payload._id}`, payload);
        if (res.data?.status) {
          toast.success(
            payload.status === "active"
              ? "Automation published and activated successfully!"
              : "Automation saved as Draft successfully!"
          );
          setIsCanvasOpen(false);
          fetchData();
        }
      } else {
        const res = await api.post("/api/retention-automations", payload);
        if (res.data?.status) {
          toast.success(
            payload.status === "active"
              ? "Advanced automation created and activated!"
              : "Advanced automation created as Draft!"
          );
          setIsCanvasOpen(false);
          fetchData();
        }
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.response?.data?.message || "Failed to save automation");
    }
  };

  // ─── Overlapping Keyword Detection ─────────────────────────────────────────
  // Finds pairs of ACTIVE automations that share the same trigger keyword.
  // These fire simultaneously on the same inbound message → customer receives
  // two bot replies at once.
  const overlappingKeywordWarnings = useMemo(() => {
    const active = automations.filter((a) => a.status === "active" && a.triggerConfig?.keyword);
    const warnings = [];
    for (let i = 0; i < active.length; i++) {
      const kwsA = active[i].triggerConfig.keyword.split(",").map((k) => k.trim().toLowerCase()).filter(Boolean);
      for (let j = i + 1; j < active.length; j++) {
        const kwsB = active[j].triggerConfig.keyword.split(",").map((k) => k.trim().toLowerCase()).filter(Boolean);
        const shared = kwsA.filter((k) => kwsB.includes(k));
        if (shared.length > 0) {
          warnings.push({
            automationA: active[i].name,
            automationB: active[j].name,
            sharedKeywords: shared.map((k) => k.toUpperCase()),
          });
        }
      }
    }
    return warnings;
  }, [automations]);

  // Metrics
  const stats = useMemo(() => {
    const total = automations.length;
    const active = automations.filter((a) => a.status === "active").length;
    const draft = automations.filter((a) => a.status === "draft").length;
    const totalSent = automations.reduce((acc, curr) => acc + (curr.analyticsSummary?.sent || 0), 0);
    const totalRead = automations.reduce((acc, curr) => acc + (curr.analyticsSummary?.read || 0), 0);
    const totalReplied = automations.reduce((acc, curr) => acc + (curr.analyticsSummary?.replied || 0), 0);
    const readRate = totalSent > 0 ? Math.round((totalRead / totalSent) * 100) : 0;
    const replyRate = totalSent > 0 ? Math.round((totalReplied / totalSent) * 100) : 0;

    return { total, active, draft, totalSent, readRate, replyRate };
  }, [automations]);

  // Filtered Automations
  const filteredAutomations = useMemo(() => {
    return automations.filter((a) => {
      const matchSearch =
        a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.triggerConfig?.keyword?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "all" || a.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [automations, searchTerm, statusFilter]);

  // If in Visual Canvas Mode, display the full ReactFlow Visual Flow Builder!
  if (isCanvasOpen) {
    return (
      <TemplateFlowCanvas
        initialAutomation={currentEditingAutomation}
        templates={templates}
        onSave={handleSaveFlowCanvas}
        onBack={() => {
          setIsCanvasOpen(false);
          setCurrentEditingAutomation(null);
        }}
        onSyncTemplates={syncTemplatesFromMeta}
        syncingTemplates={syncingTemplates}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#313166] to-[#4A4A8A] p-6 rounded-3xl text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-pink-200 flex items-center gap-1.5">
              <Sparkles size={13} className="text-pink-300" /> WhatsApp Template Automation Flow Builder
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Advanced Template Automation</h2>
          <p className="text-sm text-gray-200 mt-1 leading-relaxed">
            Visually connect Meta WhatsApp templates and quick-reply button branches on an interactive flow canvas (like the Chennai Metro bot) with real-time phone preview and Meta approval checks.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={syncTemplatesFromMeta}
            disabled={syncingTemplates}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-xs font-semibold transition-all border border-white/20 text-white disabled:opacity-50"
          >
            <RefreshCw size={15} className={syncingTemplates ? "animate-spin text-pink-300" : "text-pink-300"} />
            {syncingTemplates ? "Syncing Meta Status..." : "Sync Meta Templates"}
          </button>

          <button
            onClick={() => handleCreateNew("metro")}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#CB376D] hover:bg-[#b02c5c] rounded-xl text-xs font-bold text-white shadow-md transition-all transform active:scale-95"
          >
            <Plus size={16} />
            Launch Visual Flow Builder
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Journeys</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-[#313166]">{stats.total}</span>
            <Layers className="text-[#313166]/30 w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-emerald-600">{stats.active}</span>
            <Play className="text-emerald-500/30 w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Draft / Review</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-amber-500">{stats.draft}</span>
            <Clock className="text-amber-500/30 w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Messages Sent</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-[#313166]">{stats.totalSent}</span>
            <Send className="text-[#313166]/30 w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Read Rate</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-blue-600">{stats.readRate}%</span>
            <Eye className="text-blue-500/30 w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Reply / Click Rate</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-[#CB376D]">{stats.replyRate}%</span>
            <TrendingUp className="text-[#CB376D]/30 w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ─── Overlapping Keyword Warning Banner ──────────────────────────────── */}
      {overlappingKeywordWarnings.length > 0 && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 flex gap-3">
          <AlertCircle className="text-amber-500 w-5 h-5 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800 mb-1">
              ⚠️ Overlapping Trigger Keywords Detected
            </p>
            <p className="text-xs text-amber-700 mb-2">
              The following active automations share the same trigger keywords. When a customer sends one
              of these words, <strong>both automations will fire at the same time</strong>, sending two
              different messages simultaneously. Fix this by removing the shared keywords from one of the
              automations.
            </p>
            <ul className="space-y-1">
              {overlappingKeywordWarnings.map((w, i) => (
                <li key={i} className="text-xs text-amber-800 flex flex-wrap items-center gap-1">
                  <span className="font-semibold">"{w.automationA}"</span>
                  <span className="text-amber-600">and</span>
                  <span className="font-semibold">"{w.automationB}"</span>
                  <span className="text-amber-600">both trigger on:</span>
                  {w.sharedKeywords.map((kw) => (
                    <span key={kw} className="px-1.5 py-0.5 bg-amber-200 text-amber-900 rounded font-mono font-bold text-[10px]">
                      {kw}
                    </span>
                  ))}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Blueprints Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="text-[#313166] w-4 h-4" />
            <h3 className="text-sm font-bold text-[#313166]">Instant WhatsApp Template Blueprints</h3>
          </div>
          <span className="text-xs text-gray-400">Click a blueprint to open and edit directly in the Flow Builder</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRESET_BLUEPRINTS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => handleCreateNew(preset.id)}
              className="group p-5 bg-gradient-to-b from-gray-50 to-white hover:from-pink-50/40 hover:to-white border border-gray-200 hover:border-[#CB376D]/40 rounded-2xl cursor-pointer transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 bg-[#313166]/10 text-[#313166] text-[10px] font-bold rounded-full uppercase tracking-wider">
                    {preset.badge}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">{preset.stepsCount} Templates</span>
                </div>
                <h4 className="font-bold text-[#313166] group-hover:text-[#CB376D] transition-colors">{preset.title}</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{preset.desc}</p>

                <div className="flex items-center gap-1.5 mt-3 overflow-x-auto py-1">
                  {preset.sampleJourney.map((step, sIdx) => (
                    <React.Fragment key={sIdx}>
                      <span className="px-2 py-0.5 bg-white border border-gray-200 text-[10px] font-medium text-gray-600 rounded-md whitespace-nowrap shadow-2xs">
                        {step}
                      </span>
                      {sIdx < preset.sampleJourney.length - 1 && <ArrowRight size={10} className="text-gray-400 shrink-0" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#CB376D]">
                <span>Open in Visual Flow Builder</span>
                <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Automations Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search automations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#313166]/20 focus:border-[#313166]"
            />
          </div>

          <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-medium">
            {["all", "active", "draft", "paused"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                  statusFilter === st ? "bg-white text-[#313166] shadow-xs font-bold" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader />
          </div>
        ) : filteredAutomations.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl">
            <Bot className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-gray-600">No Advanced Template Automations Yet</h4>
            <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
              Launch the Visual Flow Builder to create your first multi-template WhatsApp journey.
            </p>
            <button
              onClick={() => handleCreateNew("metro")}
              className="mt-4 px-4 py-2 bg-[#313166] text-white text-xs font-bold rounded-xl hover:bg-[#252550] transition-colors"
            >
              Open Flow Builder
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAutomations.map((auto) => (
              <div
                key={auto._id}
                className="p-5 border border-gray-100 hover:border-gray-200 rounded-2xl bg-white transition-all shadow-xs hover:shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-[#313166] text-base">{auto.name}</h4>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 ${
                        auto.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : auto.status === "paused"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {auto.status === "active" ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                      {auto.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-700 rounded-lg border border-gray-100 font-medium">
                      <Tag size={12} className="text-emerald-600" />
                      Trigger: <strong className="text-gray-900">{auto.triggerConfig?.keyword || "Keyword Match"}</strong>
                    </span>

                    <ArrowRight size={12} className="text-gray-300" />

                    <span className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg border border-purple-100 font-medium">
                      <FileText size={12} className="text-purple-600" />
                      Step 1: {auto.actionConfig?.templateName || "Initial Template"}
                    </span>

                    {auto.flowGraph?.nodes?.length > 2 && (
                      <>
                        <ArrowRight size={12} className="text-gray-300" />
                        <span className="flex items-center gap-1 px-2.5 py-1 bg-pink-50 text-pink-700 rounded-lg border border-pink-100 font-medium">
                          <GitFork size={12} className="text-[#CB376D]" />
                          {auto.flowGraph.nodes.length} Template Nodes
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-100">
                  <div className="flex items-center gap-4 text-xs text-gray-500 pr-2">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase">Sent</p>
                      <p className="font-bold text-[#313166]">{auto.analyticsSummary?.sent || 0}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase">Read</p>
                      <p className="font-bold text-blue-600">{auto.analyticsSummary?.read || 0}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase">Replied</p>
                      <p className="font-bold text-[#CB376D]">{auto.analyticsSummary?.replied || 0}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenAnalytics(auto)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-pink-50 hover:bg-pink-100 text-[#CB376D] rounded-xl text-xs font-semibold transition-colors border border-pink-100 shadow-xs"
                      title="View Detailed Analytics & Performance"
                    >
                      <BarChart3 size={14} />
                      <span>Analytics</span>
                    </button>

                    <button
                      onClick={() => handleToggleStatus(auto)}
                      className={`p-2 rounded-xl border transition-all ${
                        auto.status === "active"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                          : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                      title={auto.status === "active" ? "Pause Automation" : "Activate Automation"}
                    >
                      {auto.status === "active" ? <Pause size={15} /> : <Play size={15} />}
                    </button>

                    <button
                      onClick={() => handleEdit(auto)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-[#313166] hover:bg-[#252550] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                      title="Edit Flow in Visual Canvas"
                    >
                      <GitFork size={13} />
                      Open Flow Builder
                    </button>

                    <button
                      onClick={() => handleDelete(auto._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="Delete Automation"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Individual Journey Analytics & Execution Modal */}
      {analyticsModalAutomation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-[#313166] to-[#4A4A8A] text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-wider text-pink-200">
                    Journey Performance Analytics
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      analyticsModalAutomation.status === "active"
                        ? "bg-emerald-500/30 text-emerald-200 border border-emerald-400/40"
                        : "bg-amber-500/30 text-amber-200 border border-amber-400/40"
                    }`}
                  >
                    {analyticsModalAutomation.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold mt-1">{analyticsModalAutomation.name}</h3>
                <p className="text-xs text-gray-200 mt-0.5">
                  Trigger: <strong className="text-white">{analyticsModalAutomation.triggerConfig?.keyword || "Keyword Match"}</strong> • {analyticsModalAutomation.flowGraph?.nodes?.length || 0} Flow Nodes
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefreshExecutions}
                  disabled={loadingExecutions}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
                  title="Refresh Live Execution Data"
                >
                  <RefreshCw size={14} className={loadingExecutions ? "animate-spin" : ""} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                <button
                  onClick={() => {
                    setAnalyticsModalAutomation(null);
                    setExecutions([]);
                  }}
                  className="p-2 hover:bg-white/10 rounded-xl text-white/80 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Funnel KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Sent</p>
                  <p className="text-2xl font-black text-[#313166] mt-1">{analyticsModalAutomation.analyticsSummary?.sent || 0}</p>
                  <span className="text-[10px] text-gray-500 mt-1 block">Triggered Executions</span>
                </div>

                <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Delivered</p>
                  <p className="text-2xl font-black text-blue-700 mt-1">{analyticsModalAutomation.analyticsSummary?.delivered || 0}</p>
                  <span className="text-[10px] text-blue-600 font-semibold mt-1 block">
                    {analyticsModalAutomation.analyticsSummary?.sent > 0
                      ? Math.round(((analyticsModalAutomation.analyticsSummary?.delivered || 0) / analyticsModalAutomation.analyticsSummary.sent) * 100)
                      : 0}
                    % Delivery Rate
                  </span>
                </div>

                <div className="p-4 bg-purple-50/60 border border-purple-100 rounded-2xl">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-purple-500">Read</p>
                  <p className="text-2xl font-black text-purple-700 mt-1">{analyticsModalAutomation.analyticsSummary?.read || 0}</p>
                  <span className="text-[10px] text-purple-600 font-semibold mt-1 block">
                    {analyticsModalAutomation.analyticsSummary?.sent > 0
                      ? Math.round(((analyticsModalAutomation.analyticsSummary?.read || 0) / analyticsModalAutomation.analyticsSummary.sent) * 100)
                      : 0}
                    % Read Rate
                  </span>
                </div>

                <div className="p-4 bg-pink-50/60 border border-pink-100 rounded-2xl">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-pink-500">Replied / Clicked</p>
                  <p className="text-2xl font-black text-[#CB376D] mt-1">{analyticsModalAutomation.analyticsSummary?.replied || 0}</p>
                  <span className="text-[10px] text-[#CB376D] font-semibold mt-1 block">
                    {analyticsModalAutomation.analyticsSummary?.sent > 0
                      ? Math.round(((analyticsModalAutomation.analyticsSummary?.replied || 0) / analyticsModalAutomation.analyticsSummary.sent) * 100)
                      : 0}
                    % Reply Rate
                  </span>
                </div>

                <div className="p-4 bg-red-50/60 border border-red-100 rounded-2xl">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-red-500">Failed</p>
                  <p className="text-2xl font-black text-red-600 mt-1">{analyticsModalAutomation.analyticsSummary?.failed || 0}</p>
                  <span className="text-[10px] text-red-500 mt-1 block">Delivery Failures</span>
                </div>
              </div>

              {/* Real-time Customer Execution Activity Log */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#313166] flex items-center gap-2">
                    <Activity size={16} className="text-[#CB376D]" />
                    <span>Real-time Inbound & Outbound Execution Log</span>
                  </h4>
                  <span className="text-xs text-gray-400">
                    {executions.length} recorded events
                  </span>
                </div>

                {loadingExecutions ? (
                  <div className="py-12 flex justify-center">
                    <Loader />
                  </div>
                ) : executions.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                    <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-gray-500">No execution activity logged yet</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      When customers send trigger keywords or click interactive buttons, events will appear here in real-time.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-gray-100 rounded-2xl shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3">Customer</th>
                          <th className="px-4 py-3">Trigger / Button</th>
                          <th className="px-4 py-3">Template Sent</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {executions.map((exec) => {
                          const cust = exec.customerId || {};
                          const phone = cust.mobileNumber ? `${cust.countryCode || ""}${cust.mobileNumber}` : "WhatsApp User";
                          const name = `${cust.firstname || ""} ${cust.lastname || ""}`.trim() || phone;
                          const triggerText = exec.triggerSnapshot?.messageContent || exec.triggerSnapshot?.keyword || "Inbound";
                          const templateName = exec.templateUsed?.name || exec.triggerSnapshot?.targetTemplateName || analyticsModalAutomation.actionConfig?.templateName || "Template Step";
                          const status = exec.sendResult || "sent";

                          return (
                            <tr key={exec._id} className="hover:bg-gray-50/70 transition-colors">
                              <td className="px-4 py-3">
                                <p className="font-bold text-[#313166]">{name}</p>
                                <p className="text-[10px] text-gray-400">{phone}</p>
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-block px-2 py-0.5 bg-gray-100 rounded-md font-mono text-[11px] text-gray-800">
                                  {triggerText}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center gap-1 text-purple-700 font-medium">
                                  <FileText size={12} />
                                  {templateName}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    status === "replied"
                                      ? "bg-pink-100 text-[#CB376D]"
                                      : status === "read"
                                      ? "bg-purple-100 text-purple-700"
                                      : status === "delivered"
                                      ? "bg-blue-100 text-blue-700"
                                      : status === "failed"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-emerald-100 text-emerald-700"
                                  }`}
                                >
                                  {status === "replied" ? (
                                    <TrendingUp size={10} />
                                  ) : status === "read" ? (
                                    <Eye size={10} />
                                  ) : status === "failed" ? (
                                    <AlertCircle size={10} />
                                  ) : (
                                    <CheckCircle2 size={10} />
                                  )}
                                  {status}
                                </span>
                                {exec.failureReason && (
                                  <p className="text-[10px] text-red-500 mt-0.5 max-w-xs truncate" title={exec.failureReason}>
                                    {exec.failureReason}
                                  </p>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right text-gray-400 whitespace-nowrap text-[11px]">
                                {new Date(exec.runAt || exec.createdAt).toLocaleString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => {
                  const autoToEdit = analyticsModalAutomation;
                  setAnalyticsModalAutomation(null);
                  handleEdit(autoToEdit);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#313166] text-white rounded-xl text-xs font-bold hover:bg-[#252550] transition-colors"
              >
                <GitFork size={14} />
                <span>Open in Flow Builder</span>
              </button>

              <button
                onClick={() => {
                  setAnalyticsModalAutomation(null);
                  setExecutions([]);
                }}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-xl text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedTemplateAutomation;
