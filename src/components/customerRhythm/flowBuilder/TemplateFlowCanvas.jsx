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
  XCircle
} from "lucide-react";
import TriggerNode from "./TriggerNode";
import TemplateNode from "./TemplateNode";
import ActionNode from "./ActionNode";
import LabeledEdge from "./LabeledEdge";
import TemplateBuilder from "../TemplateBuilder";
import { renderWhatsAppFormattedText } from "../../../utils/whatsappTextFormatter";
import { toast } from "react-toastify";

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
          status: "APPROVED",
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
          status: "APPROVED",
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
          status: "APPROVED",
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
          status: "APPROVED",
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
          status: "APPROVED",
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
          status: "APPROVED",
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
          status: "APPROVED",
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
          status: "APPROVED",
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
          status: "APPROVED",
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
          templateName: "welcome_greeting",
          status: "APPROVED",
          language: "en_US",
          bodyText: "Hello! Welcome to our automated WhatsApp service. Please select an option below 👇",
          buttons: [{ text: "Option 1", type: "QUICK_REPLY" }, { text: "Option 2", type: "QUICK_REPLY" }],
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

  // UI Panels
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [isTemplateBuilderOpen, setIsTemplateBuilderOpen] = useState(false);
  const [templateBuilderPrefill, setTemplateBuilderPrefill] = useState(null);
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);

  // Live WhatsApp Simulator State
  const [simMessages, setSimMessages] = useState([]);
  const [simUserInboundText, setSimUserInboundText] = useState("");

  // Helper: check if a template exists in user's Meta account
  const findMetaTemplate = useCallback((templateName) => {
    if (!templateName) return null;
    return templates.find((t) => t.name === templateName || t._id === templateName);
  }, [templates]);

  // Initialize nodes & edges from automation or preset
  useEffect(() => {
    if (initialAutomation?.flowGraph?.nodes?.length) {
      setNodes(initialAutomation.flowGraph.nodes);
      setEdges(initialAutomation.flowGraph.edges || []);
      setAutomationName(initialAutomation.name || "WhatsApp Template Automation");
    } else if (initialAutomation?.presetId && (BUILDER_PRESETS[initialAutomation.presetId] || initialAutomation.presetId === "metro")) {
      const p = BUILDER_PRESETS[initialAutomation.presetId] || BUILDER_PRESETS.general;
      setNodes(p.nodes);
      setEdges(p.edges);
      setAutomationName(p.name);
    } else {
      const p = BUILDER_PRESETS.general;
      setNodes(p.nodes);
      setEdges(p.edges);
      setAutomationName(initialAutomation?.name || p.name);
    }
  }, [initialAutomation]);

  // Attach interactive callbacks to node data
  const enrichNodesWithCallbacks = useCallback((rawNodes) => {
    return rawNodes.map((n) => ({
      ...n,
      data: {
        ...n.data,
        onAddNext: (handleId, label) => handleSproutNode(n.id, handleId, label),
      },
    }));
  }, []);

  useEffect(() => {
    setNodes((nds) => enrichNodesWithCallbacks(nds));
  }, [enrichNodesWithCallbacks]);

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
    [nodes]
  );

  const handleDeleteEdge = (edgeId) => {
    setEdges((eds) => eds.filter((e) => e.id !== edgeId));
  };

  // Node selection handler
  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Sprout / Quick Connect next node
  const handleSproutNode = (sourceId, sourceHandle, label = "Next Step") => {
    const sourceNode = nodes.find((n) => n.id === sourceId);
    if (!sourceNode) return;

    const newId = getNextNodeId("template");
    const nextX = sourceNode.position.x + 380;
    const nextY = sourceNode.position.y + (sourceHandle?.startsWith("btn_") ? (parseInt(sourceHandle.replace("btn_", "")) * 140) - 40 : 0);

    const newNode = {
      id: newId,
      type: "template",
      position: { x: nextX, y: nextY },
      data: {
        templateName: `follow_up_${Date.now().toString().slice(-4)}`,
        status: "APPROVED",
        language: "en_US",
        bodyText: `Thank you for choosing ${label}. Here are your options:`,
        buttons: [{ text: "Confirm", type: "QUICK_REPLY" }, { text: "Main Menu", type: "QUICK_REPLY" }],
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
    toast.info(`Connected new Template message step for "${label}"!`);
  };

  // Add Template Node
  const handleAddTemplateNode = () => {
    const newId = getNextNodeId("template");
    const centerPos = { x: 550 + Math.random() * 80, y: 180 + Math.random() * 80 };

    const newNode = {
      id: newId,
      type: "template",
      position: centerPos,
      data: {
        templateName: `whatsapp_template_${Date.now().toString().slice(-4)}`,
        status: "APPROVED",
        language: "en_US",
        bodyText: "Hello! Please choose one of the options below 👇",
        buttons: [{ text: "Option A", type: "QUICK_REPLY" }, { text: "Option B", type: "QUICK_REPLY" }],
        onAddNext: (h, l) => handleSproutNode(newId, h, l),
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setSelectedNode(newNode);
    toast.success("Added new WhatsApp Template Node");
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
          setSelectedNode({ ...n, data: updatedData });
          return { ...n, data: updatedData };
        }
        return n;
      })
    );
  };

  // Deploy / Create this specific node's template to Meta
  const handleDeployNodeTemplateToMeta = (node) => {
    const nodeData = node.data || {};
    const prefill = {
      name: (nodeData.templateName || "new_template").toLowerCase().replace(/[^a-z0-9_]/g, "_"),
      category: "MARKETING",
      language: nodeData.language || "en_US",
      components: [
        { type: "BODY", text: nodeData.bodyText || "Hello! Please select an option." },
        ...(nodeData.buttons?.length
          ? [
              {
                type: "BUTTONS",
                buttons: nodeData.buttons.map((b) => ({
                  type: b.type || "QUICK_REPLY",
                  text: b.text || b.label || "Option",
                })),
              },
            ]
          : []),
      ],
    };

    setTemplateBuilderPrefill(prefill);
    setIsTemplateBuilderOpen(true);
  };

  // Load Preset Blueprint into Canvas
  const loadPreset = (presetKey) => {
    const p = BUILDER_PRESETS[presetKey];
    if (!p) return;
    setNodes(enrichNodesWithCallbacks(p.nodes));
    setEdges(p.edges);
    setAutomationName(p.name);
    setSelectedNode(null);
    initSimulator(p.nodes, p.edges);
    toast.success(`Loaded blueprint: ${p.name}`);
  };

  // Template Audit across all template nodes in the canvas
  const templateAudit = useMemo(() => {
    const templateNodes = nodes.filter((n) => n.type === "template");
    const list = templateNodes.map((n) => {
      const metaT = findMetaTemplate(n.data?.templateName);
      const existsInAccount = !!metaT;
      const status = metaT ? metaT.status : "NOT_IN_ACCOUNT";

      return {
        nodeId: n.id,
        name: n.data?.templateName || "Untitled",
        existsInAccount,
        status,
        approved: status === "APPROVED",
      };
    });

    const approvedCount = list.filter((t) => t.approved).length;
    const allApproved = list.length > 0 && approvedCount === list.length;
    const pendingOrMissing = list.filter((t) => !t.approved);

    return {
      total: list.length,
      approvedCount,
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
      const botMsg = {
        id: "sim_b_1",
        sender: "bot",
        nodeId: rootTemplateNode.id,
        templateName: rootTemplateNode.data?.templateName || "Welcome Template",
        bodyText: rootTemplateNode.data?.bodyText || "Welcome! Please choose an option:",
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
        const botReplyMsg = {
          id: `sim_b_${Date.now()}`,
          sender: "bot",
          nodeId: targetNode.id,
          templateName: targetNode.data?.templateName || "Follow-up Template",
          bodyText: targetNode.data?.bodyText || "Proceeding...",
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
      if (!templateAudit.allApproved) {
        const unapprovedNames = templateAudit.pendingOrMissing
          .map((t) => t.name)
          .filter(Boolean)
          .join(", ") || "templates";
        toast.warning(
          `Cannot activate: Template(s) "${unapprovedNames}" are not yet approved by Meta. Saved as Draft. You can continue editing or activate once Meta approves all templates.`
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
      },
      flowGraph: {
        nodes,
        edges,
      },
    };

    onSave(payload, willBeActive);
  };

  // Selected node meta check
  const selectedNodeMeta = useMemo(() => {
    if (!selectedNode || selectedNode.type !== "template") return null;
    const metaT = findMetaTemplate(selectedNode.data?.templateName);
    return {
      metaT,
      exists: !!metaT,
      status: metaT ? metaT.status : "NOT_IN_ACCOUNT",
    };
  }, [selectedNode, findMetaTemplate]);

  return (
    <div className="flex flex-col h-[84vh] bg-slate-900 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl relative">
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
                {nodes.length} Template Nodes • {edges.length} Button Wires
              </span>
            </div>
          </div>
        </div>

        {/* Center: Meta Status Indicator */}
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
              templateAudit.allApproved
                ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-400"
                : "bg-amber-950/60 border-amber-500/40 text-amber-400"
            }`}
          >
            {templateAudit.allApproved ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
            <span>
              Meta Status: {templateAudit.approvedCount}/{templateAudit.total} Approved
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
                <span className="text-[10px] text-gray-400">4 Templates</span>
              </button>
              <button
                onClick={() => loadPreset("restaurant")}
                className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-purple-50 rounded-xl flex items-center justify-between text-[#313166]"
              >
                <span>🍽️ Restaurant Table Bot</span>
                <span className="text-[10px] text-gray-400">4 Templates</span>
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

          <button
            onClick={handleAddActionNode}
            className="flex items-center gap-2 px-3 py-2 bg-amber-800 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition-all group"
            title="Add a CRM Tag Action"
          >
            <Tag size={15} className="text-amber-300 group-hover:scale-110 transition-transform" />
            <span>+ Tag Action</span>
          </button>
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
                        selectedNodeMeta.exists && selectedNodeMeta.status === "APPROVED"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                          : selectedNodeMeta.exists && selectedNodeMeta.status === "PENDING"
                          ? "bg-yellow-50 border-yellow-200 text-yellow-900"
                          : "bg-amber-50 border-amber-200 text-amber-900"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] flex items-center gap-1.5">
                          {selectedNodeMeta.exists && selectedNodeMeta.status === "APPROVED" ? (
                            <CheckCircle2 size={14} className="text-emerald-600" />
                          ) : (
                            <AlertCircle size={14} className="text-amber-600" />
                          )}
                          {selectedNodeMeta.exists
                            ? `Meta Status: ${selectedNodeMeta.status}`
                            : "Not in your Meta Account"}
                        </span>
                      </div>

                      {!selectedNodeMeta.exists && (
                        <div>
                          <p className="text-[10px] text-amber-700 leading-tight mb-2">
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
                      onChange={(e) => updateSelectedNodeData({ templateName: e.target.value })}
                      placeholder="e.g. welcome_greeting"
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl font-mono text-[#313166] font-bold"
                    />
                  </div>

                  {/* Actions: Pick Existing or Create New */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setIsTemplatePickerOpen(true)}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-[11px] transition-colors"
                    >
                      Select Existing
                    </button>
                    <button
                      onClick={() => {
                        setTemplateBuilderPrefill(null);
                        setIsTemplateBuilderOpen(true);
                      }}
                      className="px-3 py-2 bg-[#313166] hover:bg-[#252550] text-white rounded-xl font-bold text-[11px] transition-colors"
                    >
                      + Create New
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Message Body Text</label>
                    <textarea
                      rows={4}
                      value={selectedNode.data?.bodyText || ""}
                      onChange={(e) => updateSelectedNodeData({ bodyText: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-xl font-sans text-gray-700 leading-relaxed"
                    />
                  </div>

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
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Keywords (Comma-separated)</label>
                        <span className="text-[10px] text-emerald-600 font-bold">Exact Match</span>
                      </div>
                      <input
                        type="text"
                        value={selectedNode.data?.keyword || ""}
                        onChange={(e) => updateSelectedNodeData({ keyword: e.target.value })}
                        placeholder="e.g. HI, METRO, TICKET, START"
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl font-mono text-emerald-700 font-bold text-xs"
                      />
                      <p className="text-[10px] text-gray-400 leading-tight">
                        When a customer sends any of these keywords, this automated template journey will start immediately.
                      </p>
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
                onSuccess={() => {
                  setIsTemplateBuilderOpen(false);
                  toast.success("Template submitted to Meta successfully! Syncing status...");
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
                  const bodyComp = t.components?.find((c) => c.type === "BODY");
                  const btnComp = t.components?.find((c) => c.type === "BUTTONS");
                  const bodyText = bodyComp?.text || "";
                  const btns = btnComp?.buttons || [];
                  const isApproved = t.status === "APPROVED";
                  const isRejected = t.status === "REJECTED";

                  return (
                    <div
                      key={t._id}
                      onClick={() => {
                        if (selectedNode) {
                          updateSelectedNodeData({
                            templateName: t.name,
                            status: t.status,
                            language: t.language,
                            bodyText: bodyText,
                            buttons: btns.map((b) => ({
                              text: b.text || b.label || "Option",
                              type: b.type || "QUICK_REPLY",
                            })),
                          });
                        }
                        setIsTemplatePickerOpen(false);
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
                          <h5 className="font-bold text-[#313166] text-xs truncate">{t.name}</h5>
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
                            {t.status}
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
                              className="px-2.5 py-1 bg-white border border-[#313166]/20 text-[#313166] text-[10px] font-bold rounded-full shadow-sm"
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
                            : "Pending Meta approval — automation will stay as Draft until approved"}
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
