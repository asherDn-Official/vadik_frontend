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
  Star
} from 'lucide-react';

const FlowList = ({ flows, onSelectFlow, onCreateFlow, onDeleteFlow, onPublishFlow, onShowAnalytics, onSetDefault, defaultFlowId, loading }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

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
          <button 
            onClick={onCreateFlow}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#CB376D] text-white rounded-xl font-bold hover:bg-[#b52d5e] transition-all shadow-lg shadow-[#CB376D]/20 active:scale-95"
          >
            <Plus size={20} />
            Create New Flow
          </button>
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
