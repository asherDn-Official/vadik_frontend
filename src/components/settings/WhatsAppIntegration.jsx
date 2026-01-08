import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../api/apiconfig.js';
import { MessageSquare, CheckCircle, XCircle, RefreshCw, Trash2, Layout, Plus, Send } from 'lucide-react';
import { toast } from 'react-toastify';

const WhatsAppIntegration = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    category: 'MARKETING',
    language: 'en_US',
    bodyText: ''
  });
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualConfig, setManualConfig] = useState({
    accessToken: '',
    wabaId: '',
    phoneNumberId: '',
    businessId: ''
  });
  const tokenRef = useRef(null);

  useEffect(() => {
    fetchConfig();
    loadFacebookSDK();

    // Listen for messages from Meta Embedded Signup
    const handleMetaMessage = (event) => {
      if (event.origin !== "https://www.facebook.com") return;
      
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'WA_EMBEDDED_SIGNUP_COMPLETE') {
          console.log("WhatsApp Embedded Signup Complete:", data);
          const { waba_id, phone_number_id } = data.data;
          
          if (waba_id && phone_number_id && tokenRef.current) {
            toast.success("WhatsApp account linked! Saving configuration...");
            saveConfig({
              accessToken: tokenRef.current,
              wabaId: waba_id,
              phoneNumberId: phone_number_id
            });
          }
        }
      } catch (e) {
        // Not a JSON or not from Meta
      }
    };

    window.addEventListener('message', handleMetaMessage);
    return () => window.removeEventListener('message', handleMetaMessage);
  }, []);

  const loadFacebookSDK = () => {
    window.fbAsyncInit = function() {
      window.FB.init({
        appId      : import.meta.env.VITE_FACEBOOK_APP_ID,
        cookie     : true,
        xfbml      : true,
        version    : 'v18.0'
      });
    };

    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  };

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
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const handleEmbeddedSignup = () => {
    if (window.FB) {
      window.FB.login((response) => {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken;
          tokenRef.current = accessToken;
          console.log("Logged in to Meta", response);
          
          // The embedded signup flow might return the WABA and Phone IDs in the response 
          // or via a message event. We'll handle it here if possible.
          // Note: Full implementation usually requires a backend exchange if using 'code' response type
          toast.info("Meta login successful. Please ensure your Business Account and WhatsApp IDs are configured.");
        } else {
          toast.error("User cancelled login or did not fully authorize.");
        }
      }, {
        scope: 'whatsapp_business_management,whatsapp_business_messaging',
        extras: {
          feature: 'whatsapp_embedded_signup',
          config_id: import.meta.env.VITE_FACEBOOK_CONFIG_ID,
          response_type: 'code',
        }
      });
    } else {
      toast.error("Facebook SDK not loaded");
    }
  };

  const saveConfig = async (data) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/integrationManagement/whatsapp/config`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        toast.success("WhatsApp connected successfully");
        fetchConfig();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to connect WhatsApp");
    }
  };

  const disconnectWhatsapp = async () => {
    if (!window.confirm("Are you sure you want to disconnect your WhatsApp account? You will revert to using the platform's default WhatsApp number.")) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_BASE_URL}/api/integrationManagement/whatsapp/config`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        toast.success("WhatsApp disconnected");
        setConfig({ ...config, isUsingOwnWhatsapp: false, whatsappStatus: 'disconnected' });
        setTemplates([]);
      }
    } catch (error) {
      toast.error("Failed to disconnect WhatsApp");
    }
  };

  const syncTemplates = async () => {
    setSyncing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/integrationManagement/whatsapp/sync-templates`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        toast.success("Templates synced successfully");
        fetchTemplates();
      }
    } catch (error) {
      toast.error("Failed to sync templates");
    } finally {
      setSyncing(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualConfig.accessToken || !manualConfig.wabaId || !manualConfig.phoneNumberId) {
      toast.error("Please fill in all required fields");
      return;
    }
    await saveConfig(manualConfig);
    setShowManualModal(false);
    setManualConfig({ accessToken: '', wabaId: '', phoneNumberId: '', businessId: '' });
  };

  const formatTemplateText = (text, example) => {
    if (!text) return '';
    if (!example) return text;

    let formattedText = text;
    
    // Handle body_text or header_text examples
    const exampleValues = example.body_text?.[0] || example.header_text?.[0] || [];
    
    exampleValues.forEach((val, index) => {
      const placeholder = `{{${index + 1}}}`;
      formattedText = formattedText.split(placeholder).join(val);
    });

    return formattedText;
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        name: newTemplate.name.toLowerCase().replace(/\s+/g, '_'),
        category: newTemplate.category,
        language: newTemplate.language,
        components: [
          {
            type: 'BODY',
            text: newTemplate.bodyText
          }
        ]
      };
      // We'll use the sync-templates endpoint or a new one
      const response = await axios.post(`${API_BASE_URL}/api/integrationManagement/whatsapp/sync-templates`, { customTemplate: payload }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        toast.success("Template submitted for approval");
        setShowCreateModal(false);
        setNewTemplate({ name: '', category: 'MARKETING', language: 'en_US', bodyText: '' });
        fetchTemplates();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create template");
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><RefreshCw className="animate-spin text-[#313166]" /></div>;
  console.log(import.meta.env.VITE_FACEBOOK_CONFIG_ID)
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#313166] mb-2">WhatsApp Integration Opened</h2>
        <p className="text-gray-600">Connect your own WhatsApp Business account to send messages using your own number and branding.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${config?.isUsingOwnWhatsapp ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
              <MessageSquare size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#313166]">
                {config?.isUsingOwnWhatsapp ? 'Custom WhatsApp Account' : 'Platform Default Account'}
              </h3>
              <p className="text-sm text-gray-500">
                {config?.isUsingOwnWhatsapp ? `Connected to WABA: ${config.whatsappWabaId}` : 'Currently using Vadik AI\'s shared WhatsApp number'}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            {config?.isUsingOwnWhatsapp ? (
              <span className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                <CheckCircle size={16} className="mr-1" /> Connected
              </span>
            ) : (
              <span className="flex items-center text-gray-600 bg-gray-50 px-3 py-1 rounded-full text-sm font-medium">
                <XCircle size={16} className="mr-1" /> Not Connected
              </span>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
          {!config?.isUsingOwnWhatsapp ? (
            <div>
              <p className="mb-4 text-sm text-gray-600">
                Choose how you want to connect your WhatsApp Business API account.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 p-4 border border-gray-100 rounded-lg bg-gray-50">
                  <h4 className="font-semibold text-[#313166] mb-2">Embedded Signup</h4>
                  <p className="text-xs text-gray-500 mb-4">Recommended. Easy flow through Meta's popup.</p>
                  <button
                    onClick={handleEmbeddedSignup}
                    className="w-full bg-[#313166] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#25254d] transition-colors"
                  >
                    Connect via Meta
                  </button>
                </div>
                <div className="flex-1 p-4 border border-gray-100 rounded-lg bg-gray-50">
                  <h4 className="font-semibold text-[#313166] mb-2">Manual Entry</h4>
                  <p className="text-xs text-gray-500 mb-4">Enter your WABA ID and Token manually.</p>
                  <button
                    onClick={() => setShowManualModal(true)}
                    className="w-full border border-[#313166] text-[#313166] px-4 py-2 rounded-lg text-sm font-medium hover:bg-white transition-colors"
                  >
                    Enter Manually
                  </button>
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-400">Your interaction data will be stored securely and used only for your business communications.</p>
            </div>
          ) : (
            <div className="flex space-x-4">
              <button
                onClick={syncTemplates}
                disabled={syncing}
                className="flex items-center space-x-2 border border-[#313166] text-[#313166] px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {syncing ? <RefreshCw size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                <span>Sync Standard Templates</span>
              </button>
              <button
                onClick={disconnectWhatsapp}
                className="flex items-center space-x-2 border border-red-200 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors"
              >
                <Trash2 size={18} />
                <span>Disconnect Account</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {config?.isUsingOwnWhatsapp && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2 text-[#313166]">
              <Layout size={20} />
              <h3 className="text-lg font-semibold">Your WhatsApp Templates</h3>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-1 text-sm bg-[#313166] text-white px-3 py-1 rounded-md hover:bg-[#25254d]"
              >
                <Plus size={16} />
                <span>Create Template</span>
              </button>
              <button 
                onClick={fetchTemplates}
                className="text-sm text-[#313166] hover:underline"
              >
                Refresh List
              </button>
            </div>
          </div>

          {templates.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-lg">
              <p className="text-gray-400 mb-4">No templates found in your WABA account.</p>
              <button 
                onClick={syncTemplates}
                className="text-[#313166] font-medium hover:underline"
              >
                Sync Standard Templates Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <div 
                  key={template.id} 
                  className="border border-gray-100 rounded-lg p-4 hover:border-[#313166] hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => {
                    setSelectedTemplate(template);
                    setShowDetailModal(true);
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{template.category}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      template.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                      template.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {template.status}
                    </span>
                  </div>
                  <h4 className="font-medium text-[#313166] mb-1 group-hover:text-[#313166]">{template.name}</h4>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                    {template.components.find(c => c.type === 'BODY')?.text}
                  </p>
                  <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-50">
                    <span className="text-[10px] text-gray-400 uppercase">{template.language}</span>
                    <span className="text-[10px] text-[#313166] font-bold opacity-0 group-hover:opacity-100 transition-opacity">View Details →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#313166]">Create New Template</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateTemplate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. welcome_message"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#313166] focus:border-transparent outline-none"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Lowercase letters, numbers and underscores only.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none"
                    value={newTemplate.category}
                    onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                  >
                    <option value="MARKETING">Marketing</option>
                    <option value="UTILITY">Utility</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Body Text</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Hello {{1}}, welcome to {{2}}!"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#313166] focus:border-transparent outline-none"
                    value={newTemplate.bodyText}
                    onChange={(e) => setNewTemplate({ ...newTemplate, bodyText: e.target.value })}
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Use {"{{1}}, {{2}}"} etc. for dynamic variables.</p>
                </div>
              </div>
              <div className="mt-8 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#313166] text-white rounded-lg font-medium hover:bg-[#25254d] flex items-center justify-center space-x-2"
                >
                  <Send size={18} />
                  <span>Submit for Approval</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showManualModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#313166]">Manual Credential Entry</h3>
              <button onClick={() => setShowManualModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleManualSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Permanent Access Token *</label>
                  <input
                    type="password"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#313166] outline-none"
                    value={manualConfig.accessToken}
                    onChange={(e) => setManualConfig({ ...manualConfig, accessToken: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Business Account ID (WABA ID) *</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#313166] outline-none"
                    value={manualConfig.wabaId}
                    onChange={(e) => setManualConfig({ ...manualConfig, wabaId: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number ID *</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#313166] outline-none"
                    value={manualConfig.phoneNumberId}
                    onChange={(e) => setManualConfig({ ...manualConfig, phoneNumberId: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business ID (Optional)</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#313166] outline-none"
                    value={manualConfig.businessId}
                    onChange={(e) => setManualConfig({ ...manualConfig, businessId: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-8 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#313166] text-white rounded-lg font-medium hover:bg-[#25254d]"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showDetailModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <div>
                <h3 className="text-xl font-bold text-[#313166]">{selectedTemplate.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{selectedTemplate.category}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-500 uppercase">{selectedTemplate.language}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${
                  selectedTemplate.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                  selectedTemplate.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {selectedTemplate.status}
                </span>
                <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* WhatsApp Preview Style */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-gray-500">Message Preview</span>
                  {selectedTemplate.components.some(c => c.example) && (
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium italic">
                      Showing example values
                    </span>
                  )}
                </div>
                <div className="bg-[#e5ddd5] p-4 rounded-lg relative overflow-hidden">
                  <div className="bg-white p-3 rounded-lg shadow-sm max-w-[85%] relative">
                    {selectedTemplate.components.map((comp, idx) => {
                      if (comp.type === 'HEADER') {
                        return (
                          <div key={idx} className="mb-2">
                            {comp.format === 'TEXT' ? (
                              <div className="font-bold text-sm">{formatTemplateText(comp.text, comp.example)}</div>
                            ) : comp.format === 'IMAGE' ? (
                              <div className="bg-gray-200 aspect-video rounded flex items-center justify-center text-gray-400 text-xs mb-2">
                                Image Header
                              </div>
                            ) : (
                              <div className="bg-gray-100 p-2 rounded text-xs text-gray-500 italic mb-2">
                                {comp.format} Header
                              </div>
                            )}
                          </div>
                        );
                      }
                      if (comp.type === 'BODY') {
                        return (
                          <div key={idx} className="text-sm text-gray-800 whitespace-pre-wrap">
                            {formatTemplateText(comp.text, comp.example)}
                          </div>
                        );
                      }
                      if (comp.type === 'FOOTER') {
                        return (
                          <div key={idx} className="text-[11px] text-gray-400 mt-1">
                            {comp.text}
                          </div>
                        );
                      }
                      return null;
                    })}
                    
                    {/* Buttons in preview */}
                  {selectedTemplate.components.find(c => c.type === 'BUTTONS') && (
                    <div className="mt-3 border-t pt-2 flex flex-col space-y-1">
                      {selectedTemplate.components.find(c => c.type === 'BUTTONS').buttons.map((btn, bIdx) => (
                        <div key={bIdx} className="bg-white text-blue-500 text-sm py-2 text-center border rounded font-medium flex items-center justify-center space-x-1">
                          {btn.type === 'PHONE_NUMBER' && <span className="text-xs">📞</span>}
                          {btn.type === 'URL' && <span className="text-xs">🔗</span>}
                          <span>{btn.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

              {/* Technical Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Components</span>
                  <div className="space-y-1">
                    {selectedTemplate.components.map((comp, idx) => (
                      <div key={idx} className="text-xs flex justify-between">
                        <span className="text-gray-600">{comp.type}</span>
                        <span className="text-gray-400">{comp.format || (comp.buttons ? `${comp.buttons.length} buttons` : 'TEXT')}</span>
                      </div>
                    ))}
                    {selectedTemplate.sub_category && (
                      <div className="text-xs flex justify-between pt-1 border-t border-gray-100 mt-1">
                        <span className="text-gray-600">Sub-category</span>
                        <span className="text-gray-400">{selectedTemplate.sub_category}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">ID</span>
                  <span className="text-xs font-mono break-all text-gray-600">{selectedTemplate.id}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 bg-[#313166] text-white rounded-lg font-medium hover:bg-[#25254d]"
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

export default WhatsAppIntegration;
