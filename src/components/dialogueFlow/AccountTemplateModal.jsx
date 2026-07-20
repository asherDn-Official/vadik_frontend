import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  RefreshCw, 
  LayoutTemplate, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Plus, 
  MessageSquare
} from 'lucide-react';
import api from '../../api/apiconfig';
import showToast from '../../utils/ToastNotification';

const AccountTemplateModal = ({ isOpen, onClose, onSelectTemplate, title = "Select Meta WhatsApp Template" }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('APPROVED');

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/integrationManagement/whatsapp/custom-templates');
      if (res.data?.status) {
        setTemplates(res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      showToast('Failed to fetch WhatsApp templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const res = await api.post('/api/integrationManagement/whatsapp/custom-templates/sync');
      if (res.data?.status) {
        setTemplates(res.data.data || []);
        showToast('Templates synced from Meta successfully!', 'success');
      }
    } catch (error) {
      console.error('Error syncing templates:', error);
      showToast(error.response?.data?.message || 'Failed to sync templates', 'error');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || t.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || t.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold">
            <CheckCircle2 size={10} /> Approved
          </span>
        );
      case 'PENDING':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold">
            <Clock size={10} /> Pending
          </span>
        );
      case 'REJECTED':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-[10px] font-bold">
            <AlertCircle size={10} /> Rejected
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#CB376D]/10 rounded-xl text-[#CB376D]">
              <LayoutTemplate size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">{title}</h2>
              <p className="text-xs text-gray-500">Choose an approved Meta WhatsApp template to build or populate your flow screens</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#CB376D] bg-[#CB376D]/5 hover:bg-[#CB376D]/15 rounded-lg transition-colors border border-[#CB376D]/20 disabled:opacity-50"
              title="Sync latest templates from Meta"
            >
              <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Syncing..." : "Sync Meta Templates"}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search account templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#CB376D]/20 focus:border-[#CB376D]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#CB376D]"
            >
              <option value="ALL">All Categories</option>
              <option value="MARKETING">Marketing</option>
              <option value="UTILITY">Utility</option>
              <option value="AUTHENTICATION">Authentication</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#CB376D]"
            >
              <option value="APPROVED">Approved Only</option>
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="w-8 h-8 border-3 border-[#CB376D] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-gray-500 font-medium">Fetching Meta WhatsApp templates...</p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6 bg-white rounded-xl border border-gray-100">
              <MessageSquare size={36} className="text-gray-300 mb-3" />
              <h3 className="text-sm font-bold text-gray-800 mb-1">No Meta templates found</h3>
              <p className="text-xs text-gray-500 max-w-sm mb-4">
                {searchTerm ? "No templates matched your filter criteria." : "You have no approved WhatsApp templates in your connected account."}
              </p>
              <button
                onClick={handleSync}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#CB376D] rounded-lg hover:bg-[#b52d5e] transition-colors"
              >
                <RefreshCw size={14} /> Sync from Meta
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => {
                const headerComponent = template.components?.find(c => c.type === 'HEADER');
                const bodyComponent = template.components?.find(c => c.type === 'BODY');
                const footerComponent = template.components?.find(c => c.type === 'FOOTER');
                const buttonsComponent = template.components?.find(c => c.type === 'BUTTONS');

                return (
                  <div
                    key={template._id || template.name}
                    className="bg-white rounded-xl border border-gray-200 hover:border-[#CB376D] shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group"
                  >
                    {/* Card Header */}
                    <div className="p-4 border-b border-gray-100 flex items-start justify-between gap-2 bg-gradient-to-r from-gray-50/50 to-white">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#CB376D] bg-[#CB376D]/10 px-2 py-0.5 rounded">
                            {template.category || 'MARKETING'}
                          </span>
                          {renderStatusBadge(template.status)}
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#CB376D] transition-colors">
                          {template.name}
                        </h3>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono uppercase bg-gray-100 px-1.5 py-0.5 rounded">
                        {template.language || 'en'}
                      </span>
                    </div>

                    {/* Template Content Preview */}
                    <div className="p-4 flex-1 space-y-2 bg-slate-50/60 font-sans">
                      {headerComponent?.text && (
                        <div className="text-xs font-bold text-gray-800 border-b border-gray-100 pb-1.5">
                          {headerComponent.text}
                        </div>
                      )}

                      {bodyComponent?.text ? (
                        <div className="text-xs text-gray-600 line-clamp-4 leading-relaxed whitespace-pre-line">
                          {bodyComponent.text}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 italic">No body message</div>
                      )}

                      {footerComponent?.text && (
                        <div className="text-[10px] text-gray-400 font-medium pt-1">
                          {footerComponent.text}
                        </div>
                      )}

                      {buttonsComponent?.buttons?.length > 0 && (
                        <div className="pt-2 flex flex-wrap gap-1.5">
                          {buttonsComponent.buttons.map((btn, bIdx) => (
                            <span
                              key={bIdx}
                              className="px-2 py-1 bg-white border border-gray-200 text-gray-700 text-[10px] font-semibold rounded-md shadow-2xs"
                            >
                              {btn.text}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Card Footer Action */}
                    <div className="p-3 bg-white border-t border-gray-100 flex items-center justify-between">
                      <div className="text-[10px] text-gray-400">
                        {buttonsComponent?.buttons?.length || 0} Quick Actions
                      </div>
                      <button
                        onClick={() => {
                          onSelectTemplate(template);
                          onClose();
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#CB376D] hover:bg-[#b52d5e] rounded-lg transition-colors shadow-sm"
                      >
                        <Plus size={14} /> Use Template
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-white flex justify-between items-center">
          <span className="text-xs text-gray-400">
            Showing {filteredTemplates.length} of {templates.length} templates
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};

export default AccountTemplateModal;
