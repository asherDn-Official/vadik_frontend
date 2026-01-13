import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../api/apiconfig.js';
import { MessageSquare, CheckCircle, XCircle, RefreshCw, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';

const WhatsAppIntegration = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
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
      }
    } catch (error) {
      console.error("Error fetching WhatsApp config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmbeddedSignup = () => {
    if (window.FB) {
      window.FB.login((response) => {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken;
          tokenRef.current = accessToken;
          console.log("Logged in to Meta", response);
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
      }
    } catch (error) {
      toast.error("Failed to disconnect WhatsApp");
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!manualConfig.accessToken || !manualConfig.wabaId || !manualConfig.phoneNumberId) {
      toast.error("Please fill in all required fields");
      return;
    }

    // ID validation (usually 10-20 digits)
    const idRegex = /^\d{10,20}$/;
    if (!idRegex.test(manualConfig.wabaId)) {
      toast.error("Invalid WABA ID format. Should be 10-20 digits.");
      return;
    }
    if (!idRegex.test(manualConfig.phoneNumberId)) {
      toast.error("Invalid Phone Number ID format. Should be 10-20 digits.");
      return;
    }

    if (manualConfig.accessToken.length < 50) {
      toast.error("Access Token seems too short. Please provide a valid Meta System User Token.");
      return;
    }

    await saveConfig(manualConfig);
    setShowManualModal(false);
    setManualConfig({ accessToken: '', wabaId: '', phoneNumberId: '', businessId: '' });
  };

  if (loading) return <div className="flex justify-center items-center h-64"><RefreshCw className="animate-spin text-[#313166]" /></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#313166] mb-2">WhatsApp Integration</h2>
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

        {config?.isUsingOwnWhatsapp && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">WABA ID</p>
              <p className="text-sm font-mono text-[#313166]">{config.whatsappWabaId}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Phone Number ID</p>
              <p className="text-sm font-mono text-[#313166]">{config.whatsappPhoneNumberId}</p>
            </div>
            {config.whatsappBusinessId && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Business ID</p>
                <p className="text-sm font-mono text-[#313166]">{config.whatsappBusinessId}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Connection Status</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={`w-2 h-2 rounded-full ${config.whatsappStatus === 'verified' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <p className="text-sm capitalize text-[#313166]">{config.whatsappStatus || 'Connected'}</p>
              </div>
            </div>
          </div>
        )}

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
            </div>
          ) : (
            <div className="flex space-x-4">
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

      {showManualModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#313166]">Manual Configuration</h3>
              <button onClick={() => setShowManualModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleManualSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Access Token</label>
                  <input
                    type="password"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#313166] outline-none"
                    value={manualConfig.accessToken}
                    onChange={(e) => setManualConfig({ ...manualConfig, accessToken: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Business Account ID</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#313166] outline-none"
                    value={manualConfig.wabaId}
                    onChange={(e) => setManualConfig({ ...manualConfig, wabaId: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number ID</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#313166] outline-none"
                    value={manualConfig.phoneNumberId}
                    onChange={(e) => setManualConfig({ ...manualConfig, phoneNumberId: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Business ID (Optional)</label>
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
    </div>
  );
};

export default WhatsAppIntegration;
