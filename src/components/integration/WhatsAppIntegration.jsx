import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../api/apiconfig.js';
import { 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Trash2, 
  X, 
  Link as LinkIcon, 
  Copy, 
  ExternalLink, 
  Info,
  CheckCircle2,
  Phone,
  Settings,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Globe,
  AlertTriangle 
} from 'lucide-react';
import { toast } from 'react-toastify';

const WhatsAppIntegration = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [webhookInfo, setWebhookInfo] = useState(null);
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [signupStatus, setSignupStatus] = useState(null); 
  const [whatsappDetails, setWhatsappDetails] = useState(null);
  const [metaStatus, setMetaStatus] = useState(null);
  
  // Modals
  const [showManualModal, setShowManualModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showPaymentInstructions, setShowPaymentInstructions] = useState(false);
  const [showIndiaWarning, setShowIndiaWarning] = useState(false); 

  const [pin, setPin] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [pingLoading, setPingLoading] = useState(false);
  const [refreshingStatus, setRefreshingStatus] = useState(false);
  
  const [pendingPhoneId, setPendingPhoneId] = useState('');
  const [manualConfig, setManualConfig] = useState({
    accessToken: '',
    wabaId: '',
    phoneNumberId: '',
    businessId: ''
  });
  const [fbInitialized, setFbInitialized] = useState(false);
  const signupRef = useRef({
    code: null,
    wabaId: null,
    phoneNumberId: null,
    businessId: null,
    authorizedAt: null,
    exchanging: false
  });

  const decodeSignedRequest = (signedRequest) => {
    try {
      const parts = signedRequest.split('.');
      if (parts.length !== 2) return null;
      const payload = parts[1];
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      return decoded;
    } catch (e) {
      console.error("Error decoding signedRequest:", e);
      return null;
    }
  };

  useEffect(() => {
    fetchConfig();
    loadFacebookSDK();

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      signupRef.current.code = code;
    }

    const handleMetaMessage = (event) => {
      if (!event.origin.endsWith('facebook.com') && !event.origin.endsWith('facebook.net')) return;
      
      let data;
      try {
        if (typeof event.data === "string") {
          if (event.data.trim().startsWith('{')) data = JSON.parse(event.data);
          else return; 
        } else {
          data = event.data;
        }
      } catch { return; }

      if (data.type === 'WA_EMBEDDED_SIGNUP') {
        if (['FINISH', 'FINISH_ONLY_WABA', 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING'].includes(data.event)) {
          const extractedData = data.data || {};
          if (extractedData.waba_id) signupRef.current.wabaId = extractedData.waba_id;
          if (extractedData.phone_number_id) signupRef.current.phoneNumberId = extractedData.phone_number_id;
          if (extractedData.business_id) signupRef.current.businessId = extractedData.business_id;
          
          if (signupRef.current.code) tryCompleteSignup();
        } else if (data.event === 'CANCEL') {
          if (data.data?.error_message) toast.error(`Setup Error: ${data.data.error_message}`);
        }
      }
    };

    window.addEventListener('message', handleMetaMessage);
    return () => window.removeEventListener('message', handleMetaMessage);
  }, []);

  useEffect(() => {
    let pollingInterval;
    const needsPolling = 
      config?.whatsappStatus === 'authorised' || 
      ['pending', 'provisioning'].includes(config?.whatsappOnboardingStatus);

    if (needsPolling) {
      pollingInterval = setInterval(() => {
        fetchConfig();
      }, 5000); 
    }

    return () => { if (pollingInterval) clearInterval(pollingInterval); };
  }, [config?.whatsappStatus, config?.whatsappOnboardingStatus]);

  const loadFacebookSDK = () => {
    const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
    if (!appId) return;

    const initFB = () => {
      if (window.FB) {
        window.FB.init({ appId, cookie: true, xfbml: true, version: 'v21.0' });
        setFbInitialized(true);
      }
    };

    if (window.FB) initFB();
    else {
      window.fbAsyncInit = function() { initFB(); };
      if (!document.getElementById('facebook-jssdk')) {
        (function(d, s, id) {
          var js, fjs = d.getElementsByTagName(s)[0];
          if (d.getElementById(id)) return;
          js = d.createElement(s); js.id = id;
          js.src = "https://connect.facebook.net/en_US/sdk.js";
          fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
      }
    }
  };

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/integrationManagement/whatsapp/config`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        setConfig(response.data.data);
        setWebhookInfo(response.data.webhook);
        setTokenExpiry(response.data.tokenExpiry);
        if (response.data.data.whatsappOnboardingStatus === 'pin_required' && response.data.data.whatsappPhoneNumberId) {
          setPendingPhoneId(response.data.data.whatsappPhoneNumberId);
          if (!showPinModal) setShowPinModal(true);
        }
        if (response.data.data.isUsingOwnWhatsapp) fetchDetails();
      }
    } catch (error) { console.error("Error fetching config:", error); } 
      finally { setLoading(false); }
  };

  const fetchDetails = async () => {
    setDetailsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [detailsRes, statusRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/integrationManagement/whatsapp/details`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/api/integrationManagement/whatsapp/meta-status`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      if (detailsRes.data.status) setWhatsappDetails(detailsRes.data.data);
      if (statusRes.data.status) setMetaStatus(statusRes.data.data);
    } catch (error) { 
      console.error("Error fetching details:", error); 
    } finally { 
      setDetailsLoading(false); 
    }
  };

  const tryCompleteSignup = () => {
    const { code, wabaId, phoneNumberId } = signupRef.current;
    if (!code) return;
    if (!wabaId || !phoneNumberId) {
      setTimeout(() => { if (!signupRef.current.exchanging) performExchange(); }, 2000);
      return;
    }
    performExchange();
  };

  const performExchange = () => {
    const { code, wabaId, phoneNumberId, businessId } = signupRef.current;
    if (signupRef.current.exchanging) return;
    signupRef.current.exchanging = true;
    toast.success("WhatsApp account linked! Completing setup...");
    exchangeCode({ code, wabaId, phoneNumberId, businessId });
  };

  const exchangeCode = async (data) => {
    setSignupStatus('exchanging');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/integrationManagement/whatsapp/exchange-code`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        if (response.data.message === "ALREADY_CONNECTED") {
          toast.info("This WhatsApp account is already connected.");
          setSignupStatus('completed');
          fetchConfig();
          return;
        }
        if (response.data.message === "PIN_REQUIRED") {
          setSignupStatus('pin_required');
          setPendingPhoneId(response.data.phoneNumberId);
          setShowPinModal(true);
          toast.info("A 6-digit PIN is required for this number.");
          return;
        }
        if (response.data.message === "BILLING_REQUIRED") toast.warning("WhatsApp authorized, but billing is required.");
        else toast.success("WhatsApp connected successfully!");
        setSignupStatus('completed');
        fetchConfig();
        signupRef.current = { code: null, wabaId: null, phoneNumberId: null, businessId: null, authorizedAt: null, exchanging: false };
        // Redirect to template management for syncing
        setTimeout(() => {
          navigate('/settings/template?sync=true');
        }, 2000);
      }
    } catch (error) {
      signupRef.current.exchanging = false;
      setSignupStatus('failed');
      toast.error(error.response?.data?.message || "Failed to complete setup");
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualConfig.accessToken || !manualConfig.wabaId || !manualConfig.phoneNumberId) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/integrationManagement/whatsapp/config`, manualConfig, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        toast.success("WhatsApp connected manually");
        fetchConfig();
        setShowManualModal(false);
        setManualConfig({ accessToken: '', wabaId: '', phoneNumberId: '', businessId: '' });
        setTimeout(() => {
          navigate('/settings/template?sync=true');
        }, 2000);
      }
    } catch (error) { toast.error(error.response?.data?.message || "Failed manual connection"); }
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    if (pin.length !== 6) { toast.error("PIN must be 6 digits"); return; }
    setPinLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/integrationManagement/whatsapp/verify-pin`, {
        pin, phoneNumberId: pendingPhoneId
      }, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.status) {
        toast.success("PIN verified!");
        setShowPinModal(false);
        setSignupStatus('completed');
        fetchConfig();
        setTimeout(() => {
          navigate('/settings/template?sync=true');
        }, 2000);
      }
    } catch (error) { toast.error(error.response?.data?.message || "PIN verification failed"); } 
      finally { setPinLoading(false); }
  };

  const handleRefreshStatus = async () => {
    setRefreshingStatus(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/integrationManagement/whatsapp/refresh-status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("WhatsApp status refreshed!");
      await Promise.all([fetchConfig(), fetchDetails()]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Refresh failed");
    } finally {
      setRefreshingStatus(false);
    }
  };

  const handleWebhookPing = async () => {
    setPingLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/integrationManagement/whatsapp/webhook-ping`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.info("Check your WhatsApp for the test ping!");
    } catch (error) { toast.error(error.response?.data?.message || "Ping failed"); } 
      finally { setPingLoading(false); }
  };

  const disconnectWhatsapp = async () => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_BASE_URL}/api/integrationManagement/whatsapp/config`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        toast.success("WhatsApp disconnected");
        fetchConfig();
      }
    } catch { toast.error("Failed disconnect"); }
  };

  const handleEmbeddedSignup = () => {
    setShowIndiaWarning(false);

    if (!fbInitialized && !window.FB) {
      toast.error("Facebook SDK loading...");
      loadFacebookSDK();
      return;
    }
    setSignupStatus('initializing');
    const configId = import.meta.env.VITE_FACEBOOK_APP_ID; // Changed to VITE_FACEBOOK_APP_ID as per standard or use configId from env
    window.FB.login((response) => {
      if (response.authResponse) {
        let code = response.authResponse.code;
        if (!code && response.authResponse.signedRequest) {
          const decoded = decodeSignedRequest(response.authResponse.signedRequest);
          if (decoded && decoded.code) code = decoded.code;
        }
        if (!code) { setSignupStatus('failed'); toast.error("No code returned."); return; }
        signupRef.current.code = code;
        setSignupStatus('authorized');
        tryCompleteSignup();
      } else {
        setSignupStatus('failed');
        toast.error("Login cancelled or failed.");
      }
    }, {
      config_id: import.meta.env.VITE_FACEBOOK_CONFIG_ID,
      response_type: 'code',
      override_default_response_type: true,
      scope: "business_management,whatsapp_business_management,whatsapp_business_messaging",
      extras: { setup: {} }
    });
  };

  const getBillingUrl = () => {
    const businessId = config?.whatsappBusinessId;
    if (!businessId) return "https://business.facebook.com/settings/payment-methods";
    return `https://business.facebook.com/billing_hub/accounts?business_id=${businessId}&placement=business_settings&account_type=whatsapp-business-account`;
  };

  const getVerificationUrl = () => {
    const businessId = config?.whatsappBusinessId;
    if (!businessId) return "https://business.facebook.com/settings/security";
    return `https://business.facebook.com/settings/security?business_id=${businessId}`;
  };

  // ... (rest of the component UI would go here, omitting for brevity as per instructions)
  return (
    <div>
       {/* UI code based on your pasted snippet logic */}
       WhatsApp Integration Component
    </div>
  );
};

export default WhatsAppIntegration;