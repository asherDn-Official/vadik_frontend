import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Save,
  Plus,
  Play,
  RotateCcw,
  Sparkles,
  Smartphone,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Tag,
  Zap,
  Trash2,
  Edit3,
  Layers,
  ArrowLeft,
  X,
  Send,
  RefreshCw,
  Search,
  ChevronRight,
  CornerDownRight,
  Check,
  Bot,
  UploadCloud,
  ExternalLink,
  XCircle,
  HelpCircle,
  PauseCircle,
  Image,
  Video,
  File,
} from "lucide-react";
import TriggerNode from "./TriggerNode";
import TemplateNode from "./TemplateNode";
import ActionNode from "./ActionNode";
import LabeledEdge from "./LabeledEdge";
import TemplateBuilder from "../TemplateBuilder";
import { renderWhatsAppFormattedText } from "../../../utils/whatsappTextFormatter";
import { toast } from "react-toastify";
import api from "../../../api/apiconfig";

const nodeTypes = {
  trigger: TriggerNode,
  template: TemplateNode,
  action: ActionNode,
};

const edgeTypes = {
  labeled: LabeledEdge,
};

const defaultEdgeOptions = {
  animated: true,
  type: "labeled",
  style: { stroke: "#CB376D", strokeWidth: 2.5 },
};

// Pure WhatsApp Template Starter Blueprints
const BUILDER_PRESETS = {
  general: {
    name: "General Customer Assistant Bot",
    nodes: [
      {
        id: "node_trigger",
        type: "trigger",
        position: { x: 50, y: 180 },
        data: {
          triggerType: "whatsapp_keyword",
          keyword: "HI, HELLO, MENU, START, HELP",
        },
      },
      {
        id: "node_welcome",
        type: "template",
        position: { x: 380, y: 150 },
        data: {
          templateName: "general_welcome_greeting",
          status: "NOT_IN_ACCOUNT",
          language: "en_US",
          bodyText: "Hello! Welcome to our automated WhatsApp service 👋\n\nHow can we help you today? Please choose an option below 👇",
          buttons: [
            { text: "Our Services", type: "QUICK_REPLY" },
            { text: "Support & Help", type: "QUICK_REPLY" },
            { text: "Contact Info", type: "QUICK_REPLY" },
          ],
        },
      },
      {
        id: "node_services",
        type: "template",
        position: { x: 800, y: 30 },
        data: {
          templateName: "general_services_overview",
          status: "NOT_IN_ACCOUNT",
          language: "en_US",
          bodyText: "Here are the key services we offer:\n\n1. Product Inquiries & Orders\n2. Special Offers & Discounts\n3. Account Management\n\nChoose an option below to proceed:",
          buttons: [
            { text: "Special Offers", type: "QUICK_REPLY" },
            { text: "Talk to Agent", type: "QUICK_REPLY" },
          ],
        },
      },
      {
        id: "node_support",
        type: "template",
        position: { x: 800, y: 250 },
        data: {
          templateName: "general_customer_support",
          status: "NOT_IN_ACCOUNT",
          language: "en_US",
          bodyText: "Our support team is always here to assist you.\n\nPlease choose what you need help with:",
          buttons: [
            { text: "Order Status", type: "QUICK_REPLY" },
            { text: "Talk to Agent", type: "QUICK_REPLY" },
          ],
        },
      },
      {
        id: "node_contact",
        type: "template",
        position: { x: 800, y: 470 },
        data: {
          templateName: "general_contact_details",
          status: "NOT_IN_ACCOUNT",
          language: "en_US",
          bodyText: "You can connect with us directly:\n\n📞 Phone: +91 98765 43210\n📧 Email: support@yourstore.com\n⏰ Support Hours: Mon-Sat 9 AM - 7 PM\n\nFeel free to message anytime!",
          buttons: [
            { text: "Main Menu", type: "QUICK_REPLY" },
          ],
        },
      },
      {
        id: "node_agent_connect",
        type: "template",
        position: { x: 1240, y: 150 },
        data: {
          templateName: "general_agent_connected",
          status: "NOT_IN_ACCOUNT",
          language: "en_US",
          bodyText: "Thank you! An executive has been notified and will reply to you shortly.\n\nAverage response time: under 5 minutes.",
          buttons: [
            { text: "Main Menu", type: "QUICK_REPLY" },
          ],
        },
      },
    ],
    edges: [
      {
        id: "e_trig_welc",
        source: "node_trigger",
        target: "node_welcome",
        sourceHandle: "default",
        targetHandle: "input",
        type: "labeled",
        data: { label: "Inbound 'Hi'" },
      },
      {
        id: "e_welc_services",
        source: "node_welcome",
        target: "node_services",
        sourceHandle: "btn_0",
        targetHandle: "input",
        type: "labeled",
        data: { label: "Our Services" },
      },
      {
        id: "e_welc_support",
        source: "node_welcome",
        target: "node_support",
        sourceHandle: "btn_1",
        targetHandle: "input",
        type: "labeled",
        data: { label: "Support & Help" },
      },
      {
        id: "e_welc_contact",
        source: "node_welcome",
        target: "node_contact",
        sourceHandle: "btn_2",
        targetHandle: "input",
        type: "labeled",
        data: { label: "Contact Info" },
      },
      {
        id: "e_serv_agent",
        source: "node_services",
        target: "node_agent_connect",
        sourceHandle: "btn_1",
        targetHandle: "input",
        type: "labeled",
        data: { label: "Talk to Agent" },
      },
      {
        id: "e_supp_agent",
        source: "node_support",
        target: "node_agent_connect",
        sourceHandle: "btn_1",
        targetHandle: "input",
        type: "labeled",
        data: { label: "Talk to Agent" },
      },
    ],
  },
  restaurant: {
    name: "Restaurant Menu & Table Bot",
    nodes: [
      {
        id: "node_trigger",
        type: "trigger",
        position: { x: 50, y: 150 },
        data: { triggerType: "whatsapp_keyword", keyword: "BOOK, TABLE, MENU, HI" },
      },
      {
        id: "node_welcome",
        type: "template",
        position: { x: 380, y: 120 },
        data: {
          templateName: "restaurant_welcome_menu",
          status: "NOT_IN_ACCOUNT",
          language: "en_US",
          bodyText: "Welcome to The Gourmet Bistro.\n\nHow can we help you today? Please choose an option below.",
          buttons: [
            { text: "Book Table", type: "QUICK_REPLY" },
            { text: "View Menu", type: "QUICK_REPLY" },
          ],
        },
      },
      {
        id: "node_table_booking",
        type: "template",
        position: { x: 800, y: 40 },
        data: {
          templateName: "restaurant_table_options",
          status: "NOT_IN_ACCOUNT",
          language: "en_US",
          bodyText: "Table Reservation:\n\nPlease select your preferred dining time slot.",
          buttons: [
            { text: "Tonight 7:30 PM", type: "QUICK_REPLY" },
            { text: "Tomorrow 8:00 PM", type: "QUICK_REPLY" },
          ],
        },
      },
      {
        id: "node_menu_card",
        type: "template",
        position: { x: 800, y: 240 },
        data: {
          templateName: "restaurant_menu_details",
          status: "NOT_IN_ACCOUNT",
          language: "en_US",
          bodyText: "Our Chef's Specials Menu:\n\n1. Woodfired Truffle Pizza\n2. Smoked Salmon Risotto\n3. Tiramisu Classico\n\nWould you like to reserve a table now?",
          buttons: [
            { text: "Reserve Table", type: "QUICK_REPLY" },
          ],
        },
      },
      {
        id: "node_booking_confirm",
        type: "template",
        position: { x: 1220, y: 100 },
        data: {
          templateName: "restaurant_booking_confirmed",
          status: "NOT_IN_ACCOUNT",
          language: "en_US",
          bodyText: "Table Reservation Confirmed:\n\nReservation ID: BISTRO-8921\nGuests: 2 Guests\nStatus: Confirmed\n\nWe look forward to welcoming you!",
          buttons: [{ text: "Get Directions", type: "QUICK_REPLY" }],
        },
      },
    ],
    edges: [
      { id: "e1", source: "node_trigger", target: "node_welcome", sourceHandle: "default", targetHandle: "input", type: "labeled", data: { label: "Inbound 'Hi'" } },
      { id: "e2", source: "node_welcome", target: "node_table_booking", sourceHandle: "btn_0", targetHandle: "input", type: "labeled", data: { label: "Book Table" } },
      { id: "e3", source: "node_welcome", target: "node_menu_card", sourceHandle: "btn_1", targetHandle: "input", type: "labeled", data: { label: "View Menu" } },
      { id: "e4", source: "node_table_booking", target: "node_booking_confirm", sourceHandle: "btn_0", targetHandle: "input", type: "labeled", data: { label: "Select 7:30 PM" } },
      { id: "e5", source: "node_menu_card", target: "node_booking_confirm", sourceHandle: "btn_0", targetHandle: "input", type: "labeled", data: { label: "Reserve Table" } },
    ],
  },
  blank: {
    name: "Custom Template Journey",
    nodes: [
      {
        id: "node_trigger",
        type: "trigger",
        position: { x: 100, y: 150 },
        data: { triggerType: "whatsapp_keyword", keyword: "HI, HELLO, START" },
      },
      {
        id: "node_template_1",
        type: "template",
        position: { x: 450, y: 120 },
        data: {
          templateName: "",
          status: "NOT_SELECTED",
          language: "en_US",
          bodyText: "",
          buttons: [],
          templateSelected: false,
        },
      },
    ],
    edges: [
      { id: "e_init", source: "node_trigger", target: "node_template_1", sourceHandle: "default", targetHandle: "input", type: "labeled", data: { label: "Inbound Message" } },
    ],
  },
};

let nodeCounter = 20;
const getNextNodeId = (prefix = "node") => `${prefix}_${Date.now()}_${nodeCounter++}`;

const TemplateFlowCanvasContent = ({
  initialAutomation,
  templates = [],
  existingAutomations = [],
  onSave,
  onBack,
  onSyncTemplates,
  syncingTemplates = false,
}) => {
  const reactFlowInstance = useReactFlow();

  // Graph State
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [automationName, setAutomationName] = useState(initialAutomation?.name || "WhatsApp Template Automation");
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // UI Panels
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [isTemplateBuilderOpen, setIsTemplateBuilderOpen] = useState(false);
  const [templateBuilderPrefill, setTemplateBuilderPrefill] = useState(null);
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);

  // Live WhatsApp Simulator State
  const [simMessages, setSimMessages] = useState([]);
  const [simUserInboundText, setSimUserInboundText] = useState("");

  // Live reference to nodes for stable callbacks
  const nodesRef = useRef(nodes);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  // Helper: check if a template exists in user's Meta account
  const findMetaTemplate = useCallback(
    (templateName) => {
      if (!templateName || typeof templateName !== "string") return null;
      const trimmed = templateName.trim().toLowerCase();
      return templates.find(
        (t) =>
          t.name?.toLowerCase() === trimmed ||
          t._id === templateName ||
          t.templateName?.toLowerCase() === trimmed
      );
    },
    [templates]
  );

  // Real-time overlapping keyword conflict computation across active automations
  const computeConflictsForKeyword = useCallback(
    (kwString) => {
      if (!kwString || typeof kwString !== "string" || !kwString.trim()) return [];
      const currentId = initialAutomation?._id;
      const typedKeywords = kwString
        .split(",")
        .map((k) => k.trim().toLowerCase())
        .filter(Boolean);

      const conflicts = [];
      const activeAutomations = (existingAutomations || []).filter(
        (a) => a.status === "active" && String(a._id) !== String(currentId) && a.triggerConfig?.keyword
      );

      for (const other of activeAutomations) {
        const otherKws = (other.triggerConfig.keyword || "")
          .split(",")
          .map((k) => k.trim().toLowerCase())
          .filter(Boolean);
        const overlapping = typedKeywords.filter((k) => otherKws.includes(k));
        if (overlapping.length > 0) {
          conflicts.push({
            automationName: other.name,
            overlappingKeywords: overlapping.map((k) => k.toUpperCase()),
          });
        }
      }
      return conflicts;
    },
    [existingAutomations, initialAutomation?._id]
  );

  const triggerNode = nodes.find((n) => n.type === "trigger");
  const currentTriggerKeyword = (selectedNode?.type === "trigger" ? selectedNode.data?.keyword : triggerNode?.data?.keyword) || "";

  const conflictingKeywordDetails = useMemo(() => {
    return computeConflictsForKeyword(currentTriggerKeyword);
  }, [computeConflictsForKeyword, currentTriggerKeyword]);

  // Synchronize node status and header media with Meta templates list
  const syncNodeStatusWithMeta = useCallback(
    (nodeList) => {
      return nodeList.map((n) => {
        if (n.type !== "template") return n;
        const tName = n.data?.templateName;
        if (!tName || tName.trim() === "" || n.data?.status === "NOT_SELECTED" || n.data?.templateSelected === false) {
          return {
            ...n,
            data: {
              ...n.data,
              status: "NOT_SELECTED",
              templateSelected: false,
            },
          };
        }
        const metaT = findMetaTemplate(tName);
        if (metaT) {
          const headerComp = metaT.components?.find((c) => c.type === "HEADER");
          const headerFormat = headerComp?.format?.toUpperCase() || (headerComp?.text ? "TEXT" : null);
          const isMediaHeader = ["IMAGE", "VIDEO", "DOCUMENT"].includes(headerFormat);
          const templateMediaUrl = headerComp?.mediaUrl || (Array.isArray(headerComp?.example?.header_handle) ? headerComp.example.header_handle[0] : null) || "";

          return {
            ...n,
            data: {
              ...n.data,
              status: metaT.status || "APPROVED",
              headerFormat: n.data?.headerFormat || headerFormat,
              headerMediaType: n.data?.headerMediaType || (isMediaHeader ? headerFormat : null),
              mediaUrl: n.data?.mediaUrl !== undefined && n.data?.mediaUrl !== "" ? n.data.mediaUrl : (templateMediaUrl || ""),
              headerText: n.data?.headerText || headerComp?.text || "",
              templateSelected: true,
            },
          };
        }
        // Named template but not found in Meta account
        return {
          ...n,
          data: {
            ...n.data,
            status: n.data?.status === "APPROVED" ? "NOT_IN_ACCOUNT" : (n.data?.status || "NOT_IN_ACCOUNT"),
            templateSelected: true,
          },
        };
      });
    },
    [findMetaTemplate]
  );

  // Header media file uploader
  const handleHeaderMediaUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadingMedia(true);
      const res = await api.post("/api/integrationManagement/whatsapp/media/upload", formData);
      if (res.data?.status && res.data?.url) {
        updateSelectedNodeData({
          mediaUrl: res.data.url,
        });
        toast.success("Header media uploaded successfully!");
      } else {
        toast.error(res.data?.message || "Failed to upload header media");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Media upload failed";
      toast.error(errorMsg);
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleDeleteEdge = useCallback((edgeId) => {
    setEdges((eds) => eds.filter((e) => e.id !== edgeId));
    toast.info("Route line removed");
  }, [setEdges]);

  // Attach interactive callbacks & default options to edges
  const enrichEdgesWithCallbacks = useCallback(
    (rawEdges) => {
      return (rawEdges || []).map((e) => ({
        ...e,
        type: "labeled",
        animated: true,
        data: {
          ...(e.data || {}),
          label: e.data?.label || "",
          onDelete: handleDeleteEdge,
        },
      }));
    },
    [handleDeleteEdge]
  );

  // Sprout / Quick Connect next node
  const handleSproutNode = useCallback((sourceId, sourceHandle, label = "Next Step") => {
    const currentNodes = nodesRef.current;
    const sourceNode = currentNodes.find((n) => n.id === sourceId);
    if (!sourceNode) return;

    const newId = getNextNodeId("template");
    const nextX = sourceNode.position.x + 380;
    const nextY = sourceNode.position.y + (sourceHandle?.startsWith("btn_") ? (parseInt(sourceHandle.replace("btn_", "")) * 140) - 40 : 0);

    const newNode = {
      id: newId,
      type: "template",
      position: { x: nextX, y: nextY },
      data: {
        templateName: "",
        status: "NOT_SELECTED",
        language: "en_US",
        bodyText: "",
        buttons: [],
        templateSelected: false,
        onAddNext: (h, l) => handleSproutNode(newId, h, l),
      },
    };

    const newEdge = {
      id: `e_${sourceId}_${newId}`,
      source: sourceId,
      target: newId,
      sourceHandle: sourceHandle || "default",
      targetHandle: "input",
      type: "labeled",
      animated: true,
      data: { label: label || "Next", onDelete: handleDeleteEdge },
    };

    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [...eds, newEdge]);
    setSelectedNode(newNode);
    setIsTemplatePickerOpen(true);
    toast.info(`Connected new step for "${label}". Select a template from your Meta account.`);
  }, [handleDeleteEdge]);

  // Attach interactive callbacks & sync status to node data
  const enrichNodesWithCallbacks = useCallback(
    (rawNodes) => {
      const synced = syncNodeStatusWithMeta(rawNodes);
      return synced.map((n) => {
        if (n.type === "trigger") {
          const kw = n.data?.keyword || "HI, HELLO, MENU, START, HELP";
          return {
            ...n,
            data: {
              ...n.data,
              keyword: kw,
              conflicts: computeConflictsForKeyword(kw),
              onAddNext: (handleId, label) => handleSproutNode(n.id, handleId, label),
            },
          };
        }
        return {
          ...n,
          data: {
            ...n.data,
            onAddNext: (handleId, label) => handleSproutNode(n.id, handleId, label),
          },
        };
      });
    },
    [syncNodeStatusWithMeta, computeConflictsForKeyword, handleSproutNode]
  );

  // Guard initialization so it only runs once per automation instance
  const initializedAutomationIdRef = useRef(null);

  useEffect(() => {
    const currentId = initialAutomation?._id || `new_${initialAutomation?.presetId || "general"}`;
    if (initializedAutomationIdRef.current === currentId) {
      return;
    }
    initializedAutomationIdRef.current = currentId;

    if (initialAutomation?.flowGraph?.nodes?.length) {
      setNodes(enrichNodesWithCallbacks(initialAutomation.flowGraph.nodes));
      setEdges(enrichEdgesWithCallbacks(initialAutomation.flowGraph.edges || []));
      setAutomationName(initialAutomation.name || "WhatsApp Template Automation");
    } else if (initialAutomation?.presetId && (BUILDER_PRESETS[initialAutomation.presetId] || initialAutomation.presetId === "metro")) {
      const p = BUILDER_PRESETS[initialAutomation.presetId] || BUILDER_PRESETS.general;
      setNodes(enrichNodesWithCallbacks(p.nodes));
      setEdges(enrichEdgesWithCallbacks(p.edges));
      setAutomationName(p.name);
    } else {
      const p = BUILDER_PRESETS.general;
      setNodes(enrichNodesWithCallbacks(p.nodes));
      setEdges(enrichEdgesWithCallbacks(p.edges));
      setAutomationName(initialAutomation?.name || p.name);
    }
  }, [initialAutomation, enrichNodesWithCallbacks, enrichEdgesWithCallbacks]);

  // When active automations list updates, refresh conflict data on trigger nodes without resetting canvas
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.type === "trigger") {
          const kw = n.data?.keyword || "";
          return {
            ...n,
            data: {
              ...n.data,
              conflicts: computeConflictsForKeyword(kw),
            },
          };
        }
        return n;
      })
    );
  }, [existingAutomations, computeConflictsForKeyword]);

  // When templates from Meta API update, re-sync node statuses
  useEffect(() => {
    setNodes((currentNodes) => syncNodeStatusWithMeta(currentNodes));
  }, [templates, syncNodeStatusWithMeta]);

  // Connect edges
  const onConnect = useCallback(
    (params) => {
      const sourceNode = nodes.find((n) => n.id === params.source);
      let label = "";
      if (sourceNode?.type === "template" && params.sourceHandle?.startsWith("btn_")) {
        const btnIdx = parseInt(params.sourceHandle.replace("btn_", ""), 10);
        label = sourceNode.data?.buttons?.[btnIdx]?.text || "Option";
      } else if (params.sourceHandle === "default") {
        label = "Next Template";
      }

      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "labeled",
            animated: true,
            data: { label, onDelete: handleDeleteEdge },
          },
          eds
        )
      );
    },
    [nodes, handleDeleteEdge]
  );

  // Node selection handler
  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Add Template Node
  const handleAddTemplateNode = () => {
    const newId = getNextNodeId("template");
    const centerPos = { x: 550 + Math.random() * 80, y: 180 + Math.random() * 80 };

    const newNode = {
      id: newId,
      type: "template",
      position: centerPos,
      data: {
        templateName: "",
        status: "NOT_SELECTED",
        language: "en_US",
        bodyText: "",
        buttons: [],
        templateSelected: false,
        onAddNext: (h, l) => handleSproutNode(newId, h, l),
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setSelectedNode(newNode);
    setIsTemplatePickerOpen(true);
    toast.info("Added new Template step. Select or create a WhatsApp template.");
  };

  const handleAddActionNode = () => {
    const newId = getNextNodeId("action");
    const centerPos = { x: 600, y: 300 };

    const newNode = {
      id: newId,
      type: "action",
      position: centerPos,
      data: {
        actionType: "tag",
        label: "Tag: VIP Customer",
        value: "tag_vip",
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setSelectedNode(newNode);
    toast.success("Added CRM Action Node");
  };

  const handleDeleteSelectedNode = () => {
    if (!selectedNode || selectedNode.type === "trigger") {
      toast.warning("Cannot delete the initial trigger entry node");
      return;
    }
    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
    setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
    setSelectedNode(null);
    toast.info("Node deleted from canvas");
  };

  // Update selected node data
  const updateSelectedNodeData = (updates) => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === selectedNode.id) {
          const updatedData = { ...n.data, ...updates };
          if (n.type === "trigger" && updates.keyword !== undefined) {
            updatedData.conflicts = computeConflictsForKeyword(updates.keyword);
          }
          setSelectedNode({ ...n, data: updatedData });
          return { ...n, data: updatedData };
        }
        return n;
      })
    );
  };

  // Deploy / Create this specific node's template to Meta
  const handleDeployNodeTemplateToMeta = (node) => {
    const nodeData = node?.data || {};
    const headerFormat = (nodeData.headerMediaType || nodeData.headerFormat || "").toUpperCase();
    const isMedia = ["IMAGE", "VIDEO", "DOCUMENT"].includes(headerFormat);

    const components = [];
    if (headerFormat) {
      if (isMedia) {
        components.push({
          type: "HEADER",
          format: headerFormat,
          mediaUrl: nodeData.mediaUrl || "",
          example: nodeData.mediaUrl ? { header_handle: [nodeData.mediaUrl] } : undefined,
        });
      } else if (headerFormat === "TEXT" || nodeData.headerText) {
        components.push({
          type: "HEADER",
          format: "TEXT",
          text: nodeData.headerText || "",
        });
      }
    }

    components.push({
      type: "BODY",
      text: nodeData.bodyText || "Hello! Please select an option.",
    });

    if (nodeData.buttons?.length) {
      components.push({
        type: "BUTTONS",
        buttons: nodeData.buttons.map((b) => ({
          type: b.type || "QUICK_REPLY",
          text: b.text || b.label || "Option",
        })),
      });
    }

    const prefill = {
      name: (nodeData.templateName || "custom_flow_template").toLowerCase().replace(/[^a-z0-9_]/g, "_"),
      category: "MARKETING",
      language: nodeData.language || "en_US",
      components,
    };

    setTemplateBuilderPrefill(prefill);
    setIsTemplateBuilderOpen(true);
  };

  // Load Preset Blueprint into Canvas
  const loadPreset = (presetKey) => {
    const p = BUILDER_PRESETS[presetKey];
    if (!p) return;
    setNodes(enrichNodesWithCallbacks(p.nodes));
    setEdges(enrichEdgesWithCallbacks(p.edges));
    setAutomationName(p.name);
    setSelectedNode(null);
    initSimulator(p.nodes, p.edges);
    toast.success(`Loaded blueprint: ${p.name}`);
  };

  // Template Audit across all template nodes in the canvas
  const templateAudit = useMemo(() => {
    const templateNodes = nodes.filter((n) => n.type === "template");
    const list = templateNodes.map((n) => {
      const templateName = n.data?.templateName;
      const isSelected = Boolean(templateName && n.data?.status !== "NOT_SELECTED" && n.data?.templateSelected !== false);
      const metaT = findMetaTemplate(templateName);
      const existsInAccount = !!metaT;

      let status = "NOT_SELECTED";
      if (isSelected) {
        status = metaT ? metaT.status : (n.data?.status || "NOT_IN_ACCOUNT");
      }

      const rawStatusUpper = (status || "").toUpperCase();
      const approved = isSelected && rawStatusUpper === "APPROVED";
      const inProgress = isSelected && ["PENDING", "IN_PROGRESS", "INPROGRESS", "SUBMITTED", "IN_APPEAL"].includes(rawStatusUpper);
      const rejected = isSelected && rawStatusUpper === "REJECTED";
      const notInAccount = isSelected && rawStatusUpper === "NOT_IN_ACCOUNT";
      const notSelected = !isSelected || status === "NOT_SELECTED";

      return {
        nodeId: n.id,
        name: templateName || "Unselected Step",
        existsInAccount,
        status,
        isSelected,
        approved,
        inProgress,
        rejected,
        notInAccount,
        notSelected,
      };
    });

    const approvedCount = list.filter((t) => t.approved).length;
    const inProgressCount = list.filter((t) => t.inProgress).length;
    const rejectedCount = list.filter((t) => t.rejected).length;
    const notInAccountCount = list.filter((t) => t.notInAccount).length;
    const notSelectedCount = list.filter((t) => t.notSelected).length;
    const allApproved = list.length > 0 && approvedCount === list.length;
    const pendingOrMissing = list.filter((t) => !t.approved);

    return {
      total: list.length,
      approvedCount,
      inProgressCount,
      rejectedCount,
      notInAccountCount,
      notSelectedCount,
      allApproved,
      pendingOrMissing,
      list,
    };
  }, [nodes, findMetaTemplate]);

  // ================= SIMULATOR LOGIC =================
  const initSimulator = useCallback((currentNodes = nodes, currentEdges = edges) => {
    const triggerNode = currentNodes.find((n) => n.type === "trigger");
    const firstEdge = currentEdges.find((e) => e.source === triggerNode?.id);
    const rootTemplateNode = currentNodes.find((n) => n.id === firstEdge?.target);

    const userMsg = {
      id: "sim_u_1",
      sender: "user",
      text: triggerNode?.data?.keyword?.split(",")?.[0]?.trim() || "Hi",
      time: "Just now",
    };

    let initialMessages = [userMsg];

    if (rootTemplateNode) {
      const isUnselected = !rootTemplateNode.data?.templateName || rootTemplateNode.data?.status === "NOT_SELECTED";
      const botMsg = {
        id: "sim_b_1",
        sender: "bot",
        nodeId: rootTemplateNode.id,
        templateName: rootTemplateNode.data?.templateName || "Step 1 Template",
        headerMediaType: rootTemplateNode.data?.headerMediaType || rootTemplateNode.data?.headerFormat || null,
        mediaUrl: rootTemplateNode.data?.mediaUrl || null,
        bodyText: isUnselected
          ? "⚠️ No template selected for this step yet. Click the template node to attach one."
          : rootTemplateNode.data?.bodyText || "Welcome! Please choose an option:",
        buttons: rootTemplateNode.data?.buttons || [],
        time: "Just now",
      };
      initialMessages.push(botMsg);
    }

    setSimMessages(initialMessages);
  }, [nodes, edges]);

  useEffect(() => {
    if (nodes.length > 0) {
      initSimulator(nodes, edges);
    }
  }, [initSimulator]);

  const handleSimButtonClick = (btnIndex, btnText, sourceNodeId) => {
    const userClickMsg = {
      id: `sim_u_${Date.now()}`,
      sender: "user",
      text: btnText,
      time: "Just now",
    };

    // Find matching edge from that button handle
    const targetEdge = edges.find(
      (e) => e.source === sourceNodeId && (e.sourceHandle === `btn_${btnIndex}` || e.sourceHandle === "default")
    );

    if (targetEdge) {
      const targetNode = nodes.find((n) => n.id === targetEdge.target);

      if (targetNode?.type === "template") {
        const isUnselected = !targetNode.data?.templateName || targetNode.data?.status === "NOT_SELECTED";
        const botReplyMsg = {
          id: `sim_b_${Date.now()}`,
          sender: "bot",
          nodeId: targetNode.id,
          templateName: targetNode.data?.templateName || "Follow-up Template",
          headerMediaType: targetNode.data?.headerMediaType || targetNode.data?.headerFormat || null,
          mediaUrl: targetNode.data?.mediaUrl || null,
          bodyText: isUnselected
            ? "⚠️ No template message attached to this step."
            : targetNode.data?.bodyText || "Proceeding...",
          buttons: targetNode.data?.buttons || [],
          time: "Just now",
        };
        setSimMessages((prev) => [...prev, userClickMsg, botReplyMsg]);
      } else {
        const actionMsg = {
          id: `sim_a_${Date.now()}`,
          sender: "system",
          text: `⚡ Action Executed: ${targetNode?.data?.label || "Tag Customer"}`,
          time: "Just now",
        };
        setSimMessages((prev) => [...prev, userClickMsg, actionMsg]);
      }
    } else {
      const fallbackMsg = {
        id: `sim_f_${Date.now()}`,
        sender: "bot",
        text: `✅ Selected: *${btnText}*\n(No follow-up template connected to this button on canvas)`,
        time: "Just now",
      };
      setSimMessages((prev) => [...prev, userClickMsg, fallbackMsg]);
    }
  };

  // Save Automation Handler (Seamless Draft anytime, guarded Active publish)
  const handleSave = (asActive = false) => {
    if (!automationName.trim()) {
      toast.error("Please enter a name for this automation");
      return;
    }

    let willBeActive = asActive;
    if (asActive) {
      if (templateAudit.notSelectedCount > 0) {
        toast.warning(
          "Cannot publish as Active: One or more steps have no template selected. Saved as Draft."
        );
        willBeActive = false;
      } else if (!templateAudit.allApproved) {
        const unapprovedNames = templateAudit.pendingOrMissing
          .map((t) => t.name)
          .filter(Boolean)
          .join(", ") || "templates";
        toast.warning(
          `Cannot publish as Active: Template(s) "${unapprovedNames}" are not yet approved by Meta. Saved as Draft. You can continue editing or activate once Meta approves all templates.`
        );
        willBeActive = false;
      } else if (conflictingKeywordDetails.length > 0) {
        const confSummary = conflictingKeywordDetails
          .map((c) => `"${c.overlappingKeywords.join(", ")}" (used in "${c.automationName}")`)
          .join("; ");
        toast.warning(
          `Cannot publish as Active: Overlapping trigger keyword ${confSummary}. Saved as Draft to prevent sending duplicate bot replies.`
        );
        willBeActive = false;
      }
    }

    const triggerNode = nodes.find((n) => n.type === "trigger");
    const rootTemplateNode = nodes.find((n) => n.type === "template");
    const rootTemplateName = rootTemplateNode?.data?.templateName || "";
    const matchedRootTemplate = templates.find((t) => t.name === rootTemplateName || t._id === rootTemplateName);

    const payload = {
      ...initialAutomation,
      name: automationName,
      status: willBeActive ? "active" : "draft",
      journeyType: "advanced_template",
      triggerType: triggerNode?.data?.triggerType || "whatsapp_keyword",
      triggerConfig: {
        keyword: triggerNode?.data?.keyword || "HI, MENU, BOOK",
      },
      actionConfig: {
        actionType: "template",
        templateId: matchedRootTemplate?._id || null,
        templateName: rootTemplateName,
        languageCode: rootTemplateNode?.data?.language || "en_US",
        mediaUrl: rootTemplateNode?.data?.mediaUrl || null,
        mediaType: rootTemplateNode?.data?.headerMediaType || rootTemplateNode?.data?.headerFormat || null,
        variableMappings: rootTemplateNode?.data?.variableMappings || [],
      },
      flowGraph: {
        nodes,
        edges: edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle,
          targetHandle: e.targetHandle,
          type: e.type || "labeled",
          animated: e.animated !== undefined ? e.animated : true,
          data: {
            label: e.data?.label || "",
          },
        })),
      },
    };

    onSave(payload, willBeActive);
  };

  // Selected node meta check
  const selectedNodeMeta = useMemo(() => {
    if (!selectedNode || selectedNode.type !== "template") return null;
    const templateName = selectedNode.data?.templateName;
    const isSelected = Boolean(templateName && selectedNode.data?.status !== "NOT_SELECTED" && selectedNode.data?.templateSelected !== false);
    
    if (!isSelected) {
      return {
        metaT: null,
        exists: false,
        status: "NOT_SELECTED",
        isSelected: false,
      };
    }

    const metaT = findMetaTemplate(templateName);
    return {
      metaT,
      exists: !!metaT,
      status: metaT ? metaT.status : (selectedNode.data?.status || "NOT_IN_ACCOUNT"),
      isSelected: true,
    };
  }, [selectedNode, findMetaTemplate]);

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl relative">
      {/* Top Action Bar */}
      <div className="px-5 py-3 bg-[#1e1e38] border-b border-gray-800 flex flex-wrap items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-xl text-gray-300 transition-colors"
            title="Back to Automations List"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <input
              type="text"
              value={automationName}
              onChange={(e) => setAutomationName(e.target.value)}
              placeholder="Automation Flow Name..."
              className="bg-transparent border-b border-transparent hover:border-gray-500 focus:border-[#CB376D] text-white font-bold text-base focus:outline-none px-1"
            />
            <div className="flex items-center gap-2 mt-0.5">
              <span className="px-2 py-0.2 bg-[#CB376D]/20 text-[#CB376D] text-[10px] font-bold rounded-full uppercase">
                WhatsApp Template Flow Builder
              </span>
              <span className="text-[10px] text-gray-400">
                {nodes.length} Flow Nodes • {edges.length} Button Wires
              </span>
            </div>
          </div>
        </div>

        {/* Center: Meta Status Indicator */}
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
              templateAudit.total === 0
                ? "bg-gray-800 border-gray-700 text-gray-300"
                : templateAudit.allApproved
                ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-400"
                : templateAudit.notSelectedCount > 0
                ? "bg-slate-800/80 border-slate-600 text-slate-300"
                : templateAudit.inProgressCount > 0
                ? "bg-amber-950/60 border-amber-500/40 text-amber-400"
                : "bg-red-950/60 border-red-500/40 text-red-400"
            }`}
          >
            {templateAudit.allApproved ? (
              <CheckCircle2 size={13} className="text-emerald-400" />
            ) : templateAudit.inProgressCount > 0 ? (
              <Clock size={13} className="text-amber-400 animate-pulse" />
            ) : templateAudit.notSelectedCount > 0 ? (
              <HelpCircle size={13} className="text-slate-400" />
            ) : (
              <AlertCircle size={13} />
            )}
            <span>
              {templateAudit.total === 0
                ? "0 Template Steps"
                : templateAudit.allApproved
                ? `Meta Status: All ${templateAudit.approvedCount} Approved`
                : templateAudit.notSelectedCount > 0
                ? `${templateAudit.notSelectedCount} Not Selected • ${templateAudit.approvedCount}/${templateAudit.total} Approved`
                : templateAudit.inProgressCount > 0
                ? `${templateAudit.inProgressCount} In Progress • ${templateAudit.approvedCount}/${templateAudit.total} Approved`
                : `${templateAudit.approvedCount}/${templateAudit.total} Approved`}
            </span>
          </div>

          <button
            onClick={onSyncTemplates}
            disabled={syncingTemplates}
            className="p-1.5 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg text-xs transition-colors flex items-center gap-1"
            title="Sync latest status from Meta WhatsApp API"
          >
            <RefreshCw size={13} className={syncingTemplates ? "animate-spin text-pink-300" : ""} />
            <span className="text-[10px] font-medium hidden sm:inline">Sync Meta</span>
          </button>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          {/* Preset Blueprints */}
          <div className="relative group">
            <button className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-white/10">
              <Sparkles size={13} className="text-pink-300" />
              <span>Blueprints</span>
            </button>
            <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-2xl shadow-2xl p-2 hidden group-hover:block z-50 border border-gray-100 text-gray-800">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1">Templates Scaffold</p>
              <button
                onClick={() => loadPreset("general")}
                className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-purple-50 rounded-xl flex items-center justify-between text-[#313166]"
              >
                <span>🤖 General Assistant Bot</span>
                <span className="text-[10px] text-gray-400">4 Steps</span>
              </button>
              <button
                onClick={() => loadPreset("restaurant")}
                className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-purple-50 rounded-xl flex items-center justify-between text-[#313166]"
              >
                <span>🍽️ Restaurant Table Bot</span>
                <span className="text-[10px] text-gray-400">4 Steps</span>
              </button>
              <button
                onClick={() => loadPreset("blank")}
                className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-gray-100 rounded-xl text-gray-600"
              >
                <span>➕ Blank Journey</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsPreviewOpen(!isPreviewOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              isPreviewOpen
                ? "bg-[#CB376D] border-[#CB376D] text-white shadow-sm"
                : "bg-white/10 border-white/10 text-gray-200 hover:bg-white/20 hover:text-white"
            }`}
            title={isPreviewOpen ? "Hide Live WhatsApp Phone Preview" : "Show Live WhatsApp Phone Preview"}
          >
            <Smartphone size={14} />
            <span>{isPreviewOpen ? "Hide Preview" : "Show Preview"}</span>
          </button>

          <button
            onClick={() => handleSave(false)}
            className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/10 transition-colors"
          >
            Save Draft
          </button>

          <button
            onClick={() => handleSave(true)}
            className="px-4 py-1.5 bg-[#CB376D] hover:bg-[#b02c5c] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Check size={14} />
            Publish Active
          </button>
        </div>
      </div>

      {/* Main Builder Grid */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Left Palette Toolbar */}
        <div className="absolute left-4 top-4 z-10 flex flex-col gap-2 bg-[#1e1e38]/90 backdrop-blur-md p-2 rounded-2xl border border-gray-700 shadow-2xl">
          <button
            onClick={handleAddTemplateNode}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-[#313166] to-[#4A4A8A] hover:brightness-110 text-white rounded-xl text-xs font-bold shadow-md transition-all group"
            title="Add a WhatsApp Template Message Node"
          >
            <FileText size={16} className="text-purple-300 group-hover:scale-110 transition-transform" />
            <span>+ Template Node</span>
          </button>

          {/* <button
            onClick={handleAddActionNode}
            className="flex items-center gap-2 px-3 py-2 bg-amber-800 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition-all group"
            title="Add a CRM Tag Action"
          >
            <Tag size={15} className="text-amber-300 group-hover:scale-110 transition-transform" />
            <span>+ Tag Action</span>
          </button> */}
        </div>

        {/* Center: ReactFlow Canvas */}
        <div className="flex-1 h-full bg-[#131326]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            deleteKeyCode={["Backspace", "Delete"]}
            fitView
            minZoom={0.2}
            maxZoom={1.8}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#313166" gap={20} size={1.5} />
            <Controls className="bg-[#1e1e38]! border-gray-700! fill-white! text-white!" />
            <MiniMap
              nodeStrokeColor="#CB376D"
              nodeColor="#313166"
              maskColor="rgba(19, 19, 38, 0.7)"
              className="bg-[#1e1e38]! border-gray-700! rounded-xl!"
            />
          </ReactFlow>
        </div>

        {/* Right Drawer: Properties Inspector */}
        {selectedNode && (
          <div className="w-84 bg-white border-l border-gray-200 flex flex-col z-20 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <Edit3 size={16} className="text-[#313166]" />
                <h4 className="font-bold text-[#313166] text-xs uppercase tracking-wider">
                  {selectedNode.type.toUpperCase()} Properties
                </h4>
              </div>
              <div className="flex items-center gap-1">
                {selectedNode.type !== "trigger" && (
                  <button
                    onClick={handleDeleteSelectedNode}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Node"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
              {/* Template Node Inspector */}
              {selectedNode.type === "template" && (
                <>
                  {/* Account Status Badge */}
                  {selectedNodeMeta && (
                    <div
                      className={`p-3 rounded-xl border flex flex-col gap-2 ${
                        selectedNodeMeta.status === "NOT_SELECTED"
                          ? "bg-slate-50 border-slate-200 text-slate-900"
                          : selectedNodeMeta.status === "APPROVED"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                          : ["PENDING", "IN_PROGRESS", "INPROGRESS", "SUBMITTED"].includes(selectedNodeMeta.status?.toUpperCase())
                          ? "bg-amber-50 border-amber-200 text-amber-900"
                          : selectedNodeMeta.status === "REJECTED"
                          ? "bg-red-50 border-red-200 text-red-900"
                          : "bg-indigo-50 border-indigo-200 text-indigo-900"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] flex items-center gap-1.5">
                          {selectedNodeMeta.status === "APPROVED" ? (
                            <CheckCircle2 size={14} className="text-emerald-600" />
                          ) : selectedNodeMeta.status === "NOT_SELECTED" ? (
                            <HelpCircle size={14} className="text-slate-500" />
                          ) : ["PENDING", "IN_PROGRESS", "INPROGRESS", "SUBMITTED"].includes(selectedNodeMeta.status?.toUpperCase()) ? (
                            <Clock size={14} className="text-amber-600 animate-pulse" />
                          ) : selectedNodeMeta.status === "REJECTED" ? (
                            <XCircle size={14} className="text-red-600" />
                          ) : (
                            <UploadCloud size={14} className="text-indigo-600" />
                          )}

                          {selectedNodeMeta.status === "NOT_SELECTED"
                            ? "Template Status: Not Selected"
                            : selectedNodeMeta.status === "APPROVED"
                            ? "Meta Status: Approved"
                            : ["PENDING", "IN_PROGRESS", "INPROGRESS", "SUBMITTED"].includes(selectedNodeMeta.status?.toUpperCase())
                            ? "Meta Status: In Progress (Pending Review)"
                            : selectedNodeMeta.status === "REJECTED"
                            ? "Meta Status: Rejected"
                            : selectedNodeMeta.exists
                            ? `Meta Status: ${selectedNodeMeta.status}`
                            : "Draft / Not in Meta Account"}
                        </span>
                      </div>

                      {selectedNodeMeta.status === "NOT_SELECTED" && (
                        <div>
                          <p className="text-[10px] text-slate-600 leading-tight mb-2">
                            Please select an approved WhatsApp template or create a new template to attach to this node.
                          </p>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <button
                              onClick={() => setIsTemplatePickerOpen(true)}
                              className="px-3 py-2 bg-[#313166] hover:bg-[#252550] text-white rounded-xl font-bold text-[11px] transition-colors flex items-center justify-center gap-1 shadow-xs"
                            >
                              Select Template
                            </button>
                            <button
                              onClick={() => {
                                setTemplateBuilderPrefill(null);
                                setIsTemplateBuilderOpen(true);
                              }}
                              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-[11px] transition-colors flex items-center justify-center gap-1"
                            >
                              + Create New
                            </button>
                          </div>
                        </div>
                      )}

                      {selectedNodeMeta.status === "APPROVED" && (
                        <p className="text-[10px] text-emerald-700 leading-tight">
                          This template is approved by Meta and ready to send in active automations.
                        </p>
                      )}

                      {["PENDING", "IN_PROGRESS", "INPROGRESS", "SUBMITTED"].includes(selectedNodeMeta.status?.toUpperCase()) && (
                        <p className="text-[10px] text-amber-700 leading-tight">
                          This template is currently under review by Meta. Automations will stay as Draft until approved.
                        </p>
                      )}

                      {selectedNodeMeta.status === "REJECTED" && (
                        <p className="text-[10px] text-red-700 leading-tight">
                          This template was rejected by Meta. Please edit or recreate it with compliant content.
                        </p>
                      )}

                      {selectedNodeMeta.status === "NOT_IN_ACCOUNT" && (
                        <div>
                          <p className="text-[10px] text-indigo-800 leading-tight mb-2">
                            This template name is a draft / preset. Click below to submit and register it directly into your Meta WhatsApp account.
                          </p>
                          <button
                            onClick={() => handleDeployNodeTemplateToMeta(selectedNode)}
                            className="w-full py-1.5 bg-[#CB376D] hover:bg-[#b02c5c] text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                          >
                            <UploadCloud size={13} />
                            Create & Submit to Meta
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Template Name</label>
                    <input
                      type="text"
                      value={selectedNode.data?.templateName || ""}
                      onChange={(e) => {
                        const newName = e.target.value;
                        const metaT = findMetaTemplate(newName);
                        updateSelectedNodeData({
                          templateName: newName,
                          status: metaT ? metaT.status : (newName.trim() ? "NOT_IN_ACCOUNT" : "NOT_SELECTED"),
                          templateSelected: Boolean(newName.trim()),
                        });
                      }}
                      placeholder="e.g. welcome_greeting"
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl font-mono text-[#313166] font-bold"
                    />
                  </div>

                  {/* Actions: Pick Existing or Create New */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setIsTemplatePickerOpen(true)}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-[11px] transition-colors flex items-center justify-center gap-1"
                    >
                      Select Existing
                    </button>
                    <button
                      onClick={() => {
                        setTemplateBuilderPrefill(null);
                        setIsTemplateBuilderOpen(true);
                      }}
                      className="px-3 py-2 bg-[#313166] hover:bg-[#252550] text-white rounded-xl font-bold text-[11px] transition-colors flex items-center justify-center gap-1"
                    >
                      + Create Blank
                    </button>
                    <button
                      onClick={() => handleDeployNodeTemplateToMeta(selectedNode)}
                      className="col-span-2 px-3 py-2 bg-gradient-to-r from-[#CB376D] to-purple-600 hover:opacity-95 text-white rounded-xl font-bold text-[11px] transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-98"
                      title="Register latest edited text, media, and buttons as a Meta WhatsApp template for approval"
                    >
                      <Sparkles size={13} className="text-yellow-300" />
                      <span>Create / Submit Changes as Meta Template</span>
                    </button>
                  </div>

                  {/* Header Media Configuration Section */}
                  {(() => {
                    const selectedHeaderComp = selectedNodeMeta?.metaT?.components?.find((c) => c.type === "HEADER");
                    const headerFormat = (
                      selectedNode.data?.headerMediaType ||
                      selectedNode.data?.headerFormat ||
                      selectedHeaderComp?.format ||
                      (selectedHeaderComp?.text ? "TEXT" : "")
                    ).toUpperCase();
                    const isMediaHeader = ["IMAGE", "VIDEO", "DOCUMENT"].includes(headerFormat);

                    if (!isMediaHeader && !selectedNode.data?.mediaUrl) return null;

                    return (
                      <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50/40 rounded-xl border border-purple-200/80 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {headerFormat === "IMAGE" ? (
                              <Image size={14} className="text-[#CB376D]" />
                            ) : headerFormat === "VIDEO" ? (
                              <Video size={14} className="text-[#CB376D]" />
                            ) : (
                              <FileText size={14} className="text-[#CB376D]" />
                            )}
                            <label className="text-[10px] font-bold text-[#313166] uppercase tracking-wider">
                              Header {headerFormat || "Media"}
                            </label>
                          </div>
                          <span
                            className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                              selectedNode.data?.mediaUrl
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : "bg-amber-100 text-amber-900 border border-amber-200 animate-pulse"
                            }`}
                          >
                            {selectedNode.data?.mediaUrl ? "Media Attached" : "Media Required"}
                          </span>
                        </div>

                        {/* Media Preview if URL exists */}
                        {selectedNode.data?.mediaUrl ? (
                          <div className="relative group rounded-xl overflow-hidden border border-purple-200 bg-white shadow-xs">
                            {headerFormat === "IMAGE" ? (
                              <img
                                src={selectedNode.data.mediaUrl}
                                alt="Header Preview"
                                className="w-full h-28 object-cover rounded-xl"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : headerFormat === "VIDEO" ? (
                              <video
                                src={selectedNode.data.mediaUrl}
                                controls
                                className="w-full h-28 object-cover rounded-xl"
                              />
                            ) : (
                              <div className="p-3 flex items-center gap-2 text-xs text-gray-700 bg-purple-50/50">
                                <FileText size={20} className="text-purple-600 shrink-0" />
                                <span className="truncate flex-1 font-mono text-[10px]">{selectedNode.data.mediaUrl}</span>
                              </div>
                            )}
                            <button
                              onClick={() => updateSelectedNodeData({ mediaUrl: "" })}
                              className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-red-600 text-white rounded-lg opacity-80 group-hover:opacity-100 transition-all shadow-xs"
                              title="Remove Media"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[10px] flex items-start gap-1.5">
                            <AlertCircle size={13} className="text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="block font-bold">Media Required for Meta API</strong>
                              This template requires {headerFormat ? `an ${headerFormat.toLowerCase()}` : "media"} in its header. Upload a file or paste a URL below to prevent Meta error #132012.
                            </div>
                          </div>
                        )}

                        {/* Upload & URL Input Controls */}
                        <div className="space-y-1.5">
                          <div className="flex gap-1.5">
                            <label className="flex-1 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 hover:border-purple-300 rounded-xl text-xs font-bold text-[#313166] cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-2xs">
                              {uploadingMedia ? (
                                <RefreshCw size={13} className="animate-spin text-[#CB376D]" />
                              ) : (
                                <UploadCloud size={13} className="text-[#CB376D]" />
                              )}
                              <span>{uploadingMedia ? "Uploading..." : `Upload ${headerFormat || "Media"}`}</span>
                              <input
                                type="file"
                                accept={
                                  headerFormat === "IMAGE"
                                    ? "image/*"
                                    : headerFormat === "VIDEO"
                                    ? "video/*"
                                    : headerFormat === "DOCUMENT"
                                    ? ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                    : "*/*"
                                }
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    handleHeaderMediaUpload(e.target.files[0]);
                                  }
                                }}
                                disabled={uploadingMedia}
                                className="hidden"
                              />
                            </label>
                          </div>

                          <div className="relative">
                            <input
                              type="url"
                              value={selectedNode.data?.mediaUrl || ""}
                              onChange={(e) => updateSelectedNodeData({ mediaUrl: e.target.value })}
                              placeholder={`Or paste public ${headerFormat ? headerFormat.toLowerCase() : "media"} URL...`}
                              className="w-full px-2.5 py-1.5 text-[11px] bg-white border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#CB376D]"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Message Body Text</label>
                    <textarea
                      rows={4}
                      value={selectedNode.data?.bodyText || ""}
                      onChange={(e) => updateSelectedNodeData({ bodyText: e.target.value })}
                      placeholder="Enter template message text..."
                      className="w-full p-2.5 border border-gray-200 rounded-xl font-sans text-gray-700 leading-relaxed"
                    />
                  </div>

                  {/* Dynamic Variables Configuration */}
                  {(() => {
                    const combinedText = `${selectedNode.data?.headerText || ""} ${selectedNode.data?.bodyText || ""}`;
                    const matches = [...combinedText.matchAll(/\{\{(\d+)\}\}/g)];
                    const varNumbers = [...new Set(matches.map((m) => parseInt(m[1], 10)))].sort((a, b) => a - b);

                    if (varNumbers.length === 0) return null;

                    const currentMappings = selectedNode.data?.variableMappings || [];

                    const handleUpdateMapping = (varToken, sourceType, value) => {
                      const existingIdx = currentMappings.findIndex((m) => m.variable === varToken);
                      let nextMappings = [...currentMappings];
                      const newEntry = {
                        variable: varToken,
                        sourceType,
                        value,
                        componentType: "BODY",
                      };
                      if (existingIdx >= 0) {
                        nextMappings[existingIdx] = newEntry;
                      } else {
                        nextMappings.push(newEntry);
                      }
                      updateSelectedNodeData({ variableMappings: nextMappings });
                    };

                    const handleAutoMapDefaults = () => {
                      const autoMapped = varNumbers.map((num, idx) => {
                        if (idx === 0) {
                          return { variable: `{{${num}}}`, sourceType: "derived", value: "first_name", componentType: "BODY" };
                        }
                        if (idx === 1) {
                          return { variable: `{{${num}}}`, sourceType: "derived", value: "store_name", componentType: "BODY" };
                        }
                        if (idx === 2) {
                          return { variable: `{{${num}}}`, sourceType: "derived", value: "mobile_number", componentType: "BODY" };
                        }
                        return { variable: `{{${num}}}`, sourceType: "static", value: "Special Offer", componentType: "BODY" };
                      });
                      updateSelectedNodeData({ variableMappings: autoMapped });
                      toast.success("Applied standard variable mappings (First Name, Store Name, etc.)");
                    };

                    return (
                      <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/80 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Tag size={13} className="text-blue-600" />
                            <label className="text-[10px] font-bold text-blue-900 uppercase tracking-wider">
                              Template Variables ({varNumbers.length})
                            </label>
                          </div>
                          <button
                            onClick={handleAutoMapDefaults}
                            className="text-[9px] font-bold text-blue-700 hover:underline flex items-center gap-1"
                          >
                            <Sparkles size={10} />
                            Auto-Map
                          </button>
                        </div>

                        <p className="text-[10px] text-blue-800/80 leading-tight">
                          Map variables like <code className="font-bold">{"{{1}}"}</code> to customer or store fields to prevent Meta Error #132000:
                        </p>

                        <div className="space-y-2 pt-1">
                          {varNumbers.map((num) => {
                            const varToken = `{{${num}}}`;
                            const mapping = currentMappings.find((m) => m.variable === varToken) || {
                              variable: varToken,
                              sourceType: num === 1 ? "derived" : num === 2 ? "derived" : "static",
                              value: num === 1 ? "first_name" : num === 2 ? "store_name" : "",
                            };

                            const isStatic = mapping.sourceType === "static";

                            return (
                              <div key={varToken} className="p-2 bg-white rounded-lg border border-blue-100 space-y-1.5 shadow-2xs">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-mono font-bold text-[10px] rounded-md shrink-0">
                                    {varToken}
                                  </span>
                                  <select
                                    value={isStatic ? "static" : mapping.value}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val === "static") {
                                        handleUpdateMapping(varToken, "static", mapping.value || "Offer");
                                      } else {
                                        handleUpdateMapping(varToken, "derived", val);
                                      }
                                    }}
                                    className="flex-1 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-[11px] font-semibold text-[#313166] focus:outline-none focus:border-blue-500"
                                  >
                                    <optgroup label="Customer Details">
                                      <option value="first_name">Customer First Name</option>
                                      <option value="last_name">Customer Last Name</option>
                                      <option value="full_name">Customer Full Name</option>
                                      <option value="mobile_number">Customer Phone Number</option>
                                      <option value="loyalty_points">Loyalty Points</option>
                                    </optgroup>
                                    <optgroup label="Store / Business">
                                      <option value="store_name">Store / Brand Name</option>
                                      <option value="current_date">Today's Date</option>
                                    </optgroup>
                                    <optgroup label="Custom Static Text">
                                      <option value="static">Custom Static Text...</option>
                                    </optgroup>
                                  </select>
                                </div>

                                {isStatic && (
                                  <input
                                    type="text"
                                    value={mapping.value || ""}
                                    onChange={(e) => handleUpdateMapping(varToken, "static", e.target.value)}
                                    placeholder={`Value for ${varToken} (e.g. 20% OFF)`}
                                    className="w-full px-2.5 py-1 text-xs bg-gray-50 border border-gray-200 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Button Branches Management */}
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Quick Reply Buttons (Branches)</label>
                      <button
                        onClick={() => {
                          const curr = selectedNode.data?.buttons || [];
                          if (curr.length >= 3) {
                            toast.warning("Meta WhatsApp templates support a maximum of 3 quick reply buttons");
                            return;
                          }
                          updateSelectedNodeData({
                            buttons: [...curr, { text: `Option ${curr.length + 1}`, type: "QUICK_REPLY" }],
                          });
                        }}
                        className="text-[10px] font-bold text-[#CB376D] hover:underline"
                      >
                        + Add Button
                      </button>
                    </div>

                    {(selectedNode.data?.buttons || []).map((btn, bIdx) => (
                      <div key={bIdx} className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {bIdx + 1}
                        </span>
                        <input
                          type="text"
                          value={btn.text}
                          onChange={(e) => {
                            const next = [...selectedNode.data.buttons];
                            next[bIdx] = { ...next[bIdx], text: e.target.value };
                            updateSelectedNodeData({ buttons: next });
                          }}
                          placeholder="Button text (e.g. Yes, Proceed)"
                          className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-[#313166]"
                        />
                        <button
                          onClick={() => {
                            const next = selectedNode.data.buttons.filter((_, i) => i !== bIdx);
                            updateSelectedNodeData({ buttons: next });
                          }}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}

                    {(selectedNode.data?.buttons || []).length > 0 && (
                      <p className="text-[9px] text-gray-400 leading-tight pt-1">
                        💡 Each button creates a visual transition handle on the canvas so you can wire it to the next template step.
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Trigger Node Inspector */}
              {selectedNode.type === "trigger" && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Trigger Event Type</label>
                    <select
                      value={selectedNode.data?.triggerType || "whatsapp_keyword"}
                      onChange={(e) => updateSelectedNodeData({ triggerType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl font-medium text-[#313166] text-xs bg-white focus:outline-none focus:border-[#313166]"
                    >
                      <option value="whatsapp_keyword">Keyword Match</option>
                      <option value="all_inbound">Any Inbound Message</option>
                      <option value="new_customer" disabled className="text-gray-400 bg-gray-50">
                        New Customer (Coming Soon)
                      </option>
                      <option value="customer_field_date" disabled className="text-gray-400 bg-gray-50">
                        Date Event (Coming Soon)
                      </option>
                    </select>
                  </div>

                  {(selectedNode.data?.triggerType || "whatsapp_keyword") === "whatsapp_keyword" ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Keywords (Comma-separated)</label>
                        <span className={`text-[10px] font-bold ${conflictingKeywordDetails.length > 0 ? "text-amber-600 font-bold" : "text-emerald-600"}`}>
                          {conflictingKeywordDetails.length > 0 ? "⚠️ Conflict Detected" : "Exact Match"}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={selectedNode.data?.keyword || ""}
                        onChange={(e) => updateSelectedNodeData({ keyword: e.target.value })}
                        placeholder="e.g. HI, METRO, TICKET, START"
                        className={`w-full px-3 py-2 border rounded-xl font-mono font-bold text-xs transition-colors ${
                          conflictingKeywordDetails.length > 0
                            ? "border-amber-400 bg-amber-50/40 text-amber-900 focus:border-amber-500"
                            : "border-gray-200 text-emerald-700 focus:border-[#313166]"
                        }`}
                      />

                      {/* Real-time Inline Overlapping Keyword Conflict Alert */}
                      {conflictingKeywordDetails.length > 0 ? (
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-amber-900 text-xs space-y-1.5 shadow-2xs">
                          <div className="flex items-center gap-1.5 font-bold text-amber-800">
                            <AlertCircle size={14} className="text-amber-600 shrink-0" />
                            <span>⚠️ Overlapping Trigger Keywords Detected</span>
                          </div>
                          <p className="text-[11px] text-amber-800 leading-snug">
                            The following keyword{conflictingKeywordDetails.some(c => c.overlappingKeywords.length > 1) ? "s are" : " is"} already active in another automation. If triggered, both automations would reply simultaneously:
                          </p>
                          <div className="space-y-1">
                            {conflictingKeywordDetails.map((c, idx) => (
                              <div key={idx} className="bg-white p-2 rounded-lg border border-amber-200 text-[11px] flex items-center justify-between gap-2">
                                <span className="font-bold text-[#313166] truncate">"{c.automationName}"</span>
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 font-mono font-bold rounded-md text-[10px] shrink-0">
                                  {c.overlappingKeywords.join(", ")}
                                </span>
                              </div>
                            ))}
                          </div>
                          <p className="text-[10px] text-amber-700 italic pt-0.5">
                            👉 Tip: Remove or change the shared keyword above so both automations operate without collision.
                          </p>
                        </div>
                      ) : (
                        <p className="text-[10px] text-gray-400 leading-tight">
                          When a customer sends any of these keywords, this automated template journey will start immediately.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs leading-relaxed space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                        <Sparkles size={13} />
                        Any Inbound Message Trigger
                      </div>
                      <p className="text-[11px] text-emerald-700">
                        This journey triggers automatically whenever a customer sends <strong>any message</strong> to your WhatsApp number (unless a specific button reply branch is being followed).
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Right Dock: Live WhatsApp Phone Simulator */}
        {isPreviewOpen && (
          <div className="w-[360px] bg-slate-950 border-l border-gray-800 p-4 flex flex-col z-20 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-2">
              <div className="flex items-center gap-2 text-white">
                <Sparkles size={16} className="text-pink-400" />
                <h4 className="font-bold text-xs uppercase tracking-wider">Live WhatsApp Simulator</h4>
              </div>
              <button
                onClick={() => initSimulator()}
                className="text-[11px] text-[#CB376D] font-bold hover:underline flex items-center gap-1"
                title="Reset Chat"
              >
                <RotateCcw size={12} />
                Reset
              </button>
            </div>

            {/* Smartphone Frame */}
            <div className="flex-1 bg-[#EFEAE2] rounded-[28px] overflow-hidden flex flex-col relative border-4 border-slate-800 shadow-inner">
              {/* WhatsApp Chat Header */}
              <div className="bg-[#075E54] px-3.5 py-2.5 text-white flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                    🤖
                  </div>
                  <div>
                    <h5 className="font-bold text-xs leading-tight">WhatsApp Template Assistant</h5>
                    <p className="text-[8px] text-emerald-200">Online • Automated</p>
                  </div>
                </div>
              </div>

              {/* Chat Message List */}
              <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
                {simMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    {msg.sender === "system" ? (
                      <div className="p-2 bg-yellow-100 text-yellow-900 text-[10px] rounded-lg border border-yellow-200 font-mono w-full">
                        {msg.text}
                      </div>
                    ) : msg.sender === "user" ? (
                      <div className="bg-[#E7FFDB] text-gray-800 text-xs px-3 py-1.5 rounded-2xl rounded-tr-xs shadow-2xs max-w-[85%]">
                        {msg.text}
                        <span className="text-[8px] text-gray-400 block text-right mt-0.5">{msg.time}</span>
                      </div>
                    ) : (
                      /* Bot Template Message */
                      <div className="bg-white text-gray-800 text-xs rounded-2xl rounded-tl-xs shadow-xs max-w-[90%] overflow-hidden border border-gray-100">
                        {msg.mediaUrl && (
                          <div className="border-b border-gray-100 bg-gray-50 overflow-hidden">
                            {msg.headerMediaType === "VIDEO" ? (
                              <video src={msg.mediaUrl} controls className="w-full max-h-36 object-cover" />
                            ) : msg.headerMediaType === "DOCUMENT" ? (
                              <div className="p-2.5 flex items-center gap-2 bg-purple-50 text-[#313166] text-[10px] font-bold">
                                <FileText size={16} className="text-[#CB376D]" />
                                <span className="truncate">Document Attached</span>
                              </div>
                            ) : (
                              <img src={msg.mediaUrl} alt="Header" className="w-full max-h-36 object-cover" />
                            )}
                          </div>
                        )}
                        <div className="p-3 space-y-1.5">
                          <p className="font-bold text-[#313166] text-[10px] border-b border-gray-100 pb-1">
                            {msg.templateName}
                          </p>
                          <div
                            className="text-gray-700 leading-relaxed text-[11px]"
                            dangerouslySetInnerHTML={{
                              __html: renderWhatsAppFormattedText(msg.bodyText || msg.text || ""),
                            }}
                          />
                          <span className="text-[8px] text-gray-400 block text-right">{msg.time}</span>
                        </div>

                        {/* Interactive Buttons */}
                        {msg.buttons && msg.buttons.length > 0 && (
                          <div className="border-t border-gray-100 divide-y divide-gray-100 bg-gray-50/50">
                            {msg.buttons.map((b, bIdx) => (
                              <button
                                key={bIdx}
                                onClick={() => handleSimButtonClick(bIdx, b.text || b.label, msg.nodeId)}
                                className="w-full py-2 px-3 text-center text-[#00A884] hover:bg-[#E7FFDB]/60 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 active:scale-98"
                              >
                                <CornerDownRight size={11} />
                                {b.text || b.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-2 bg-white border-t border-gray-100 flex items-center gap-1.5">
                <input
                  type="text"
                  value={simUserInboundText}
                  onChange={(e) => setSimUserInboundText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && simUserInboundText.trim()) {
                      setSimMessages((prev) => [
                        ...prev,
                        { id: `sim_u_${Date.now()}`, sender: "user", text: simUserInboundText, time: "Just now" },
                      ]);
                      setSimUserInboundText("");
                    }
                  }}
                  placeholder="Type simulated message..."
                  className="flex-1 px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                />
                <button
                  onClick={() => {
                    if (!simUserInboundText.trim()) return;
                    setSimMessages((prev) => [
                      ...prev,
                      { id: `sim_u_${Date.now()}`, sender: "user", text: simUserInboundText, time: "Just now" },
                    ]);
                    setSimUserInboundText("");
                  }}
                  className="p-1.5 bg-[#075E54] text-white rounded-xl hover:bg-[#064d45]"
                >
                  <Send size={13} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Embedded Meta Template Builder Modal */}
      {isTemplateBuilderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <FileText className="text-[#CB376D] w-5 h-5" />
                <h3 className="font-bold text-[#313166] text-base">Submit WhatsApp Template to Meta</h3>
              </div>
              <button
                onClick={() => setIsTemplateBuilderOpen(false)}
                className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              <TemplateBuilder
                initialTemplate={templateBuilderPrefill}
                onCancel={() => setIsTemplateBuilderOpen(false)}
                onSuccess={(createdTemplate) => {
                  setIsTemplateBuilderOpen(false);
                  toast.success("Template submitted to Meta successfully! Syncing status...");
                  if (createdTemplate && selectedNode) {
                    const headerComp = createdTemplate.components?.find((c) => c.type === "HEADER");
                    const headerFormat = headerComp?.format?.toUpperCase() || (headerComp?.text ? "TEXT" : null);
                    const isMediaHeader = ["IMAGE", "VIDEO", "DOCUMENT"].includes(headerFormat);
                    const templateMediaUrl = headerComp?.mediaUrl || (Array.isArray(headerComp?.example?.header_handle) ? headerComp.example.header_handle[0] : null) || "";

                    updateSelectedNodeData({
                      templateId: createdTemplate._id,
                      templateName: createdTemplate.name,
                      status: createdTemplate.status || "PENDING",
                      language: createdTemplate.language || "en_US",
                      headerFormat: headerFormat,
                      headerMediaType: isMediaHeader ? headerFormat : null,
                      mediaUrl: templateMediaUrl || "",
                      headerText: headerComp?.text || "",
                      bodyText: createdTemplate.components?.find((c) => c.type === "BODY")?.text || "",
                      buttons: (createdTemplate.components?.find((c) => c.type === "BUTTONS")?.buttons || []).map((b) => ({
                        text: b.text || b.label || "Option",
                        type: b.type || "QUICK_REPLY",
                      })),
                      templateSelected: true,
                    });
                  }
                  onSyncTemplates();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Select from Existing Approved Templates Modal */}
      {isTemplatePickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div>
                <h4 className="font-bold text-[#313166] text-sm">Select WhatsApp Template</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Click a template to attach it to the selected node
                </p>
              </div>
              <button onClick={() => setIsTemplatePickerOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            {/* Template List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {templates.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-xs">No templates found in your Meta account.</p>
                  <button
                    onClick={() => {
                      setIsTemplatePickerOpen(false);
                      setIsTemplateBuilderOpen(true);
                    }}
                    className="mt-2 px-3 py-1.5 bg-[#CB376D] text-white rounded-xl text-xs font-bold"
                  >
                    + Create First Template
                  </button>
                </div>
              ) : (
                templates.map((t) => {
                  const headerComp = t.components?.find((c) => c.type === "HEADER");
                  const headerFormat = headerComp?.format?.toUpperCase() || (headerComp?.text ? "TEXT" : null);
                  const isMediaHeader = ["IMAGE", "VIDEO", "DOCUMENT"].includes(headerFormat);
                  const templateMediaUrl = headerComp?.mediaUrl || (Array.isArray(headerComp?.example?.header_handle) ? headerComp.example.header_handle[0] : null) || "";

                  const bodyComp = t.components?.find((c) => c.type === "BODY");
                  const btnComp = t.components?.find((c) => c.type === "BUTTONS");
                  const bodyText = bodyComp?.text || "";
                  const btns = btnComp?.buttons || [];
                  const isApproved = t.status === "APPROVED";
                  const isRejected = t.status === "REJECTED";
                  const isPending = ["PENDING", "IN_PROGRESS", "INPROGRESS", "SUBMITTED"].includes(t.status?.toUpperCase());

                  return (
                    <div
                      key={t._id}
                      onClick={() => {
                        if (selectedNode) {
                          updateSelectedNodeData({
                            templateId: t._id,
                            templateName: t.name,
                            status: t.status,
                            language: t.language || "en_US",
                            headerFormat: headerFormat,
                            headerMediaType: isMediaHeader ? headerFormat : null,
                            mediaUrl: selectedNode.data?.mediaUrl || templateMediaUrl || "",
                            headerText: headerComp?.text || "",
                            bodyText: bodyText,
                            buttons: btns.map((b) => ({
                              text: b.text || b.label || "Option",
                              type: b.type || "QUICK_REPLY",
                            })),
                            templateSelected: true,
                          });
                        }
                        setIsTemplatePickerOpen(false);
                        toast.success(`Attached template "${t.name}" (${t.status})`);
                      }}
                      className={`rounded-2xl border-2 cursor-pointer transition-all hover:shadow-md overflow-hidden ${
                        isApproved
                          ? "border-gray-200 hover:border-[#313166]/50"
                          : isRejected
                          ? "border-red-300 hover:border-red-500 bg-red-50/20"
                          : "border-amber-300 hover:border-amber-500 bg-amber-50/20"
                      }`}
                    >
                      {/* Card Top Row */}
                      <div className={`px-4 py-2.5 flex items-center justify-between ${
                        isApproved ? "bg-[#313166]/5" : isRejected ? "bg-red-100/60" : "bg-amber-100/60"
                      }`}>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-[#313166] text-xs truncate">{t.name}</h5>
                            {isMediaHeader && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[9px] font-bold rounded-full flex items-center gap-1">
                                {headerFormat === "IMAGE" ? (
                                  <Image size={10} className="text-purple-600" />
                                ) : headerFormat === "VIDEO" ? (
                                  <Video size={10} className="text-purple-600" />
                                ) : (
                                  <FileText size={10} className="text-purple-600" />
                                )}
                                {headerFormat}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            Lang: <strong>{t.language}</strong> &nbsp;|&nbsp; {t.category}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                              isApproved
                                ? "bg-emerald-100 text-emerald-800"
                                : isRejected
                                ? "bg-red-200 text-red-800"
                                : "bg-amber-200 text-amber-900"
                            }`}
                          >
                            {isApproved ? (
                              <CheckCircle2 size={10} />
                            ) : isRejected ? (
                              <XCircle size={10} />
                            ) : (
                              <Clock size={10} />
                            )}
                            {isPending ? "In Progress" : t.status}
                          </span>
                          <span className="px-3 py-1 bg-[#313166] text-white rounded-lg text-[10px] font-bold whitespace-nowrap">
                            Attach ➔
                          </span>
                        </div>
                      </div>

                      {/* Body Text Preview */}
                      {bodyText ? (
                        <div className="px-4 pt-2.5 pb-2">
                          <div className="bg-[#EFEAE2]/70 rounded-xl px-3 py-2 text-[11px] text-gray-700 leading-relaxed max-h-[72px] overflow-hidden relative">
                            {bodyText}
                            {/* Fade-out if overflowing */}
                            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-[#EFEAE2] to-transparent pointer-events-none rounded-b-xl" />
                          </div>
                        </div>
                      ) : (
                        <div className="px-4 py-2 text-[10px] text-gray-400 italic">
                          No body text found for this template.
                        </div>
                      )}

                      {/* Button Labels */}
                      {btns.length > 0 && (
                        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                          {btns.map((b, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 bg-white border border-[#313166]/20 text-[#313166] text-[10px] font-bold rounded-full shadow-2xs"
                            >
                              {b.text || b.label || `Option ${i + 1}`}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Not-approved warning */}
                      {!isApproved && (
                        <div className={`px-4 py-1.5 text-[10px] font-semibold flex items-center gap-1 border-t ${
                          isRejected
                            ? "bg-red-100 text-red-700 border-red-200"
                            : "bg-amber-100 text-amber-800 border-amber-200"
                        }`}>
                          <AlertCircle size={10} />
                          {isRejected
                            ? "Rejected by Meta — cannot be used in live automations"
                            : "Pending Meta approval (In Progress) — automation will stay as Draft until approved"}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TemplateFlowCanvas = (props) => (
  <ReactFlowProvider>
    <TemplateFlowCanvasContent {...props} />
  </ReactFlowProvider>
);

export default TemplateFlowCanvas;
