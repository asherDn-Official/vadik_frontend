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
  MessageSquare,
  DollarSign,
  Info,
  FolderPlus,
} from "lucide-react";
import TriggerNode from "./TriggerNode";
import TemplateNode from "./TemplateNode";
import StaticMessageNode from "./StaticMessageNode";
import ActionNode from "./ActionNode";
import LabeledEdge from "./LabeledEdge";
import TemplateBuilder from "../TemplateBuilder";
import MediaPickerModal from "../../common/MediaPickerModal";
import { renderWhatsAppFormattedText } from "../../../utils/whatsappTextFormatter";
import { toast } from "react-toastify";
import api from "../../../api/apiconfig";
import {
  normalizeMediaType,
  getMediaPickerTabType,
  getMediaAcceptString,
  isUrlCompatibleWithMediaType,
  isFileCompatibleWithMediaType,
} from "../../../utils/flowMediaValidation";

const nodeTypes = {
  trigger: TriggerNode,
  template: TemplateNode,
  static_message: StaticMessageNode,
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
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerType, setMediaPickerType] = useState("image");
  const [mediaPickerLocked, setMediaPickerLocked] = useState(false);

  // UI Panels
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [isTemplateBuilderOpen, setIsTemplateBuilderOpen] = useState(false);
  const [templateBuilderPrefill, setTemplateBuilderPrefill] = useState(null);
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);
  const [isNodeGuideOpen, setIsNodeGuideOpen] = useState(false);

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
  // const syncNodeStatusWithMeta = useCallback(
  //   (nodeList) => {
  //     return nodeList.map((n) => {
  //       if (n.type !== "template") return n;
  //       const tName = n.data?.templateName;
  //       if (!tName || tName.trim() === "" || n.data?.status === "NOT_SELECTED" || n.data?.templateSelected === false) {
  //         return {
  //           ...n,
  //           data: {
  //             ...n.data,
  //             status: "NOT_SELECTED",
  //             templateSelected: false,
  //           },
  //         };
  //       }
  //       const metaT = findMetaTemplate(tName);
  //       if (metaT) {
  //         const headerComp = metaT.components?.find((c) => c.type === "HEADER");
  //         const headerFormat = headerComp?.format?.toUpperCase() || (headerComp?.text ? "TEXT" : null);
  //         const isMediaHeader = ["IMAGE", "VIDEO", "DOCUMENT"].includes(headerFormat);
  //         const templateMediaUrl = headerComp?.mediaUrl || (Array.isArray(headerComp?.example?.header_handle) ? headerComp.example.header_handle[0] : null) || "";

  //         let validMediaUrl = "";
  //         if (isMediaHeader) {
  //           const currentUrl = n.data?.mediaUrl;
  //           if (currentUrl && isUrlCompatibleWithMediaType(currentUrl, headerFormat)) {
  //             validMediaUrl = currentUrl;
  //           } else if (templateMediaUrl && isUrlCompatibleWithMediaType(templateMediaUrl, headerFormat)) {
  //             validMediaUrl = templateMediaUrl;
  //           }
  //         }

  //         return {
  //           ...n,
  //           data: {
  //             ...n.data,
  //             status: metaT.status || "APPROVED",
  //             headerFormat: headerFormat,
  //             headerMediaType: isMediaHeader ? headerFormat : null,
  //             mediaUrl: validMediaUrl,
  //             headerText: n.data?.headerText || headerComp?.text || "",
  //             templateSelected: true,
  //           },
  //         };
  //       }
  //       // Named template but not found in Meta account
  //       return {
  //         ...n,
  //         data: {
  //           ...n.data,
  //           status: n.data?.status === "APPROVED" ? "NOT_IN_ACCOUNT" : (n.data?.status || "NOT_IN_ACCOUNT"),
  //           templateSelected: true,
  //         },
  //       };
  //     });
  //   },
  //   [findMetaTemplate]
  // );



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

          const currentUrl = typeof n.data?.mediaUrl === "string" 
            ? n.data.mediaUrl 
            : (n.data?.mediaUrl?.s3Url || n.data?.mediaUrl?.url || "");

          const cleanTemplateMediaUrl = typeof templateMediaUrl === "string"
            ? templateMediaUrl
            : (templateMediaUrl?.s3Url || templateMediaUrl?.url || "");

          let validMediaUrl = "";
          if (isMediaHeader) {
            if (currentUrl && isUrlCompatibleWithMediaType(currentUrl, headerFormat)) {
              validMediaUrl = currentUrl;
            } else if (cleanTemplateMediaUrl && isUrlCompatibleWithMediaType(cleanTemplateMediaUrl, headerFormat)) {
              validMediaUrl = cleanTemplateMediaUrl;
            }
          }

          return {
            ...n,
            data: {
              ...n.data,
              status: metaT.status || "APPROVED",
              headerFormat: headerFormat,
              headerMediaType: isMediaHeader ? headerFormat : null,
              mediaUrl: validMediaUrl,
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

  // Header media file uploader with strict format validation
  const handleHeaderMediaUpload = async (file, expectedFormat = null) => {
    if (!file) return;

    const reqFormat = (
      expectedFormat ||
      selectedNode?.data?.headerMediaType ||
      selectedNode?.data?.headerFormat ||
      ""
    ).toUpperCase();

    if (selectedNode?.type === "template" && ["IMAGE", "VIDEO", "DOCUMENT"].includes(reqFormat)) {
      if (!isFileCompatibleWithMediaType(file, reqFormat)) {
        toast.error(
          reqFormat === "VIDEO"
            ? "Invalid file type. This template requires a Video file (.mp4, .mov, etc.)."
            : reqFormat === "IMAGE"
            ? "Invalid file type. This template requires an Image file (.jpg, .png, etc.)."
            : "Invalid file type. This template requires a Document file (.pdf, .docx, etc.)."
        );
        return;
      }
    }

    const formData = new FormData();
    formData.append("file", file);
    if (reqFormat) {
      formData.append("expectedType", reqFormat);
    }

    try {
      setUploadingMedia(true);
      // const res = await api.post("/api/integrationManagement/whatsapp/media/upload", formData);
      const res = await api.post("/api/media-library/upload", formData);
      if (res.data?.status && res.data?.url) {
        updateSelectedNodeData({
          mediaUrl: res.data.url,
          ...(reqFormat ? { headerMediaType: reqFormat, headerFormat: reqFormat } : {}),
        });
        toast.success(`Header ${reqFormat ? reqFormat.toLowerCase() : "media"} uploaded successfully!`);
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

  const handleOpenMediaPicker = (rawType = "IMAGE", isLocked = false) => {
    const pType = getMediaPickerTabType(rawType);
    setMediaPickerType(pType);
    setMediaPickerLocked(Boolean(isLocked));
    setShowMediaPicker(true);
  };

  const handleMediaPickerSelect = (media) => {
    const cleanUrl = typeof media === 'string' ? media : (media?.s3Url || media?.url || '');
    const cleanThumbnailUrl = typeof media === 'object' && media?.thumbnailUrl ? media.thumbnailUrl : '';

    if (selectedNode) {
      const isTemplate = selectedNode.type === "template";
      const reqFormat = (
        selectedNode.data?.headerMediaType ||
        selectedNode.data?.headerFormat ||
        ""
      ).toUpperCase();

      if (isTemplate && ["IMAGE", "VIDEO", "DOCUMENT"].includes(reqFormat)) {
        if (!isUrlCompatibleWithMediaType(cleanUrl, reqFormat)) {
          toast.error(
            `Incompatible media selected. This template requires a ${reqFormat} (${reqFormat === "VIDEO" ? "Video only" : reqFormat === "IMAGE" ? "Image only" : "Document only"}).`
          );
          return;
        }
      }

      updateSelectedNodeData({
        mediaUrl: cleanUrl,
        ...(cleanThumbnailUrl ? { thumbnailUrl: cleanThumbnailUrl } : {}),
      });
      toast.success("Media selected from library!");
    }
    setShowMediaPicker(false);
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

    const isSourceStatic = sourceNode.type === "static_message";
    const newNodeType = isSourceStatic ? "static_message" : "template";
    const newId = getNextNodeId(isSourceStatic ? "static" : "template");
    const nextX = sourceNode.position.x + 380;
    const nextY = sourceNode.position.y + (sourceHandle?.startsWith("btn_") ? (parseInt(sourceHandle.replace("btn_", "")) * 140) - 40 : 0);

    let candidateTitle = `Reply: ${label}`;
    if (isSourceStatic) {
      const existingTitles = new Set(
        currentNodes
          .filter((n) => n.type === "static_message")
          .map((n) => (n.data?.title || "").trim().toLowerCase())
      );
      let sproutCounter = 2;
      while (existingTitles.has(candidateTitle.toLowerCase())) {
        candidateTitle = `Reply: ${label} (${sproutCounter})`;
        sproutCounter += 1;
      }
    }

    const newNode = {
      id: newId,
      type: newNodeType,
      position: { x: nextX, y: nextY },
      data: isSourceStatic
        ? {
            title: candidateTitle,
            headerFormat: null,
            headerText: "",
            headerMediaType: null,
            mediaUrl: "",
            bodyText: `Thank you for selecting "${label}"! Here are your options:`,
            footerText: "Select an option below",
            buttons: [{ id: "btn_0", text: "Main Menu" }],
            onAddNext: (h, l) => handleSproutNode(newId, h, l),
          }
        : {
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

    if (!isSourceStatic) {
      setIsTemplatePickerOpen(true);
      toast.info(`Connected new template step for "${label}". Select a template from your Meta account.`);
    } else {
      toast.success(`Connected new static message for "${label}". Edit message & buttons in Inspector!`);
    }
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

  // Add Static Message Node (Interactive Quick Reply Buttons)
  const handleAddStaticMessageNode = () => {
    const currentNodes = nodesRef.current;
    const newId = getNextNodeId("static");
    const centerPos = { x: 550 + Math.random() * 80, y: 220 + Math.random() * 80 };

    // Generate unique default title
    const existingTitles = new Set(
      currentNodes
        .filter((n) => n.type === "static_message")
        .map((n) => (n.data?.title || "").trim().toLowerCase())
    );
    let stepNum = currentNodes.filter((n) => n.type === "static_message").length + 1;
    let candidateTitle = `Interactive Step ${stepNum}`;
    while (existingTitles.has(candidateTitle.toLowerCase())) {
      stepNum += 1;
      candidateTitle = `Interactive Step ${stepNum}`;
    }

    const newNode = {
      id: newId,
      type: "static_message",
      position: centerPos,
      data: {
        title: candidateTitle,
        headerFormat: null,
        headerText: "",
        headerMediaType: null,
        mediaUrl: "",
        bodyText: "Hello {{firstname}}! 👋 How can we help you today?",
        footerText: "Choose an option below",
        buttons: [
          { id: "btn_0", text: "Our Services" },
          { id: "btn_1", text: "Talk to Support" },
        ],
        onAddNext: (h, l) => handleSproutNode(newId, h, l),
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setSelectedNode(newNode);
    toast.success("Added Static Interactive Message Node. Edit text & buttons in the Inspector!");
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

  // // Update selected node data
  // const updateSelectedNodeData = (updates) => {
  //   if (!selectedNode) return;
  //   setSelectedNode((prev) => {
  //     if (!prev || prev.id !== selectedNode.id) return prev;
  //     const updatedData = { ...prev.data, ...updates };
  //     if (prev.type === "trigger" && updates.keyword !== undefined) {
  //       updatedData.conflicts = computeConflictsForKeyword(updates.keyword);
  //     }
  //     return { ...prev, data: updatedData };
  //   });
  //   setNodes((nds) =>
  //     nds.map((n) => {
  //       if (n.id === selectedNode.id) {
  //         const updatedData = { ...n.data, ...updates };
  //         if (n.type === "trigger" && updates.keyword !== undefined) {
  //           updatedData.conflicts = computeConflictsForKeyword(updates.keyword);
  //         }
  //         return { ...n, data: updatedData };
  //       }
  //       return n;
  //     })
  //   );
  // };


  // ✅ Replace updateSelectedNodeData with this sanitized version:
const updateSelectedNodeData = (updates) => {
  if (!selectedNode) return;

  // Sanitize mediaUrl if an object was passed by mistake
  if (updates.mediaUrl && typeof updates.mediaUrl === "object") {
    updates.mediaUrl = updates.mediaUrl.s3Url || updates.mediaUrl.url || "";
  }

  setSelectedNode((prev) => {
    if (!prev || prev.id !== selectedNode.id) return prev;
    const updatedData = { ...prev.data, ...updates };
    if (prev.type === "trigger" && updates.keyword !== undefined) {
      updatedData.conflicts = computeConflictsForKeyword(updates.keyword);
    }
    return { ...prev, data: updatedData };
  });

  setNodes((nds) =>
    nds.map((n) => {
      if (n.id === selectedNode.id) {
        const updatedData = { ...n.data, ...updates };
        if (n.type === "trigger" && updates.keyword !== undefined) {
          updatedData.conflicts = computeConflictsForKeyword(updates.keyword);
        }
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
    // If there are no template nodes at all (e.g. pure static_message flow),
    // there is nothing to approve — treat as fully approved so publish is not blocked.
    const allApproved = list.length === 0 || approvedCount === list.length;
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
    const rootNode = currentNodes.find((n) => n.id === firstEdge?.target) ||
                     currentNodes.find((n) => n.type === "template" || n.type === "static_message");

    const userMsg = {
      id: "sim_u_1",
      sender: "user",
      text: triggerNode?.data?.keyword?.split(",")?.[0]?.trim() || "Hi",
      time: "Just now",
    };

    let initialMessages = [userMsg];

    if (rootNode) {
      if (rootNode.type === "static_message") {
        const botMsg = {
          id: "sim_b_1",
          sender: "bot",
          nodeId: rootNode.id,
          nodeType: "static_message",
          templateName: rootNode.data?.title || "Static Interactive Step",
          headerText: rootNode.data?.headerText || null,
          headerMediaType: rootNode.data?.headerMediaType || rootNode.data?.headerFormat || null,
          mediaUrl: typeof rootNode.data?.mediaUrl === "string" ? rootNode.data.mediaUrl : (rootNode.data?.mediaUrl?.s3Url || rootNode.data?.mediaUrl?.url || null),
          thumbnailUrl: rootNode.data?.thumbnailUrl || null,
          bodyText: rootNode.data?.bodyText || "Hello 👋 How can we help you today?",
          footerText: rootNode.data?.footerText || null,
          buttons: rootNode.data?.buttons || [],
          time: "Just now",
        };
        initialMessages.push(botMsg);
      } else if (rootNode.type === "template") {
        const isUnselected = !rootNode.data?.templateName || rootNode.data?.status === "NOT_SELECTED";
        const botMsg = {
          id: "sim_b_1",
          sender: "bot",
          nodeId: rootNode.id,
          nodeType: "template",
          templateName: rootNode.data?.templateName || "Step 1 Template",
          headerText: rootNode.data?.headerText || null,
          headerMediaType: rootNode.data?.headerMediaType || rootNode.data?.headerFormat || null,
          mediaUrl: typeof rootNode.data?.mediaUrl === "string" ? rootNode.data.mediaUrl : (rootNode.data?.mediaUrl?.s3Url || rootNode.data?.mediaUrl?.url || null),
          thumbnailUrl: rootNode.data?.thumbnailUrl || null,
          bodyText: isUnselected
            ? "⚠️ No template selected for this step yet. Click the template node to attach one."
            : rootNode.data?.bodyText || "Welcome! Please choose an option:",
          footerText: rootNode.data?.footerText || null,
          buttons: rootNode.data?.buttons || [],
          time: "Just now",
        };
        initialMessages.push(botMsg);
      } else if (rootNode.type === "action") {
        const actionMsg = {
          id: "sim_a_1",
          sender: "system",
          text: `⚡ Action Executed: ${rootNode.data?.label || "Tag Customer"}`,
          time: "Just now",
        };
        initialMessages.push(actionMsg);
      }
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

    // Find matching edge from that button handle or id
    const targetEdge = edges.find(
      (e) =>
        e.source === sourceNodeId &&
        (e.sourceHandle === `btn_${btnIndex}` ||
          e.sourceHandle === `button_${btnIndex}` ||
          e.sourceHandle === String(btnIndex) ||
          e.sourceHandle === "default" ||
          e.id?.includes(`btn_${btnIndex}`) ||
          e.id?.includes(`button_${btnIndex}`))
    );

    if (targetEdge) {
      const targetNode = nodes.find((n) => n.id === targetEdge.target);

      if (targetNode?.type === "static_message") {
        const botReplyMsg = {
          id: `sim_b_${Date.now()}`,
          sender: "bot",
          nodeId: targetNode.id,
          nodeType: "static_message",
          templateName: targetNode.data?.title || "Static Interactive Step",
          headerText: targetNode.data?.headerText || null,
          headerMediaType: targetNode.data?.headerMediaType || targetNode.data?.headerFormat || null,
          mediaUrl: typeof targetNode.data?.mediaUrl === "string" ? targetNode.data.mediaUrl : (targetNode.data?.mediaUrl?.s3Url || targetNode.data?.mediaUrl?.url || null),
          thumbnailUrl: targetNode.data?.thumbnailUrl || null,
          bodyText: targetNode.data?.bodyText || "Hello 👋 How can we help you today?",
          footerText: targetNode.data?.footerText || null,
          buttons: targetNode.data?.buttons || [],
          time: "Just now",
        };
        setSimMessages((prev) => [...prev, userClickMsg, botReplyMsg]);
      } else if (targetNode?.type === "template") {
        const isUnselected = !targetNode.data?.templateName || targetNode.data?.status === "NOT_SELECTED";
        const botReplyMsg = {
          id: `sim_b_${Date.now()}`,
          sender: "bot",
          nodeId: targetNode.id,
          nodeType: "template",
          templateName: targetNode.data?.templateName || "Follow-up Template",
          headerText: targetNode.data?.headerText || null,
          headerMediaType: targetNode.data?.headerMediaType || targetNode.data?.headerFormat || null,
          mediaUrl: typeof targetNode.data?.mediaUrl === "string" ? targetNode.data.mediaUrl : (targetNode.data?.mediaUrl?.s3Url || targetNode.data?.mediaUrl?.url || null),
          thumbnailUrl: targetNode.data?.thumbnailUrl || null,
          bodyText: isUnselected
            ? "⚠️ No template message attached to this step."
            : targetNode.data?.bodyText || "Proceeding...",
          footerText: targetNode.data?.footerText || null,
          buttons: targetNode.data?.buttons || [],
          time: "Just now",
        };
        setSimMessages((prev) => [...prev, userClickMsg, botReplyMsg]);
      } else if (targetNode?.type === "action") {
        const actionMsg = {
          id: `sim_a_${Date.now()}`,
          sender: "system",
          text: `⚡ Action Executed: ${targetNode?.data?.label || "Tag Customer"}`,
          time: "Just now",
        };
        setSimMessages((prev) => [...prev, userClickMsg, actionMsg]);
      } else {
        const actionMsg = {
          id: `sim_a_${Date.now()}`,
          sender: "system",
          text: `⚡ Step: ${targetNode?.data?.label || targetNode?.id || "Step Executed"}`,
          time: "Just now",
        };
        setSimMessages((prev) => [...prev, userClickMsg, actionMsg]);
      }
    } else {
      const fallbackMsg = {
        id: `sim_f_${Date.now()}`,
        sender: "bot",
        text: `✅ Selected: *${btnText}*\n(No follow-up step connected to this button on canvas)`,
        time: "Just now",
      };
      setSimMessages((prev) => [...prev, userClickMsg, fallbackMsg]);
    }
  };

  const handleSimInboundSubmit = (inputText) => {
    if (!inputText || !inputText.trim()) return;
    const cleanInput = inputText.trim().toLowerCase();

    // 1. Check if input matches any button on the last bot message
    const lastBotMsg = [...simMessages].reverse().find((m) => m.sender === "bot" && m.buttons?.length > 0);
    if (lastBotMsg && lastBotMsg.buttons) {
      const matchedBtnIndex = lastBotMsg.buttons.findIndex((b, idx) => {
        const bText = (b.text || b.label || "").trim().toLowerCase();
        return (
          bText === cleanInput ||
          cleanInput === `btn_${idx}` ||
          cleanInput === `button_${idx}` ||
          cleanInput === String(idx + 1)
        );
      });

      if (matchedBtnIndex !== -1) {
        const btn = lastBotMsg.buttons[matchedBtnIndex];
        handleSimButtonClick(matchedBtnIndex, btn.text || btn.label, lastBotMsg.nodeId);
        setSimUserInboundText("");
        return;
      }
    }

    // 2. Check if input matches trigger keyword -> reset/start flow
    const triggerNode = nodes.find((n) => n.type === "trigger");
    const rawKeywords = String(triggerNode?.data?.keyword || "HI, MENU, START")
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    if (rawKeywords.includes(cleanInput) || triggerNode?.data?.triggerType === "all_inbound") {
      initSimulator();
      setSimUserInboundText("");
      return;
    }

    // 3. Fallback generic response
    setSimMessages((prev) => [
      ...prev,
      { id: `sim_u_${Date.now()}`, sender: "user", text: inputText.trim(), time: "Just now" },
      {
        id: `sim_f_${Date.now()}`,
        sender: "bot",
        text: `🤖 Received: "${inputText.trim()}". To trigger this bot flow, send one of the trigger keywords: *${triggerNode?.data?.keyword || "HI"}* or click a button above.`,
        time: "Just now",
      },
    ]);
    setSimUserInboundText("");
  };

  // Save Automation Handler (Seamless Draft anytime, guarded Active publish)
  const handleSave = (asActive = false) => {
    if (!automationName.trim()) {
      toast.error("Please enter a name for this automation");
      return;
    }

    let willBeActive = asActive;
    if (asActive) {
      // Validate static_message titles (must not be empty and must be unique)
      const staticNodes = nodes.filter((n) => n.type === "static_message");
      const emptyTitleNodes = staticNodes.filter((n) => !(n.data?.title || "").trim());

      const titleCounts = {};
      staticNodes.forEach((n) => {
        const t = (n.data?.title || "").trim().toLowerCase();
        if (t) {
          titleCounts[t] = (titleCounts[t] || 0) + 1;
        }
      });
      const duplicateTitles = Object.keys(titleCounts)
        .filter((t) => titleCounts[t] > 1)
        .map((t) => {
          const found = staticNodes.find((n) => (n.data?.title || "").trim().toLowerCase() === t);
          return (found?.data?.title || t).trim();
        });

      const buttonCounts = {};
      nodes
        .filter((n) => n.type === "template" || n.type === "static_message")
        .forEach((n) => {
          (n.data?.buttons || []).forEach((b) => {
            const btnText = (b.text || b.label || "").trim().toLowerCase();
            if (btnText) {
              buttonCounts[btnText] = (buttonCounts[btnText] || 0) + 1;
            }
          });
        });
      const duplicateButtons = Object.keys(buttonCounts).filter((b) => buttonCounts[b] > 1);

      if (emptyTitleNodes.length > 0) {
        toast.warning(
          "Cannot publish as Active: One or more interactive message steps have an empty title. Saved as Draft."
        );
        willBeActive = false;
      } else if (duplicateTitles.length > 0) {
        toast.warning(
          `Cannot publish as Active: Interactive message step titles must be unique to avoid routing confusion. Duplicate title(s): "${duplicateTitles.join('", "')}". Saved as Draft.`
        );
        willBeActive = false;
      } else if (duplicateButtons.length > 0) {
        toast.warning(
          `Cannot publish as Active: All button texts in this flow must be unique. Duplicate button(s): "${duplicateButtons.join('", "')}". Saved as Draft.`
        );
        willBeActive = false;
      } else if (templateAudit.notSelectedCount > 0) {
        toast.warning(
          "Cannot publish as Active: One or more steps have no template selected. Saved as Draft."
        );
        willBeActive = false;
      } else if (templateAudit.total > 0 && !templateAudit.allApproved) {
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

      // Validate template media header compliance
      const templateNodes = nodes.filter((n) => n.type === "template");
      let mediaMismatchWarning = null;
      let missingMediaWarning = null;

      for (const tn of templateNodes) {
        const metaT = findMetaTemplate(tn.data?.templateName);
        const headerComp = metaT?.components?.find((c) => c.type === "HEADER");
        const headerFormat = (tn.data?.headerMediaType || tn.data?.headerFormat || headerComp?.format || "").toUpperCase();
        const isMedia = ["IMAGE", "VIDEO", "DOCUMENT"].includes(headerFormat);
        const mediaUrl = tn.data?.mediaUrl;

        if (isMedia) {
          if (!mediaUrl && willBeActive) {
            missingMediaWarning = `Step "${tn.data?.templateName || "Template"}" requires a ${headerFormat} header media before activating.`;
            break;
          }
          if (mediaUrl && !isUrlCompatibleWithMediaType(mediaUrl, headerFormat)) {
            mediaMismatchWarning = `Step "${tn.data?.templateName || "Template"}" requires a ${headerFormat} file, but has an incompatible media URL.`;
            break;
          }
        }
      }

      if (mediaMismatchWarning) {
        toast.warning(`Cannot publish as Active: ${mediaMismatchWarning} Saved as Draft.`);
        willBeActive = false;
      } else if (missingMediaWarning) {
        toast.warning(`Cannot publish as Active: ${missingMediaWarning} Saved as Draft.`);
        willBeActive = false;
      }
    }

    const triggerNode = nodes.find((n) => n.type === "trigger");
    const rootEdge = edges.find((e) => e.source === triggerNode?.id);
    const rootCandidate =
      nodes.find((n) => n.id === rootEdge?.target) ||
      nodes.find((n) => n.type === "template" || n.type === "static_message");
    const isRootStatic = rootCandidate?.type === "static_message";

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
        actionType: isRootStatic ? "interactive" : "template",
        templateId: isRootStatic ? null : (matchedRootTemplate?._id || null),
        templateName: isRootStatic ? (rootCandidate?.data?.title || rootCandidate?.id || "") : rootTemplateName,
        languageCode: rootTemplateNode?.data?.language || "en_US",
        mediaUrl: isRootStatic
          ? (rootCandidate?.data?.mediaUrl || null)
          : (rootTemplateNode?.data?.mediaUrl || null),
        mediaType: isRootStatic
          ? (rootCandidate?.data?.headerMediaType || rootCandidate?.data?.headerFormat || null)
          : (rootTemplateNode?.data?.headerMediaType || rootTemplateNode?.data?.headerFormat || null),
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
        <div className="absolute left-4 top-4 z-10 flex flex-col gap-2 bg-[#1e1e38]/95 backdrop-blur-md p-2 rounded-2xl border border-gray-700 shadow-2xl max-w-[210px]">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
            <span>Add Node</span>
            <Sparkles size={11} className="text-yellow-400" />
          </div>

          <button
            onClick={handleAddTemplateNode}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#313166] to-[#4A4A8A] hover:brightness-110 text-white rounded-xl text-xs font-bold shadow-md transition-all group text-left cursor-pointer"
            title="Pre-approved Meta WhatsApp template (Cold & 24h+)"
          >
            <FileText size={15} className="text-purple-300 group-hover:scale-110 transition-transform shrink-0" />
            <div className="min-w-0">
              <span className="block leading-tight font-bold text-xs">+ Template Node</span>
              <span className="block text-[9px] text-purple-200 font-normal opacity-80">Meta Approved</span>
            </div>
          </button>

          <button
            onClick={handleAddStaticMessageNode}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-900 to-teal-800 hover:brightness-110 text-white rounded-xl text-xs font-bold shadow-md transition-all group text-left border border-cyan-700/50 cursor-pointer"
            title="Instant custom interactive message with up to 3 buttons (No Meta review needed)"
          >
            <MessageSquare size={15} className="text-cyan-300 group-hover:scale-110 transition-transform shrink-0" />
            <div className="min-w-0">
              <span className="block leading-tight font-bold text-xs">+ Static Message</span>
              <span className="block text-[9px] text-cyan-200 font-normal opacity-80">3 Buttons • Instant Live</span>
            </div>
          </button>

          <div className="h-px bg-gray-700/60 my-0.5" />

          <button
            onClick={() => setIsNodeGuideOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg text-[11px] font-medium transition-colors border border-white/5 cursor-pointer"
            title="Learn how Template Node vs Static Message works & pricing"
          >
            <Info size={13} className="text-cyan-400 shrink-0" />
            <span>Node & Pricing Guide</span>
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
                        if (metaT) {
                          const headerComp = metaT.components?.find((c) => c.type === "HEADER");
                          const headerFormat = headerComp?.format?.toUpperCase() || (headerComp?.text ? "TEXT" : null);
                          const isMedia = ["IMAGE", "VIDEO", "DOCUMENT"].includes(headerFormat);
                          const templateMediaUrl = headerComp?.mediaUrl || (Array.isArray(headerComp?.example?.header_handle) ? headerComp.example.header_handle[0] : null) || "";
                          const existingUrl = selectedNode.data?.mediaUrl || "";
                          let finalMediaUrl = "";
                          if (isMedia) {
                            if (existingUrl && isUrlCompatibleWithMediaType(existingUrl, headerFormat)) {
                              finalMediaUrl = existingUrl;
                            } else if (templateMediaUrl && isUrlCompatibleWithMediaType(templateMediaUrl, headerFormat)) {
                              finalMediaUrl = templateMediaUrl;
                            }
                          }
                          updateSelectedNodeData({
                            templateName: newName,
                            templateId: metaT._id,
                            status: metaT.status || "APPROVED",
                            headerFormat: headerFormat,
                            headerMediaType: isMedia ? headerFormat : null,
                            mediaUrl: finalMediaUrl,
                            templateSelected: true,
                          });
                        } else {
                          updateSelectedNodeData({
                            templateName: newName,
                            status: newName.trim() ? "NOT_IN_ACCOUNT" : "NOT_SELECTED",
                            templateSelected: Boolean(newName.trim()),
                          });
                        }
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

                    if (!isMediaHeader) return null;

                    const isCurrentUrlCompatible =
                      !selectedNode.data?.mediaUrl ||
                      isUrlCompatibleWithMediaType(selectedNode.data.mediaUrl, headerFormat);

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
                              Header {headerFormat}
                            </label>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 border border-purple-200 text-[8px] font-bold rounded-md uppercase">
                              Locked to {headerFormat}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                                selectedNode.data?.mediaUrl && isCurrentUrlCompatible
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : "bg-amber-100 text-amber-900 border border-amber-200 animate-pulse"
                              }`}
                            >
                              {selectedNode.data?.mediaUrl && isCurrentUrlCompatible ? "Media Attached" : "Media Required"}
                            </span>
                          </div>
                        </div>

                        <p className="text-[10px] text-gray-500 leading-tight">
                          This template requires an <strong>{headerFormat.toLowerCase()}</strong> header. Unlike Static Message steps, the media type is locked to your Meta template and cannot be changed. Only {headerFormat.toLowerCase()} files can be attached.
                        </p>

                        {/* Incompatible Media Warning */}
                        {!isCurrentUrlCompatible && (
                          <div className="p-2 bg-red-50 border border-red-200 rounded-xl text-red-800 text-[10px] font-bold flex items-center gap-1.5">
                            <AlertCircle size={14} className="text-red-600 shrink-0" />
                            <span>
                              Incompatible media! This template requires a {headerFormat}, but an incompatible file URL is set. Please replace or remove it.
                            </span>
                          </div>
                        )}

                        {/* Media Preview if URL exists */}
                        {(() => {
                          const rawNodeMedia = selectedNode.data?.mediaUrl;
                          const cleanNodeMedia = typeof rawNodeMedia === 'string' ? rawNodeMedia : (rawNodeMedia?.s3Url || rawNodeMedia?.url || '');
                          if (!cleanNodeMedia) {
                            return (
                              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[10px] flex items-start gap-1.5">
                                <AlertCircle size={13} className="text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                  <strong className="block font-bold">Media Required for Meta API</strong>
                                  This template requires a {headerFormat.toLowerCase()} in its header. Upload a {headerFormat.toLowerCase()} file or paste a public URL below to prevent Meta error #132012.
                                </div>
                              </div>
                            );
                          }

                          const docFileName = decodeURIComponent(cleanNodeMedia.split("?")[0].split("/").pop() || cleanNodeMedia);

                          return (
                            <div className={`relative group rounded-xl overflow-hidden border bg-white shadow-xs ${
                              !isCurrentUrlCompatible ? "border-red-400 ring-2 ring-red-200" : "border-purple-200"
                            }`}>
                              {headerFormat === "IMAGE" ? (
                                <img
                                  src={cleanNodeMedia}
                                  alt="Header Preview"
                                  className="w-full h-28 object-cover rounded-xl"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              ) : headerFormat === "VIDEO" ? (
                                <video
                                  src={cleanNodeMedia}
                                  controls
                                  className="w-full h-28 object-cover rounded-xl bg-black"
                                />
                              ) : (
                                <div className="p-3 flex items-center gap-2 text-xs text-gray-700 bg-purple-50/50">
                                  <FileText size={20} className="text-purple-600 shrink-0" />
                                  <span className="truncate flex-1 font-mono text-[10px]">{docFileName}</span>
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
                          );
                        })()}

                        {/* Upload & URL Input Controls */}
                        <div className="space-y-1.5">
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenMediaPicker(headerFormat, true)}
                              className="px-3 py-1.5 bg-[#313166] hover:bg-[#3d3b83] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                            >
                              <FolderPlus size={13} />
                              <span>Select {headerFormat === "VIDEO" ? "Video" : headerFormat === "DOCUMENT" ? "Doc" : "Image"}</span>
                            </button>

                            <label className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 hover:border-purple-300 rounded-xl text-xs font-bold text-[#313166] cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-2xs">
                              {uploadingMedia ? (
                                <RefreshCw size={13} className="animate-spin text-[#CB376D]" />
                              ) : (
                                <UploadCloud size={13} className="text-[#CB376D]" />
                              )}
                              <span>{uploadingMedia ? "Uploading..." : `Upload ${headerFormat === "VIDEO" ? "Video" : headerFormat === "DOCUMENT" ? "Doc" : "Image"}`}</span>
                              <input
                                type="file"
                                accept={getMediaAcceptString(headerFormat)}
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    handleHeaderMediaUpload(e.target.files[0], headerFormat);
                                  }
                                }}
                                disabled={uploadingMedia}
                                className="hidden"
                              />
                            </label>
                          </div>

                          <div className="space-y-1">
                            <input
                              type="url"
                              value={typeof selectedNode.data?.mediaUrl === "string" ? selectedNode.data.mediaUrl : (selectedNode.data?.mediaUrl?.s3Url || selectedNode.data?.mediaUrl?.url || "")}
                              onChange={(e) => updateSelectedNodeData({ mediaUrl: e.target.value })}
                              onBlur={(e) => {
                                const val = (e.target.value || "").trim();
                                if (val && !isUrlCompatibleWithMediaType(val, headerFormat)) {
                                  toast.error(`Incompatible URL: This template requires a ${headerFormat} file URL.`);
                                }
                              }}
                              placeholder={`Paste public ${headerFormat.toLowerCase()} URL (e.g. ${headerFormat === "VIDEO" ? ".mp4" : headerFormat === "IMAGE" ? ".jpg, .png" : ".pdf"})...`}
                              className={`w-full px-2.5 py-1.5 text-[11px] bg-white border rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none ${
                                !isCurrentUrlCompatible
                                  ? "border-red-400 bg-red-50/20 focus:border-red-500"
                                  : "border-gray-200 focus:border-[#CB376D]"
                              }`}
                            />
                            {!isCurrentUrlCompatible && (
                              <p className="text-[9px] text-red-600 font-medium">
                                Only {headerFormat.toLowerCase()} URLs are allowed for this template.
                              </p>
                            )}
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

              {/* Static Message Node Inspector (Interactive Quick Reply Buttons) */}
              {selectedNode.type === "static_message" && (
                <>
                  {/* Status Banner */}
                  <div className="p-3 bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl border border-cyan-200 text-cyan-950 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px] flex items-center gap-1.5 text-cyan-900">
                        <Zap size={14} className="text-cyan-600 fill-cyan-600" />
                        Static Interactive Message
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-full">
                        Instant Live
                      </span>
                    </div>
                    <p className="text-[10px] text-cyan-800 leading-tight">
                      Custom interactive button message. <strong>No Meta review delay</strong> — changes go live instantly. Free within the active 24-hr customer service window.
                    </p>
                  </div>

                  {/* Step Title */}
                  {(() => {
                    const currentStaticTitle = (selectedNode.data?.title || "").trim();
                    const isStaticTitleEmpty = !currentStaticTitle;
                    const isStaticTitleDuplicate =
                      Boolean(currentStaticTitle) &&
                      nodes.some(
                        (n) =>
                          n.id !== selectedNode.id &&
                          n.type === "static_message" &&
                          (n.data?.title || "").trim().toLowerCase() === currentStaticTitle.toLowerCase()
                      );

                    return (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Step / Message Title</label>
                          {isStaticTitleDuplicate && (
                            <span className="text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-md">
                              Duplicate Title
                            </span>
                          )}
                          {isStaticTitleEmpty && (
                            <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
                              Required
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={selectedNode.data?.title || ""}
                          onChange={(e) => updateSelectedNodeData({ title: e.target.value })}
                          placeholder="e.g. Welcome Menu Options"
                          className={`w-full px-3 py-2 border rounded-xl font-bold text-[#313166] text-xs focus:outline-none transition-all ${
                            isStaticTitleDuplicate
                              ? "border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-400"
                              : isStaticTitleEmpty
                              ? "border-amber-400 bg-amber-50/20 focus:border-amber-500 focus:ring-1 focus:ring-amber-400"
                              : "border-gray-200 focus:border-cyan-600"
                          }`}
                        />
                        {isStaticTitleDuplicate && (
                          <p className="text-[10px] font-medium text-rose-600 flex items-center gap-1 mt-1 leading-tight">
                            <AlertCircle size={12} className="shrink-0 text-rose-500" />
                            Another step already uses this title. Each step must have a unique title.
                          </p>
                        )}
                        {isStaticTitleEmpty && (
                          <p className="text-[10px] font-medium text-amber-600 flex items-center gap-1 mt-1 leading-tight">
                            <AlertCircle size={12} className="shrink-0 text-amber-500" />
                            Step title cannot be empty.
                          </p>
                        )}
                      </div>
                    );
                  })()}

                  {/* Header Media / Text Option */}
                  {(() => {
                    const activeHeaderType = (
                      selectedNode.data?.headerMediaType ||
                      selectedNode.data?.headerFormat ||
                      selectedNode.data?.mediaType ||
                      "NONE"
                    ).toUpperCase();

                    return (
                      <div className="space-y-2 pt-2 border-t border-gray-100">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Header (Optional)</label>
                        <div className="grid grid-cols-5 gap-1">
                          {[
                            { id: "NONE", label: "None" },
                            { id: "TEXT", label: "Text" },
                            { id: "IMAGE", label: "Image" },
                            { id: "VIDEO", label: "Video" },
                            { id: "DOCUMENT", label: "Doc" },
                          ].map((tab) => {
                            const hType = tab.id;
                            const isSelected =
                              hType === "NONE"
                                ? (!selectedNode.data?.headerFormat && !selectedNode.data?.headerMediaType && !selectedNode.data?.mediaType) || activeHeaderType === "NONE"
                                : activeHeaderType === hType;

                            return (
                              <button
                                key={hType}
                                type="button"
                                onClick={() => {
                                  if (hType === "NONE") {
                                    updateSelectedNodeData({
                                      headerFormat: null,
                                      headerMediaType: null,
                                      mediaType: null,
                                      headerText: "",
                                      mediaUrl: "",
                                    });
                                  } else if (hType === "TEXT") {
                                    updateSelectedNodeData({
                                      headerFormat: "TEXT",
                                      headerMediaType: null,
                                      mediaType: null,
                                      mediaUrl: "",
                                    });
                                  } else {
                                    const prevType = (
                                      selectedNode.data?.headerMediaType ||
                                      selectedNode.data?.headerFormat ||
                                      selectedNode.data?.mediaType ||
                                      ""
                                    ).toUpperCase();
                                    const typeChanged = prevType !== hType;
                                    const currentUrl = selectedNode.data?.mediaUrl || "";

                                    const isImageFile = Boolean(currentUrl.match(/\.(jpg|jpeg|png|webp|gif)($|\?)/i));
                                    const isVideoFile = Boolean(currentUrl.match(/\.(mp4|3gp|mov|webm)($|\?)/i));
                                    const isDocFile = Boolean(currentUrl.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx)($|\?)/i));

                                    const isIncompatible =
                                      (hType === "IMAGE" && (isVideoFile || isDocFile)) ||
                                      (hType === "VIDEO" && (isImageFile || isDocFile)) ||
                                      (hType === "DOCUMENT" && (isImageFile || isVideoFile));

                                    updateSelectedNodeData({
                                      headerFormat: hType,
                                      headerMediaType: hType,
                                      mediaType: hType,
                                      headerText: "",
                                      ...(typeChanged && isIncompatible ? { mediaUrl: "" } : {}),
                                    });
                                  }
                                }}
                                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all text-center truncate cursor-pointer ${
                                  isSelected
                                    ? "bg-cyan-700 text-white shadow-xs"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                                title={tab.label}
                              >
                                {tab.label}
                              </button>
                            );
                          })}
                        </div>

                        {activeHeaderType === "TEXT" && (
                          <input
                            type="text"
                            maxLength={60}
                            value={selectedNode.data?.headerText || ""}
                            onChange={(e) => updateSelectedNodeData({ headerText: e.target.value })}
                            placeholder="Header Text (max 60 chars)"
                            className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-800"
                          />
                        )}

                        {["IMAGE", "VIDEO", "DOCUMENT"].includes(activeHeaderType) && (
                          <div className="space-y-2 p-2.5 bg-cyan-50/50 rounded-xl border border-cyan-100">
                            {/* Media Header Preview */}
                            {(() => {
                              const rawStaticMedia = selectedNode.data?.mediaUrl;
                              const cleanStaticMedia = typeof rawStaticMedia === 'string' ? rawStaticMedia : (rawStaticMedia?.s3Url || rawStaticMedia?.url || '');
                              if (!cleanStaticMedia) {
                                return (
                                  <p className="text-[10px] text-gray-500 italic">
                                    Attach {activeHeaderType.toLowerCase()} header to this interactive message.
                                  </p>
                                );
                              }

                              const staticDocName = decodeURIComponent(cleanStaticMedia.split("?")[0].split("/").pop() || "Document Attached");

                              return (
                                <div className="relative group rounded-xl overflow-hidden border border-cyan-200 bg-white shadow-xs">
                                  {activeHeaderType === "IMAGE" ? (
                                    <img
                                      key={cleanStaticMedia}
                                      src={cleanStaticMedia}
                                      alt="Header Preview"
                                      className="w-full h-24 object-cover rounded-xl"
                                      onError={(e) => {
                                        e.target.style.display = "none";
                                      }}
                                    />
                                  ) : activeHeaderType === "VIDEO" ? (
                                    <video
                                      key={cleanStaticMedia}
                                      src={cleanStaticMedia}
                                      controls
                                      className="w-full h-24 object-cover rounded-xl bg-black"
                                    />
                                  ) : (
                                    <div className="p-3 flex items-center gap-2 text-xs text-cyan-900 bg-cyan-50/80">
                                      <FileText size={18} className="text-cyan-700 shrink-0" />
                                      <span className="truncate flex-1 font-mono text-[10px]">
                                        {staticDocName}
                                      </span>
                                    </div>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => updateSelectedNodeData({ mediaUrl: "" })}
                                    className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-red-600 text-white rounded-lg opacity-80 group-hover:opacity-100 transition-all shadow-xs cursor-pointer"
                                    title="Remove Media"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              );
                            })()}

                            {/* Media Action Buttons: Media Library & Direct Upload */}
                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenMediaPicker(activeHeaderType)}
                                className="px-2.5 py-1.5 bg-[#313166] hover:bg-[#3d3b83] text-white rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                              >
                                <FolderPlus size={12} />
                                <span>Media Library</span>
                              </button>

                              <label className="px-2.5 py-1.5 bg-white hover:bg-cyan-100/50 border border-cyan-200 rounded-lg text-[10px] font-bold text-cyan-900 cursor-pointer transition-colors flex items-center justify-center gap-1 shadow-2xs">
                                {uploadingMedia ? (
                                  <RefreshCw size={12} className="animate-spin text-cyan-700" />
                                ) : (
                                  <UploadCloud size={12} className="text-cyan-700" />
                                )}
                                <span>{uploadingMedia ? "Uploading..." : `Upload ${activeHeaderType === "DOCUMENT" ? "Doc" : activeHeaderType === "VIDEO" ? "Video" : "Image"}`}</span>
                                <input
                                  type="file"
                                  accept={
                                    activeHeaderType === "IMAGE"
                                      ? "image/*"
                                      : activeHeaderType === "VIDEO"
                                      ? "video/*"
                                      : activeHeaderType === "DOCUMENT"
                                      ? ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                      : "*/*"
                                  }
                                  disabled={uploadingMedia}
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                      handleHeaderMediaUpload(e.target.files[0]);
                                    }
                                  }}
                                />
                              </label>
                            </div>

                            {/* Media URL Input */}
                            <div className="relative">
                              <input
                                type="text"
                                value={typeof selectedNode.data?.mediaUrl === "string" ? selectedNode.data.mediaUrl : (selectedNode.data?.mediaUrl?.s3Url || selectedNode.data?.mediaUrl?.url || "")}
                                onChange={(e) => updateSelectedNodeData({ mediaUrl: e.target.value })}
                                placeholder={`Or paste public ${activeHeaderType.toLowerCase()} URL...`}
                                className="w-full px-2.5 py-1.5 text-[11px] bg-white border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-cyan-600"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Message Body */}
                  <div className="space-y-1.5 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Message Body Text</label>
                      <span className="text-[9px] text-gray-400 font-mono">
                        {(selectedNode.data?.bodyText || "").length} / 1024
                      </span>
                    </div>

                    <textarea
                      value={selectedNode.data?.bodyText || ""}
                      onChange={(e) => updateSelectedNodeData({ bodyText: e.target.value })}
                      placeholder="Type your WhatsApp message here... Use *bold*, _italics_, or {{firstname}} for customer variables."
                      rows={4}
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs text-slate-800 font-sans focus:outline-none focus:border-cyan-600 leading-relaxed"
                    />

                    {/* Variable Quick-Insert Chips */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-gray-400 block uppercase">Insert Variable:</span>
                      <div className="flex flex-wrap gap-1">
                        {[
                          { label: "Customer Name", token: "{{firstname}}" },
                          { label: "Store Name", token: "{{storeName}}" },
                          { label: "Phone", token: "{{mobileNumber}}" },
                        ].map((chip) => (
                          <button
                            key={chip.token}
                            type="button"
                            onClick={() => {
                              const current = selectedNode.data?.bodyText || "";
                              updateSelectedNodeData({ bodyText: current ? `${current} ${chip.token}` : chip.token });
                            }}
                            className="px-2 py-0.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-[10px] font-semibold rounded-md transition-colors cursor-pointer"
                          >
                            + {chip.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer Text */}
                  <div className="space-y-1 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Footer Note (Optional)</label>
                      <span className="text-[9px] text-gray-400 font-mono">
                        {(selectedNode.data?.footerText || "").length} / 60
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={60}
                      value={selectedNode.data?.footerText || ""}
                      onChange={(e) => updateSelectedNodeData({ footerText: e.target.value })}
                      placeholder="e.g. Choose an option below"
                      className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-800"
                    />
                  </div>

                  {/* Quick Reply Buttons (Max 3) */}
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Quick Reply Buttons (Max 3)</label>
                      {(selectedNode.data?.buttons || []).length < 3 && (
                        <button
                          type="button"
                          onClick={() => {
                            const curr = selectedNode.data?.buttons || [];
                            updateSelectedNodeData({
                              buttons: [...curr, { id: `btn_${curr.length}`, text: `Option ${curr.length + 1}` }],
                            });
                          }}
                          className="text-[10px] font-bold text-cyan-700 hover:underline cursor-pointer"
                        >
                          + Add Button
                        </button>
                      )}
                    </div>

                    {(() => {
                      // Collect ALL button texts across the entire flow (other nodes) to detect cross-node duplicates
                      const allFlowButtonTexts = nodes
                        .filter((n) => n.id !== selectedNode.id && (n.type === "template" || n.type === "static_message"))
                        .flatMap((n) => (n.data?.buttons || []).map((b) => (b.text || b.label || "").trim().toLowerCase()))
                        .filter(Boolean);

                      const thisNodeTexts = (selectedNode.data?.buttons || []).map((b) =>
                        (b.text || "").trim().toLowerCase()
                      );
                      const withinNodeDupes = new Set(
                        thisNodeTexts.filter((t, i) => t && thisNodeTexts.indexOf(t) !== i)
                      );
                      const crossFlowDupes = new Set(
                        thisNodeTexts.filter((t) => t && allFlowButtonTexts.includes(t))
                      );
                      const hasDuplicates = withinNodeDupes.size > 0 || crossFlowDupes.size > 0;

                      return (
                        <>
                          {(selectedNode.data?.buttons || []).map((btn, bIdx) => {
                            const thisText = (btn.text || "").trim().toLowerCase();
                            const isWithinDupe = withinNodeDupes.has(thisText);
                            const isCrossFlowDupe = crossFlowDupes.has(thisText);
                            const isDupe = isWithinDupe || isCrossFlowDupe;

                            return (
                              <div key={bIdx} className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${isDupe ? "bg-red-100 text-red-700" : "bg-cyan-100 text-cyan-800"}`}>
                                    {bIdx + 1}
                                  </span>
                                  <input
                                    type="text"
                                    maxLength={20}
                                    value={btn.text}
                                    onChange={(e) => {
                                      const next = [...selectedNode.data.buttons];
                                      next[bIdx] = { ...next[bIdx], text: e.target.value };
                                      updateSelectedNodeData({ buttons: next });
                                    }}
                                    placeholder="Button title (max 20 chars)"
                                    className={`flex-1 px-2.5 py-1.5 border rounded-lg text-xs font-bold text-slate-800 focus:outline-none transition-colors ${
                                      isDupe
                                        ? "border-red-400 bg-red-50 text-red-900 focus:border-red-500"
                                        : "border-gray-200 focus:border-cyan-600"
                                    }`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = selectedNode.data.buttons.filter((_, i) => i !== bIdx);
                                      updateSelectedNodeData({ buttons: next });
                                    }}
                                    className="text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                                {isDupe && (
                                  <p className="text-[9px] text-red-600 pl-7 font-semibold">
                                    {isWithinDupe
                                      ? "⚠️ Duplicate within this node — each button must have unique text"
                                      : `⚠️ "${btn.text}" already used in another node — causes routing confusion`}
                                  </p>
                                )}
                              </div>
                            );
                          })}

                          {hasDuplicates && (
                            <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-[9px] text-red-700 font-bold leading-tight">
                                ❌ Duplicate button text detected. Every button across your entire flow must have a unique label so the bot can route replies correctly.
                              </p>
                            </div>
                          )}

                          <p className="text-[9px] text-gray-400 leading-tight pt-1">
                            💡 Click the <strong>+</strong> handle next to each button on the canvas to wire it to the next step.
                          </p>
                        </>
                      );
                    })()}
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
                        {(() => {
                          const rawSimMedia = msg.mediaUrl;
                          const cleanSimMedia = typeof rawSimMedia === 'string' ? rawSimMedia : (rawSimMedia?.s3Url || rawSimMedia?.url || '');
                          if (!cleanSimMedia) return null;

                          const isDoc = msg.headerMediaType === "DOCUMENT" && !cleanSimMedia.match(/\.(jpg|jpeg|png|webp|gif)/i);
                          const docName = decodeURIComponent(cleanSimMedia.split("?")[0].split("/").pop() || "Document Attached");

                          return (
                            <div className="border-b border-gray-100 bg-gray-50 overflow-hidden">
                              {msg.headerMediaType === "VIDEO" ? (
                                <video src={cleanSimMedia} controls className="w-full max-h-36 object-cover" />
                              ) : isDoc ? (
  msg.thumbnailUrl ? (
    /* Rich Document Card with Thumbnail Preview */
    <div className="bg-[#2a2b4a] p-2 rounded-t-xl overflow-hidden">
      <div className="relative rounded-lg overflow-hidden border border-white/10 bg-slate-900">
        <img
          src={msg.thumbnailUrl}
          alt="Document Thumbnail"
          className="w-full h-32 object-cover"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 backdrop-blur-xs text-white text-[9px] font-black rounded uppercase tracking-wider">
          PDF
        </span>
      </div>
      <a
        href={cleanSimMedia}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 p-2 bg-white/10 hover:bg-white/20 rounded-xl flex items-center gap-2 text-white transition-colors block group"
      >
        <div className="p-1.5 bg-cyan-500/20 rounded-lg shrink-0">
          <FileText size={16} className="text-cyan-300" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold truncate leading-tight text-white" title={docName}>
            {docName}
          </p>
          <p className="text-[8px] text-cyan-200 uppercase tracking-wide font-semibold mt-0.5 group-hover:underline">
            CLICK TO OPEN IN NEW TAB ↗
          </p>
        </div>
      </a>
    </div>
  ) : (
    /* Fallback Standard Document Strip */
    <a
      href={cleanSimMedia}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2.5 flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-[#313166] text-[10px] font-bold transition-colors block"
    >
      <FileText size={16} className="text-[#CB376D] shrink-0" />
      <span className="truncate flex-1">{docName}</span>
    </a>
  )
) : (
                                <img
                                  src={cleanSimMedia}
                                  alt="Header"
                                  className="w-full max-h-36 object-cover"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              )}
                            </div>
                          );
                        })()}
                        <div className="p-3 space-y-1.5">
                          {msg.nodeType === "static_message" ? (
                            <div className="flex items-center justify-between border-b border-gray-100 pb-1">
                              <span className="font-bold text-cyan-900 text-[10px] flex items-center gap-1">
                                <Zap size={11} className="text-cyan-600 fill-cyan-600" />
                                {msg.templateName || "Static Message"}
                              </span>
                              <span className="px-1.5 py-0.5 bg-cyan-100 text-cyan-800 text-[8px] font-bold rounded">
                                Live Interactive
                              </span>
                            </div>
                          ) : (
                            <p className="font-bold text-[#313166] text-[10px] border-b border-gray-100 pb-1">
                              {msg.templateName}
                            </p>
                          )}
                          {msg.headerText && (
                            <p className="font-bold text-xs text-gray-900 pt-0.5">
                              {msg.headerText}
                            </p>
                          )}
                          <div
                            className="text-gray-700 leading-relaxed text-[11px]"
                            dangerouslySetInnerHTML={{
                              __html: renderWhatsAppFormattedText(msg.bodyText || msg.text || ""),
                            }}
                          />
                          {msg.footerText && (
                            <p className="text-[9px] text-gray-400 italic pt-0.5">
                              {msg.footerText}
                            </p>
                          )}
                          <span className="text-[8px] text-gray-400 block text-right">{msg.time}</span>
                        </div>

                        {/* Interactive Buttons */}
                        {msg.buttons && msg.buttons.length > 0 && (
                          <div className="border-t border-gray-100 divide-y divide-gray-100 bg-gray-50/50">
                            {msg.buttons.map((b, bIdx) => (
                              <button
                                key={bIdx}
                                onClick={() => handleSimButtonClick(bIdx, b.text || b.label, msg.nodeId)}
                                className="w-full py-2 px-3 text-center text-[#00A884] hover:bg-[#E7FFDB]/60 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
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
                      handleSimInboundSubmit(simUserInboundText);
                    }
                  }}
                  placeholder="Type message or click button above..."
                  className="flex-1 px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                />
                <button
                  onClick={() => {
                    if (!simUserInboundText.trim()) return;
                    handleSimInboundSubmit(simUserInboundText);
                  }}
                  className="p-1.5 bg-[#075E54] text-white rounded-xl hover:bg-[#064d45] cursor-pointer"
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
                          const existingUrl = selectedNode.data?.mediaUrl || "";
                          let finalMediaUrl = "";
                          if (isMediaHeader) {
                            if (existingUrl && isUrlCompatibleWithMediaType(existingUrl, headerFormat)) {
                              finalMediaUrl = existingUrl;
                            } else if (templateMediaUrl && isUrlCompatibleWithMediaType(templateMediaUrl, headerFormat)) {
                              finalMediaUrl = templateMediaUrl;
                            }
                            if (existingUrl && !isUrlCompatibleWithMediaType(existingUrl, headerFormat)) {
                              toast.info(`Reset media because previous media did not match new template's ${headerFormat} format.`);
                            }
                          }

                          updateSelectedNodeData({
                            templateId: t._id,
                            templateName: t.name,
                            status: t.status,
                            language: t.language || "en_US",
                            headerFormat: headerFormat,
                            headerMediaType: isMediaHeader ? headerFormat : null,
                            mediaUrl: finalMediaUrl,
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

      {/* Node & Pricing Guide Modal */}
      {isNodeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#1e1e38] to-[#313166] text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Info className="w-5 h-5 text-cyan-300" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">Flow Nodes & WhatsApp Pricing Guide</h3>
                  <p className="text-[11px] text-gray-300 mt-0.5">
                    Understand when to use Template Nodes vs. Static Interactive Message Nodes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNodeGuideOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs text-slate-700 leading-relaxed">
              {/* Side-by-Side Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Card 1: Template Node */}
                <div className="rounded-2xl border-2 border-purple-200 bg-purple-50/30 p-5 space-y-3.5 flex flex-col">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                        <FileText size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#313166]">Template Node</h4>
                        <span className="text-[10px] font-bold text-purple-700">Official Meta WhatsApp Template</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 border border-purple-300 text-[9px] font-bold rounded-full">
                      Meta Approved
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-normal">
                    Pre-registered message templates submitted to and reviewed by Meta. Required for all outbound, cold notifications initiated by the business.
                  </p>

                  <div className="space-y-2 pt-2 border-t border-purple-100 text-[11px]">
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-[#313166] min-w-[90px]">When to use:</span>
                      <span className="text-slate-700">Outbound broadcasts, inactivity retention alerts, re-engagement after 24h of customer inactivity.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-[#313166] min-w-[90px]">Meta Approval:</span>
                      <span className="text-amber-800 font-semibold">Required (15 mins – 24 hrs review)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-[#313166] min-w-[90px]">Pricing & Cost:</span>
                      <span className="text-slate-700">Meta Template Category Fee (Marketing ~₹0.86 / Utility ~₹0.11 per message).</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-[#313166] min-w-[90px]">Buttons:</span>
                      <span className="text-slate-700">Up to 3 Quick Reply buttons + CTA URL/Call buttons.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-[#313166] min-w-[90px]">Media Format:</span>
                      <span className="text-purple-800 font-semibold">Strictly locked to Meta template (Video allowed only when template has Video; Image allowed only when template has Image).</span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Static Message Node */}
                <div className="rounded-2xl border-2 border-cyan-200 bg-cyan-50/30 p-5 space-y-3.5 flex flex-col">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-cyan-100 text-cyan-700 rounded-xl">
                        <MessageSquare size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-cyan-950">Static Message Node</h4>
                        <span className="text-[10px] font-bold text-cyan-700">Interactive Session Buttons</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-bold rounded-full flex items-center gap-1">
                      <Zap size={10} className="fill-emerald-600 text-emerald-600" />
                      Instant Live
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-normal">
                    Free-form WhatsApp messages with up to 3 interactive quick reply buttons. Built directly in Vadik AI with <strong>zero Meta review delay</strong>.
                  </p>

                  <div className="space-y-2 pt-2 border-t border-cyan-100 text-[11px]">
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-cyan-950 min-w-[90px]">When to use:</span>
                      <span className="text-slate-700">Inbound bot conversations (after "Hi", "Menu", "Help"), support FAQs, and multi-step interactive menu trees.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-cyan-950 min-w-[90px]">Meta Approval:</span>
                      <span className="text-emerald-700 font-bold">⚡ None needed (Instant live edits)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-cyan-950 min-w-[90px]">Pricing & Cost:</span>
                      <span className="text-emerald-800 font-bold">FREE in 24-hr customer service window</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-cyan-950 min-w-[90px]">Buttons:</span>
                      <span className="text-slate-700">Up to 3 Quick Reply action buttons per message step.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-cyan-950 min-w-[90px]">Media Format:</span>
                      <span className="text-cyan-800 font-semibold">Flexible header: Freely choose None, Text, Image, Video, or Document at any step.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Best Practice Recommended Architecture */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                  <Sparkles size={16} className="text-emerald-600" />
                  <span>Recommended Flow Strategy (Hybrid Architecture)</span>
                </div>
                <p className="text-[11px] text-emerald-950 leading-relaxed">
                  For optimal speed and cost efficiency:
                  <br />
                  1. <strong>Inbound Keyword Journeys:</strong> Trigger on "HI" or "MENU" ➔ Send a <strong>Static Message Node</strong> with your 3 main menu buttons ➔ Connect each button to further <strong>Static Message Nodes</strong>. You pay ₹0 Meta marketing fee!
                  <br />
                  2. <strong>Outbound Scheduled Broadcasts:</strong> Start with an approved <strong>Template Node</strong> ➔ When the customer taps a button on WhatsApp, continue the conversation with <strong>Static Message Nodes</strong>!
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
              <button
                onClick={() => setIsNodeGuideOpen(false)}
                className="px-5 py-2 bg-[#313166] hover:bg-[#252550] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Got it, let's build!
              </button>
            </div>
          </div>
        </div>
      )}

      {showMediaPicker && (
        <MediaPickerModal
          onClose={() => setShowMediaPicker(false)}
          mediaType={mediaPickerType}
          lockType={mediaPickerLocked}
          onSelect={handleMediaPickerSelect}
        />
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
