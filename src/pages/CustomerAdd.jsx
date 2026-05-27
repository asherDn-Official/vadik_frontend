// ParentComponent.jsx
import { ArrowLeft } from "lucide-react";
import CustomerForm from "../components/customerProfile/CustomerForm";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/apiconfig";
import showToast from "../utils/ToastNotification";
import { usePlan } from "../context/PlanContext";
import Loader from "../utils/Loader";

const CustomerAdd = () => {
  const navigate = useNavigate();
  const { refreshPlans, currentPlans } = usePlan();
  const [whatsappConfig, setWhatsappConfig] = useState(null);
  const [retailerId, setRetailerId] = useState(() => {
    return localStorage.getItem("retailerId") || "";
  });
  const [isPreferenceLoading, setIsPreferenceLoading] = useState(true);

  // Fetch WhatsApp configuration
  useEffect(() => {
    const fetchWhatsappConfig = async () => {
      try {
        const response = await api.get(
          "/api/integrationManagement/whatsapp/config",
        );
        if (response.data.status) {
          setWhatsappConfig(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching WhatsApp config:", error);
      }
    };
    fetchWhatsappConfig();
    refreshPlans();
  }, []);

  // Check for customer preferences existence
  useEffect(() => {
    if (!retailerId) return;

    let intervalId;
    let isMounted = true;

    const checkPreferences = async () => {
      try {
        const response = await api.get(`/api/customer-preferences/${retailerId}`);
        if (response.status === 200 && isMounted) {
          setIsPreferenceLoading(false);
          if (intervalId) clearInterval(intervalId);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // Keep polling if not found
          if (isMounted) setIsPreferenceLoading(true);
        } else {
          console.error("Error checking preferences:", error);
          // On other errors, we might want to stop to avoid infinite loop of errors,
          // but usually this means something is wrong with the API.
          // For now, let's keep polling or stop if it's a fatal error.
          if (isMounted) setIsPreferenceLoading(false);
          if (intervalId) clearInterval(intervalId);
        }
      }
    };

    checkPreferences();
    intervalId = setInterval(checkPreferences, 3000); // Check every 3 seconds

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [retailerId]);

  const isLowCredits =
    whatsappConfig &&
    !whatsappConfig.isUsingOwnWhatsapp &&
    currentPlans?.data?.whatsapp?.remaining <= 0;
  const [resetForm, setResetForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (customerData) => {
    const apiData = {
      ...customerData,
      retailerId: retailerId,
    };

    setIsSubmitting(true);

    try {
      const response = await api.post("/api/customers", apiData);
      const newCustomer = response.data;
      showToast("Customer added successfully!", "success");

      navigate(`/customers/customer-profile/${newCustomer._id}`);
    } catch (error) {
      console.error(error.response.data.error);
      showToast(error.response.data.error, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackClick = () => {
    navigate("/customers");
  };

  return (
    <div className="h-full bg-transparent">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 p-4 sm:p-5 xl:p-6">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackClick}
            className="
            inline-flex items-center gap-2

            rounded-2xl
            border border-[#EEF1FF]

            bg-white/95
            px-4 py-3

            text-sm font-medium text-[#313166]

            shadow-[0_4px_20px_rgba(49,49,102,0.06)]

            transition-all duration-200

            hover:bg-[#F8F9FF]
          "
          >
            <ArrowLeft size={18} />
            Back to Customers
          </button>
        </div>

        {/* Hero Section */}
        <div
          className="
          relative overflow-hidden

          rounded-[32px]
          border border-[#EEF1FF]

          bg-white/95
          p-6 sm:p-8

          shadow-[0_10px_40px_rgba(49,49,102,0.08)]
        "
        >
          {/* Ambient Glow */}
          <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-pink-500/5 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            {/* Left */}
            <div>
              <h1 className="text-[32px] font-bold tracking-[-0.05em] text-[#1F1C5C]">
                Add New Customer
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#8B90B2]">
                Create customer profiles, manage onboarding information and
                capture engagement details for your CRM ecosystem.
              </p>
            </div>

            {/* Right Badge */}
            <div className="rounded-2xl bg-[#F8F9FF] px-5 py-4">
              <div className="text-xs font-medium uppercase tracking-wide text-[#8B90B2]">
                Customer Workspace
              </div>

              <div className="mt-2 text-sm font-medium text-[#1F1C5C]">
                Customer Onboarding
              </div>
            </div>
          </div>
        </div>

        {/* Credit Warning */}
        {isLowCredits && (
          <div
            className="
            rounded-2xl
            border border-red-200

            bg-red-50
            px-5 py-4

            text-sm font-medium
            text-red-700
          "
          >
            ⚠️ You have low WhatsApp credits. Please top up your credits in the
            subscription page to continue using Vadik's default WhatsApp
            account. Adding a new customer will not send an opt-in message.
          </div>
        )}

        {/* Form Container */}
        <div
          className="
          rounded-[32px]
          border border-[#EEF1FF]

          bg-white/95
          p-5 sm:p-7

          shadow-[0_10px_40px_rgba(49,49,102,0.08)]
        "
        >
          {isPreferenceLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader
                text="Setting up your customer workspace..."
                fullHeight={false}
              />
              <p className="mt-4 text-center text-sm text-[#8B90B2]">
                We're creating your customer preference data based on your store
                type. This will only take a moment.
              </p>
            </div>
          ) : (
            <CustomerForm
              onSubmit={handleSubmit}
              resetForm={resetForm}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerAdd;
