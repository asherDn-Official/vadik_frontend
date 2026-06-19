import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import api from '../api/apiconfig';
import showToast from '../utils/ToastNotification';
import ComingSoon from '../components/common/ComingSoon';

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
  const userEmail = localStorage.getItem("email");
  const isAuthorized = userEmail === "anbumanickam1972@gmail.com";

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <ComingSoon />
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
  const [activePreviewScreen, setActivePreviewScreen] = useState(null);
  const [previewData, setPreviewData] = useState({});
  
  const [view, setView] = useState('list'); // 'list', 'builder', or 'analytics'
  const [flows, setFlows] = useState([]);
  const [currentFlowId, setCurrentFlowId] = useState(null);
  const [flowsLoading, setFlowsLoading] = useState(true);
  const [defaultFlowId, setDefaultFlowId] = useState(null);
  const [selectedFlowForAnalytics, setSelectedFlowForAnalytics] = useState(null);

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

  // Sync activePreviewScreen with selectedNode when tab changes to preview
  useEffect(() => {
    if (activeTab === 'preview' && selectedNode?.type === 'screen') {
      setActivePreviewScreen(selectedNode);
    } else if (activeTab === 'preview' && !activePreviewScreen) {
       setActivePreviewScreen(nodes.find(n => n.type === 'screen'));
    }
  }, [activeTab, selectedNode, nodes]);

  const generateMetaJSON = () => {
    const screens = nodes.filter(n => n.type === 'screen').map(n => {
      const screenId = n.data.label?.toUpperCase().replace(/[^A-Z0-9]+/g, '_') || n.id.toUpperCase();
      const outgoingEdges = edges.filter(e => e.source === n.id);
      const submitEdge = outgoingEdges.find(e => e.sourceHandle === 'submit' || !e.sourceHandle);
      const targetNode = submitEdge ? nodes.find(node => node.id === submitEdge.target) : null;
      
      const isBranching = outgoingEdges.some(e => e.sourceHandle?.startsWith('choice_'));
      const isActionTarget = targetNode?.type === 'action';

      const currentScreenPayload = n.data.fields?.reduce((acc, field) => {
        const fieldName = field.name || field.label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        acc[fieldName] = `\${form.${fieldName}}`;
        return acc;
      }, {}) || {};

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

      if (n.data.fields && n.data.fields.length > 0) {
        children.push({
          type: "Form",
          name: "flow_form",
          children: n.data.fields.map(f => {
            const base = {
              name: f.name || f.label.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
              label: f.label,
              required: f.required !== false
            };

            if (f.type === 'radio' || f.type === 'select' || f.type === 'checkbox') {
              const typeMap = {
                radio: 'RadioButtonsGroup',
                select: 'Dropdown',
                checkbox: 'CheckboxGroup'
              };

              const options = (f.options || []).map((o, oIdx) => {
                const optionId = o.value || o.label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
                return {
                  id: optionId,
                  title: o.label
                };
              });

              const result = {
                type: typeMap[f.type],
                name: base.name,
                label: base.label,
                required: base.required
              };

              if (f.type === 'radio') {
                result['data-source'] = options;
              } else {
                result['options'] = options;
              }

              return result;
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
          })
        });
      }

      children.push({
        type: "Footer",
        label: n.data.footerLabel || "Submit",
        "on-click-action": (() => {
          if (isBranching || isActionTarget) {
            return {
              name: "data_exchange",
              payload: currentScreenPayload
            };
          }

          if (submitEdge) {
            const targetScreenId = targetNode?.data?.label?.toUpperCase().replace(/[^A-Z0-9]+/g, '_') || targetNode?.id.toUpperCase();
            return {
              name: "navigate",
              next: {
                type: "screen",
                name: targetScreenId
              },
              payload: currentScreenPayload
            };
          }
          return {
            name: "complete",
            payload: currentScreenPayload
          };
        })()
      });

      return {
        id: screenId,
        title: n.data.label,
        terminal: !submitEdge && !isBranching && !isActionTarget,
        layout: {
          type: "SingleColumnLayout",
          children: children
        }
      };
    });

    const routingModel = {};
    // Every screen node in the graph needs to be mapped to its reachable screen transitions
    const getReachableScreens = (sourceNodeId, visited = new Set()) => {
      if (visited.has(sourceNodeId)) return [];
      visited.add(sourceNodeId);

      const outgoing = edges.filter(e => e.source === sourceNodeId);
      let reachable = [];

      outgoing.forEach(edge => {
        const targetNode = nodes.find(n => n.id === edge.target);
        if (!targetNode) return;

        if (targetNode.type === 'screen') {
          reachable.push(targetNode.data.label?.toUpperCase().replace(/[^A-Z0-9]+/g, '_') || targetNode.id.toUpperCase());
        } else if (targetNode.type === 'action') {
          // Traverse through action nodes to find screens
          reachable = [...reachable, ...getReachableScreens(targetNode.id, visited)];
        }
      });

      return Array.from(new Set(reachable));
    };

    nodes.filter(node => node.type === 'screen').forEach(node => {
      const sanitizedId = node.data.label?.toUpperCase().replace(/[^A-Z0-9]+/g, '_') || node.id.toUpperCase();
      routingModel[sanitizedId] = getReachableScreens(node.id);
    });

    return JSON.stringify({
      version: "3.0",
      data_api_version: "3.0",
      routing_model: routingModel,
      screens: screens,
    }, null, 2);
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

  const publishFlow = async (flow = null) => {
    try {
      let flowToPublish = flow;
      
      if (!flowToPublish) {
        // If coming from builder, save first
        flowToPublish = await saveFlow();
        if (!flowToPublish?._id) return;
      }

      showToast('Publishing to Meta...', 'info');
      
      // Always generate fresh JSON from the current visual graph to ensure latest fixes
      const freshMetaJSON = JSON.parse(generateMetaJSON());
      
      const payload = {
        metaFlowDefinition: freshMetaJSON
      };

      const flowId = flowToPublish._id || flowToPublish.id;
      if (!flowId) {
        showToast('Cannot publish: Flow ID is missing. Please save first.', 'error');
        return;
      }

      const response = await api.post(`/api/whatsappFlow/${flowId}/publish`, payload);
      showToast('Flow published successfully!', 'success');
      fetchFlows();
    } catch (error) {
      console.error('Error publishing flow:', error);
      showToast(error.response?.data?.error || 'Failed to publish flow', 'error');
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

  const handlePreviewSubmit = (choiceId = null) => {
    if (!activePreviewScreen) return;

    // Determine the relevant handle
    const transitionHandle = choiceId || 'submit';
    
    // Find all outgoing edges
    const outgoingEdges = edges.filter(e => e.source === activePreviewScreen.id);
    
    // 1. Check for choice-specific handle first (Direct Branching)
    const directEdge = outgoingEdges.find(e => e.sourceHandle === transitionHandle);
    
    // 2. If no direct choice edge, check for conditional edges on 'submit'
    let nextEdge = directEdge;
    if (!nextEdge && transitionHandle === 'submit') {
      nextEdge = outgoingEdges.find(e => e.sourceHandle === 'submit' && evaluateCondition(e.data?.condition, previewData));
    }
    
    if (nextEdge) {
      const nextNode = nodes.find(n => n.id === nextEdge.target);
      executeNode(nextNode);
    } else {
      showToast('Flow ended or no matching transition found', 'info');
    }
  };

  const executeNode = async (node) => {
    if (!node) return;

    if (node.type === 'screen') {
      setActivePreviewScreen(node);
    } else if (node.type === 'action') {
      showToast(`Executing: ${node.data.label}`, 'info');
      
      // Simulate action delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Find next node after action
      const nextEdge = edges.find(e => e.source === node.id);
      if (nextEdge) {
        const nextNode = nodes.find(n => n.id === nextEdge.target);
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
          <button onClick={() => setShowJsonPreview(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <Code size={18} /> Preview JSON
          </button>
          <button onClick={saveFlow} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Save size={18} /> Save Draft
          </button>
          <button onClick={publishFlow} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#CB376D] rounded-lg hover:bg-[#b52d5e] transition-colors shadow-sm">
            <Play size={18} /> Publish Flow
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
                className="group flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:border-[#CB376D] hover:bg-[#CB376D]/5 cursor-grab active:cursor-grabbing transition-all mb-2"
                onDragStart={(event) => onDragStart(event, 'screen', { label: 'New Screen' })}
                draggable
              >
                <div className="p-2 bg-white shadow-sm border border-gray-100 rounded-lg group-hover:text-[#CB376D]">
                  <Layout size={18} />
                </div>
                <div className="flex-1 text-xs font-bold text-gray-700">Form Screen</div>
                <ChevronRight size={14} className="text-gray-300 group-hover:text-[#CB376D]" />
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                <Zap size={12} /> Automation Actions
              </div>
              <div 
                className="group flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 cursor-grab active:cursor-grabbing transition-all mb-2"
                onDragStart={(event) => onDragStart(event, 'action', { actionType: 'database', label: 'Update Profile' })}
                draggable
              >
                <div className="p-2 bg-white shadow-sm border border-gray-100 rounded-lg text-blue-500">
                  <Database size={18} />
                </div>
                <div className="flex-1 text-xs font-bold text-gray-700">Update DB</div>
              </div>
              <div 
                className="group flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:border-amber-500 hover:bg-amber-50 cursor-grab active:cursor-grabbing transition-all mb-2"
                onDragStart={(event) => onDragStart(event, 'action', { actionType: 'notification', label: 'Send Alert' })}
                draggable
              >
                <div className="p-2 bg-white shadow-sm border border-gray-100 rounded-lg text-amber-500">
                  <Bell size={18} />
                </div>
                <div className="flex-1 text-xs font-bold text-gray-700">Notification</div>
              </div>
              <div 
                className="group flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:border-[#CB376D] hover:bg-[#CB376D]/5 cursor-grab active:cursor-grabbing transition-all mb-2"
                onDragStart={(event) => onDragStart(event, 'action', { actionType: 'data_exchange', label: 'Meta Data Exchange' })}
                draggable
              >
                <div className="p-2 bg-white shadow-sm border border-gray-100 rounded-lg text-[#CB376D]">
                  <MessageSquare size={18} />
                </div>
                <div className="flex-1 text-xs font-bold text-gray-700">Data Exchange</div>
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
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
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
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Node Label</label>
                    <input type="text" value={selectedNode.data.label || ''} onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CB376D]/20 focus:border-[#CB376D]" />
                  </div>

                  {selectedNode.type === 'screen' && (
                    <div className="space-y-6">
                      <div className="pt-4 border-t border-gray-100 space-y-4">
                        <label className="text-[10px] font-bold text-gray-400 uppercase block">Screen Layout</label>
                        <div>
                          <label className="text-[11px] text-gray-500 mb-1 block">Header</label>
                          <input type="text" value={selectedNode.data.header || ''} onChange={(e) => updateNodeData(selectedNode.id, { header: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs" />
                        </div>
                        <div>
                          <label className="text-[11px] text-gray-500 mb-1 block">Body</label>
                          <textarea value={selectedNode.data.body || ''} onChange={(e) => updateNodeData(selectedNode.id, { body: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs h-20" />
                        </div>
                        <div>
                          <label className="text-[11px] text-gray-500 mb-1 block">Button</label>
                          <input type="text" value={selectedNode.data.footerLabel || ''} onChange={(e) => updateNodeData(selectedNode.id, { footerLabel: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs" />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Input Fields</label>
                          <button 
                            onClick={() => updateNodeData(selectedNode.id, { fields: [...(selectedNode.data.fields || []), { id: Date.now(), type: 'text', label: 'New Field', name: `field_${Date.now()}`, options: [] }] })}
                            className="text-[10px] font-bold text-[#CB376D]"
                          >+ ADD</button>
                        </div>
                        <div className="space-y-4">
                          {(selectedNode.data.fields || []).map((field) => (
                            <div key={field.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 relative group">
                              <button onClick={() => updateNodeData(selectedNode.id, { fields: selectedNode.data.fields.filter(f => f.id !== field.id) })} className="absolute -top-2 -right-2 p-1 bg-white border border-gray-200 rounded-full text-red-500"><X size={10} /></button>
                              <div className="flex gap-2 mb-2">
                                <select 
                                  value={field.type}
                                  onChange={(e) => updateNodeData(selectedNode.id, { fields: selectedNode.data.fields.map(f => f.id === field.id ? { ...f, type: e.target.value } : f) })}
                                  className="text-[10px] bg-white border border-gray-200 px-1 py-0.5 rounded font-bold text-[#CB376D]"
                                >
                                  <option value="text">Text Input</option>
                                  <option value="textarea">Multi-line</option>
                                  <option value="select">Dropdown</option>
                                  <option value="radio">Radio (Branching)</option>
                                  <option value="checkbox">Checkbox Group</option>
                                  <option value="optin">Opt-in Toggle</option>
                                </select>
                                <input 
                                  placeholder="Variable Name"
                                  type="text" 
                                  value={field.name || ''} 
                                  onChange={(e) => updateNodeData(selectedNode.id, { fields: selectedNode.data.fields.map(f => f.id === field.id ? { ...f, name: e.target.value } : f) })} 
                                  className="flex-1 bg-white px-2 py-0.5 border border-gray-200 rounded text-[10px]" 
                                />
                              </div>
                              <input placeholder="Display Label" type="text" value={field.label} onChange={(e) => updateNodeData(selectedNode.id, { fields: selectedNode.data.fields.map(f => f.id === field.id ? { ...f, label: e.target.value } : f) })} className="w-full bg-white px-2 py-1 border border-gray-200 rounded text-[11px]" />
                              
                              {['select', 'radio', 'checkbox'].includes(field.type) && (
                                <div className="mt-2 space-y-1.5 border-t border-gray-200 pt-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase">Options (Branches)</span>
                                    <button onClick={() => updateNodeData(selectedNode.id, { fields: selectedNode.data.fields.map(f => f.id === field.id ? { ...f, options: [...(f.options || []), { label: `Option ${(f.options?.length || 0) + 1}`, value: `val_${(f.options?.length || 0) + 1}` }] } : f) })} className="text-[9px] font-bold text-[#CB376D]">+ OPTION</button>
                                  </div>
                                  {(field.options || []).map((opt, oIdx) => (
                                    <div key={oIdx} className="flex items-center gap-1">
                                      <input type="text" value={opt.label} onChange={(e) => updateNodeData(selectedNode.id, { fields: selectedNode.data.fields.map(f => f.id === field.id ? { ...f, options: f.options.map((o, i) => i === oIdx ? { ...o, label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, '_') } : o) } : f) })} className="flex-1 px-2 py-0.5 border border-gray-100 rounded text-[10px]" />
                                      <button onClick={() => updateNodeData(selectedNode.id, { fields: selectedNode.data.fields.map(f => f.id === field.id ? { ...f, options: f.options.filter((_, i) => i !== oIdx) } : f) })} className="text-red-400"><X size={10} /></button>
                                    </div>
                                  ))}
                                </div>
                              )}
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
                        <select value={selectedNode.data.actionType || 'database'} onChange={(e) => updateNodeData(selectedNode.id, { actionType: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                          <option value="database">Update Database</option>
                          <option value="notification">Send Notification</option>
                          <option value="loyalty">Award Loyalty</option>
                          <option value="data_exchange">Meta Data Exchange</option>
                          <option value="api">External API Call</option>
                        </select>
                      </div>
                      {selectedNode.data.actionType === 'api' && (
                        <div className="space-y-3">
                           <div>
                            <label className="text-[11px] text-gray-500 mb-1 block">URL</label>
                            <input type="text" placeholder="https://api.example.com/hook" value={selectedNode.data.apiUrl || ''} onChange={(e) => updateNodeData(selectedNode.id, { apiUrl: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs" />
                          </div>
                          <div>
                            <label className="text-[11px] text-gray-500 mb-1 block">Method</label>
                            <select value={selectedNode.data.apiMethod || 'POST'} onChange={(e) => updateNodeData(selectedNode.id, { apiMethod: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs">
                              <option value="GET">GET</option>
                              <option value="POST">POST</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <button onClick={() => { setNodes(nds => nds.filter(n => n.id !== selectedNode.id)); setSelectedNode(null); }} className="w-full py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg mt-6 border border-red-100">Delete Node</button>
                </div>
              ) : selectedEdge ? (
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-800">Edge Properties</h3>
                    <button onClick={() => { setEdges(eds => eds.filter(e => e.id !== selectedEdge.id)); setSelectedEdge(null); }} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg border border-red-100 transition-colors"> <X size={16} /> </button>
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
                  <button onClick={() => setActivePreviewScreen(nodes.find(n => n.type === 'screen'))} className="text-[10px] font-bold text-[#CB376D] hover:underline">Reset Flow</button>
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
                                        handlePreviewSubmit(`choice_${f.id}_${oIdx}`);
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
    </div>
  );
};

const DialogueFlow = () => (
  <ReactFlowProvider>
    <DialogueFlowInner />
  </ReactFlowProvider>
);

export default DialogueFlow;
