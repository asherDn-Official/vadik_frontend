import React from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Play, 
  Edit2, 
  Trash2, 
  Globe, 
  Clock,
  MessageSquare,
  AlertCircle,
  BarChart2,
  CheckCircle2,
  Star,
  LayoutTemplate
} from 'lucide-react';
import AccountTemplateModal from './AccountTemplateModal';
import { convertTemplateToFlowGraph } from '../../utils/templateFlowHelper';

const FlowList = ({ flows, onSelectFlow, onCreateFlow, onDeleteFlow, onPublishFlow, onShowAnalytics, onSetDefault, defaultFlowId, loading, onImportTemplate }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showAccountTemplatesModal, setShowAccountTemplatesModal] = React.useState(false);

  const handleSelectAccountTemplate = (template) => {
    const flowGraph = convertTemplateToFlowGraph(template);
    if (flowGraph) {
      onImportTemplate(flowGraph);
    }
  };

  const templates = [
    {
      id: 'template_support',
      name: 'Customer Support Flow',
      description: 'Collect user issues and contact details with automated routing.',
      nodes: [
        { id: 'n1', type: 'screen', position: { x: 100, y: 100 }, data: { label: 'Start Support', header: 'Support Center', body: 'How can we help you today?', fields: [{ id: 1, type: 'radio', label: 'Issue Type', name: 'issue_type', options: [{ label: 'Billing' }, { label: 'Technical' }, { label: 'Other' }] }] } },
        { id: 'n2', type: 'screen', position: { x: 500, y: 100 }, data: { label: 'Details', header: 'Issue Details', body: 'Please describe your problem.', fields: [{ id: 2, type: 'textarea', label: 'Description', name: 'description' }, { id: 3, type: 'text', label: 'Email Address', name: 'email' }] } }
      ],
      edges: [
        { id: 'e1-2', source: 'n1', target: 'n2', type: 'labeled', data: { label: 'Next' } }
      ]
    },
    {
      id: 'template_feedback',
      name: 'Order Feedback',
      description: 'Gather ratings and comments about recent purchases.',
      nodes: [
        { id: 'n1', type: 'screen', position: { x: 100, y: 100 }, data: { label: 'Rate Order', header: 'Your Feedback', body: 'How was your recent order?', fields: [{ id: 1, type: 'radio', label: 'Rating', name: 'rating', options: [{ label: '5 Stars' }, { label: '4 Stars' }, { label: '3 Stars' }, { label: '2 Stars' }, { label: '1 Star' }] }] } },
        { id: 'n2', type: 'screen', position: { x: 500, y: 100 }, data: { label: 'Comments', header: 'Comments', body: 'Any specific feedback for us?', fields: [{ id: 2, type: 'textarea', label: 'Your Comments', name: 'comments' }] } }
      ],
      edges: [
        { id: 'e1-2', source: 'n1', target: 'n2', type: 'labeled', data: { label: 'Submit' } }
      ]
    },
    {
      id: 'template_booking',
      name: 'Appointment Booking',
      description: 'Allow customers to book dates and select services.',
      nodes: [
        { id: 'n1', type: 'screen', position: { x: 100, y: 100 }, data: { label: 'Select Service', header: 'Booking', body: 'Which service would you like to book?', fields: [{ id: 1, type: 'radio', label: 'Service', name: 'service', options: [{ label: 'Consultation' }, { label: 'Installation' }, { label: 'Repair' }] }] } },
        { id: 'n2', type: 'screen', position: { x: 500, y: 100 }, data: { label: 'Contact Info', header: 'Contact', body: 'Please provide your details.', fields: [{ id: 2, type: 'text', label: 'Name', name: 'user_name' }, { id: 3, type: 'text', label: 'Phone', name: 'user_phone' }] } }
      ],
      edges: [
        { id: 'e1-2', source: 'n1', target: 'n2', type: 'labeled', data: { label: 'Next' } }
      ]
    }
  ];

  const filteredFlows = flows.filter(flow => 
    flow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flow.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#CB376D] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-gray-500">Loading your flows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">WhatsApp Flows</h1>
            <p className="text-sm text-gray-500 mt-1">Manage and publish interactive conversational flows for WhatsApp</p>
          </div>
          <div className="flex items-center gap-3">
            {/* <button 
              onClick={() => setShowAccountTemplatesModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 active:scale-95 text-xs sm:text-sm"
            >
              <Plus size={18} />
              Use Account Templates
            </button> */}
            <button 
              onClick={onCreateFlow}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#CB376D] text-white rounded-xl font-bold hover:bg-[#b52d5e] transition-all shadow-lg shadow-[#CB376D]/20 active:scale-95 text-xs sm:text-sm"
            >
              <Plus size={18} />
              Create New Flow
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search flows by name or description..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CB376D]/20 focus:border-[#CB376D] transition-all"
          />
        </div>
      </div>
      
      {/* Template Library */}
      <div className="px-8 pt-6 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Globe size={18} className="text-[#CB376D]" />
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Flow Template Library</h2>
          </div>
          <button 
            onClick={() => setShowAccountTemplatesModal(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#CB376D] hover:underline"
          >
            <LayoutTemplate size={14} />
            + Use Content from Meta Templates
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* <div 
            className="bg-gradient-to-br from-[#CB376D]/5 to-pink-50 p-4 rounded-xl border-2 border-dashed border-[#CB376D]/30 hover:border-[#CB376D] transition-all cursor-pointer group flex flex-col justify-between"
            onClick={() => setShowAccountTemplatesModal(true)}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#CB376D] bg-white px-2 py-0.5 rounded shadow-2xs">
                  Your Account
                </span>
                <Plus size={16} className="text-[#CB376D] group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#CB376D] transition-colors">
                Meta Account Templates
              </h3>
              <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">
                Load approved WhatsApp templates from your Meta account directly into a new Flow.
              </p>
            </div>
            <div className="mt-3 text-[10px] font-bold text-[#CB376D] flex items-center gap-1">
              Select Meta Template →
            </div>
          </div> */}

          {templates.map(template => (
            <div 
              key={template.id}
              className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-[#CB376D] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              onClick={() => onImportTemplate(template)}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#CB376D]">{template.name}</h3>
                  <Plus size={16} className="text-gray-400 group-hover:text-[#CB376D]" />
                </div>
                <p className="text-[10px] text-gray-500 line-clamp-2">{template.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AccountTemplateModal
        isOpen={showAccountTemplatesModal}
        onClose={() => setShowAccountTemplatesModal(false)}
        onSelectTemplate={handleSelectAccountTemplate}
        title="Import Meta WhatsApp Template into Flow"
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {filteredFlows.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6 border border-gray-100">
              <MessageSquare size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No flows found</h3>
            <p className="text-sm text-gray-500 mb-8">
              {searchTerm ? "We couldn't find any flows matching your search." : "You haven't created any WhatsApp flows yet. Start building your first flow now!"}
            </p>
            {!searchTerm && (
              <button 
                onClick={onCreateFlow}
                className="text-[#CB376D] font-bold text-sm hover:underline"
              >
                Build your first flow →
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFlows.map((flow) => (
              <div 
                key={flow._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col"
              >
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-[#CB376D]/5 rounded-lg text-[#CB376D]">
                      <MessageSquare size={20} />
                    </div>
                    <div className="flex items-center gap-2">
                      {defaultFlowId === flow._id && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
                          <Star size={10} fill="currentColor" />
                          Auto-Reply
                        </span>
                      )}
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        flow.status === 'PUBLISHED' 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : 'bg-amber-50 text-amber-600'
                      }`}>
                        {flow.status || 'Draft'}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-900 mb-1 group-hover:text-[#CB376D] transition-colors">{flow.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-4">
                    {flow.description || 'No description provided'}
                  </p>

                  <div className="flex items-center gap-4 mt-auto text-[10px] text-gray-400 font-medium">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(flow.updatedAt).toLocaleDateString()}
                    </div>
                    {flow.remoteFlowId && (
                      <div className="flex items-center gap-1 text-blue-500">
                        <Globe size={12} />
                        ID: {flow.remoteFlowId}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-50 p-4 bg-gray-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => onSelectFlow(flow)}
                      className="p-2 hover:bg-white hover:text-[#CB376D] rounded-lg transition-all text-gray-500"
                      title="Edit Flow"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => onShowAnalytics(flow)}
                      className="p-2 hover:bg-white hover:text-[#CB376D] rounded-lg transition-all text-gray-500"
                      title="View Analytics"
                    >
                      <BarChart2 size={16} />
                    </button>
                    <button 
                      onClick={() => onSetDefault(flow._id)}
                      className={`p-2 hover:bg-white rounded-lg transition-all ${defaultFlowId === flow._id ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
                      title={defaultFlowId === flow._id ? "Current Auto-Reply" : "Set as Auto-Reply"}
                    >
                      <Star size={16} fill={defaultFlowId === flow._id ? "currentColor" : "none"} />
                    </button>
                    <button 
                      onClick={() => onDeleteFlow(flow._id)}
                      className="p-2 hover:bg-white hover:text-red-500 rounded-lg transition-all text-gray-500"
                      title="Delete Flow"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => onPublishFlow(flow)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      flow.status === 'PUBLISHED'
                        ? 'bg-emerald-500 text-white shadow-sm hover:bg-emerald-600'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-[#CB376D] hover:text-[#CB376D]'
                    }`}
                  >
                    <Play size={14} />
                    {flow.status === 'PUBLISHED' ? 'Republish' : 'Publish'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlowList;
