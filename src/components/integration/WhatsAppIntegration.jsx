import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
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
  Globe
} from 'lucide-react';
import { toast } from 'react-toastify';

const WhatsAppIntegration = () => {
  const [config, setConfig] = useState(null);
  const [webhookInfo, setWebhookInfo] = useState(null);
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [signupStatus, setSignupStatus] = useState(null); 
  const [whatsappDetails, setWhatsappDetails] = useState(null);
  const [metaStatus, setMetaStatus] = useState(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [pingLoading, setPingLoading] = useState(false);
  const [refreshingStatus, setRefreshingStatus] = useState(false);
  const [showPaymentInstructions, setShowPaymentInstructions] = useState(false);
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
      }
    } catch (error) {
      signupRef.current.exchanging = false;
      setSignupStatus('failed');
      toast.error(error.response?.data?.message || "Failed to complete setup");
    }
  };

  const handleEmbeddedSignup = () => {
    if (!fbInitialized && !window.FB) {
      toast.error("Facebook SDK loading...");
      loadFacebookSDK();
      return;
    }
    setSignupStatus('initializing');
    const configId = import.meta.env.VITE_FACEBOOK_CONFIG_ID;
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
      config_id: configId,
      response_type: 'code',
      override_default_response_type: true,
      extras: { setup: {}, scope: "business_management,whatsapp_business_management,whatsapp_business_messaging" }
    });
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

  const getBillingUrl = () => {
    const businessId = config?.whatsappBusinessId;
    if (!businessId) return "https://business.facebook.com/settings/payment-methods";
    // This is the stable link for Payment Methods (Billing Hub)
    return `https://business.facebook.com/billing_hub/accounts?business_id=${businessId}&placement=business_settings&account_type=whatsapp-business-account`;
  };

  const getVerificationUrl = () => {
    const businessId = config?.whatsappBusinessId;
    if (!businessId) return "https://business.facebook.com/settings/security";
    // Verified Link for Business Security Center (Where verification lives)
    return `https://business.facebook.com/settings/security?business_id=${businessId}`;
  };

  // --- Status Checks ---
  const isBusinessVerified = metaStatus?.businessVerification?.status === 'verified';
  const isAccountApproved = metaStatus?.wabaReviewStatus === 'APPROVED' || ['verified', 'approved'].includes(config?.whatsappBusinessVerificationStatus?.toLowerCase());
  const isPaymentDone = metaStatus?.isBillingConfigured ?? config?.whatsappPaymentMethodAttached;

  const getMessagingLimitLabel = (tier) => {
    const tiers = {
      'TIER_250': 'Tier 1 (250/day)',
      'TIER_1K': 'Tier 2 (1,000/day)',
      'TIER_10K': 'Tier 3 (10,000/day)',
      'TIER_100K': 'Tier 4 (100,000/day)',
      'TIER_UNLIMITED': 'Unlimited'
    };
    return tiers[tier] || tier || 'Tier 1 (250/day)';
  };

  const getQualityRatingDisplay = (rating) => {
    const r = (rating || 'UNKNOWN').toUpperCase();
    const styles = {
      'GREEN': { label: 'High', color: 'text-green-600', dot: 'bg-green-500' },
      'YELLOW': { label: 'Medium', color: 'text-amber-600', dot: 'bg-amber-500' },
      'RED': { label: 'Low', color: 'text-red-600', dot: 'bg-red-500' },
      'UNKNOWN': { label: 'UNKNOWN', color: 'text-gray-500', dot: 'bg-gray-400' }
    };
    return styles[r] || styles['UNKNOWN'];
  };

  const steps = [
    {
      id: 1,
      name: 'Account Connected',
      description: 'Meta Business account linked',
      icon: Globe,
      isCompleted: !!config?.whatsappWabaId,
      isCritical: true
    },
    {
      id: 2,
      name: 'Phone Connected',
      description: 'Business number registered',
      icon: Phone,
      isCompleted: !!config?.whatsappPhoneNumberId,
      isCritical: true,
      needsAction: config?.whatsappOnboardingStatus === 'pin_required',
      actionLabel: 'Enter PIN',
      onAction: () => setShowPinModal(true)
    },
    {
      id: 3,
      name: 'Webhook Linked',
      description: 'Real-time message routing',
      icon: Settings,
      isCompleted: config?.isWebhookVerified,
      isCritical: true,
      isProcessing: config?.whatsappOnboardingStatus === 'provisioning' && !config?.isWebhookVerified
    },
    {
      id: 4,
      name: 'Payment & Billing',
      description: 'Meta conversation credits',
      icon: CreditCard,
      isCompleted: isPaymentDone,
      isCritical: false,
      // Only show action if payment is NOT done AND we are connected
      needsAction: !isPaymentDone && config?.whatsappStatus === 'connected' && config?.whatsappOnboardingStatus !== 'provisioning',
      actionLabel: 'Add Payment',
      onAction: () => window.open(getBillingUrl(), '_blank', 'noopener,noreferrer')
    },
    {
      id: 5,
      name: 'Account Approved',
      description: 'WABA review status',
      icon: ShieldCheck,
      isCompleted: isAccountApproved,
      isCritical: false,
      // Only show action if NOT verified AND we are connected
      needsAction: !isAccountApproved && config?.whatsappStatus === 'connected' && config?.whatsappOnboardingStatus !== 'provisioning',
      actionLabel: 'Verify Now',
      onAction: () => window.open(getVerificationUrl(), '_blank', 'noopener,noreferrer')
    }
  ];

  const currentStepIndex = steps.findIndex(s => !s.isCompleted);
  const currentStep = currentStepIndex === -1 ? steps[steps.length - 1] : steps[currentStepIndex];

  if (loading) return <div className="flex justify-center items-center h-64"><RefreshCw className="animate-spin text-[#313166]" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Premium Onboarding Card */}
      <div className="bg-white rounded-[24px] shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="p-6 border-b border-gray-50 bg-[#F9FAFB]/50 flex justify-between items-center">
          <div>
            <h3 className="text-[20px] font-[700] text-[#111827] tracking-tight">WhatsApp Business Integration</h3>
            <p className="text-[14px] text-[#6B7280]">Establish your professional messaging channel via Meta API</p>
          </div>
          <div className="flex items-center gap-3">
             {config?.whatsappOnboardingStatus === 'provisioning' && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-[12px] font-[600] border border-blue-100 italic">
                  <RefreshCw size={14} className="animate-spin" />
                  Provisioning
                </div>
             )}
             <div className={`
               px-4 py-1.5 rounded-full text-[12px] font-[700] border uppercase tracking-wider
               ${config?.whatsappStatus === 'connected' ? 'bg-green-50 text-green-700 border-green-100' : 
                 config?.whatsappStatus === 'authorised' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                 'bg-gray-50 text-gray-500 border-gray-100'}
             `}>
               {config?.whatsappStatus || 'Disconnected'}
             </div>
          </div>
        </div>

        <div className="p-8">
           {/* Steps Section */}
           <div className="relative mb-12">
             <div className="absolute left-[23px] top-4 bottom-4 w-[2px] bg-gray-100" />
             <div className="space-y-10 relative z-10">
               {steps.map((step, idx) => {
                 const Icon = step.icon;
                 const isActive = step.id === currentStep.id;
                 const isDone = step.isCompleted;

                 return (
                   <div key={step.id} className="flex gap-6 group">
                     <div className={`
                        w-12 h-12 rounded-[16px] flex items-center justify-center border-2 transition-all duration-500
                        ${isDone ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-100' : 
                          step.needsAction ? 'bg-amber-50 border-amber-200 text-amber-500 animate-pulse' :
                          isActive ? 'bg-white border-blue-500 text-blue-500 ring-8 ring-blue-50 shadow-md' : 
                          'bg-white border-gray-200 text-gray-400'}
                      `}>
                        {isDone ? <CheckCircle2 size={24} /> : 
                         step.isProcessing ? <RefreshCw size={24} className="animate-spin" /> :
                         <Icon size={24} />}
                      </div>

                      <div className="flex-1 pt-1.5">
                        <div className="flex justify-between items-start">
                          <div>
                             <h4 className={`text-[16px] font-[700] mb-0.5 ${isActive ? 'text-blue-600' : 'text-gray-900'}`}>
                               {step.name}
                             </h4>
                             <p className="text-[13px] text-[#6B7280] font-[500] leading-relaxed">{step.description}</p>
                          </div>
                          
                          {/* ACTION BUTTON - Only show if Action is needed and NOT Done */}
                          {step.needsAction && !isDone && (
                             <button 
                               onClick={step.onAction}
                               className="px-4 py-2 bg-amber-100 text-amber-800 rounded-[10px] text-[12px] font-[700] hover:bg-amber-200 transition-all border border-amber-200 shadow-sm flex items-center gap-2"
                             >
                               <AlertCircle size={14} />
                               {step.actionLabel}
                             </button>
                          )}
                          
                          {idx === 2 && isDone && (
                             <button 
                               onClick={handleWebhookPing}
                               disabled={pingLoading}
                               className="text-[11px] font-[700] text-blue-600 hover:text-blue-700 underline underline-offset-4"
                             >
                               {pingLoading ? "Testing..." : "Test Ping"}
                             </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
               })}
             </div>
           </div>

           {/* Payment Setup Alert Card - Only show if NOT done */}
           {!isPaymentDone && config?.whatsappStatus === 'connected' && config?.whatsappOnboardingStatus !== 'provisioning' && (
             <div className="mb-10 p-6 bg-amber-50 border border-amber-200 rounded-[24px] animate-in slide-in-from-top-4 duration-500">
               <div className="flex items-start gap-5">
                 <div className="bg-amber-500 p-3 rounded-[16px] text-white shadow-lg shadow-amber-200">
                   <CreditCard size={24} />
                 </div>
                 <div className="flex-1">
                   <h4 className="text-amber-900 font-[800] text-[18px]">Payment Setup Required</h4>
                   <p className="text-amber-800 text-[14px] mt-1.5 leading-relaxed">
                     Meta requires you to add a valid payment method (Credit Card/UPI) for billing. 
                     Please use the button below to open the Billing Hub.
                   </p>
                   <div className="mt-5 flex flex-wrap gap-3">
                     <button 
                       onClick={() => window.open(getBillingUrl(), '_blank', 'noopener,noreferrer')}
                       className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-[12px] text-[13px] font-[700] transition-all shadow-md shadow-amber-200 flex items-center gap-2"
                     >
                       OPEN BILLING HUB
                       <ExternalLink size={14} />
                     </button>
                     <button 
                       onClick={() => setShowPaymentInstructions(true)}
                       className="bg-amber-100 text-amber-800 px-5 py-2.5 rounded-[12px] text-[13px] font-[700] hover:bg-amber-200 transition-all border border-amber-200"
                     >
                       VIEW FIX STEPS
                     </button>
                     <button 
                       onClick={() => window.open(`https://business.facebook.com/billing_hub/payment_settings?asset_id=${config?.whatsappWabaId}&business_id=${config?.whatsappBusinessId}`, '_blank')}
                       className="bg-white border border-blue-300 text-blue-700 px-5 py-2.5 rounded-[12px] text-[13px] font-[700] hover:bg-blue-50 transition-all flex items-center gap-2"
                     >
                       <Settings size={14} />
                       DIRECT REPAIR LINK
                     </button>
                     <button 
                       onClick={handleRefreshStatus}
                       disabled={refreshingStatus}
                       className="bg-white border border-amber-300 text-amber-700 px-5 py-2.5 rounded-[12px] text-[13px] font-[700] hover:bg-amber-50 transition-all font-[700] flex items-center gap-2"
                     >
                       {refreshingStatus ? <RefreshCw size={14} className="animate-spin" /> : null}
                       I'VE ADDED IT
                     </button>
                   </div>
                 </div>
               </div>
             </div>
           )}

           {/* Name Status Alert - Only show if PENDING_REVIEW and Connected */}
           {whatsappDetails?.phone?.name_status === 'PENDING_REVIEW' && config?.whatsappStatus === 'connected' && (
             <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl shadow-sm relative overflow-hidden animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-amber-500 p-2 rounded-xl text-white shadow-lg shadow-amber-100">
                    <AlertCircle size={20} />
                  </div>
                  <h4 className="text-lg font-bold text-amber-900">Display Name Under Review</h4>
                </div>
                <p className="text-amber-800 text-sm mb-2 leading-relaxed">
                  Meta is currently reviewing your WhatsApp display name. 
                  <strong> Message sending will be disabled</strong> until the name is approved.
                </p>
                <p className="text-amber-700 text-[12px] italic">
                  This typically takes 24-48 hours. No action is required from your side.
                </p>
             </div>
           )}

           {/* Verification Alert - Only show if NOT Verified and Connected */}
           {!isBusinessVerified && config?.whatsappStatus === 'connected' && (
             <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-2xl shadow-sm relative overflow-hidden animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-500 p-2 rounded-xl text-white shadow-lg shadow-blue-100">
                    <Info size={20} />
                  </div>
                  <h4 className="text-lg font-bold text-blue-900">Limited Messaging Tier</h4>
                </div>
                <p className="text-blue-800 text-sm mb-5 leading-relaxed">
                  Your business is not yet fully verified by Meta. You are limited to 250 service-initiated conversations per day. 
                  Complete verification to increase your messaging limits.
                </p>
                <a 
                  href={getVerificationUrl()}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-700 font-bold text-sm underline hover:text-blue-800 transition-colors"
                >
                  Start Business Verification <ExternalLink size={14} />
                </a>
             </div>
           )}

           {/* Signup Status Alert Bar */}
           {signupStatus && signupStatus !== 'completed' && signupStatus !== 'pin_required' && (
             <div className="mb-10 p-4 bg-[#313166] rounded-[16px] flex items-center gap-4 text-white shadow-lg shadow-[#313166]/20 border border-[#4a4a8a]">
                <RefreshCw size={20} className="animate-spin text-blue-300" />
                <div>
                   <p className="text-[14px] font-[700] capitalize">{signupStatus.replace('_', ' ')}...</p>
                   <p className="text-[12px] text-blue-100">Synchronizing with Meta secure servers</p>
                </div>
             </div>
           )}

           {/* Business & Phone Details Row */}
           {config?.whatsappStatus === 'connected' && (
             <div className="mb-8 p-6 bg-gray-50/50 border border-gray-100 rounded-[24px] grid grid-cols-1 md:grid-cols-2 gap-8 relative overflow-hidden">
               <div className="space-y-4">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-[#313166]">
                     <Globe size={20} />
                   </div>
                   <h4 className="font-bold text-gray-900">Business Details</h4>
                 </div>
                 <div className="space-y-2.5">
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-500 font-medium">Display Name:</span>
                     <span className="text-gray-900 font-bold">{metaStatus?.wabaName || 'N/A'}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-500 font-medium">Currency:</span>
                     <span className="text-gray-900 font-bold">{metaStatus?.billingCurrency || config?.whatsappCurrency || 'N/A'}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-500 font-medium">Review Status:</span>
                     <div className="flex items-center gap-1.5">
                       {isAccountApproved ? (
                         <span className="flex items-center gap-1 text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-md text-[11px]">
                           <CheckCircle2 size={12} /> APPROVED
                         </span>
                       ) : (
                         <span className="flex items-center gap-1 text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md text-[11px]">
                           <AlertCircle size={12} /> {metaStatus?.wabaReviewStatus || 'PENDING'}
                         </span>
                       )}
                     </div>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-500 font-medium">Business ID:</span>
                     <span className="text-gray-900 font-bold">{metaStatus?.businessVerification?.id || config?.whatsappBusinessId || 'N/A'}</span>
                   </div>
                   {metaStatus?.businessDetails?.legal_entity_name && (
                     <div className="flex justify-between items-center text-sm">
                       <span className="text-gray-500 font-medium">Legal Name:</span>
                       <span className="text-gray-900 font-bold">{metaStatus.businessDetails.legal_entity_name}</span>
                     </div>
                   )}
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-500 font-medium">Payment Link:</span>
                     <div className="flex items-center gap-1.5">
                       {metaStatus?.businessDetails?.primary_funding_id ? (
                         <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-md text-[11px]">
                           LINKED
                         </span>
                       ) : (
                         <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md text-[11px]">
                           BROKEN / NULL
                         </span>
                       )}
                     </div>
                   </div>
                 </div>
               </div>

               <div className="space-y-4">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-[#313166]">
                     <Phone size={20} />
                   </div>
                   <h4 className="font-bold text-gray-900">Phone Details</h4>
                 </div>
                 <div className="space-y-2.5">
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-500 font-medium">WhatsApp No:</span>
                     <span className="text-gray-900 font-bold">{metaStatus?.phoneNumber || 'N/A'}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-500 font-medium">Phone Status:</span>
                     <span className="text-gray-900 font-bold flex items-center gap-1.5">
                       {metaStatus?.phoneStatus === 'verified' ? (
                         <><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Connected</>
                       ) : metaStatus?.phoneStatus || 'Unknown'}
                     </span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-500 font-medium">Name Status:</span>
                     <div className="flex items-center gap-1.5">
                       {whatsappDetails?.phone?.name_status === 'APPROVED' ? (
                         <span className="flex items-center gap-1 text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-md text-[11px]">
                           <CheckCircle2 size={12} /> APPROVED
                         </span>
                       ) : (
                         <span className={`flex items-center gap-1 font-bold bg-amber-50 px-2 py-0.5 rounded-md text-[11px] ${
                           whatsappDetails?.phone?.name_status === 'PENDING_REVIEW' ? 'text-amber-600' : 'text-red-600'
                         }`}>
                           <AlertCircle size={12} /> {whatsappDetails?.phone?.name_status || 'UNKNOWN'}
                         </span>
                       )}
                     </div>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-500 font-medium">Timezone:</span>
                     <span className="text-gray-900 font-bold">{metaStatus?.wabaTimezone || 'N/A'}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-500 font-medium">WABA ID:</span>
                     <span className="text-gray-900 font-bold">{config?.whatsappWabaId || 'N/A'}</span>
                   </div>
                 </div>
               </div>
             </div>
           )}

           {/* Actions / Info Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-gray-50">
              <div className="p-5 bg-[#F9FAFB] rounded-[20px] border border-gray-100">
                <p className="text-[11px] font-[700] text-[#9CA3AF] uppercase tracking-widest mb-3">Messaging Vital Signs</p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[14px]">
                    {/* <span className="text-[#6B7280] font-[500]">Messaging Limit:</span>
                    <span className="text-[#111827] font-[700]">
                      {getMessagingLimitLabel(
                        whatsappDetails?.phone?.messaging_limit_tier || 
                        metaStatus?.messagingLimit || 
                        config?.whatsappMessagingLimit
                      )}
                    </span> */}
                  </div>
                  <div className="flex justify-between items-center text-[14px]">
                    <span className="text-[#6B7280] font-[500]">Quality Rating:</span>
                    {(() => {
                      const display = getQualityRatingDisplay(
                        whatsappDetails?.phone?.quality_rating || 
                        metaStatus?.qualityRating || 
                        config?.whatsappQualityRating
                      );
                      return (
                        <div className={`flex items-center gap-2 ${display.color} font-[700]`}>
                           <div className={`w-1.5 h-1.5 rounded-full ${display.dot}`} />
                           {display.label}
                        </div>
                      );
                    })()}
                  </div>
                  {config?.whatsappStatus === 'connected' && (
                    <div className="pt-2">
                       <button 
                        onClick={handleWebhookPing}
                        disabled={pingLoading}
                        className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg text-[12px] font-bold hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
                      >
                        {pingLoading ? <RefreshCw size={14} className="animate-spin" /> : <MessageSquare size={14} />}
                        TEST WHATSAPP PING
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 justify-center">
                {!config?.isUsingOwnWhatsapp ? (
                  <>
                    <button 
                      onClick={handleEmbeddedSignup}
                      className="w-full py-3.5 bg-[#313166] hover:bg-[#25254d] text-white rounded-[14px] font-[700] text-[14px] transition-all shadow-lg shadow-[#313166]/10 flex items-center justify-center gap-2 group"
                    >
                      <Globe size={18} className="group-hover:rotate-12 transition-transform" />
                      Connect via Meta Popup
                    </button>
                    <button 
                      onClick={() => setShowManualModal(true)}
                      className="w-full py-3.5 bg-white border border-[#E5E7EB] hover:border-blue-200 hover:bg-blue-50 text-[#374151] rounded-[14px] font-[700] text-[14px] transition-all"
                    >
                      Manual API Configuration
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={disconnectWhatsapp}
                    className="w-full py-3.5 bg-white border border-red-100 hover:bg-red-50 text-red-600 rounded-[14px] font-[700] text-[14px] transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 size={18} />
                    Disconnect Account
                  </button>
                )}
              </div>
           </div>
        </div>
      </div>

      {/* PIN Verification Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[24px] max-w-md w-full p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="text-center mb-8">
               <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
                  <ShieldCheck size={32} />
               </div>
               <h3 className="text-[24px] font-[800] text-[#111827]">Verify Ownership</h3>
               <p className="text-[14px] text-[#6B7280] mt-2">Enter the 6-digit PIN linked to this phone number</p>
            </div>
            
            <form onSubmit={handlePinSubmit} className="space-y-6">
              <input
                type="text"
                maxLength={6}
                placeholder="000000"
                className="w-full text-center text-3xl tracking-[1rem] font-mono border-2 border-gray-100 bg-gray-50 rounded-[16px] py-5 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all placeholder:text-gray-200"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              />
              <div className="p-4 bg-amber-50 rounded-[12px] border border-amber-100 text-[12px] text-amber-800 leading-relaxed font-[500]">
                 <p className="font-[700] mb-1 flex items-center gap-1"><Info size={14} /> Stuck?</p>
                 If you don't know the PIN, try creating a new 6-digit one in Meta Manager. If rejected, you may need to wait 7 days for the cache to clear.
              </div>
              <button
                type="submit"
                disabled={pinLoading || pin.length !== 6}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-[16px] font-[700] text-[16px] transition-all shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {pinLoading ? <RefreshCw className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                Complete Verification
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Manual Configuration Modal */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-8 shadow-2xl animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[20px] font-[800] text-[#111827]">Meta API Direct Access</h3>
              <button onClick={() => setShowManualModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} className="text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleManualSubmit} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-[700] text-[#374151] uppercase tracking-wider">Access Token</label>
                  <textarea
                    rows={3}
                    required
                    className="w-full border border-[#E5E7EB] rounded-[12px] px-4 py-3 text-[14px] focus:ring-2 focus:ring-[#313166] outline-none transition-all placeholder:text-gray-300"
                    placeholder="EAAG2..."
                    value={manualConfig.accessToken}
                    onChange={(e) => setManualConfig({ ...manualConfig, accessToken: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-[700] text-[#374151] uppercase tracking-wider">WABA ID</label>
                    <input
                      type="text"
                      required
                      className="w-full border border-[#E5E7EB] rounded-[12px] px-4 py-3 text-[14px] focus:ring-2 focus:ring-[#313166] outline-none transition-all"
                      value={manualConfig.wabaId}
                      onChange={(e) => setManualConfig({ ...manualConfig, wabaId: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-[700] text-[#374151] uppercase tracking-wider">Phone ID</label>
                    <input
                      type="text"
                      required
                      className="w-full border border-[#E5E7EB] rounded-[12px] px-4 py-3 text-[14px] focus:ring-2 focus:ring-[#313166] outline-none transition-all"
                      value={manualConfig.phoneNumberId}
                      onChange={(e) => setManualConfig({ ...manualConfig, phoneNumberId: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-[700] text-[#374151] uppercase tracking-wider">Business ID (Optional)</label>
                  <input
                    type="text"
                    className="w-full border border-[#E5E7EB] rounded-[12px] px-4 py-3 text-[14px] focus:ring-2 focus:ring-[#313166] outline-none transition-all"
                    value={manualConfig.businessId}
                    onChange={(e) => setManualConfig({ ...manualConfig, businessId: e.target.value })}
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="flex-1 py-3 text-[14px] font-[700] text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#313166] hover:bg-[#25254d] text-white rounded-[12px] font-[700] text-[14px] transition-all shadow-md"
                >
                  Register Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Instructions Modal */}
      {showPaymentInstructions && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[24px] max-w-2xl w-full p-8 shadow-2xl animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
                  <CreditCard size={24} />
                </div>
                <h3 className="text-[20px] font-[800] text-[#111827]">Fix Payment Eligibility Issue</h3>
              </div>
              <button onClick={() => setShowPaymentInstructions(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-blue-800 text-sm">
                <strong>Why is this happening?</strong> Even if you added a card to your Business Manager, Meta requires you to specifically link it to your WhatsApp Account.
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-[#111827] flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#313166] text-white rounded-full flex items-center justify-center text-xs">1</span>
                  Main Fix (Card Already Added)
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 ml-8">
                  <li>Go to <strong>WhatsApp Manager &gt; Account Settings</strong>.</li>
                  <li>Click on <strong>Payment Settings</strong> in the left sidebar.</li>
                  <li>In the "Payment Method" section, click <strong>Add Payment Method</strong>.</li>
                  <li><strong>CRUCIAL:</strong> Do not enter new card details. Select <strong>"Import from Business Manager"</strong> or select the card you already added.</li>
                  <li>Set it as <strong>Default</strong>.</li>
                </ol>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-[#111827] flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#313166] text-white rounded-full flex items-center justify-center text-xs">2</span>
                  Alternate Fix (Prepaid/Indian Accounts)
                </h4>
                <p className="text-sm text-gray-600 ml-8">If "Import" is missing or you have an Indian account:</p>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 ml-8">
                  <li>In <strong>Payment Settings</strong>, click <strong>Add Funds</strong>.</li>
                  <li>Add a small amount (e.g., <strong>₹100</strong>) using UPI or Card.</li>
                  <li>This creates a balance that instantly clears the eligibility error.</li>
                </ol>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  onClick={() => window.open(getBillingUrl(), '_blank')}
                  className="px-6 py-2.5 bg-[#313166] text-white rounded-xl text-sm font-bold hover:bg-[#25254d] transition-all"
                >
                  GO TO META PAYMENT SETTINGS
                </button>
                <button 
                  onClick={() => setShowPaymentInstructions(false)}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all"
                >
                  GOT IT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppIntegration;