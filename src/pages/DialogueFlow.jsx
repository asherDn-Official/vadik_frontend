import React, { useState, useCallback, useRef } from 'react';
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
  X
} from 'lucide-react';

import ScreenNode from '../components/dialogueFlow/ScreenNode';
import ActionNode from '../components/dialogueFlow/ActionNode';
import api from '../api/apiconfig';
import showToast from '../utils/ToastNotification';

const nodeTypes = {
  screen: ScreenNode,
  action: ActionNode,
};

const initialNodes = [
  {
    id: '1',
    type: 'screen',
    data: { label: 'Welcome Screen' },
    position: { x: 250, y: 50 },
  },
];

const initialEdges = [];

let id = 0;
const getId = () => `node_${id++}`;

const DialogueFlowInner = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('properties'); // 'properties' or 'preview'

  const generateMetaJSON = () => {
    // Advanced mapping to official Meta Flow Definition
    const screens = nodes.filter(n => n.type === 'screen').map(n => {
      const screenId = n.data.label?.toLowerCase().replace(/\s+/g, '_') || n.id;
      
      const children = [
        {
          type: "Header",
          props: { title: n.data.header || n.data.label }
        },
        {
          type: "Form",
          props: {
            children: [
              {
                type: "Text",
                props: { text: n.data.body || "Please fill the details below" }
              },
              ...(n.data.fields || []).map(f => ({
                type: f.type === 'select' ? 'Dropdown' : 'TextInput',
                props: {
                  label: f.label,
                  name: f.label.toLowerCase().replace(/\s+/g, '_'),
                  required: f.required !== false
                }
              })),
              {
                type: "Footer",
                props: {
                  label: n.data.footerLabel || "Submit",
                  on_click_action: {
                    name: "data_exchange"
                  }
                }
              }
            ]
          }
        }
      ];

      return {
        id: screenId,
        layout: {
          type: "SingleColumnLayout",
          children: children
        }
      };
    });

    return JSON.stringify({
      version: "3.1",
      screens: screens
    }, null, 2);
  };

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const updateNodeData = (nodeId, newData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      })
    );
    // Also update selectedNode to reflect changes in UI
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

      const response = await api.post('/whatsappFlow', flowData);
      showToast('Flow saved successfully!', 'success');
      console.log('Saved flow:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error saving flow:', error);
      showToast(error.response?.data?.error || 'Failed to save flow', 'error');
    }
  };

  const publishFlow = async () => {
    try {
      // First save the flow
      const savedFlow = await saveFlow();
      if (!savedFlow?._id) return;

      showToast('Publishing to Meta...', 'info');
      
      const payload = {
        metaFlowDefinition: JSON.parse(generateMetaJSON())
      };

      const response = await api.post(`/whatsappFlow/${savedFlow._id}/publish`, payload);
      showToast('Flow published successfully!', 'success');
      console.log('Publish result:', response.data);
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

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`, ...customData },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
      {/* Header/Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-800">WhatsApp Flow Builder</h1>
          <p className="text-sm text-gray-500">Design interactive conversational flows for your customers</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowJsonPreview(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Code size={18} />
            Preview JSON
          </button>
          <button 
            onClick={saveFlow}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Save size={18} />
            Save Draft
          </button>
          <button 
            onClick={publishFlow}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#CB376D] rounded-lg hover:bg-[#b52d5e] transition-colors shadow-sm"
          >
            <Play size={18} />
            Publish Flow
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Node Components */}
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Components</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* UI Screens Section */}
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                <Layout size={12} />
                User Interface
              </div>
              <div 
                className="group flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:border-[#CB376D] hover:bg-[#CB376D]/5 cursor-grab active:cursor-grabbing transition-all mb-2"
                onDragStart={(event) => onDragStart(event, 'screen', { label: 'New Screen' })}
                draggable
              >
                <div className="p-2 bg-white shadow-sm border border-gray-100 rounded-lg group-hover:text-[#CB376D]">
                  <Layout size={18} />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-gray-700">Form Screen</div>
                  <div className="text-[9px] text-gray-400">Collect user input</div>
                </div>
                <ChevronRight size={14} className="text-gray-300 group-hover:text-[#CB376D]" />
              </div>
            </div>

            {/* Actions Section */}
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                <Zap size={12} />
                Automation Actions
              </div>
              
              <div 
                className="group flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 cursor-grab active:cursor-grabbing transition-all mb-2"
                onDragStart={(event) => onDragStart(event, 'action', { actionType: 'database', label: 'Update Profile' })}
                draggable
              >
                <div className="p-2 bg-white shadow-sm border border-gray-100 rounded-lg text-blue-500">
                  <Database size={18} />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-gray-700">Update DB</div>
                  <div className="text-[9px] text-gray-400">Save preference data</div>
                </div>
              </div>

              <div 
                className="group flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:border-amber-500 hover:bg-amber-50 cursor-grab active:cursor-grabbing transition-all mb-2"
                onDragStart={(event) => onDragStart(event, 'action', { actionType: 'notification', label: 'Send Alert' })}
                draggable
              >
                <div className="p-2 bg-white shadow-sm border border-gray-100 rounded-lg text-amber-500">
                  <Bell size={18} />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-gray-700">Notification</div>
                  <div className="text-[9px] text-gray-400">Notify staff or user</div>
                </div>
              </div>

              <div 
                className="group flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:border-purple-500 hover:bg-purple-50 cursor-grab active:cursor-grabbing transition-all"
                onDragStart={(event) => onDragStart(event, 'action', { actionType: 'loyalty', label: 'Add Loyalty Points' })}
                draggable
              >
                <div className="p-2 bg-white shadow-sm border border-gray-100 rounded-lg text-purple-500">
                  <Tag size={18} />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-gray-700">Loyalty</div>
                  <div className="text-[9px] text-gray-400">Manage reward points</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Status</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
                <span className="text-xs font-medium text-gray-600">Draft - Unsaved</span>
              </div>
            </div>
          </div>
        </div>

        {/* Builder Canvas Area */}
        <div className="flex-1 relative bg-[#f8fafc]" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
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
            fitView
          >
            <Controls />
            <MiniMap 
              nodeColor={(n) => {
                if (n.type === 'screen') return '#CB376D';
                if (n.type === 'action') return '#10b981';
                return '#94a3b8';
              }}
              maskColor="rgba(0, 0, 0, 0.1)"
            />
            <Background variant="dots" gap={20} size={1} color="#e2e8f0" />
          </ReactFlow>
        </div>

        {/* Right Sidebar - Properties & Preview */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="flex border-b border-gray-100">
            <button 
              onClick={() => setActiveTab('properties')}
              className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'properties' ? 'text-[#CB376D] border-b-2 border-[#CB376D]' : 'text-gray-400'}`}
            >
              Properties
            </button>
            <button 
              onClick={() => setActiveTab('preview')}
              className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'preview' ? 'text-[#CB376D] border-b-2 border-[#CB376D]' : 'text-gray-400'}`}
            >
              Preview
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'properties' ? (
              selectedNode ? (
                <div className="p-6 space-y-6">
                  {/* ... (existing property editor content) ... */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Node Label</label>
                    <input
                      type="text"
                      value={selectedNode.data.label || ''}
                      onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CB376D]/20 focus:border-[#CB376D]"
                      placeholder="Enter label..."
                    />
                  </div>

                  {selectedNode.type === 'screen' && (
                    <div className="space-y-6">
                      {/* Screen Layout Config */}
                      <div className="pt-4 border-t border-gray-100 space-y-4">
                        <label className="text-[10px] font-bold text-gray-400 uppercase block">Screen Layout</label>
                        
                        <div>
                          <label className="text-[11px] text-gray-500 mb-1 block">Header Text</label>
                          <input
                            type="text"
                            value={selectedNode.data.header || ''}
                            onChange={(e) => updateNodeData(selectedNode.id, { header: e.target.value })}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-[#CB376D]"
                            placeholder="e.g. Personal Details"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-gray-500 mb-1 block">Body Text</label>
                          <textarea
                            value={selectedNode.data.body || ''}
                            onChange={(e) => updateNodeData(selectedNode.id, { body: e.target.value })}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs h-20 focus:ring-1 focus:ring-[#CB376D]"
                            placeholder="Instructions for the user..."
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-gray-500 mb-1 block">Submit Button Text</label>
                          <input
                            type="text"
                            value={selectedNode.data.footerLabel || ''}
                            onChange={(e) => updateNodeData(selectedNode.id, { footerLabel: e.target.value })}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-[#CB376D]"
                            placeholder="e.g. Continue"
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Input Fields</label>
                          <button 
                            onClick={() => {
                              const currentFields = selectedNode.data.fields || [];
                              updateNodeData(selectedNode.id, { 
                                fields: [...currentFields, { id: Date.now(), type: 'text', label: 'New Field', required: true }] 
                              });
                            }}
                            className="flex items-center gap-1 text-[10px] font-bold text-[#CB376D] hover:bg-[#CB376D]/5 px-2 py-1 rounded"
                          >
                            <Plus size={12} />
                            ADD FIELD
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          {(selectedNode.data.fields || []).map((field, idx) => (
                            <div key={field.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 relative group">
                              <button 
                                onClick={() => {
                                  const newFields = selectedNode.data.fields.filter(f => f.id !== field.id);
                                  updateNodeData(selectedNode.id, { fields: newFields });
                                }}
                                className="absolute -top-2 -right-2 p-1 bg-white border border-gray-200 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Plus size={10} className="rotate-45" />
                              </button>
                              <div className="flex flex-col gap-2">
                                <select 
                                  value={field.type}
                                  onChange={(e) => {
                                    const newFields = selectedNode.data.fields.map(f => f.id === field.id ? { ...f, type: e.target.value } : f);
                                    updateNodeData(selectedNode.id, { fields: newFields });
                                  }}
                                  className="text-[10px] bg-transparent border-none font-bold text-[#CB376D] focus:ring-0 p-0"
                                >
                                  <option value="text">Text Input</option>
                                  <option value="textarea">Multi-line Text</option>
                                  <option value="select">Dropdown</option>
                                  <option value="checkbox">Checkbox Group</option>
                                </select>
                                <input
                                  type="text"
                                  value={field.label}
                                  onChange={(e) => {
                                    const newFields = selectedNode.data.fields.map(f => f.id === field.id ? { ...f, label: e.target.value } : f);
                                    updateNodeData(selectedNode.id, { fields: newFields });
                                  }}
                                  className="w-full bg-white px-2 py-1 border border-gray-200 rounded text-[11px]"
                                />
                              </div>
                            </div>
                          ))}
                          {(!selectedNode.data.fields || selectedNode.data.fields.length === 0) && (
                            <div className="text-[11px] text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-lg">
                              No components added yet
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedNode.type === 'action' && (
                    <div className="space-y-4">
                      <div className="pt-4 border-t border-gray-100">
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Action Type</label>
                        <select
                          value={selectedNode.data.actionType || 'database'}
                          onChange={(e) => updateNodeData(selectedNode.id, { actionType: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CB376D]/20 focus:border-[#CB376D]"
                        >
                          <option value="database">Update Database</option>
                          <option value="notification">Send Notification</option>
                          <option value="loyalty">Award Loyalty Points</option>
                          <option value="coupon">Generate Coupon</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="pt-6 border-t border-gray-100">
                    <button 
                      onClick={() => {
                        setNodes(nds => nds.filter(n => n.id !== selectedNode.id));
                        setSelectedNode(null);
                      }}
                      className="w-full py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                    >
                      Delete Node
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 p-6 flex flex-col items-center justify-center text-center h-full">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                    <Settings size={32} />
                  </div>
                  <p className="text-sm font-medium text-gray-500">No element selected</p>
                  <p className="text-xs text-gray-400 mt-1">Select a node on the canvas to configure its settings.</p>
                </div>
              )
            ) : (
              /* Phone Preview Tab */
              <div className="p-6 h-full flex flex-col items-center">
                {selectedNode && selectedNode.type === 'screen' ? (
                  <div className="w-full max-w-[260px] aspect-[9/18] bg-gray-900 rounded-[3rem] border-[6px] border-gray-800 shadow-2xl relative overflow-hidden flex flex-col">
                    {/* Status Bar */}
                    <div className="h-6 w-full bg-gray-900 flex items-center justify-center">
                      <div className="w-16 h-3 bg-black rounded-full"></div>
                    </div>
                    
                    {/* App Content */}
                    <div className="flex-1 bg-white m-1 rounded-[2rem] overflow-hidden flex flex-col">
                      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#CB376D]/10 rounded-full flex items-center justify-center">
                          <MessageSquare size={12} className="text-[#CB376D]" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-700 truncate">{selectedNode.data.header || selectedNode.data.label}</span>
                      </div>
                      
                      <div className="p-4 flex-1 space-y-4">
                        <div className="text-[11px] text-gray-600 font-medium">
                          {selectedNode.data.body || "Please fill the details below"}
                        </div>
                        
                        <div className="space-y-3">
                          {(selectedNode.data.fields || []).map((f, i) => (
                            <div key={i} className="space-y-1">
                              <label className="text-[9px] font-bold text-gray-400 uppercase">{f.label}</label>
                              <div className="w-full h-8 border border-gray-200 rounded bg-gray-50"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="p-4 border-t border-gray-100">
                        <button className="w-full py-2 bg-[#CB376D] text-white text-[11px] font-bold rounded-lg shadow-sm">
                          {selectedNode.data.footerLabel || "Submit"}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <Eye size={32} className="text-gray-300 mb-2" />
                    <p className="text-xs text-gray-400 px-4">Select a Screen node to see its mobile preview</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* JSON Preview Modal */}
      {showJsonPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Code className="text-[#CB376D]" />
                <h3 className="text-lg font-bold text-gray-800">Meta Flow Definition</h3>
              </div>
              <button onClick={() => setShowJsonPreview(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <pre className="bg-gray-900 text-gray-100 p-6 rounded-xl text-xs font-mono leading-relaxed overflow-x-auto">
                {generateMetaJSON()}
              </pre>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(generateMetaJSON());
                  showToast('JSON copied to clipboard!', 'success');
                }}
                className="px-6 py-2 text-sm font-bold text-[#CB376D] border border-[#CB376D] rounded-lg hover:bg-[#CB376D]/5 transition-colors"
              >
                Copy JSON
              </button>
              <button 
                onClick={() => setShowJsonPreview(false)}
                className="px-6 py-2 text-sm font-bold text-white bg-[#CB376D] rounded-lg hover:bg-[#b52d5e] transition-colors shadow-sm"
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

const DialogueFlow = () => (
  <ReactFlowProvider>
    <DialogueFlowInner />
  </ReactFlowProvider>
);

export default DialogueFlow;