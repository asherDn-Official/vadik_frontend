import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Save, 
  Plus, 
  Play, 
  Settings, 
  Layout, 
  Zap, 
  Database, 
  Bell, 
  Tag,
  MessageSquare,
  ChevronRight,
  Code,
  Eye,
  X,
  ArrowLeft
} from 'lucide-react';

import ScreenNode from '../components/dialogueFlow/ScreenNode';
import ActionNode from '../components/dialogueFlow/ActionNode';
import LabeledEdge from '../components/dialogueFlow/LabeledEdge';
import FlowList from '../components/dialogueFlow/FlowList';
import FlowAnalytics from '../components/dialogueFlow/FlowAnalytics';
import AccountTemplateModal from '../components/dialogueFlow/AccountTemplateModal';
import { convertTemplateToScreenData, convertTemplateToFlowGraph } from '../utils/templateFlowHelper';
import api from '../api/apiconfig';
import showToast from '../utils/ToastNotification';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Loader from '../utils/Loader';

const nodeTypes = {
  screen: ScreenNode,
  action: ActionNode,
};

const edgeTypes = {
  labeled: LabeledEdge,
};

const initialNodes = [
  {
    id: 'node_1',
    type: 'screen',
    data: { 
      label: 'Welcome & Consent', 
      header: 'Welcome to Vadik AI', 
      body: 'Would you like to provide feedback about your recent order?', 
      fields: [
        { id: 101, type: 'radio', label: 'Response', name: 'user_consent', options: [{ label: 'Yes, sure', value: 'yes' }, { label: 'No, thanks', value: 'no' }] }
      ] 
    },
    position: { x: 100, y: 150 },
  },
  {
    id: 'node_2',
    type: 'screen',
    data: { 
      label: 'Feedback Form', 
      header: 'Your Feedback', 
      body: 'How would you rate our service?', 
      fields: [
        { id: 102, type: 'radio', label: 'Rating', name: 'rating', options: [{ label: '5 - Excellent', value: '5' }, { label: '3 - Average', value: '3' }, { label: '1 - Poor', value: '1' }] },
        { id: 103, type: 'textarea', label: 'Comments', name: 'comments' }
      ] 
    },
    position: { x: 500, y: 50 },
  },
  {
    id: 'node_3',
    type: 'screen',
    data: { 
      label: 'Exit Screen', 
      header: 'Goodbye', 
      body: 'No problem! Have a great day ahead.', 
      fields: [] 
    },
    position: { x: 500, y: 300 },
  },
  {
    id: 'node_4',
    type: 'action',
    data: { label: 'Notify Support', actionType: 'notification' },
    position: { x: 900, y: 0 },
  },
  {
    id: 'node_5',
    type: 'screen',
    data: { 
      label: 'Thank You', 
      header: 'Success', 
      body: 'Thank you for your feedback! We appreciate your time.', 
      fields: [] 
    },
    position: { x: 900, y: 150 },
  },
];

const initialEdges = [
  { id: 'e1-2', source: 'node_1', target: 'node_2', sourceHandle: 'choice_101_0', type: 'labeled', data: { label: 'Yes' } },
  { id: 'e1-3', source: 'node_1', target: 'node_3', sourceHandle: 'choice_101_1', type: 'labeled', data: { label: 'No' } },
  { id: 'e2-4', source: 'node_2', target: 'node_4', sourceHandle: 'submit', type: 'labeled', data: { label: 'Bad Rating', condition: { field: 'rating', operator: 'less_than', value: '4' } } },
  { id: 'e2-5', source: 'node_2', target: 'node_5', sourceHandle: 'submit', type: 'labeled', data: { label: 'Good Rating', condition: { field: 'rating', operator: 'greater_than', value: '3' } } },
  { id: 'e4-5', source: 'node_4', target: 'node_5', type: 'labeled', data: { label: 'Next' } },
];

let id = 10;
const getId = () => `node_${id++}`;

const DialogueFlowInner = () => {
  const { auth, loading: authLoading } = useAuth();
  
  // Check if WhatsApp is connected via embedded signup
  const isWhatsAppConnected = auth?.data?.isUsingOwnWhatsapp;

  if (authLoading) {
    return <Loader fullHeight={true} text="Verifying access..." />;
  }

  if (!isWhatsAppConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-8 text-center bg-white rounded-2xl shadow-sm border border-gray-100 m-6">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <MessageSquare className="text-green-500" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Connect Your WhatsApp Account</h2>
        <p className="text-gray-500 max-w-md mb-8">
          To build and publish interactive WhatsApp Flows, you need to connect your WhatsApp Business account using Meta's Embedded Signup.
        </p>
        <Link 
          to="/integration" 
          className="px-8 py-3 bg-[#CB376D] text-white font-bold rounded-xl hover:bg-[#b52d5e] transition-all flex items-center gap-2 shadow-lg shadow-[#CB376D]/20"
        >
          Go to Integrations <ChevronRight size={18} />
        </Link>
      </div>
    );
  }

  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('properties'); // 'properties' or 'preview'
  const [activePreviewScreenId, setActivePreviewScreenId] = useState(null);
  const [previewData, setPreviewData] = useState({});
  const activePreviewScreen = nodes.find(n => n.id === activePreviewScreenId) || null;
  
  const [view, setView] = useState('list'); // 'list', 'builder', or 'analytics'
  const [flows, setFlows] = useState([]);
  const [currentFlowId, setCurrentFlowId] = useState(null);
  const [flowsLoading, setFlowsLoading] = useState(true);
  const [defaultFlowId, setDefaultFlowId] = useState(null);
  const [selectedFlowForAnalytics, setSelectedFlowForAnalytics] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [validationWarnings, setValidationWarnings] = useState([]);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showAccountTemplateModal, setShowAccountTemplateModal] = useState(false);
  const [templateImportMode, setTemplateImportMode] = useState('SCREEN'); // 'SCREEN' or 'NEW_FLOW'

  const handleSelectAccountTemplate = (template) => {
    if (templateImportMode === 'NEW_FLOW') {
      const flowGraph = convertTemplateToFlowGraph(template);
      if (flowGraph) {
        setNodes(flowGraph.nodes);
        setEdges(flowGraph.edges);
        setCurrentFlowId(null);
        setView('builder');
        showToast(`Created flow from template "${template.name}"`, 'success');
      }
    } else {
      const screenData = convertTemplateToScreenData(template);
      if (screenData) {
        if (selectedNode && selectedNode.type === 'screen') {
          updateNodeData(selectedNode.id, screenData);
          showToast(`Applied template "${template.name}" to screen "${selectedNode.data?.label || selectedNode.id}"`, 'success');
        } else {
          const newNodeId = getId();
          const newNode = {
            id: newNodeId,
            type: 'screen',
            position: { x: 300, y: 150 },
            data: screenData,
          };
          setNodes((nds) => nds.concat(newNode));
          setSelectedNode(newNode);
          showToast(`Added screen from template "${template.name}"`, 'success');
        }
      }
    }
  };

  const getNodeDisplayName = (node) => node?.data?.label || node?.data?.header || node?.id || 'Untitled';

  const removeEdgeById = (edgeId) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
    setSelectedEdge((prev) => (prev?.id === edgeId ? null : prev));
  };

  const getOutgoingRoutes = (nodeId) => edges.filter((edge) => edge.source === nodeId);

  const fetchFlows = useCallback(async () => {
    try {
      setFlowsLoading(true);
      const response = await api.get('/api/whatsappFlow');
      setFlows(response.data || []);
    } catch (error) {
      console.error('Error fetching flows:', error);
      showToast('Failed to load flows', 'error');
    } finally {
      setFlowsLoading(false);
    }
  }, []);

  const fetchDefaultFlow = useCallback(async () => {
    try {
      const response = await api.get('/api/whatsappFlow/default/current');
      setDefaultFlowId(response.data.defaultFlow?._id || response.data.defaultFlow);
    } catch (error) {
      console.error('Error fetching default flow:', error);
    }
  }, []);

  useEffect(() => {
    fetchFlows();
    fetchDefaultFlow();
  }, [fetchFlows, fetchDefaultFlow]);

  const onDeleteFlow = async (flowId) => {
    if (!window.confirm('Are you sure you want to delete this flow?')) return;
    try {
      await api.delete(`/api/whatsappFlow/${flowId}`);
      showToast('Flow deleted successfully', 'success');
      fetchFlows();
    } catch (error) {
      console.error('Error deleting flow:', error);
      showToast('Failed to delete flow', 'error');
    }
  };

  const defaultEdgeOptions = {
    animated: true,
    type: 'labeled',
    style: { stroke: '#CB376D', strokeWidth: 2 },
  };

  const normalizeScreenId = (value) =>
    (value || '')
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

  const getScreenNodeId = (node) => {
    if (!node) return null;
    return normalizeScreenId(node.data?.label) || normalizeScreenId(node.id);
  };

  const resolveNextScreenNode = (sourceNodeId, graphNodes, graphEdges, contextData = null, visited = new Set()) => {
    if (!sourceNodeId || visited.has(sourceNodeId)) return null;
    visited.add(sourceNodeId);

    const outgoing = graphEdges.filter((edge) => edge.source === sourceNodeId);
    if (outgoing.length === 0) return null;

    const nextEdge =
      outgoing.find((edge) => contextData && edge.data?.condition && evaluateCondition(edge.data.condition, contextData)) ||
      outgoing.find((edge) => !edge.data?.condition) ||
      outgoing[0];

    const targetNode = graphNodes.find((node) => node.id === nextEdge.target);
    if (!targetNode) return null;

    if (targetNode.type === 'action') {
      return resolveNextScreenNode(targetNode.id, graphNodes, graphEdges, contextData, visited);
    }

    return targetNode;
  };

  const getReachableScreenIds = (sourceNodeId, graphNodes, graphEdges, visited = new Set()) => {
    if (!sourceNodeId || visited.has(sourceNodeId)) return [];
    visited.add(sourceNodeId);

    const outgoing = graphEdges.filter((edge) => edge.source === sourceNodeId);
    const reachable = [];

    outgoing.forEach((edge) => {
      const targetNode = graphNodes.find((node) => node.id === edge.target);
      if (!targetNode) return;

      if (targetNode.type === 'screen') {
        const targetScreenId = getScreenNodeId(targetNode);
        if (targetScreenId) reachable.push(targetScreenId);
        return;
      }

      if (targetNode.type === 'action') {
        reachable.push(...getReachableScreenIds(targetNode.id, graphNodes, graphEdges, visited));
      }
    });

    return [...new Set(reachable)];
  };

  const buildRoutingModel = (graphNodes, graphEdges) => {
    const routingModel = {};

    graphNodes
      .filter((node) => node.type === 'screen')
      .forEach((node) => {
        const screenId = getScreenNodeId(node);
        routingModel[screenId] = getReachableScreenIds(node.id, graphNodes, graphEdges);
      });

    return routingModel;
  };

  useEffect(() => {
    if (activeTab !== 'preview') return;
    if (selectedNode?.type === 'screen') {
      setActivePreviewScreenId(selectedNode.id);
    } else if (!activePreviewScreenId) {
      const firstScreen = nodes.find(n => n.type === 'screen');
      if (firstScreen) setActivePreviewScreenId(firstScreen.id);
    }
  }, [activeTab, selectedNode, activePreviewScreenId, nodes]);

  const generateMetaJSON = (sourceNodes = null, sourceEdges = null) => {
    const graphNodes = sourceNodes || nodes;
    const graphEdges = sourceEdges || edges;
    const screens = graphNodes.filter(n => n.type === 'screen').map(n => {
      const screenId = getScreenNodeId(n) || n.id.toUpperCase();
      const outgoingEdges = graphEdges.filter(e => e.source === n.id);
      const isTerminal = outgoingEdges.length === 0;

      const formName = `form_${screenId.toLowerCase()}`;
      const children = [
        {
          type: "TextHeading",
          text: n.data.header || n.data.label
        },
        {
          type: "TextBody",
          text: n.data.body || "Please fill the details below"
        }
      ];

      const payloadRefs = {};
      (n.data.fields || []).forEach(f => {
        const fn = f.name || f.label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        payloadRefs[fn] = `\${form.${fn}}`;
      });

      const footer = {
        type: "Footer",
        label: n.data.footerLabel || (isTerminal ? "Submit" : "Next"),
        "on-click-action": isTerminal
          ? { name: "complete", payload: payloadRefs }
          : { name: "data_exchange", payload: payloadRefs }
      };

      if (n.data.fields && n.data.fields.length > 0) {
        children.push({
          type: "Form",
          name: formName,
          children: [
            ...n.data.fields.map(f => {
              const fieldName = f.name || f.label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
              const base = {
                name: fieldName,
                label: f.label,
                required: f.required !== false
              };

              if (f.type === 'radio' || f.type === 'select' || f.type === 'checkbox') {
                const typeMap = {
                  radio: 'RadioButtonsGroup',
                  select: 'Dropdown',
                  checkbox: 'CheckboxGroup'
                };

                const options = (f.options || []).map((o) => {
                  const optionId = o.value || o.label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
                  return {
                    id: optionId,
                    title: o.label
                  };
                });

                return {
                  type: typeMap[f.type],
                  name: base.name,
                  label: base.label,
                  required: base.required,
                  "data-source": options
                };
              }

              if (f.type === 'optin') {
                return {
                  type: "OptIn",
                  name: base.name,
                  label: base.label,
                  required: base.required,
                  description: "I agree to receive updates"
                };
              }

              return {
                type: f.type === 'textarea' ? 'TextArea' : 'TextInput',
                name: base.name,
                label: base.label,
                required: base.required
              };
            }),
            footer
          ]
        });
      } else {
        children.push(footer);
      }

      return {
        id: screenId,
        title: n.data.label,
        terminal: isTerminal,
        layout: {
          type: "SingleColumnLayout",
          children: children
        }
      };
    });

    const finalJson = {
      version: "7.3",
      data_api_version: "3.0",
      routing_model: buildRoutingModel(graphNodes, graphEdges),
      screens: screens,
    };
    console.log("📋 [generateMetaJSON] Generated flow JSON:", JSON.stringify(finalJson, null, 2));
    return JSON.stringify(finalJson, null, 2);
  };

  const onConnect = useCallback(
    (params) => {
      const sourceNode = nodes.find(n => n.id === params.source);
      let label = '';
      
      if (params.sourceHandle?.startsWith('choice_')) {
        const parts = params.sourceHandle.split('_');
        const fieldId = parts[1];
        const optionIdx = parts[2];
        const field = sourceNode?.data?.fields?.find(f => f.id.toString() === fieldId);
        label = field?.options?.[optionIdx]?.label || 'Branch';
      } else if (params.sourceHandle === 'submit') {
        label = 'Submit';
      }

      setEdges((eds) => addEdge({ 
        ...params, 
        type: 'labeled',
        data: { label },
        animated: true, 
        style: { stroke: '#CB376D', strokeWidth: 2 } 
      }, eds));
    },
    [setEdges, nodes]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  const onEdgeClick = useCallback((event, edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  const addNextNode = useCallback((sourceNodeId, sourceHandleId) => {
    const sourceNode = nodes.find(n => n.id === sourceNodeId);
    if (!sourceNode) return;

    const newNodeId = getId();
    const position = {
      x: sourceNode.position.x + 300,
      y: sourceNode.position.y,
    };

    const newNode = {
      id: newNodeId,
      type: 'screen',
      position,
      data: { label: 'New Screen', fields: [], header: 'Next Step', body: 'Continue the conversation...' },
    };

    const newEdge = {
      id: `e-${sourceNodeId}-${newNodeId}`,
      source: sourceNodeId,
      target: newNodeId,
      sourceHandle: sourceHandleId,
      animated: true,
      style: { stroke: '#CB376D', strokeWidth: 2 }
    };

    setNodes((nds) => nds.concat(newNode));
    setEdges((eds) => addEdge(newEdge, eds));
    
    // Auto-select the new node
    setTimeout(() => {
      setSelectedNode(newNode);
    }, 100);
  }, [nodes, setNodes, setEdges]);

  // Inject addNextNode into node data
  const nodesWithCallbacks = nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      onAddNext: (handleId) => addNextNode(node.id, handleId)
    }
  }));

  const updateNodeData = (nodeId, newData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      })
    );
    setSelectedNode((prev) => (prev?.id === nodeId ? { ...prev, data: { ...prev.data, ...newData } } : prev));
  };

  const saveFlow = async () => {
    try {
      const flowData = {
        name: nodes[0]?.data?.label || "New WhatsApp Flow",
        description: "Created via visual builder",
        visualGraph: {
          nodes,
          edges,
        },
      };

      let response;
      if (currentFlowId) {
        response = await api.put(`/api/whatsappFlow/${currentFlowId}`, flowData);
        showToast('Flow updated successfully!', 'success');
      } else {
        response = await api.post('/api/whatsappFlow', flowData);
        setCurrentFlowId(response.data._id);
        showToast('Flow saved successfully!', 'success');
      }
      fetchFlows();
      return response.data;
    } catch (error) {
      console.error('Error saving flow:', error);
      showToast(error.response?.data?.error || 'Failed to save flow', 'error');
    }
  };

  const onSelectFlow = (flow) => {
    if (flow.visualGraph) {
      setNodes(flow.visualGraph.nodes || initialNodes);
      setEdges(flow.visualGraph.edges || initialEdges);
    }
    setCurrentFlowId(flow._id);
    setView('builder');
  };

  const onCreateFlow = () => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setCurrentFlowId(null);
    setView('builder');
  };

  const onSetDefault = async (flowId) => {
    try {
      // Toggle if already default
      const newFlowId = defaultFlowId === flowId ? null : flowId;
      await api.post('/api/whatsappFlow/default', { flowId: newFlowId });
      setDefaultFlowId(newFlowId);
      showToast(newFlowId ? 'Auto-reply flow updated' : 'Auto-reply disabled', 'success');
    } catch (error) {
      console.error('Error setting default flow:', error);
      showToast('Failed to update auto-reply setting', 'error');
    }
  };

  const onShowAnalytics = (flow) => {
    setSelectedFlowForAnalytics(flow);
    setView('analytics');
  };

  const validateFlowJSON = (sourceNodes = null, sourceEdges = null) => {
    const graphNodes = sourceNodes || nodes;
    const graphEdges = sourceEdges || edges;
    const errors = [];
    const warnings = [];

    const screenNodes = graphNodes.filter(n => n.type === 'screen');

    if (screenNodes.length === 0) {
      errors.push('Flow has no screens. Add at least one Screen node.');
      return { errors, warnings, isValid: false };
    }

    const idMap = {};
    screenNodes.forEach(n => {
      const screenId = getScreenNodeId(n) || '';
      if (!screenId) {
        errors.push(`A screen is missing a name. All screens must have a unique, non-empty name.`);
        return;
      }
      if (!idMap[screenId]) idMap[screenId] = [];
      idMap[screenId].push(n.data.label || n.id);
    });

    Object.entries(idMap).forEach(([id, labels]) => {
      if (labels.length > 1) {
        errors.push(
          `Duplicate screen name detected: "${labels[0]}" — ${labels.length} screens resolve to the same ID "${id}". Each screen must have a unique name. Same node names are not allowed for multiple screens.`
        );
      }
    });

    screenNodes.forEach(n => {
      const fieldNames = [];
      (n.data.fields || []).forEach(f => {
        const name = (f.name || '').trim() || (f.label || '').toLowerCase().replace(/[^a-z0-9]+/g, '_');
        if (!name) {
          errors.push(`Screen "${n.data.label}": A field is missing both a variable name and a label.`);
          return;
        }
        if (fieldNames.includes(name)) {
          errors.push(`Screen "${n.data.label}": Duplicate field variable name "${name}". Each field on a screen must have a unique variable name.`);
        } else {
          fieldNames.push(name);
        }
      });

      const outgoing = graphEdges.filter(e => e.source === n.id);
      if (outgoing.length === 0) {
        warnings.push(`Screen "${n.data.label || n.id}" has no outgoing connections — it will be treated as a terminal (end) screen.`);
      }

      const radioFields = (n.data.fields || []).filter(f => f.type === 'radio');
      radioFields.forEach(f => {
        (f.options || []).forEach((opt, oIdx) => {
          const handle = `choice_${f.id}_${oIdx}`;
          const hasEdge = graphEdges.some(e => e.source === n.id && e.sourceHandle === handle);
          if (!hasEdge) {
            warnings.push(`Screen "${n.data.label}": Radio option "${opt.label}" (field "${f.label}") has no outgoing branch connection.`);
          }
        });
      });
    });

    const allEdgeTargets = graphEdges.map(e => e.target);
    const firstScreen = screenNodes[0];
    screenNodes.forEach(n => {
      if (n.id !== firstScreen?.id && !allEdgeTargets.includes(n.id)) {
        warnings.push(`Screen "${n.data.label || n.id}" is unreachable — no connections lead to it.`);
      }
    });

    return { errors, warnings, isValid: errors.length === 0 };
  };

  const publishFlow = async (flow = null) => {
    const nodesToValidate = flow?.visualGraph?.nodes || nodes;
    const edgesToValidate = flow?.visualGraph?.edges || edges;
    const validation = validateFlowJSON(nodesToValidate, edgesToValidate);

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setValidationWarnings(validation.warnings);
      setShowValidationModal(true);
      return;
    }

    try {
      let flowToPublish = flow;
      
      if (!flowToPublish) {
        showToast('Saving flow before publishing...', 'info');
        flowToPublish = await saveFlow();
        if (!flowToPublish?._id) {
          console.error("❌ [publishFlow] Flow saving failed, cannot publish.");
          return;
        }
      }

      showToast('Publishing to Meta...', 'info');
      
      // Use the nodes and edges from the flow if provided, otherwise use current state
      let nodesToUse, edgesToUse;
      if (flow && flow.visualGraph?.nodes?.length) {
        nodesToUse = flow.visualGraph.nodes;
        edgesToUse = flow.visualGraph.edges || [];
      } else {
        nodesToUse = nodes;
        edgesToUse = edges;
      }

      const freshMetaJSONStr = generateMetaJSON(nodesToUse, edgesToUse);
      console.log("📤 [publishFlow] Generated Meta JSON:", freshMetaJSONStr);
      const freshMetaJSON = JSON.parse(freshMetaJSONStr);
      
      const payload = {
        metaFlowDefinition: freshMetaJSON
      };

      const flowId = flowToPublish._id || flowToPublish.id;
      if (!flowId) {
        showToast('Cannot publish: Flow ID is missing. Please save first.', 'error');
        return;
      }

      console.log(`🚀 [publishFlow] Publishing flow ${flowId} to backend...`);
      const response = await api.post(`/api/whatsappFlow/${flowId}/publish`, payload);
      showToast(response.data?.message || 'Flow published successfully!', 'success');
      fetchFlows();
    } catch (error) {
      console.error('Error publishing flow:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to publish flow';
      showToast(errorMsg, 'error');
    }
  };

  const onDragStart = (event, nodeType, data = {}) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/reactflow-data', JSON.stringify(data));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      const dataStr = event.dataTransfer.getData('application/reactflow-data');
      const customData = dataStr ? JSON.parse(dataStr) : {};

      if (typeof type === 'undefined' || !type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`, fields: [], ...customData },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const evaluateCondition = (condition, data) => {
    if (!condition) return true;
    const { field, operator, value } = condition;
    const fieldValue = data[field];

    switch (operator) {
      case 'equals': return fieldValue === value;
      case 'not_equals': return fieldValue !== value;
      case 'contains': return String(fieldValue).includes(value);
      case 'greater_than': return Number(fieldValue) > Number(value);
      case 'less_than': return Number(fieldValue) < Number(value);
      default: return true;
    }
  };

  const handlePreviewSubmit = () => {
    if (!activePreviewScreen) return;

    const outgoingEdges = edges.filter(e => e.source === activePreviewScreen.id);

    const radioFields = (activePreviewScreen.data.fields || []).filter(f => f.type === 'radio');
    for (const f of radioFields) {
      const selectedValue = previewData[f.name];
      if (selectedValue !== undefined && selectedValue !== '') {
        const optIdx = (f.options || []).findIndex(o => o.value === selectedValue);
        if (optIdx !== -1) {
          const choiceHandle = `choice_${f.id}_${optIdx}`;
          const directEdge = outgoingEdges.find(e => e.sourceHandle === choiceHandle);
          if (directEdge) {
            const nextNode = nodes.find(n => n.id === directEdge.target);
            setPreviewData({});
            executeNode(nextNode);
            return;
          }
        }
      }
    }

    const submitEdge = outgoingEdges.find(e => e.sourceHandle === 'submit');
    if (submitEdge) {
      const nextNode = nodes.find(n => n.id === submitEdge.target);
      setPreviewData({});
      executeNode(nextNode);
      return;
    }

    const nextNode = resolveNextScreenNode(activePreviewScreen.id, nodes, edges, previewData);
    if (nextNode) {
      setPreviewData({});
      executeNode(nextNode);
      return;
    }

    showToast('Flow completed', 'success');
  };

  const executeNode = async (node) => {
    if (!node) return;

    if (node.type === 'screen') {
      setActivePreviewScreenId(node.id);
    } else if (node.type === 'action') {
      showToast(`Executing: ${node.data.label}`, 'info');
      
      // Simulate action delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Find next node after action
      const nextNode = resolveNextScreenNode(node.id, nodes, edges);
      if (nextNode) {
        executeNode(nextNode);
      } else {
        showToast('Flow completed after action', 'success');
      }
    }
  };

  const onImportTemplate = (template) => {
    setNodes(template.nodes);
    setEdges(template.edges);
    setCurrentFlowId(null);
    setView('builder');
    showToast(`${template.name} imported!`, 'success');
  };

  if (view === 'list') {
    return (
      <FlowList 
        flows={flows} 
        onSelectFlow={onSelectFlow} 
        onCreateFlow={onCreateFlow} 
        onDeleteFlow={onDeleteFlow} 
        onPublishFlow={publishFlow}
        onShowAnalytics={onShowAnalytics}
        onSetDefault={onSetDefault}
        defaultFlowId={defaultFlowId}
        loading={flowsLoading}
        onImportTemplate={onImportTemplate}
      />
    );
  }

  if (view === 'analytics' && selectedFlowForAnalytics) {
    return (
      <FlowAnalytics 
        flow={selectedFlowForAnalytics} 
        onBack={() => {
          setView('list');
          setSelectedFlowForAnalytics(null);
        }} 
      />
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setView('list')}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">WhatsApp Flow Builder</h1>
            <p className="text-sm text-gray-500">Design interactive conversational flows for your customers</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setTemplateImportMode('NEW_FLOW');
              setShowAccountTemplateModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors shadow-2xs"
            title="Import content from your Meta WhatsApp templates into a new flow"
          >
            <Plus size={16} /> <Layout size={16} /> Use Account Template
          </button>
          <button
            onClick={() => {
              const result = validateFlowJSON();
              setValidationErrors(result.errors);
              setValidationWarnings(result.warnings);
              setShowValidationModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Tag size={18} /> Validate Flow
          </button>
          <button onClick={() => setShowJsonPreview(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <Code size={18} /> Preview JSON
          </button>
          <button onClick={saveFlow} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            <Save size={18} /> Save as Draft
          </button>
          <button onClick={() => publishFlow()} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#CB376D] rounded-lg hover:bg-[#b52d5e] transition-colors shadow-sm">
            <Play size={18} /> Publish to Meta
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Components</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                <Layout size={12} /> User Interface
              </div>
              <div 
                className="group flex flex-col p-3 border border-gray-100 rounded-xl hover:border-[#CB376D] hover:bg-[#CB376D]/5 cursor-grab active:cursor-grabbing transition-all mb-2"
                onDragStart={(event) => onDragStart(event, 'screen', { label: 'New Screen', header: 'Welcome', body: 'Hello!' })}
                draggable
              >
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 bg-white shadow-sm border border-gray-100 rounded-lg group-hover:text-[#CB376D]">
                    <Layout size={18} />
                  </div>
                  <div className="flex-1 text-xs font-bold text-gray-700">Form Screen</div>
                </div>
                <p className="text-[9px] text-gray-400">A visual screen with header, body, and input fields for users to interact with.</p>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                <Zap size={12} /> Automation Actions
              </div>
              <div 
                className="group flex flex-col p-3 border border-blue-100 rounded-xl bg-blue-50/50 cursor-grab active:cursor-grabbing transition-all mb-2"
                onDragStart={(event) => onDragStart(event, 'action', { actionType: 'database', label: 'Update Profile', comingSoon: true })}
                draggable
              >
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 bg-white shadow-sm border border-blue-100 rounded-lg text-blue-500 transition-colors">
                    <Database size={18} />
                  </div>
                  <div className="flex-1 text-xs font-bold text-gray-700">Update DB</div>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-blue-600">
                    Coming Soon
                  </span>
                </div>
                <p className="text-[9px] text-gray-400">Silently save user data or update customer records in your database once automation is enabled.</p>
              </div>
              <div 
                className="group flex flex-col p-3 border border-amber-100 rounded-xl bg-amber-50/50 cursor-grab active:cursor-grabbing transition-all mb-2"
                onDragStart={(event) => onDragStart(event, 'action', { actionType: 'notification', label: 'Send Alert', comingSoon: true })}
                draggable
              >
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 bg-white shadow-sm border border-amber-100 rounded-lg text-amber-500 transition-colors">
                    <Bell size={18} />
                  </div>
                  <div className="flex-1 text-xs font-bold text-gray-700">Notification</div>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-amber-600">
                    Coming Soon
                  </span>
                </div>
                <p className="text-[9px] text-gray-400">Trigger alerts to staff or customers when this point in the flow is reached, once the backend automation is connected.</p>
              </div>
              <div 
                className="group flex flex-col p-3 border border-[#CB376D]/15 rounded-xl bg-[#CB376D]/5 cursor-grab active:cursor-grabbing transition-all mb-2"
                onDragStart={(event) => onDragStart(event, 'action', { actionType: 'data_exchange', label: 'Meta Data Exchange', comingSoon: true })}
                draggable
              >
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 bg-white shadow-sm border border-[#CB376D]/10 rounded-lg text-[#CB376D] transition-colors">
                    <MessageSquare size={18} />
                  </div>
                  <div className="flex-1 text-xs font-bold text-gray-700">Data Exchange</div>
                  <span className="rounded-full bg-[#CB376D]/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-[#CB376D]">
                    Coming Soon
                  </span>
                </div>
                <p className="text-[9px] text-gray-400">Advanced: Exchange data with your server using Meta's Data Exchange API.</p>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MessageSquare size={12} className="text-[#CB376D]" /> Meta Account Templates
                </span>
              </div>
              <div 
                className="group flex flex-col p-3 border border-emerald-200 bg-emerald-50/50 rounded-xl hover:border-emerald-500 hover:bg-emerald-100/60 cursor-pointer transition-all mb-2"
                onClick={() => {
                  setTemplateImportMode('SCREEN');
                  setShowAccountTemplateModal(true);
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-white shadow-xs rounded-lg text-emerald-600">
                    <Plus size={16} />
                  </div>
                  <div className="flex-1 text-xs font-bold text-gray-800">Use Meta Template</div>
                </div>
                <p className="text-[9px] text-gray-500">Pick an approved template from your Meta account to auto-fill header, body & choices.</p>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                <Layout size={12} /> Screen Templates
              </div>
              <div 
                className="group flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 cursor-grab active:cursor-grabbing transition-all mb-2"
                onDragStart={(event) => onDragStart(event, 'screen', { 
                  label: 'Customer Feedback', 
                  header: 'Feedback', 
                  body: 'How was your experience?', 
                  fields: [
                    { id: 1, type: 'radio', label: 'Rating', options: [{ label: 'Excellent' }, { label: 'Good' }, { label: 'Average' }, { label: 'Poor' }] },
                    { id: 2, type: 'textarea', label: 'Comments' }
                  ] 
                })}
                draggable
              >
                <div className="p-2 bg-white shadow-sm border border-gray-100 rounded-lg text-emerald-500">
                  <MessageSquare size={18} />
                </div>
                <div className="flex-1 text-xs font-bold text-gray-700">Feedback Form</div>
              </div>
              <div 
                className="group flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 cursor-grab active:cursor-grabbing transition-all mb-2"
                onDragStart={(event) => onDragStart(event, 'screen', { 
                  label: 'Lead Registration', 
                  header: 'Register', 
                  body: 'Join our loyalty program!', 
                  fields: [
                    { id: 1, type: 'text', label: 'Full Name' },
                    { id: 2, type: 'text', label: 'Email Address' },
                    { id: 3, type: 'select', label: 'Preferred Store', options: [{ label: 'Store A' }, { label: 'Store B' }] }
                  ] 
                })}
                draggable
              >
                <div className="p-2 bg-white shadow-sm border border-gray-100 rounded-lg text-indigo-500">
                  <Plus size={18} />
                </div>
                <div className="flex-1 text-xs font-bold text-gray-700">Lead Gen</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 relative bg-[#f8fafc]" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodesWithCallbacks}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
          >
            <Controls />
            <MiniMap nodeColor={(n) => n.type === 'screen' ? '#CB376D' : '#10b981'} maskColor="rgba(0, 0, 0, 0.1)" />
            <Background variant="dots" gap={20} size={1} color="#e2e8f0" />
          </ReactFlow>
        </div>

        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="flex border-b border-gray-100">
            <button onClick={() => setActiveTab('properties')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'properties' ? 'text-[#CB376D] border-b-2 border-[#CB376D]' : 'text-gray-400'}`}>Properties</button>
            <button onClick={() => setActiveTab('preview')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'preview' ? 'text-[#CB376D] border-b-2 border-[#CB376D]' : 'text-gray-400'}`}>Preview</button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'properties' ? (
              selectedNode ? (
                <div className="p-6 space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase block">Node Label</label>
                      <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Internal ID</span>
                    </div>
                    <input type="text" placeholder="e.g. Welcome Screen" value={selectedNode.data.label || ''} onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CB376D]/20 focus:border-[#CB376D]" />
                    <p className="text-[9px] text-gray-400 mt-1">This name is used to identify the screen in the flow builder and routing.</p>
                  </div>

                  {selectedNode.type === 'screen' && (
                    <div className="space-y-6">
                      <div className="pt-4 border-t border-gray-100 space-y-4">
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase block">Screen Layout</label>
                          <button
                            type="button"
                            onClick={() => {
                              setTemplateImportMode('SCREEN');
                              setShowAccountTemplateModal(true);
                            }}
                            className="flex items-center gap-1 text-[10px] font-bold text-[#CB376D] bg-[#CB376D]/10 hover:bg-[#CB376D]/20 px-2 py-0.5 rounded transition-colors"
                            title="Fill screen with content from a Meta WhatsApp Template"
                          >
                            <Plus size={10} /> Meta Template
                          </button>
                        </div>
                        
                        <div>
                          <label className="text-[11px] font-semibold text-gray-600 mb-1 block">Header Text</label>
                          <input type="text" placeholder="e.g. Welcome to Vadik AI" value={selectedNode.data.header || ''} onChange={(e) => updateNodeData(selectedNode.id, { header: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-[#CB376D] outline-none" />
                          <p className="text-[9px] text-gray-400 mt-1">Bold title shown at the top of the WhatsApp screen.</p>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-gray-600 mb-1 block">Body Message</label>
                          <textarea placeholder="e.g. Please let us know how we can help you today..." value={selectedNode.data.body || ''} onChange={(e) => updateNodeData(selectedNode.id, { body: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs h-20 focus:ring-1 focus:ring-[#CB376D] outline-none" />
                          <p className="text-[9px] text-gray-400 mt-1">The main text content users will read on this screen.</p>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-gray-600 mb-1 block">Footer Button Label</label>
                          <input type="text" placeholder="e.g. Continue" value={selectedNode.data.footerLabel || ''} onChange={(e) => updateNodeData(selectedNode.id, { footerLabel: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-[#CB376D] outline-none" />
                          <p className="text-[9px] text-gray-400 mt-1">Text shown on the primary action button at the bottom.</p>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase block">Outgoing Routes</label>
                              <p className="text-[9px] text-gray-400">Review and remove page-to-page links from this screen.</p>
                            </div>
                            <span className="text-[9px] font-bold text-[#CB376D] bg-[#CB376D]/5 px-2 py-1 rounded-full">
                              {getOutgoingRoutes(selectedNode.id).length} routes
                            </span>
                          </div>

                          <div className="space-y-2">
                            {getOutgoingRoutes(selectedNode.id).length > 0 ? (
                              getOutgoingRoutes(selectedNode.id).map((edge) => {
                                const targetNode = nodes.find((node) => node.id === edge.target);
                                const condition = edge.data?.condition;
                                const conditionLabel = condition?.field
                                  ? `${condition.field} ${condition.operator || 'equals'} ${condition.value || ''}`.trim()
                                  : null;

                                return (
                                  <div key={edge.id} className="p-3 rounded-lg border border-gray-200 bg-gray-50 flex items-start justify-between gap-3">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedEdge(edge)}
                                      className="text-left flex-1"
                                    >
                                      <div className="text-xs font-semibold text-gray-700">{edge.data?.label || 'Route'}</div>
                                      <div className="text-[9px] text-gray-500 mt-0.5">
                                        Goes to: {getNodeDisplayName(targetNode)}
                                      </div>
                                      {conditionLabel && (
                                        <div className="text-[9px] text-[#CB376D] mt-1">
                                          If {conditionLabel}
                                        </div>
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => removeEdgeById(edge.id)}
                                      className="shrink-0 rounded-md border border-red-100 bg-white p-1.5 text-red-500 hover:bg-red-50"
                                      title="Remove route"
                                    >
                                      <X size={12} />
                                    </button>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-4 text-[10px] text-gray-400">
                                No outgoing routes yet. Connect this screen to another page or action to create a transition.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase block">Input Fields</label>
                            <p className="text-[9px] text-gray-400">Add forms elements for users to fill.</p>
                          </div>
                          <button 
                            onClick={() => updateNodeData(selectedNode.id, { fields: [...(selectedNode.data.fields || []), { id: Date.now(), type: 'text', label: 'New Field', name: `field_${Date.now()}`, options: [] }] })}
                            className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-white bg-[#CB376D] rounded hover:bg-[#b52d5e] transition-colors"
                          >
                            <Plus size={10} /> ADD FIELD
                          </button>
                        </div>
                        <div className="space-y-4">
                          {(selectedNode.data.fields || []).map((field) => (
                            <div key={field.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 relative group hover:border-[#CB376D]/30 transition-colors">
                              <button onClick={() => updateNodeData(selectedNode.id, { fields: selectedNode.data.fields.filter(f => f.id !== field.id) })} className="absolute -top-2 -right-2 p-1 bg-white border border-gray-200 rounded-full text-red-500 shadow-sm hover:bg-red-50"><X size={10} /></button>
                              
                              <div className="space-y-3">
                                <div className="flex gap-2">
                                  <div className="flex-1">
                                    <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 block">Field Type</label>
                                    <select 
                                      value={field.type}
                                      onChange={(e) => updateNodeData(selectedNode.id, { fields: selectedNode.data.fields.map(f => f.id === field.id ? { ...f, type: e.target.value } : f) })}
                                      className="w-full text-[10px] bg-white border border-gray-200 px-1 py-1 rounded font-bold text-[#CB376D] focus:ring-1 focus:ring-[#CB376D] outline-none"
                                    >
                                      <option value="text">Text Input (Short)</option>
                                      <option value="textarea">Multi-line (Long)</option>
                                      <option value="select">Dropdown List</option>
                                      <option value="radio">Radio Buttons (Branching)</option>
                                      <option value="checkbox">Checkbox Group</option>
                                      <option value="optin">Opt-in Toggle</option>
                                    </select>
                                  </div>
                                  <div className="flex-1">
                                    <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 block">Variable Name</label>
                                    <input 
                                      placeholder="e.g. user_name"
                                      type="text" 
                                      value={field.name || ''} 
                                      onChange={(e) => updateNodeData(selectedNode.id, { fields: selectedNode.data.fields.map(f => f.id === field.id ? { ...f, name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') } : f) })} 
                                      className="w-full bg-white px-2 py-1 border border-gray-200 rounded text-[10px] focus:ring-1 focus:ring-[#CB376D] outline-none" 
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 block">Display Label</label>
                                  <input placeholder="e.g. What is your name?" type="text" value={field.label} onChange={(e) => updateNodeData(selectedNode.id, { fields: selectedNode.data.fields.map(f => f.id === field.id ? { ...f, label: e.target.value } : f) })} className="w-full bg-white px-2 py-1.5 border border-gray-200 rounded text-[11px] focus:ring-1 focus:ring-[#CB376D] outline-none" />
                                </div>
                                
                                {['select', 'radio', 'checkbox'].includes(field.type) && (
                                  <div className="mt-2 space-y-2 border-t border-gray-200 pt-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[9px] font-bold text-gray-400 uppercase">Options (Branches)</span>
                                      <button onClick={() => updateNodeData(selectedNode.id, { fields: selectedNode.data.fields.map(f => f.id === field.id ? { ...f, options: [...(f.options || []), { label: `Option ${(f.options?.length || 0) + 1}`, value: `val_${(f.options?.length || 0) + 1}` }] } : f) })} className="text-[9px] font-bold text-[#CB376D] hover:underline">+ OPTION</button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-1.5">
                                      {(field.options || []).map((opt, oIdx) => (
                                        <div key={oIdx} className="flex items-center gap-1 group/opt">
                                          <input type="text" placeholder="Option Label" value={opt.label} onChange={(e) => updateNodeData(selectedNode.id, { fields: selectedNode.data.fields.map(f => f.id === field.id ? { ...f, options: f.options.map((o, i) => i === oIdx ? { ...o, label: e.target.value, value: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') } : o) } : f) })} className="flex-1 px-2 py-1 border border-gray-100 rounded text-[10px] focus:border-[#CB376D] outline-none" />
                                          <button onClick={() => updateNodeData(selectedNode.id, { fields: selectedNode.data.fields.map(f => f.id === field.id ? { ...f, options: f.options.filter((_, i) => i !== oIdx) } : f) })} className="text-gray-300 hover:text-red-400 transition-colors"><X size={10} /></button>
                                        </div>
                                      ))}
                                    </div>
                                    {field.type === 'radio' && <p className="text-[8px] text-gray-400 italic">Radio options create branches you can connect to other screens.</p>}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedNode.type === 'action' && (
                    <div className="pt-4 border-t border-gray-100 space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Action Type</label>
                        <select value={selectedNode.data.actionType || 'database'} onChange={(e) => updateNodeData(selectedNode.id, { actionType: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none">
                          <option value="database">Update Database</option>
                          <option value="notification">Send Notification</option>
                          <option value="loyalty">Award Loyalty</option>
                          <option value="data_exchange">Meta Data Exchange</option>
                          <option value="api">External API Call</option>
                        </select>
                        <p className="text-[9px] text-gray-400 mt-1">Actions are performed automatically when the flow reaches this point.</p>
                      </div>
                      {selectedNode.data.actionType === 'api' && (
                        <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                           <div>
                            <label className="text-[11px] font-semibold text-gray-600 mb-1 block">API Endpoint URL</label>
                            <input type="text" placeholder="https://api.example.com/hook" value={selectedNode.data.apiUrl || ''} onChange={(e) => updateNodeData(selectedNode.id, { apiUrl: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none" />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-gray-600 mb-1 block">HTTP Method</label>
                            <select value={selectedNode.data.apiMethod || 'POST'} onChange={(e) => updateNodeData(selectedNode.id, { apiMethod: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none">
                              <option value="GET">GET</option>
                              <option value="POST">POST</option>
                              <option value="PUT">PUT</option>
                            </select>
                          </div>
                          <p className="text-[8px] text-blue-400 italic">Vadik will send current user data as a JSON payload to this endpoint.</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-6 border-t border-gray-100">
                    <button 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this node? All its connections will also be removed.')) {
                          setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
                          setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
                          setSelectedNode(null);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-red-500 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <X size={14} /> DELETE NODE
                    </button>
                    <p className="text-[9px] text-gray-400 mt-2 text-center">Removing this node will also delete its incoming and outgoing connections.</p>
                  </div>
                </div>
              ) : selectedEdge ? (
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-800">Edge Properties</h3>
                    <button onClick={() => { setEdges(eds => eds.filter(e => e.id !== selectedEdge.id)); setSelectedEdge(null); }} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg border border-red-100 transition-colors"> Remove </button>
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Display Label</label>
                    <input type="text" value={selectedEdge.data?.label || ''} onChange={(e) => {
                      const newLabel = e.target.value;
                      setEdges(eds => eds.map(edge => edge.id === selectedEdge.id ? { ...edge, data: { ...edge.data, label: newLabel } } : edge));
                      setSelectedEdge(prev => ({ ...prev, data: { ...prev.data, label: newLabel } }));
                    }} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CB376D]/20 focus:border-[#CB376D]" />
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-3 block">Conditions (If/Else)</label>
                    <div className="space-y-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div>
                        <label className="text-[9px] font-bold text-gray-500 uppercase mb-1 block">When Field</label>
                        <select 
                          value={selectedEdge.data?.condition?.field || ''} 
                          onChange={(e) => {
                            const condition = { ...(selectedEdge.data?.condition || {}), field: e.target.value };
                            setEdges(eds => eds.map(edge => edge.id === selectedEdge.id ? { ...edge, data: { ...edge.data, condition } } : edge));
                            setSelectedEdge(prev => ({ ...prev, data: { ...prev.data, condition } }));
                          }}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs bg-white"
                        >
                          <option value="">Select Field...</option>
                          {nodes.filter(n => n.type === 'screen').flatMap(n => (n.data.fields || []).map(f => ({ label: `${n.data.label} > ${f.label}`, value: f.name }))).map((f, i) => (
                            <option key={i} value={f.value}>{f.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-[9px] font-bold text-gray-500 uppercase mb-1 block">Is</label>
                          <select 
                            value={selectedEdge.data?.condition?.operator || 'equals'} 
                            onChange={(e) => {
                              const condition = { ...(selectedEdge.data?.condition || {}), operator: e.target.value };
                              setEdges(eds => eds.map(edge => edge.id === selectedEdge.id ? { ...edge, data: { ...edge.data, condition } } : edge));
                              setSelectedEdge(prev => ({ ...prev, data: { ...prev.data, condition } }));
                            }}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs bg-white"
                          >
                            <option value="equals">Equals</option>
                            <option value="not_equals">Not Equals</option>
                            <option value="contains">Contains</option>
                            <option value="greater_than">&gt;</option>
                            <option value="less_than">&lt;</option>
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="text-[9px] font-bold text-gray-500 uppercase mb-1 block">Value</label>
                          <input 
                            type="text" 
                            value={selectedEdge.data?.condition?.value || ''} 
                            onChange={(e) => {
                              const condition = { ...(selectedEdge.data?.condition || {}), value: e.target.value };
                              setEdges(eds => eds.map(edge => edge.id === selectedEdge.id ? { ...edge, data: { ...edge.data, condition } } : edge));
                              setSelectedEdge(prev => ({ ...prev, data: { ...prev.data, condition } }));
                            }}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 p-6 flex flex-col items-center justify-center text-center h-full">
                  <Settings size={32} className="text-gray-200 mb-2" />
                  <p className="text-sm font-medium text-gray-500">No element selected</p>
                </div>
              )
            ) : (
              <div className="p-6 h-full flex flex-col items-center">
                <div className="mb-4 flex items-center justify-between w-full">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Live Simulation</span>
                  <button onClick={() => { setActivePreviewScreenId(nodes.find(n => n.type === 'screen')?.id || null); setPreviewData({}); }} className="text-[10px] font-bold text-[#CB376D] hover:underline">Reset Flow</button>
                </div>
                {activePreviewScreen ? (
                  <div className="w-full max-w-[260px] aspect-[9/18] bg-gray-900 rounded-[3rem] border-[6px] border-gray-800 shadow-2xl relative overflow-hidden flex flex-col">
                    <div className="h-6 w-full bg-gray-900 flex items-center justify-center"><div className="w-16 h-3 bg-black rounded-full"></div></div>
                    <div className="flex-1 bg-white m-1 rounded-[2rem] overflow-hidden flex flex-col">
                      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                        <MessageSquare size={12} className="text-[#CB376D]" />
                        <span className="text-[10px] font-bold text-gray-700 truncate">{activePreviewScreen.data.header || activePreviewScreen.data.label}</span>
                      </div>
                      <div className="p-4 flex-1 space-y-4">
                        <div className="text-[11px] text-gray-600 font-medium">{activePreviewScreen.data.body || "Please fill the details below"}</div>
                        <div className="space-y-3">
                          {(activePreviewScreen.data.fields || []).map((f, i) => (
                            <div key={i} className="space-y-1">
                              <label className="text-[9px] font-bold text-gray-400 uppercase">{f.label}</label>
                              {f.type === 'radio' ? (
                                <div className="space-y-1">
                                  {(f.options || []).map((opt, oIdx) => (
                                    <button 
                                      key={oIdx} 
                                      onClick={() => {
                                        setPreviewData(prev => ({ ...prev, [f.name]: opt.value }));
                                      }} 
                                      className={`w-full text-left px-3 py-1.5 border rounded text-[10px] transition-colors ${previewData[f.name] === opt.value ? 'bg-[#CB376D] text-white border-[#CB376D]' : 'bg-white text-gray-600 border-gray-200 hover:bg-[#CB376D]/5 hover:border-[#CB376D]'}`}
                                    >
                                      {opt.label}
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <input 
                                  type={f.type === 'textarea' ? 'text' : f.type}
                                  placeholder={f.type === 'select' ? 'Select option...' : 'Type something...'}
                                  value={previewData[f.name] || ''}
                                  onChange={(e) => setPreviewData(prev => ({ ...prev, [f.name]: e.target.value }))}
                                  className="w-full h-8 border border-gray-200 rounded bg-gray-50 flex items-center px-2 text-[10px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#CB376D]"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 border-t border-gray-100">
                        <button onClick={() => handlePreviewSubmit()} className="w-full py-2 bg-[#CB376D] text-white text-[11px] font-bold rounded-lg shadow-sm hover:bg-[#b52d5e]"> {activePreviewScreen.data.footerLabel || "Submit"} </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-300">
                    <Eye size={32} className="mb-2" />
                    <p className="text-xs">Select a Screen to start</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showJsonPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-2"> <Code className="text-[#CB376D]" /> <h3 className="text-lg font-bold text-gray-800">Meta Flow Definition</h3> </div>
              <button onClick={() => setShowJsonPreview(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"> <X size={20} /> </button>
            </div>
            <div className="flex-1 overflow-auto p-6"> <pre className="bg-gray-900 text-gray-100 p-6 rounded-xl text-xs font-mono leading-relaxed overflow-x-auto"> {generateMetaJSON()} </pre> </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => { navigator.clipboard.writeText(generateMetaJSON()); showToast('JSON copied!', 'success'); }} className="px-6 py-2 text-sm font-bold text-[#CB376D] border border-[#CB376D] rounded-lg">Copy JSON</button>
              <button onClick={() => setShowJsonPreview(false)} className="px-6 py-2 text-sm font-bold text-white bg-[#CB376D] rounded-lg shadow-sm">Close</button>
            </div>
          </div>
        </div>
      )}

      <AccountTemplateModal
        isOpen={showAccountTemplateModal}
        onClose={() => setShowAccountTemplateModal(false)}
        onSelectTemplate={handleSelectAccountTemplate}
        title={templateImportMode === 'NEW_FLOW' ? "Use Meta WhatsApp Template as New Flow" : "Populate Screen from Meta WhatsApp Template"}
      />

      {showValidationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-2">
                {validationErrors.length > 0 ? (
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <X size={16} className="text-red-600" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <Bell size={16} className="text-amber-600" />
                  </div>
                )}
                <h3 className="text-lg font-bold text-gray-800">
                  {validationErrors.length > 0 ? 'Flow Has Errors — Cannot Publish' : 'Flow Warnings'}
                </h3>
              </div>
              <button onClick={() => setShowValidationModal(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6 space-y-4">
              {validationErrors.length === 0 && validationWarnings.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <Play size={24} className="text-green-600" />
                  </div>
                  <p className="text-sm font-bold text-green-700">Flow looks good!</p>
                  <p className="text-xs text-gray-500 mt-1">No errors or warnings detected. You can publish this flow.</p>
                </div>
              )}

              {validationErrors.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-3">
                    {validationErrors.length} Error{validationErrors.length !== 1 ? 's' : ''} — Fix these before publishing
                  </p>
                  <div className="space-y-2">
                    {validationErrors.map((err, i) => (
                      <div key={i} className="flex gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">
                        <div className="mt-0.5 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                          <X size={10} className="text-white" />
                        </div>
                        <p className="text-xs text-red-700 leading-relaxed">{err}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {validationWarnings.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-3">
                    {validationWarnings.length} Warning{validationWarnings.length !== 1 ? 's' : ''}
                  </p>
                  <div className="space-y-2">
                    {validationWarnings.map((warn, i) => (
                      <div key={i} className="flex gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                        <div className="mt-0.5 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-[9px] font-bold">!</span>
                        </div>
                        <p className="text-xs text-amber-700 leading-relaxed">{warn}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowValidationModal(false)}
                className="px-6 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {validationErrors.length > 0 ? 'Fix Issues' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DialogueFlow = () => (
  <ReactFlowProvider>
    <DialogueFlowInner />
  </ReactFlowProvider>
);

export default DialogueFlow;
