import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../api/apiconfig.js';
import { MessageSquare, CheckCircle, XCircle, RefreshCw, Trash2, X, Link as LinkIcon, Copy, ExternalLink, Info } from 'lucide-react';
import { toast } from 'react-toastify';

const WhatsAppIntegration = () => {
  const [config, setConfig] = useState(null);
  const [webhookInfo, setWebhookInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [signupStatus, setSignupStatus] = useState(null); // 'initializing', 'authorized', 'exchanging', 'completed', 'failed', 'pin_required'
  const [whatsappDetails, setWhatsappDetails] = useState(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
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

    // Check if we have a code in the URL (in case of redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      console.log("Found code in URL:", code);
      signupRef.current.code = code;
    }

    // Listen for messages from Meta Embedded Signup
    const handleMetaMessage = (event) => {
      // Log all messages for debugging during setup
      console.log("PostMessage event received from origin:", event.origin);
      
      // Documentation says origin should end with facebook.com
      if (!event.origin.endsWith('facebook.com') && !event.origin.endsWith('facebook.net')) {
        return;
      }
      
      let data;
      try {
        if (typeof event.data === "string") {
          // Meta SDK sends some internal messages that are not JSON (e.g., "cb=...")
          if (event.data.trim().startsWith('{')) {
            data = JSON.parse(event.data);
          } else {
            return; 
          }
        } else {
          data = event.data;
        }
      } catch {
        return;
      }

      console.log("Decoded Meta message:", data);

      // Documentation specifies 'WA_EMBEDDED_SIGNUP' type
      if (data.type === 'WA_EMBEDDED_SIGNUP') {
        console.log("WhatsApp Embedded Signup Event detected:", data.event);
        
        // Handle successful completion
        if (['FINISH', 'FINISH_ONLY_WABA', 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING'].includes(data.event)) {
          const extractedData = data.data || {};
          const wabaId = extractedData.waba_id;
          const phoneNumberId = extractedData.phone_number_id;
          const businessId = extractedData.business_id;

          console.log("Captured IDs from Meta:", { wabaId, phoneNumberId, businessId });
          
          if (wabaId) signupRef.current.wabaId = wabaId;
          if (phoneNumberId) signupRef.current.phoneNumberId = phoneNumberId;
          if (businessId) signupRef.current.businessId = businessId;
          
          // If we already have the code, we can complete now
          if (signupRef.current.code) {
             console.log("IDs captured and code already present. Proceeding...");
             tryCompleteSignup();
          }
        } else if (data.event === 'CANCEL') {
          console.log("User cancelled flow at step:", data.data?.current_step);
          if (data.data?.error_message) {
            toast.error(`Setup Error: ${data.data.error_message}`);
          }
        }
      }
    };

    window.addEventListener('message', handleMetaMessage);
    return () => window.removeEventListener('message', handleMetaMessage);
  }, []);

  // Polling for onboarding status if it's in progress
  useEffect(() => {
    let pollingInterval;
    const needsPolling = 
      config?.whatsappStatus === 'authorised' || 
      ['pending', 'provisioning'].includes(config?.whatsappOnboardingStatus);

    if (needsPolling) {
      console.log("WhatsApp onboarding in progress. Starting status polling...");
      pollingInterval = setInterval(() => {
        fetchConfig();
      }, 5000); 
    }

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [config?.whatsappStatus, config?.whatsappOnboardingStatus]);

  const loadFacebookSDK = () => {
    const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
    
    if (!appId) {
      console.error("Facebook App ID is missing. Check your environment variables.");
      return;
    }

    const initFB = () => {
      if (window.FB) {
        window.FB.init({
          appId      : appId,
          cookie     : true,
          xfbml      : true,
          version    : 'v21.0'
        });
        setFbInitialized(true);
        console.log("Facebook SDK Initialized with App ID:", appId);
      }
    };

    // If SDK is already loaded, initialize it directly
    if (window.FB) {
      initFB();
    } else {
      // Otherwise, set up the async init callback
      window.fbAsyncInit = function() {
        initFB();
      };

      // Load the SDK script if not already present
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
        if (response.data.data.isUsingOwnWhatsapp) {
          fetchDetails();
        }
      }
    } catch (error) {
      console.error("Error fetching WhatsApp config:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetails = async () => {
    setDetailsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/integrationManagement/whatsapp/details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        setWhatsappDetails(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching WhatsApp details:", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const tryCompleteSignup = () => {
    const { code, wabaId, phoneNumberId } = signupRef.current;

    console.log("Checking if signup can be completed:", { 
      hasCode: !!code,
      hasIds: !!(wabaId && phoneNumberId)
    });

    if (!code) {
      console.log("Waiting for Meta authorization code...");
      return;
    }

    // If we have the code but NO IDs yet, wait a moment for the 'WA_EMBEDDED_SIGNUP' message
    // which often arrives slightly after the login callback.
    if (!wabaId || !phoneNumberId) {
      console.log("Code received but IDs missing. Waiting 2 seconds for Meta event message...");
      setTimeout(() => {
        if (!signupRef.current.exchanging) {
          console.log("Timeout reached. Proceeding with best available data (Backend will attempt discovery).");
          performExchange();
        }
      }, 2000);
      return;
    }

    // We have both, proceed immediately
    console.log("Authorization code and IDs received. Completing signup...");
    performExchange();
  };

  const performExchange = () => {
    const { code, wabaId, phoneNumberId, businessId } = signupRef.current;
    
    // Prevent multiple calls
    if (signupRef.current.exchanging) return;
    signupRef.current.exchanging = true;

    console.log("Initiating backend exchange with code and hint IDs...");
    toast.success("WhatsApp account linked! Completing setup...");
    exchangeCode({ 
      code,
      wabaId,
      phoneNumberId,
      businessId
    });
  };

  const handleEmbeddedSignup = () => {
    if (!fbInitialized && !window.FB) {
      toast.error("Facebook SDK still loading... Please wait a moment.");
      loadFacebookSDK();
      return;
    }

    if (window.FB) {
      if (!fbInitialized) {
        const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
        if (appId) {
          window.FB.init({
            appId: appId,
            cookie: true,
            xfbml: true,
            version: 'v21.0'
          });
          setFbInitialized(true);
        }
      }

      setSignupStatus('initializing');

      const configId = import.meta.env.VITE_FACEBOOK_CONFIG_ID;
      console.log("Starting FB login with Config ID v2:", configId);

      window.FB.login((response) => {
        console.log("Full FB login response:", response);
        
        if (response.authResponse) {
          // Meta returns the code in response.authResponse.code when response_type: 'code' is used
          let code = response.authResponse.code;
          const signedRequest = response.authResponse.signedRequest;
          
          // Try to extract code from signedRequest if missing (fallback)
          if (!code && signedRequest) {
            const decoded = decodeSignedRequest(signedRequest);
            if (decoded && decoded.code) {
              code = decoded.code;
              console.log("Extracted code from signedRequest payload");
            }
          }
          
          if (!code) {
            console.error("Auth response received but no 'code' found.");
            setSignupStatus('failed');
            toast.error("Authorization succeeded but no code was returned.");
            return;
          }

          console.log("Meta authorization successful. Code received.");
          signupRef.current.code = code;
          signupRef.current.authorizedAt = Date.now();
          setSignupStatus('authorized');
          
          tryCompleteSignup();
        } else {
          console.warn("FB login failed or cancelled. Response:", response);
          setSignupStatus('failed');
          toast.error("User cancelled login or did not fully authorize.");
        }
      }, {
        config_id: configId,
        response_type: 'code',
        override_default_response_type: true,
        extras: {
          setup: {},
          scope: "business_management,whatsapp_business_management,whatsapp_business_messaging"
        }
      });
    } else {
      toast.error("Facebook SDK not loaded. Check your connection or App ID.");
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

  const handleSyncTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/integrationManagement/whatsapp/sync-templates`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status) {
        toast.success("Standard templates synced successfully");
      }
    } catch (error) {
      console.error("Error syncing templates:", error);
      throw error;
    }
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

        if (response.data.message === "BILLING_REQUIRED") {
          toast.warning("WhatsApp authorized, but a payment method is required on Meta.");
        } else {
          toast.success("WhatsApp connected successfully!");
        }

        setSignupStatus('completed');
        fetchConfig();
        // Clear signup data
        signupRef.current = { 
          code: null, 
          wabaId: null, 
          phoneNumberId: null, 
          businessId: null,
          authorizedAt: null,
          exchanging: false 
        };
      }
    } catch (error) {
      signupRef.current.exchanging = false;
      setSignupStatus('failed');
      toast.error(error.response?.data?.message || "Failed to complete WhatsApp setup");
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
        setWhatsappDetails(null);
      }
    } catch {
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

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    if (pin.length !== 6) {
      toast.error("PIN must be exactly 6 digits");
      return;
    }

    setPinLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/integrationManagement/whatsapp/verify-pin`, {
        pin,
        phoneNumberId: pendingPhoneId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.status) {
        toast.success("PIN verified successfully!");
        setShowPinModal(false);
        setSignupStatus('completed');
        fetchConfig();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to verify PIN");
    } finally {
      setPinLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><RefreshCw className="animate-spin text-[#313166]" /></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#313166] mb-2">WhatsApp Integration</h2>
        <p className="text-gray-600">Connect your own WhatsApp Business account to send messages using your own number and branding.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
        {signupStatus && signupStatus !== 'completed' && (
          <div className="mb-8 p-5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100 overflow-hidden relative border border-indigo-500">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-500 rounded-full opacity-50 blur-3xl"></div>
            <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-pink-500 rounded-full opacity-20 blur-3xl"></div>
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md border border-white/20">
                <RefreshCw size={24} className="animate-spin text-white" />
              </div>
              <div className="flex-grow">
                <h4 className="text-white font-bold text-lg mb-0.5">
                  {signupStatus === 'initializing' && "Opening Meta Secure Portal..."}
                  {signupStatus === 'authorized' && "Authorization Successful!"}
                  {signupStatus === 'exchanging' && "Linking Your Business Credentials..."}
                  {signupStatus === 'pin_required' && "Security Verification Required"}
                  {signupStatus === 'failed' && "Signup Interrupted"}
                  {signupStatus === 'completed' && "Integration Active"}
                </h4>
                <p className="text-indigo-100 text-sm font-medium">
                  {signupStatus === 'initializing' && "Please complete the setup in the popup window."}
                  {signupStatus === 'authorized' && "Meta has granted permissions. Finalizing account details..."}
                  {signupStatus === 'exchanging' && "Establishing a secure connection between Vadik AI and Meta..."}
                  {signupStatus === 'pin_required' && "Please enter your 6-digit PIN to verify ownership."}
                  {signupStatus === 'failed' && "We encountered an issue. Please try again or use manual setup."}
                </p>
              </div>
            </div>
          </div>
        )}

        {config?.whatsappStatus === 'authorised' && (
          <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <MessageSquare size={120} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-100">
                  <CheckCircle size={22} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-blue-900">Account Authorization Successful!</h4>
                  <p className="text-sm text-blue-600 leading-relaxed">Meta is now provisioning your WhatsApp integration. This usually takes 2-5 minutes.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="relative">
                  <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-blue-200/50"></div>
                  
                  <div className="space-y-8">
                    {/* Step 1: Meta Authorization */}
                    <div className="flex items-center gap-4 relative">
                      <div className="z-10 bg-green-500 text-white p-1 rounded-full border-4 border-white shadow-sm">
                        <CheckCircle size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-blue-900">Meta Account Authorization</p>
                        <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Completed</p>
                      </div>
                    </div>

                    {/* Step 2: Provisioning */}
                    <div className="flex items-center gap-4 relative">
                      <div className={`z-10 p-1 rounded-full border-4 border-white shadow-sm ${
                        ['pending', 'provisioning'].includes(config.whatsappOnboardingStatus) 
                        ? 'bg-blue-600 text-white animate-pulse' 
                        : 'bg-blue-200 text-blue-400'
                      }`}>
                        <RefreshCw size={16} className={['pending', 'provisioning'].includes(config.whatsappOnboardingStatus) ? 'animate-spin' : ''} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-blue-900">Provisioning WABA & Phone</p>
                        <p className="text-xs text-blue-600 font-medium animate-pulse">
                          {config.whatsappOnboardingStatus === 'pending' ? "Waiting for Meta account sync..." : "Registering number with WhatsApp..."}
                        </p>
                      </div>
                    </div>

                    {/* Step 3: Template Sync */}
                    <div className="flex items-center gap-4 relative">
                      <div className="z-10 bg-gray-200 text-gray-400 p-1 rounded-full border-4 border-white shadow-sm">
                        <LinkIcon size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-400">Syncing Standard Templates</p>
                        <p className="text-xs text-gray-400 font-medium italic">Pending setup completion...</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-blue-100/50">
                  <div className="flex items-center gap-2 text-[10px] text-blue-500 font-bold uppercase tracking-wider">
                    <RefreshCw size={12} className="animate-spin" />
                    Auto-refreshing status...
                  </div>
                  <button 
                    onClick={fetchConfig}
                    className="bg-white hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg text-xs font-bold border border-blue-200 shadow-sm transition-all hover:shadow-md"
                  >
                    REFRESH NOW
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
                {config?.isUsingOwnWhatsapp ? `Connected to WABA: ${config.whatsappWabaId}` : "Currently using Vadik AI's shared WhatsApp number"}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            {config?.whatsappStatus === 'connected' || config?.isUsingOwnWhatsapp ? (
              <span className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                <CheckCircle size={16} className="mr-1" /> Connected
              </span>
            ) : config?.whatsappStatus === 'authorised' ? (
              <span className="flex items-center text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm font-medium">
                <RefreshCw size={16} className="mr-1 animate-spin" /> Authorised (Setting up...)
              </span>
            ) : (
              <span className="flex items-center text-gray-600 bg-gray-50 px-3 py-1 rounded-full text-sm font-medium">
                <XCircle size={16} className="mr-1" /> Not Connected
              </span>
            )}
          </div>
        </div>

        {config?.isUsingOwnWhatsapp && (
          <>
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

            {detailsLoading ? (
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
                <RefreshCw size={14} className="animate-spin" />
                <span>Fetching real-time business details...</span>
              </div>
            ) : (whatsappDetails?.business && whatsappDetails?.phone) && (
              <div className="mb-6 space-y-6">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <h4 className="text-sm font-bold text-[#313166] mb-3 flex items-center">
                    <CheckCircle size={16} className="mr-2 text-blue-600" />
                    Business Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Business Name</p>
                      <p className="text-sm font-semibold text-[#313166]">{whatsappDetails.business.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Account Status</p>
                      <p className="text-sm text-[#313166] capitalize">{whatsappDetails.business.status?.replace(/_/g, ' ')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Currency</p>
                      <p className="text-sm text-[#313166]">{whatsappDetails.business.currency}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Ownership</p>
                      <p className="text-sm text-[#313166] capitalize">{whatsappDetails.business.owner_business_info?.name || 'Business Owned'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">WABA ID</p>
                      <p className="text-sm text-[#313166]">{whatsappDetails.business.id}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                  <h4 className="text-sm font-bold text-[#313166] mb-3 flex items-center">
                    <CheckCircle size={16} className="mr-2 text-green-600" />
                    Phone Number Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Display Number</p>
                      <p className="text-sm font-semibold text-[#313166]">{whatsappDetails.phone.display_phone_number}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Verified Name</p>
                      <p className="text-sm text-[#313166]">{whatsappDetails.phone.verified_name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Quality Rating</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className={`w-2 h-2 rounded-full ${
                          whatsappDetails.phone.quality_rating === 'GREEN' ? 'bg-green-500' : 
                          whatsappDetails.phone.quality_rating === 'YELLOW' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <p className="text-sm text-[#313166]">{whatsappDetails.phone.quality_rating}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Name Status</p>
                      <p className="text-sm text-[#313166] capitalize">{whatsappDetails.phone.name_status?.replace(/_/g, ' ')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Verification</p>
                      <p className="text-sm text-[#313166] capitalize">{whatsappDetails.phone.code_verification_status?.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Webhook Configuration Section */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-[#313166] flex items-center">
                  <LinkIcon size={20} className="mr-2 text-[#db3b76]" />
                  Webhook Configuration
                </h4>
                <div className="flex items-center">
                  {config.isWebhookVerified ? (
                    <span className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-medium border border-green-100">
                      <CheckCircle size={14} className="mr-1" /> Webhook Connected
                    </span>
                  ) : (
                    <span className="flex items-center text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-xs font-medium border border-amber-100">
                      <RefreshCw size={14} className="mr-1 animate-spin" /> Waiting for Setup
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <p className="text-sm text-gray-600 mb-5">
                  To receive incoming messages and status updates, you must configure the following webhook in your Meta App Dashboard.
                </p>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Callback URL</label>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(webhookInfo?.callbackUrl);
                          toast.success("Callback URL copied!");
                        }}
                        className="text-[#db3b76] hover:text-[#c73369] flex items-center gap-1 text-[11px] font-bold"
                      >
                        <Copy size={12} /> COPY
                      </button>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono text-gray-700 break-all">
                      {webhookInfo?.callbackUrl}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Verify Token</label>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(webhookInfo?.verifyToken);
                          toast.success("Verify Token copied!");
                        }}
                        className="text-[#db3b76] hover:text-[#c73369] flex items-center gap-1 text-[11px] font-bold"
                      >
                        <Copy size={12} /> COPY
                      </button>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono text-gray-700">
                      {webhookInfo?.verifyToken}
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <h5 className="text-xs font-bold text-blue-800 flex items-center mb-2">
                    <Info size={14} className="mr-1.5" /> Setup Instructions
                  </h5>
                  <ol className="text-xs text-blue-700 space-y-2 list-decimal ml-4">
                    <li>Go to your <b>Meta App Dashboard</b> and select your app.</li>
                    <li>Navigate to <b>WhatsApp &gt; Configuration</b> in the left sidebar.</li>
                    <li>Click <b>Edit</b> next to the Callback URL section.</li>
                    <li>Paste the <b>Callback URL</b> and <b>Verify Token</b> provided above.</li>
                    <li>Click <b>Verify and Save</b>.</li>
                    <li>Under <b>Webhook fields</b>, click <b>Manage</b> and subscribe to <b>messages</b>.</li>
                  </ol>
                  <a 
                    href="https://developers.facebook.com/apps/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    Go to Meta Dashboard <ExternalLink size={12} className="ml-1" />
                  </a>
                </div>
              </div>
            </div>
          </>
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
                  <p className="text-xs text-gray-500 mb-4">Recommended. Easy flow through Meta&apos;s popup.</p>
                  <button
                    onClick={handleEmbeddedSignup}
                    disabled={config?.isUsingOwnWhatsapp}
                    className="w-full bg-[#313166] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#25254d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {config?.isUsingOwnWhatsapp ? 'Already Connected' : 'Connect via Meta'}
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

      {showPinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-blue-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#313166] flex items-center gap-2">
                <LinkIcon className="text-blue-600" size={20} />
                WhatsApp Verification
              </h3>
              <button onClick={() => setShowPinModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">
                This number was previously used with another provider or has 2-step verification enabled.
              </p>
              <p className="text-sm font-semibold text-blue-800 bg-blue-50 p-3 rounded-lg border border-blue-100">
                Enter the 6-digit PIN to complete the migration.
              </p>
            </div>
            <form onSubmit={handlePinSubmit}>
              <div className="mb-6">
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-400 mb-2">6-Digit PIN</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  required
                  className="w-full text-center text-3xl tracking-[1rem] font-mono border-2 border-gray-200 rounded-xl py-4 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={pinLoading || pin.length !== 6}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {pinLoading ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                  Verify & Connect
                </button>
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="w-full text-gray-500 text-sm font-medium hover:text-gray-700 py-1"
                >
                  Cancel
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
