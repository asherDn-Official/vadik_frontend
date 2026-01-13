import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Clock, RefreshCw, CheckCircle, Layout, Plus, 
  Trash2, Send, Edit2, AlertCircle, Check
} from "lucide-react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../api/apiconfig.js";

const STANDARD_TEMPLATES = [
  { 
    id: 'optin_optout', 
    label: 'Opt-in/Opt-out Request', 
    defaultText: 'Hello {{1}}, welcome to {{2}}. Would you like to receive updates from us?',
    vars: ['Name', 'Store Name'],
    category: 'MARKETING'
  },
  { 
    id: 'spinwheel_offer', 
    label: 'Spin Wheel Offer', 
    defaultText: 'Congratulations {{1}}! You won a special offer at {{2}}. Claim it here: {{3}}',
    vars: ['Name', 'Store Name', 'Link'],
    category: 'MARKETING'
  },
  { 
    id: 'scratch_card_offer', 
    label: 'Scratch Card Offer', 
    defaultText: 'Hi {{1}}, you have a new scratch card from {{2}}! Scratch it here: {{3}}',
    vars: ['Name', 'Store Name', 'Link'],
    category: 'MARKETING'
  },
  { 
    id: 'quiz_link_message', 
    label: 'Quiz Message', 
    defaultText: 'Hello {{1}}, try our new {{3}} quiz at {{2}} and win rewards! {{4}}',
    vars: ['Name', 'Store Name', 'Quiz Name', 'Link'],
    category: 'MARKETING'
  },
  { 
    id: 'customer_otp', 
    label: 'OTP Verification', 
    defaultText: 'Your verification code for {{2}} is {{1}}. Valid for 5 minutes.',
    vars: ['Code', 'Store Name'],
    category: 'UTILITY'
  },
  { 
    id: 'birthday_greeting', 
    label: 'Birthday Greeting', 
    defaultText: 'Happy Birthday {{1}}! To celebrate, {{2}} has a special gift for you.',
    vars: ['Name', 'Store Name'],
    category: 'MARKETING'
  },
  { 
    id: 'customer_appreciation', 
    label: 'Customer Appreciation', 
    defaultText: 'Thank you {{1}} for shopping at {{2}}! We appreciate your business.',
    vars: ['Name', 'Store Name'],
    category: 'MARKETING'
  },
  { 
    id: 'abandoned_cart', 
    label: 'Abandoned Cart Remainder', 
    defaultText: 'Hi {{1}}, you left some items in your cart at {{2}}. Complete your purchase now: {{3}}',
    vars: ['Name', 'Store Name', 'Cart Link'],
    category: 'MARKETING'
  },
];

const Template = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [mappings, setMappings] = useState({});
  const [syncing, setSyncing] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncTemplatesData, setSyncTemplatesData] = useState([]);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0, status: 'idle' });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/integrationManagement/whatsapp/config`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        setConfig(response.data.data);
        if (response.data.data.isUsingOwnWhatsapp) {
          fetchTemplates();
        }
      }
    } catch (error) {
      console.error("Error fetching WhatsApp config:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/integrationManagement/whatsapp/templates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        setTemplates(response.data.data);
        setMappings(response.data.mappings || {});
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const handleOpenSyncModal = () => {
    const data = STANDARD_TEMPLATES.map(t => ({
      ...t,
      selected: true,
      text: t.defaultText,
      name: t.id
    }));
    setSyncTemplatesData(data);
    setShowSyncModal(true);
  };

  const handleSyncTemplates = async () => {
    const selected = syncTemplatesData.filter(t => t.selected);
    if (selected.length === 0) {
      toast.error("Please select at least one template to sync");
      return;
    }

    setSyncing(true);
    setSyncProgress({ current: 0, total: selected.length, status: 'syncing' });

    const token = localStorage.getItem('token');
    
    for (let i = 0; i < selected.length; i++) {
      const template = selected[i];
      setSyncProgress(prev => ({ ...prev, current: i + 1 }));
      
      try {
        const payload = {
          templateData: {
            name: template.name,
            category: template.category,
            language: 'en_US',
            components: [
              {
                type: 'BODY',
                text: template.text,
                example: {
                  body_text: [template.vars.map((_, idx) => `Value ${idx + 1}`)]
                }
              }
            ]
          }
        };

        await axios.post(`${API_BASE_URL}/api/integrationManagement/whatsapp/templates`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Auto-map if created successfully
        await axios.put(`${API_BASE_URL}/api/integrationManagement/whatsapp/templates/mapping`, {
          mappings: { [template.id]: template.name }
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

      } catch (error) {
        console.error(`Error creating template ${template.name}:`, error);
        // Continue with next one even if one fails
      }
      
      // Artificial delay for animation
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    setSyncProgress(prev => ({ ...prev, status: 'completed' }));
    setTimeout(() => {
      setShowSyncModal(false);
      setSyncing(false);
      setSyncProgress({ current: 0, total: 0, status: 'idle' });
      fetchTemplates();
      toast.success("Templates synced successfully");
    }, 1500);
  };

  const updateMapping = async (role, templateName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/api/integrationManagement/whatsapp/templates/mapping`, {
        mappings: { [role]: templateName }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        toast.success(`Role updated successfully`);
        setMappings(prev => ({ ...prev, [role]: templateName }));
      }
    } catch (error) {
      toast.error("Failed to update template mapping");
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><RefreshCw className="animate-spin text-[#313166]" /></div>;

  if (!config?.isUsingOwnWhatsapp) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
        <AlertCircle className="w-12 h-12 text-yellow-500 mb-4" />
        <h2 className="text-xl font-semibold text-[#1D1B4F]">WhatsApp Not Connected</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-xs">
          Please connect your own WhatsApp Business account in the Integration page to manage templates.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#313166]">Template Management</h2>
          <p className="text-sm text-gray-500">Manage and sync your WhatsApp message templates</p>
        </div>
        <button 
          onClick={handleOpenSyncModal}
          className="flex items-center gap-2 bg-[#313166] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#25254d] transition-colors shadow-sm"
        >
          <RefreshCw size={18} />
          <span>Sync Standard Templates</span>
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-6 mb-8 shadow-sm">
        <h3 className="text-lg font-semibold text-[#313166] mb-4 flex items-center gap-2">
          <Layout size={20} className="text-[#db3b76]" />
          System Template Mapping
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STANDARD_TEMPLATES.map(role => (
            <div key={role.id} className="p-4 border border-gray-100 rounded-lg bg-gray-50 flex flex-col justify-between">
              <div className="mb-4">
                <h4 className="font-medium text-[#313166] text-sm">{role.label}</h4>
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-bold">Variables: {role.vars.join(', ')}</p>
              </div>
              <div className="flex items-center gap-2">
                <select 
                  className="flex-1 text-xs border border-gray-300 rounded-md px-3 py-2 outline-none bg-white focus:ring-2 focus:ring-[#db3b76] focus:border-transparent transition-all"
                  value={mappings[role.id] || ''}
                  onChange={(e) => updateMapping(role.id, e.target.value)}
                >
                  <option value="">Use Default</option>
                  {templates.filter(t => t.status === 'APPROVED').map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
                {mappings[role.id] && (
                  <div className="bg-green-100 p-1.5 rounded-full">
                    <Check size={14} className="text-green-600" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                template.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                template.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {template.status}
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">{template.category}</span>
            </div>
            <h4 className="font-bold text-[#313166] mb-3 truncate" title={template.name}>{template.name}</h4>
            <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 line-clamp-4 flex-grow mb-4 italic border border-gray-100">
              {template.components.find(c => c.type === 'BODY')?.text}
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-50 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              <span>{template.language}</span>
              {Object.values(mappings).includes(template.name) && (
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle size={12} /> Active
                </span>
              )}
            </div>
          </div>
        ))}
        {templates.length === 0 && (
          <div className="col-span-full py-12 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
            <Layout className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No templates found. Click 'Sync' to get started.</p>
          </div>
        )}
      </div>

      {showSyncModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-xl font-bold text-[#313166]">Sync Standard Templates</h3>
                <p className="text-xs text-gray-500 mt-1">Select and customize templates to be created in your account</p>
              </div>
              {!syncing && (
                <button onClick={() => setShowSyncModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <Plus size={24} className="rotate-45" />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {syncing ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative w-32 h-32 mb-8">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="60"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-100"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="60"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={377}
                        strokeDashoffset={377 - (377 * syncProgress.current) / syncProgress.total}
                        className="text-[#db3b76] transition-all duration-500 ease-out"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-2xl font-bold text-[#313166]">{syncProgress.current}/{syncProgress.total}</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Progress</span>
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-[#313166] mb-2">
                    {syncProgress.status === 'completed' ? 'All Templates Created!' : `Creating: ${syncTemplatesData.filter(t => t.selected)[syncProgress.current - 1]?.label || '...'}`}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {syncProgress.status === 'completed' ? 'Refreshing your template list now.' : 'Please do not close this window.'}
                  </p>
                </div>
              ) : (
                syncTemplatesData.map((template, idx) => (
                  <div key={template.id} className={`p-4 border rounded-xl transition-all ${template.selected ? 'border-[#db3b76] bg-pink-50/30' : 'border-gray-100 opacity-60'}`}>
                    <div className="flex items-start gap-3 mb-3">
                      <div 
                        onClick={() => {
                          const newData = [...syncTemplatesData];
                          newData[idx].selected = !newData[idx].selected;
                          setSyncTemplatesData(newData);
                        }}
                        className={`mt-1 w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                          template.selected ? 'bg-[#db3b76] border-[#db3b76] text-white' : 'border-gray-300 bg-white'
                        }`}
                      >
                        {template.selected && <Check size={14} strokeWidth={3} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-bold text-[#313166] text-sm">{template.label}</h4>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{template.category}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {template.vars.map((v, vIdx) => (
                            <span key={vIdx} className="text-[9px] bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-500 font-medium">
                              {"{{"}{vIdx + 1}{"}}"} : {v}
                            </span>
                          ))}
                        </div>
                        <div className="relative">
                          <textarea
                            className="w-full text-xs p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#db3b76] focus:border-transparent outline-none bg-white min-h-[80px]"
                            value={template.text}
                            onChange={(e) => {
                              const newData = [...syncTemplatesData];
                              newData[idx].text = e.target.value;
                              setSyncTemplatesData(newData);
                            }}
                            placeholder="Template content..."
                          />
                          <div className="absolute right-2 bottom-2 text-gray-300">
                            <Edit2 size={14} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {!syncing && (
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                <button
                  onClick={() => setShowSyncModal(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSyncTemplates}
                  className="flex-[2] py-3 px-4 bg-[#313166] text-white rounded-xl font-bold hover:bg-[#25254d] transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  <span>Confirm and Create Templates</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Template;
