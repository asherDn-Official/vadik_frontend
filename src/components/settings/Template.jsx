import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { 
  RefreshCw, CheckCircle, Layout, Plus, 
  Send, AlertCircle, Check, Info,
  ChevronRight, ArrowLeft, Search, X,
  FileText, ExternalLink, HelpCircle
} from "lucide-react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../api/apiconfig.js";

import PropTypes from 'prop-types';

const STANDARD_TEMPLATES = [
  { 
    id: 'customer_otp', 
    label: 'OTP Verification', 
    defaultText: 'Your verification code for {{2}} is {{1}}. Valid for 5 minutes.',
    vars: ['Code', 'Store Name'],
    category: 'UTILITY',
    description: 'Used for verifying customer phone numbers during login or registration.'
  },
  { 
    id: 'optin_optout', 
    label: 'Opt-in/Opt-out Request', 
    defaultText: 'Hello {{1}}, welcome to {{2}}. Would you like to receive updates from us?',
    vars: ['Name', 'Store Name'],
    category: 'MARKETING',
    description: 'Initial message to get customer consent for marketing messages.'
  },
  { 
    id: 'opt_in_success_1', 
    label: 'Opt-in Success', 
    defaultText: 'Thank you {{1}} for opting in to updates from {{2}}!',
    vars: ['Name', 'Store Name'],
    category: 'MARKETING',
    description: 'Confirmation message sent after a user successfully opts in.'
  },
  { 
    id: 'opt_in_confirmation_2', 
    label: 'Opt-in Confirmation', 
    defaultText: 'Hi {{1}}, please confirm your subscription to {{2}} by replying YES.',
    vars: ['Name', 'Store Name'],
    category: 'MARKETING',
    description: 'Secondary confirmation for double opt-in flows.'
  },
  { 
    id: 'opt_out_acknowledged', 
    label: 'Opt-out Acknowledged', 
    defaultText: 'Hi {{1}}, you have been successfully unsubscribed from {{2}} updates.',
    vars: ['Name', 'Store Name'],
    category: 'MARKETING',
    description: 'Message confirming the user has been removed from the mailing list.'
  },
  { 
    id: 'birthday_greeting', 
    label: 'Birthday Greeting', 
    defaultText: 'Happy Birthday {{1}}! To celebrate, {{2}} has a special gift for you.',
    vars: ['Name', 'Store Name'],
    category: 'MARKETING',
    description: 'Automated greeting sent to customers on their birthday.'
  },
  { 
    id: 'anniversary_greeting', 
    label: 'Anniversary Greeting', 
    defaultText: 'Happy Anniversary {{1}}! Thank you for being with {{2}} for another year.',
    vars: ['Name', 'Store Name'],
    category: 'MARKETING',
    description: 'Greeting sent on the anniversary of the customer joining.'
  },
  { 
    id: 'custom_event_greeting', 
    label: 'Custom Event Greeting', 
    defaultText: 'Hello {{1}}, we are excited to have you at our event with {{2}}!',
    vars: ['Name', 'Store Name'],
    category: 'MARKETING',
    description: 'Used for specific events or custom trigger campaigns.'
  },
  { 
    id: 'customer_appreciation', 
    label: 'Customer Appreciation', 
    defaultText: 'Thank you {{1}} for shopping at {{2}}! We appreciate your business.',
    vars: ['Name', 'Store Name'],
    category: 'MARKETING',
    description: 'Post-purchase thank you message.'
  },
  { 
    id: 'sale_reminder', 
    label: 'Sale Reminder', 
    defaultText: 'Hi {{1}}, our big sale at {{2}} is starting soon! Don\'t miss out.',
    vars: ['Name', 'Store Name'],
    category: 'MARKETING',
    description: 'Promotional message for upcoming sales or events.'
  },
  { 
    id: 'spinwheel_offer', 
    label: 'Spin Wheel Offer', 
    defaultText: 'Congratulations {{1}}! You won a special offer at {{2}}. Claim it here: {{3}}',
    vars: ['Name', 'Store Name', 'Link'],
    category: 'MARKETING',
    description: 'Message sent when a user wins a prize on the spin wheel.'
  },
  { 
    id: 'scratch_card_offer', 
    label: 'Scratch Card Offer', 
    defaultText: 'Hi {{1}}, you have a new scratch card from {{2}}! Scratch it here: {{3}}',
    vars: ['Name', 'Store Name', 'Link'],
    category: 'MARKETING',
    description: 'Message sent when a user receives a digital scratch card.'
  },
  { 
    id: 'quiz_link_message', 
    label: 'Quiz Message', 
    defaultText: 'Hello {{1}}, try our new {{3}} quiz at {{2}} and win rewards! {{4}}',
    vars: ['Name', 'Store Name', 'Quiz Name', 'Link'],
    category: 'MARKETING',
    description: 'Invitation to participate in a rewards-based quiz.'
  },
];

const TemplatePreview = ({ text, vars }) => {
  const previewText = useMemo(() => {
    let t = text;
    vars.forEach((v, i) => {
      const reg = new RegExp(`\\{\\{${i + 1}\\}\\}`, 'g');
      t = t.replace(reg, `<span class="bg-[#db3b76]/10 text-[#db3b76] px-1 rounded font-bold">[${v}]</span>`);
    });
    return t;
  }, [text, vars]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full max-w-[300px]">
      <div className="bg-[#075e54] p-3 flex items-center gap-2">
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white">
          <Layout size={16} />
        </div>
        <div>
          <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">WhatsApp Preview</p>
          <p className="text-xs text-white font-bold truncate">Vadik Business</p>
        </div>
      </div>
      <div className="p-4 bg-[#e5ddd5] min-h-[150px] relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://wweb.dev/assets/whatsapp-chat-bg.png")', backgroundSize: '200px' }}></div>
        <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-sm relative z-10 max-w-[90%]">
          <p className="text-[11px] text-gray-800 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: previewText }}></p>
          <div className="flex justify-end mt-1">
            <span className="text-[9px] text-gray-400">12:00 PM</span>
          </div>
        </div>
      </div>
    </div>
  );
};

TemplatePreview.propTypes = {
  text: PropTypes.string.isRequired,
  vars: PropTypes.arrayOf(PropTypes.string).isRequired
};

const Template = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [mappings, setMappings] = useState({});
  const [syncing, setSyncing] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [quickCreateData, setQuickCreateData] = useState({ name: '', text: '', role: null });
  const [syncTemplatesData, setSyncTemplatesData] = useState([]);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0, status: 'idle', results: [] });
  const [selectedRole, setSelectedRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showRules, setShowRules] = useState(false);

  const fetchTemplates = useCallback(async () => {
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
  }, []);

  const fetchConfig = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/integrationManagement/whatsapp/config`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        setConfig(response.data.data);
        fetchTemplates();
      }
    } catch (error) {
      console.error("Error fetching WhatsApp config:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchTemplates]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const getVariableCount = (text) => {
    const matches = text.match(/\{\{(\d+)\}\}/g);
    return matches ? new Set(matches).size : 0;
  };

  const validateVariableStructure = (text, expectedCount) => {
    const actualCount = getVariableCount(text);
    if (actualCount !== expectedCount) return false;
    
    // Ensure sequential {{1}}, {{2}}...
    for (let i = 1; i <= expectedCount; i++) {
      if (!text.includes(`{{${i}}}`)) return false;
    }
    return true;
  };

  const checkEligibility = (template, role) => {
    if (!template || !role) return { eligible: false };
    const templateBody = template.components.find(c => c.type === 'BODY')?.text || "";
    const templateVars = getVariableCount(templateBody);
    const requiredVars = role.vars.length;
    
    if (templateVars !== requiredVars) {
      return { 
        eligible: false, 
        reason: `Variable mismatch. Role needs ${requiredVars} variables, template has ${templateVars}.` 
      };
    }
    
    if (template.category !== role.category && role.category !== 'ANY') {
      return { 
        eligible: false, 
        reason: `Category mismatch. Role requires ${role.category}, template is ${template.category}.` 
      };
    }

    return { eligible: true };
  };

  const handleSyncTemplates = async () => {
    const selected = syncTemplatesData.filter(t => t.selected);
    if (selected.length === 0) {
      toast.error("Please select at least one template to sync");
      return;
    }

    // Pre-validation
    const existingNames = templates.map(t => t.name.toLowerCase());
    for (const t of selected) {
      const sanitizedName = t.customName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      if (existingNames.includes(sanitizedName)) {
        toast.error(`Template name "${sanitizedName}" already exists. Please rename it.`);
        return;
      }
      if (!validateVariableStructure(t.text, t.vars.length)) {
        toast.error(`Template "${t.label}" has broken variable structure. Expected {{1}} to {{${t.vars.length}}}`);
        return;
      }
    }

    setSyncing(true);
    setSyncProgress({ current: 0, total: selected.length, status: 'syncing', results: [] });

    const token = localStorage.getItem('token');
    const newResults = [];
    
    for (let i = 0; i < selected.length; i++) {
      const template = selected[i];
      setSyncProgress(prev => ({ ...prev, current: i + 1 }));
      
      try {
        const varCount = getVariableCount(template.text);
        const sanitizedName = template.customName.toLowerCase().replace(/[^a-z0-9_]/g, '_');

        const payload = {
          templateData: {
            name: sanitizedName,
            category: template.category,
            language: 'en_US',
            components: [
              {
                type: 'BODY',
                text: template.text,
                example: varCount > 0 ? {
                  body_text: [Array.from({ length: varCount }, (_, idx) => `Sample ${idx + 1}`)]
                } : undefined
              }
            ]
          }
        };

        const res = await axios.post(`${API_BASE_URL}/api/integrationManagement/whatsapp/templates`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.status) {
          await axios.put(`${API_BASE_URL}/api/integrationManagement/whatsapp/templates/mapping`, {
            mappings: { [template.id]: sanitizedName }
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          newResults.push({ name: template.label, status: 'success', message: 'Created and Mapped' });
        } else {
          newResults.push({ name: template.label, status: 'error', message: res.data.message || 'Meta Rejected' });
        }

      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message;
        newResults.push({ name: template.label, status: 'error', message: errorMsg });
      }
      
      setSyncProgress(prev => ({ ...prev, results: [...newResults] }));
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    setSyncProgress(prev => ({ ...prev, status: 'completed' }));
    fetchTemplates();
  };

  const handleQuickCreate = async () => {
    if (!quickCreateData.name || !quickCreateData.text) {
      toast.error("Please fill all fields");
      return;
    }

    const sanitizedName = quickCreateData.name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const existingNames = templates.map(t => t.name.toLowerCase());
    
    if (existingNames.includes(sanitizedName)) {
      toast.error("Template name already exists");
      return;
    }

    const role = quickCreateData.role;
    if (!validateVariableStructure(quickCreateData.text, role.vars.length)) {
      toast.error(`Template must include variables {{1}} through {{${role.vars.length}}}`);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const payload = {
        templateData: {
          name: sanitizedName,
          category: role.category,
          language: 'en_US',
          components: [
            {
              type: 'BODY',
              text: quickCreateData.text,
              example: {
                body_text: [role.vars.map((_, i) => `Sample ${i + 1}`)]
              }
            }
          ]
        }
      };

      const res = await axios.post(`${API_BASE_URL}/api/integrationManagement/whatsapp/templates`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.status) {
        toast.success("Template request sent to Meta!");
        setShowQuickCreate(false);
        fetchTemplates();
      } else {
        toast.error(res.data.message || "Failed to create template");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Internal Error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSyncModal = () => {
    const data = STANDARD_TEMPLATES.map(t => ({
      ...t,
      selected: !templates.some(existing => existing.name === t.id.toLowerCase()),
      text: t.defaultText,
      name: t.id,
      customName: t.id
    }));
    setSyncTemplatesData(data);
    setShowSyncModal(true);
  };

  const updateMapping = async (roleId, templateName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/api/integrationManagement/whatsapp/templates/mapping`, {
        mappings: { [roleId]: templateName }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        toast.success(`Mapping updated`);
        setMappings(prev => ({ ...prev, [roleId]: templateName }));
      }
    } catch {
      toast.error("Failed to update mapping");
    }
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => 
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.components.find(c => c.type === 'BODY')?.text.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [templates, searchTerm]);

  if (loading) return <div className="flex justify-center items-center h-64"><RefreshCw className="animate-spin text-[#313166]" /></div>;

  const isUsingOwn = config?.isUsingOwnWhatsapp;

  if (selectedRole) {
    const role = STANDARD_TEMPLATES.find(r => r.id === selectedRole);
    return (
      <div className="p-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
        <button 
          onClick={() => setSelectedRole(null)}
          className="flex items-center gap-2 text-gray-500 hover:text-[#313166] mb-6 transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xl mb-8">
          <div className="p-8 bg-gradient-to-r from-[#313166] to-[#4a4a8a] text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-black">{role.label}</h2>
                  <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">{role.category}</span>
                </div>
                <p className="text-gray-200 text-sm max-w-2xl leading-relaxed">{role.description}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">Required Variables</p>
                <div className="flex flex-wrap gap-2">
                  {role.vars.map((v, i) => (
                    <span key={i} className="bg-white text-[#313166] px-2.5 py-1 rounded-lg text-[10px] font-bold">
                      {"{{"}{i + 1}{"}}"} : {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
              <h3 className="text-xl font-bold text-[#313166]">Eligible Templates</h3>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    setQuickCreateData({
                      name: `${role.id}_custom_${Date.now().toString().slice(-4)}`,
                      text: role.defaultText,
                      role: role
                    });
                    setShowQuickCreate(true);
                  }}
                  className="bg-[#db3b76] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#b83163] transition-colors shadow-lg flex items-center gap-2"
                >
                  <Plus size={16} />
                  Create Replacement
                </button>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search templates..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#db3b76]/20 focus:border-[#db3b76] transition-all text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Default Option Card */}
              <div 
                onClick={() => updateMapping(role.id, "")}
                className={`relative group cursor-pointer p-6 rounded-2xl border-2 transition-all ${
                  !mappings[role.id] 
                    ? 'border-[#db3b76] bg-pink-50/30' 
                    : 'border-gray-100 hover:border-[#db3b76]/30 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-gray-200 rounded-xl text-gray-600">
                    <Layout size={24} />
                  </div>
                  {!mappings[role.id] && <CheckCircle size={20} className="text-[#db3b76]" />}
                </div>
                <h4 className="font-bold text-[#313166] text-lg mb-1">System Default</h4>
                <p className="text-xs text-gray-500 mb-4">Uses Vadik&apos;s standard message format for this role.</p>
                <div className="bg-white border border-gray-100 p-4 rounded-xl text-xs text-gray-400 italic">
                  &quot;{role.defaultText}&quot;
                </div>
              </div>

              {/* Eligible Custom Templates */}
              {templates.map(t => {
                const eligibility = checkEligibility(t, role);
                const isSelected = mappings[role.id] === t.name;
                
                return (
                  <div 
                    key={t.id}
                    onClick={() => eligibility.eligible && updateMapping(role.id, t.name)}
                    className={`relative group p-6 rounded-2xl border-2 transition-all ${
                      isSelected 
                        ? 'border-[#db3b76] bg-pink-50/30' 
                        : eligibility.eligible 
                          ? 'border-gray-100 cursor-pointer hover:border-[#db3b76]/30 hover:bg-gray-50' 
                          : 'border-gray-50 opacity-50 cursor-not-allowed bg-gray-50/50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-xl ${
                        t.status === 'APPROVED' ? 'bg-green-100 text-green-600' : 
                        t.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                      }`}>
                        <FileText size={24} />
                      </div>
                      <div className="flex items-center gap-2">
                        {isSelected && <CheckCircle size={20} className="text-[#db3b76]" />}
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                          t.status === 'APPROVED' ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                    </div>
                    <h4 className="font-bold text-[#313166] text-lg mb-1 truncate pr-8">{t.name}</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">{t.language} • {t.category}</p>
                    
                    <div className="bg-white border border-gray-100 p-4 rounded-xl text-xs text-gray-600 italic line-clamp-3 mb-4">
                      &quot;{t.components.find(c => c.type === 'BODY')?.text}&quot;
                    </div>

                    {!eligibility.eligible && (
                      <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold bg-red-50 p-2 rounded-lg mt-2">
                        <AlertCircle size={14} />
                        {eligibility.reason}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {templates.length === 0 && (
              <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="text-gray-300" size={32} />
                </div>
                <h4 className="text-[#313166] font-bold">No custom templates yet</h4>
                <p className="text-gray-400 text-sm max-w-xs mx-auto mt-1">Create or sync templates to see them listed here for mapping.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black text-[#313166] tracking-tight flex items-center gap-3">
            WhatsApp Template Manager
            <button onClick={() => setShowRules(true)} className="text-gray-300 hover:text-[#db3b76] transition-colors">
              <HelpCircle size={22} />
            </button>
          </h2>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            {isUsingOwn 
              ? "Automate your customer engagement with custom meta-approved templates." 
              : "Standard account active. Connect your own to unlock custom branding."}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          {isUsingOwn && (
            <button 
              onClick={handleOpenSyncModal}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-[#313166] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#25254d] transition-all shadow-lg active:scale-95 group"
            >
              <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
              <span>Smart Sync</span>
            </button>
          )}
          <a 
            href="https://business.facebook.com/wa/manage/templates" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white border-2 border-gray-100 text-[#313166] px-6 py-3 rounded-2xl font-bold hover:border-[#313166] transition-all group"
          >
            <ExternalLink size={18} className="text-[#db3b76]" />
            <span>Meta Manager</span>
          </a>
        </div>
      </div>

      {/* Rules Banner */}
      {showRules && (
        <div className="mb-8 p-6 bg-[#313166] text-white rounded-3xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
          <button 
            onClick={() => setShowRules(false)}
            className="absolute top-4 right-4 text-white/40 hover:text-white"
          >
            <X size={20} />
          </button>
          <div className="flex items-start gap-5 relative z-10">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md shrink-0">
              <Info size={24} className="text-[#db3b76]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
              <div>
                <h4 className="font-bold text-lg mb-2">Naming Rules</h4>
                <ul className="text-xs text-white/70 space-y-1.5 list-disc pl-4">
                  <li>Lowercase letters only (a-z)</li>
                  <li>Numbers allowed (0-9)</li>
                  <li>Underscores only (no spaces)</li>
                  <li>Max 512 characters</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2">Variables {"{{n}}"}</h4>
                <ul className="text-xs text-white/70 space-y-1.5 list-disc pl-4">
                  <li>Must use format: {"{{1}}, {{2}}"}...</li>
                  <li>Numbers must be sequential</li>
                  <li>No gaps (e.g., {"{{1}}, {{3}}"} is invalid)</li>
                  <li>Content is filled dynamically</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2">Approval Process</h4>
                <ul className="text-xs text-white/70 space-y-1.5 list-disc pl-4">
                  <li>Meta reviews every template</li>
                  <li>Takes 1 minute to 24 hours</li>
                  <li>Only &apos;APPROVED&apos; can be sent</li>
                  <li>Rejected ones can be edited and resubmitted</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Alert for Unconnected */}
      {!isUsingOwn && (
        <div className="mb-10 p-6 bg-blue-50/50 border-2 border-blue-100 rounded-3xl flex items-start gap-5 shadow-sm">
          <div className="p-3 bg-blue-100 rounded-2xl text-blue-600 animate-pulse">
            <AlertCircle size={28} />
          </div>
          <div className="flex-1">
            <h4 className="font-black text-blue-900 text-lg">System Account Routing Active</h4>
            <p className="text-sm text-blue-700 mt-1 leading-relaxed font-medium">
              You are currently using the default Vadik account. To use your own brand name, custom templates, and direct Meta approval, please complete the setup in <span className="underline font-bold">Settings &gt; Integration</span>.
            </p>
          </div>
          <ChevronRight className="text-blue-400 self-center" size={24} />
        </div>
      )}

      {/* Grid Sections */}
      <div className="space-y-12">
        {/* Role Mapping Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-[#313166] flex items-center gap-2">
              <div className="w-2 h-8 bg-[#db3b76] rounded-full"></div>
              System Roles & Mapping
            </h3>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100">
              Operational Status: Active
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {STANDARD_TEMPLATES.map(role => {
              const currentMapping = mappings[role.id];
              
              return (
                <div 
                  key={role.id}
                  onClick={() => isUsingOwn && setSelectedRole(role.id)}
                  className={`group relative bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${isUsingOwn ? 'cursor-pointer' : 'opacity-80'}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2.5 rounded-2xl ${currentMapping ? 'bg-[#db3b76]/10 text-[#db3b76]' : 'bg-gray-100 text-gray-400'}`}>
                      <Layout size={20} />
                    </div>
                    {currentMapping && (
                      <div className="flex items-center gap-1.5 bg-green-50 text-green-600 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-green-100">
                        <Check size={10} strokeWidth={3} /> Mapped
                      </div>
                    )}
                  </div>
                  
                  <h4 className="font-bold text-[#313166] text-sm group-hover:text-[#db3b76] transition-colors">{role.label}</h4>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {role.vars.slice(0, 2).map((v, i) => (
                      <span key={i} className="text-[9px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">
                        {v}
                      </span>
                    ))}
                    {role.vars.length > 2 && <span className="text-[9px] font-bold text-gray-400">+{role.vars.length - 2} more</span>}
                  </div>

                  <div className="mt-6 pt-5 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Template Source</span>
                      <span className="text-[10px] font-black text-[#313166] truncate max-w-[120px]">
                        {currentMapping || "System Default"}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-[#db3b76] group-hover:text-white transition-all shadow-inner">
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Templates Gallery Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-[#313166] flex items-center gap-2">
              <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
              Your Meta Templates
            </h3>
            <div className="flex items-center gap-4">
              <div className="relative w-48 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Filter templates..."
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#db3b76]/20 transition-all text-xs"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-4 py-2 rounded-xl border border-gray-200">
                {templates.length} TOTAL
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((template) => {
              const isMapped = Object.values(mappings).includes(template.name);
              
              return (
                <div key={template.id} className="group bg-white border border-gray-200 rounded-3xl p-0 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col border-b-4 hover:border-b-[#db3b76]">
                  <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                    <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-tight shadow-sm ${
                      template.status === 'APPROVED' ? 'bg-green-600 text-white' : 
                      template.status === 'REJECTED' ? 'bg-red-600 text-white' : 'bg-yellow-500 text-white'
                    }`}>
                      {template.status}
                    </span>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{template.category}</span>
                  </div>
                  
                  <div className="p-6 flex-grow flex flex-col">
                    <h4 className="font-black text-[#313166] mb-4 text-sm truncate group-hover:text-[#db3b76] transition-colors" title={template.name}>
                      {template.name}
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-2xl text-[11px] text-gray-600 leading-relaxed italic border border-gray-100 min-h-[120px] relative">
                      <span className="absolute -top-2 -left-2 text-[#db3b76] opacity-20"><Plus size={24} /></span>
                      &quot;{template.components.find(c => c.type === 'BODY')?.text}&quot;
                    </div>
                  </div>

                  <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/20 flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-400 border-2 border-white shadow-sm"></div>
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">{template.language}</span>
                    </div>
                    {isMapped && (
                      <div className="flex items-center gap-1.5 py-1 px-3 bg-[#db3b76] text-white rounded-full shadow-lg">
                        <CheckCircle size={12} strokeWidth={3} />
                        <span className="text-[9px] font-black uppercase tracking-tighter">Active</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {templates.length === 0 && (
              <div className="col-span-full py-20 text-center bg-gray-50 border-4 border-dashed border-gray-200 rounded-[3rem] flex flex-col items-center">
                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl mb-6 -rotate-6 group hover:rotate-0 transition-transform duration-500">
                  <Layout className="w-12 h-12 text-[#db3b76] opacity-30" />
                </div>
                <h4 className="text-[#313166] text-xl font-black mb-2">Initialize Your Account</h4>
                <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
                  {isUsingOwn 
                    ? "Your template library is currently empty. Use 'Smart Sync' to automatically generate our core message set."
                    : "Connect your custom business profile to start building a tailored messaging experience."}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Enhanced Sync Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-[#313166]/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
            {/* Modal Header */}
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-2xl font-black text-[#313166] tracking-tight">Smart Sync Engine</h3>
                <p className="text-xs text-gray-500 mt-1 font-medium italic">Generating Meta-compliant system templates automatically.</p>
              </div>
              {!syncing && (
                <button 
                  onClick={() => setShowSyncModal(false)} 
                  className="w-10 h-10 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all shadow-sm"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8">
              {syncing ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="relative w-48 h-48 mb-10 group">
                    <div className="absolute inset-0 bg-[#db3b76]/5 rounded-full scale-110 animate-pulse"></div>
                    <svg className="w-full h-full transform -rotate-90 relative z-10">
                      <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
                      <circle
                        cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent"
                        strokeDasharray={553}
                        strokeDashoffset={553 - (553 * syncProgress.current) / syncProgress.total}
                        className="text-[#db3b76] transition-all duration-1000 ease-in-out"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col z-20">
                      <span className="text-5xl font-black text-[#313166]">{Math.round((syncProgress.current / syncProgress.total) * 100)}%</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] mt-1">Processing</span>
                    </div>
                  </div>

                  <div className="w-full max-w-md bg-gray-50 rounded-3xl p-6 border border-gray-100">
                    <h4 className="text-center font-bold text-[#313166] mb-4 flex items-center justify-center gap-2">
                      {syncProgress.status === 'completed' ? (
                        <>
                          <CheckCircle className="text-green-500" />
                          Batch Process Complete
                        </>
                      ) : (
                        <>
                          <RefreshCw className="animate-spin text-[#db3b76]" size={18} />
                          Active Deployment...
                        </>
                      )}
                    </h4>
                    
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {syncProgress.results.map((res, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 animate-in slide-in-from-right-2">
                          <span className="text-xs font-bold text-gray-600 truncate max-w-[200px]">{res.name}</span>
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                            res.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {res.status === 'success' ? <Check size={10} strokeWidth={4} /> : <X size={10} strokeWidth={4} />}
                            {res.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {syncProgress.status === 'completed' && (
                    <button 
                      onClick={() => setShowSyncModal(false)}
                      className="mt-8 bg-[#313166] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-[#25254d] shadow-2xl transition-all"
                    >
                      Dismiss Console
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-yellow-50 border-2 border-yellow-100 p-5 rounded-3xl flex gap-4">
                    <AlertCircle className="text-yellow-600 shrink-0" size={24} />
                    <p className="text-xs text-yellow-800 font-medium leading-relaxed">
                      This process will create standardized templates in your Meta account. We will attempt to use your custom names, but we always ensure the final names are sanitized for Meta&apos;s API requirements (lowercase + underscores).
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {syncTemplatesData.map((template, idx) => (
                      <div key={template.id} className={`p-5 border-2 rounded-3xl transition-all duration-300 ${template.selected ? 'border-[#db3b76] bg-pink-50/20 ring-4 ring-[#db3b76]/5' : 'border-gray-100 opacity-60'}`}>
                        <div className="flex items-start gap-4 mb-4">
                          <div 
                            onClick={() => {
                              const newData = [...syncTemplatesData];
                              newData[idx].selected = !newData[idx].selected;
                              setSyncTemplatesData(newData);
                            }}
                            className={`mt-1 w-7 h-7 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all ${
                              template.selected ? 'bg-[#db3b76] border-[#db3b76] text-white shadow-lg' : 'border-gray-300 bg-white'
                            }`}
                          >
                            {template.selected && <Check size={18} strokeWidth={4} />}
                          </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-black text-[#313166] text-sm uppercase tracking-tight">{template.label}</h4>
                          <span className="text-[9px] font-black text-gray-400 bg-white px-2 py-0.5 rounded-lg border border-gray-100">{template.category}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-4">
                          <span className="text-[10px] font-bold text-gray-400 shrink-0">API NAME:</span>
                          <div className="flex-1 relative">
                            <input 
                              type="text"
                              className={`w-full bg-white border rounded-lg px-3 py-1.5 text-xs outline-none transition-colors font-mono ${
                                templates.some(ex => ex.name.toLowerCase() === template.customName.toLowerCase().replace(/[^a-z0-9_]/g, '_'))
                                  ? 'border-red-500 text-red-600'
                                  : 'border-gray-200 focus:border-[#db3b76] text-[#db3b76]'
                              }`}
                              value={template.customName}
                              onChange={(e) => {
                                const newData = [...syncTemplatesData];
                                newData[idx].customName = e.target.value;
                                setSyncTemplatesData(newData);
                              }}
                            />
                            {templates.some(ex => ex.name.toLowerCase() === template.customName.toLowerCase().replace(/[^a-z0-9_]/g, '_')) && (
                              <span className="absolute -bottom-4 left-0 text-[8px] text-red-500 font-bold">NAME ALREADY TAKEN</span>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="space-y-3">
                             <div className="relative">
                              <textarea
                                className={`w-full text-xs p-3 border rounded-lg outline-none bg-white min-h-[100px] transition-colors ${
                                  !validateVariableStructure(template.text, template.vars.length) 
                                    ? 'border-red-500 ring-2 ring-red-50' 
                                    : 'border-gray-200 focus:ring-2 focus:ring-[#db3b76]/10 focus:border-[#db3b76]'
                                }`}
                                value={template.text}
                                onChange={(e) => {
                                  const newData = [...syncTemplatesData];
                                  newData[idx].text = e.target.value;
                                  setSyncTemplatesData(newData);
                                }}
                                placeholder="Template content..."
                              />
                              {!validateVariableStructure(template.text, template.vars.length) && (
                                <p className="text-red-500 text-[9px] mt-1 font-bold flex items-center gap-1">
                                  <AlertCircle size={10} />
                                  Missing variable: {"{{"}{template.vars.length}{"}}"}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {template.vars.map((v, vIdx) => (
                                <span key={vIdx} className="text-[8px] bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-500 font-bold">
                                  {"{{"}{vIdx + 1}{"}}"} : {v}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-center items-center bg-gray-50/50 rounded-2xl p-2">
                             <TemplatePreview 
                                text={template.text} 
                                vars={template.vars} 
                             />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

          {/* Modal Footer */}
            {!syncing && (
              <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex gap-4">
                <button
                  onClick={() => setShowSyncModal(false)}
                  className="flex-1 py-4 px-6 bg-white border-2 border-gray-200 rounded-2xl font-black text-gray-400 uppercase tracking-widest hover:border-gray-300 hover:text-gray-500 transition-all shadow-sm"
                >
                  Cancel Batch
                </button>
                <button
                  onClick={handleSyncTemplates}
                  className="flex-[2] py-4 px-6 bg-[#313166] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-[#25254d] transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95"
                >
                  <Send size={20} />
                  <span>Execute Smart Sync</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Quick Create Modal */}
      {showQuickCreate && (
        <div className="fixed inset-0 bg-[#313166]/80 backdrop-blur-xl flex items-center justify-center z-[110] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-2xl font-black text-[#313166] tracking-tight">Create Custom Replacement</h3>
                <p className="text-xs text-gray-500 mt-1 font-medium italic">Building a specialized template for: <span className="text-[#db3b76] uppercase font-bold">{quickCreateData.role?.label}</span></p>
              </div>
              <button 
                onClick={() => setShowQuickCreate(false)} 
                className="w-10 h-10 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                    <h4 className="text-xs font-black text-blue-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Info size={14} /> Role Requirements
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {quickCreateData.role?.vars.map((v, i) => (
                        <span key={i} className="bg-white px-2 py-1 rounded-lg text-[10px] font-bold text-blue-700 border border-blue-200">
                          {"{{"}{i + 1}{"}}"} : {v}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Unique Template Name</label>
                      <input 
                        type="text"
                        className={`w-full bg-gray-50 border rounded-2xl px-5 py-3 text-sm outline-none transition-all font-mono ${
                          templates.some(ex => ex.name.toLowerCase() === quickCreateData.name.toLowerCase().replace(/[^a-z0-9_]/g, '_'))
                            ? 'border-red-500 text-red-600 bg-red-50'
                            : 'border-gray-200 focus:border-[#db3b76] focus:bg-white text-[#313166]'
                        }`}
                        value={quickCreateData.name}
                        onChange={(e) => setQuickCreateData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. birthday_promo_2024"
                      />
                      {templates.some(ex => ex.name.toLowerCase() === quickCreateData.name.toLowerCase().replace(/[^a-z0-9_]/g, '_')) && (
                        <p className="text-red-500 text-[10px] mt-1 font-bold">This name is already used in your Meta account.</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Message Content</label>
                      <textarea 
                        className={`w-full bg-gray-50 border rounded-2xl px-5 py-4 text-sm outline-none transition-all min-h-[150px] ${
                          !validateVariableStructure(quickCreateData.text, quickCreateData.role?.vars.length)
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 focus:border-[#db3b76] focus:bg-white'
                        }`}
                        value={quickCreateData.text}
                        onChange={(e) => setQuickCreateData(prev => ({ ...prev, text: e.target.value }))}
                        placeholder="Type your message here..."
                      />
                      {!validateVariableStructure(quickCreateData.text, quickCreateData.role?.vars.length) && (
                        <div className="mt-2 p-3 bg-red-100 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2">
                          <AlertCircle size={14} />
                          Variable Structure Invalid: Must use all sequential variables.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center space-y-4">
                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Meta Preview</h4>
                   <TemplatePreview 
                      text={quickCreateData.text} 
                      vars={quickCreateData.role?.vars || []} 
                   />
                   <p className="text-[10px] text-gray-400 text-center max-w-[250px] italic">
                     This is exactly how your customers will see the message on their phones.
                   </p>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex gap-4">
              <button
                onClick={() => setShowQuickCreate(false)}
                className="flex-1 py-4 px-6 bg-white border-2 border-gray-200 rounded-2xl font-black text-gray-400 uppercase tracking-widest hover:border-gray-300 transition-all"
              >
                Discard
              </button>
              <button
                disabled={loading || templates.some(ex => ex.name.toLowerCase() === quickCreateData.name.toLowerCase().replace(/[^a-z0-9_]/g, '_')) || !validateVariableStructure(quickCreateData.text, quickCreateData.role?.vars.length)}
                onClick={handleQuickCreate}
                className="flex-[2] py-4 px-6 bg-[#313166] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-[#25254d] transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <RefreshCw className="animate-spin" size={20} /> : <Send size={20} />}
                <span>Request Meta Approval</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Template;
