import { useEffect, useState } from "react";
import SubscriptionCard from "./components/SubscriptionCard";
import UsageTable from "./components/UsageTable";
import ConfirmationModal from "./components/ConfirmationModal";
import CancelConfirmationModal from "./components/CancelConfirmationModal";
import WhatsAppCredits from "./components/WhatsAppCredits";
import api from "../../../api/apiconfig";
import { useAuth } from "../../../context/AuthContext";
import showToast from "../../../utils/ToastNotification";
import { calculateTotalWithGST } from "../../../utils/billingUtils";
import VideoPopupWithShare from "../../common/VideoPopupWithShare";

export default function SubscriptionPage() {
  const [activeTab, setActiveTab] = useState("subscription");
  const [currentPlans, setCurrentPlans] = useState(null);
  const [subscription, setSubscription] = useState([]);
  const [addons, setAddons] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [activeSubscriptionId, setActiveSubscriptionId] = useState(null);
  const [autoplay, setAutoplay] = useState(true);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const retailerid = localStorage.getItem("retailerId");
  const { auth } = useAuth();
      const [soon, setSoon] = useState()


      useEffect(() => {
        fetch("/assets/Comingsoon.json")
            .then((res) => res.json())
            .then(setSoon)
            .catch(console.error)

    }, []);

  // Addon quantities state
  const [addonQuantities, setAddonQuantities] = useState({});

  // Initialize quantities when addons load
  useEffect(() => {
    if (addons.length > 0) {
      const initialQuantities = {};
      addons.forEach((addon) => {
        initialQuantities[addon._id] = 1;
      });
      setAddonQuantities(initialQuantities);
    }
  }, [addons]);

  const getCurrentPlanDetails = async () => {
    try {
      const response = await api.get("/api/subscriptions/credit/usage");
      setCurrentPlans(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setCurrentPlans(null);
      }
    }
  };

  const getActiveSubscription = async () => {
    try {
      const response = await api.get("/api/subscriptions?isActive=true");
      if (response.data.data && response.data.data.length > 0) {
        const subscriptionWithPlan = response.data.data.find(
          (sub) => sub.plan !== null
        );
        if (subscriptionWithPlan) {
          setActiveSubscriptionId(subscriptionWithPlan._id);
          setSubscriptionDetails(subscriptionWithPlan);
        } else {
          setSubscriptionDetails(null);
        }
      } else {
        setSubscriptionDetails(null);
      }
    } catch (error) {
      console.error("Error fetching active subscription:", error);
      setSubscriptionDetails(null);
    }
  };

  const getSubscriptionPlans = async () => {
    try {
      const response = await api.get("/api/plans/active");
      setSubscription(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getAddons = async () => {
    try {
      const response = await api.get("/api/addons/active");
      setAddons(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return "-";
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  // Updated handleAddonToggle to handle quantity
  const handleAddonToggle = (addon) => {
    setSelectedAddons((prev) => {
      const isSelected = prev.find((a) => a._id === addon._id);
      if (isSelected) {
        // Remove from selected addons
        const newQuantities = { ...addonQuantities };
        delete newQuantities[addon._id];
        setAddonQuantities(newQuantities);
        return prev.filter((a) => a._id !== addon._id);
      } else {
        // Add to selected addons with quantity 1
        setAddonQuantities((prev) => ({
          ...prev,
          [addon._id]: 1,
        }));
        return [...prev, addon];
      }
    });
  };

  // Handle quantity change for addons
  const handleQuantityChange = (addonId, newQuantity) => {
    if (newQuantity < 1) return; // Minimum quantity is 1

    setAddonQuantities((prev) => ({
      ...prev,
      [addonId]: newQuantity,
    }));
  };

  // Calculate total price with quantities
  const calculateTotalPrice = () => {
    let total = selectedPlan ? selectedPlan.price : 0;
    selectedAddons.forEach((addon) => {
      const quantity = addonQuantities[addon._id] || 1;
      total += addon.price * quantity;
    });
    return total;
  };

  const verifyRazorpayPayment = async (response, subscriptionId) => {
    try {
      const verificationPayload = {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        subscriptionId: subscriptionId,
      };

      const verificationResponse = await api.post(
        "/api/subscriptions/verify-payment",
        verificationPayload
      );

      if (!verificationResponse.data?.status) {
        throw new Error("❌ Payment verification returned false status");
      }

      const billing = verificationResponse.data?.billing;
      console.log("✅ Payment Verified:", {
        subscriptionId: verificationResponse.data?.subscription?._id,
        plan: verificationResponse.data?.subscription?.plan?.name,
        autoPay: verificationResponse.data?.subscription?.autoPay,
        billing,
        status: verificationResponse.data?.status,
      });

      showToast(`✅ Payment successful! Invoice #${billing?.billNumber}. We will invoice you through mail.`, "success");

      setShowConfirmation(false);
      setSelectedPlan(null);
      setSelectedAddons([]);
      setAddonQuantities({});
      getCurrentPlanDetails();
      getActiveSubscription();
    } catch (error) {
      console.error("Payment verification failed:", error);
      showToast("Payment verification failed. Please contact support.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Add-credits payment verification with quantities
  const verifyAddCreditsPayment = async (response, subscriptionId) => {
    try {
      // Prepare addons with quantities
      const addonsWithQuantities = selectedAddons.map((addon) => ({
        id: addon._id,
        qty: addonQuantities[addon._id] || 1,
      }));

      const verificationPayload = {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        subscriptionId: subscriptionId,
        addOnIds: addonsWithQuantities, // Changed to include quantities
      };

      const verificationResponse = await api.post(
        "/api/subscriptions/add-credits/verify",
        verificationPayload
      );

      if (!verificationResponse.data?.status) {
        throw new Error("❌ Credits payment verification failed");
      }

      const billing = verificationResponse.data?.billing;
      console.log("✅ Credits Added:", {
        subscriptionId: verificationResponse.data?.data?.subscription?._id,
        creditsAdded: verificationResponse.data?.data?.creditsAdded,
        newTotals: verificationResponse.data?.data?.newTotals,
        billing,
      });

      showToast(`✅ Credits added! Invoice #${billing?.billNumber}. We will invoice you through mail.`, "success");

      setShowConfirmation(false);
      setSelectedAddons([]);
      setAddonQuantities({});
      getCurrentPlanDetails();
    } catch (error) {
      console.error("Credits payment verification failed:", error);
      showToast("Credits payment verification failed. Please contact support.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Main payment handler
  const handleProceedToPayment = async () => {
    if (!selectedPlan && selectedAddons.length === 0) {
      alert("Please select a plan or addons before proceeding to payment.");
      return;
    }

    setLoading(true);

    const isAddonsOnly = !selectedPlan && selectedAddons.length > 0;
    const hasActiveSubscription = activeSubscriptionId !== null;

    if (isAddonsOnly && hasActiveSubscription) {
      await handleAddCreditsFlow();
    } else {
      await handleRegularSubscriptionFlow();
    }
  };

  // Regular subscription flow with quantities
  const handleRegularSubscriptionFlow = async () => {
    try {
      let subscriptionData = null;

      if (selectedPlan) {
        // Prepare addons with quantities
        const addonsWithQuantities = selectedAddons.map((addon) => ({
          id: addon._id,
          qty: addonQuantities[addon._id] || 1,
        }));

        const subscriptionPayload = {
          planId: selectedPlan._id,
          addOnIds: addonsWithQuantities, // Updated to include quantities
          isTrial: false,
          enableAutoPay: true,
          autoplay: autoplay,
        };

        const subscriptionResponse = await api.post(
          "/api/subscriptions",
          subscriptionPayload
        );

        subscriptionData =
          subscriptionResponse.data.subscriptionData ||
          subscriptionResponse.data.data ||
          subscriptionResponse.data;
      }

      // Create Razorpay Order
      const orderPayload = {
        subscriptionData: {
          user: retailerid,
          plan: selectedPlan?._id || null,
          addOns: selectedAddons.map((addon) => ({
            id: addon._id,
            qty: addonQuantities[addon._id] || 1,
          })),
          startDate: new Date().toISOString(),
          endDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          isActive: false,
          isTrial: selectedPlan?.isFreeTrial || false,
          autoplay: autoplay,
          autoPay: {
            enabled: true,
            razorpayCustomerId: null,
            razorpayTokenId: null,
          },
          totalCustomersAllowed: subscriptionData?.totalCustomersAllowed || 0,
          totalActivitiesAllowed: subscriptionData?.totalActivitiesAllowed || 0,
          totalWhatsappActivitiesAllowed:
            subscriptionData?.totalWhatsappActivitiesAllowed || 0,
        },
      };

      const orderResponse = await api.post(
        "/api/subscriptions/create-order",
        orderPayload
      );

      if (!orderResponse.data.order) {
        throw new Error("❌ Missing 'order' in create-order response");
      }
      if (!orderResponse.data.subscriptionId) {
        throw new Error("❌ Missing 'subscriptionId' in create-order response");
      }

      const { order, subscriptionId } = orderResponse.data;

      // Initialize Razorpay Payment
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Vadik AI Subscription",
        description: `${selectedPlan ? selectedPlan.name + " Plan" : "Addon"}${
          selectedAddons.length > 0
            ? ` with ${selectedAddons.length} Addon(s)`
            : ""
        }`,
        order_id: order.id,
        handler: async function (response) {
          await verifyRazorpayPayment(response, subscriptionId);
        },
        prefill: {
          name: auth?.user?.fullName,
          email: auth?.user?.email,
          contact: auth?.user?.phone,
        },
        theme: {
          color: "#D3285B",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response) {
        console.error("Razorpay payment failed:", response.error);
        alert(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      razorpay.open();
    } catch (error) {
      console.error("❌ Payment process failed:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to process payment. Please try again.";
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Add-credits flow with quantities
  const handleAddCreditsFlow = async () => {
    try {
      // Prepare addons with quantities
      const addonsWithQuantities = selectedAddons.map((addon) => ({
        id: addon._id,
        qty: addonQuantities[addon._id] || 1,
      }));

      const preparePayload = {
        subscriptionId: activeSubscriptionId,
        addOnIds: addonsWithQuantities, // Updated to include quantities
        autoplay: autoplay,
      };

      const prepareResponse = await api.post(
        "/api/subscriptions/add-credits/prepare",
        preparePayload
      );

      if (!prepareResponse.data.status) {
        throw new Error("❌ Failed to prepare credits");
      }

      const orderResponse = await api.post(
        "/api/subscriptions/add-credits/create-order",
        preparePayload
      );

      if (!orderResponse.data.order) {
        throw new Error(
          "❌ Missing 'order' in add-credits create-order response"
        );
      }
      if (!orderResponse.data.subscriptionId) {
        throw new Error(
          "❌ Missing 'subscriptionId' in add-credits create-order response"
        );
      }

      const { order, subscriptionId } = orderResponse.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Vadik AI Add Credits",
        description: `Add credits to subscription (${selectedAddons.length} addon(s))`,
        order_id: order.id,
        handler: async function (response) {
          await verifyAddCreditsPayment(response, subscriptionId);
        },
        prefill: {
          name: auth?.user?.fullName,
          email: auth?.user?.email,
          contact: auth?.user?.phone,
        },
        theme: {
          color: "#D3285B",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response) {
        console.error("Razorpay payment failed:", response.error);
        alert(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      razorpay.open();
    } catch (error) {
      console.error("❌ Add credits process failed:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to process credits addition. Please try again.";
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTrialSubscription = async (plan) => {
    setLoading(true);
    try {
      const trialPayload = {
        planId: plan._id,
        addOnIds: [],
        isTrial: true,
        enableAutoPay: false,
        autoplay: autoplay,
      };

      const trialResponse = await api.post("/api/subscriptions", trialPayload);

      if (!trialResponse.data) {
        throw new Error("❌ No response data from trial subscription");
      }

      console.log("✅ Trial Activated:", {
        subscriptionId:
          trialResponse.data.subscriptionData?._id || trialResponse.data._id,
        plan: plan.name,
        isTrial: true,
      });

      getCurrentPlanDetails();
      getActiveSubscription();
    } catch (error) {
      console.error("❌ Trial subscription failed:", {
        message: error.message,
        response: error.response?.data,
      });
      const errorMessage =
        error.response?.data?.message ||
        "Failed to activate trial. Please try again.";
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Cancel subscription function
  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    try {
      const response = await api.put(
        `/api/subscriptions/${activeSubscriptionId}/cancel`
      );
      
      if (response.data.status) {
        // console.log("✅ Subscription cancelled successfully:", response.data);
        showToast(response.data.message, "success");
        
        // Refresh data
        getCurrentPlanDetails();
        getActiveSubscription();
        
        setShowCancelConfirmation(false);
      } else {
        throw new Error(response.data.message || "Failed to cancel subscription");
      }
    } catch (error) {
      console.error("❌ Error cancelling subscription:", error);
      alert(`Failed to cancel subscription: ${error.response?.data?.message || error.message}`);
    } finally {
      setCancelLoading(false);
    }
  };

  // Open cancel confirmation
  const openCancelConfirmation = () => {
    setShowCancelConfirmation(true);
  };

  // Check if current plan has free trial
  const isCurrentPlanFreeTrial = currentPlans?.subscription?.isTrial || false;

  useEffect(() => {
    getCurrentPlanDetails();
    getSubscriptionPlans();
    getAddons();
    getActiveSubscription();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 relative">
      <div className="max-w-6xl mx-auto ">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800 mb-8">
          My Subscription
        </h1>
        <VideoPopupWithShare
                  // video_url="https://www.youtube.com/embed/MzEFeIRJ0eQ?si=JGtmQtyRIt_K6Dt5"
                  animationData={soon}
                  buttonCss="flex items-center text-sm gap-2 px-4 py-2  text-gray-700 bg-white rounded  hover:text-gray-500"
                />
        </div>
        

        {/* Current Plan Details */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          {currentPlans ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-gray-700 font-medium capitalize">
                    {currentPlans.subscription?.plan} Plan :
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      currentPlans?.status
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {currentPlans?.status ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="text-gray-600 text-sm">
                  Expiry : {formatDate(currentPlans.subscription?.endDate)}
                </div>
              </div>

              <UsageTable data={currentPlans?.data} />
            </>
          ) : (
            <div className="text-center py-8">
              <span className="text-gray-700 font-medium text-lg">
                No active subscription
              </span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex items-center justify-between border-b border-gray-200">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab("subscription")}
                className={`pb-3 px-1 font-medium transition-colors relative ${
                  activeTab === "subscription"
                    ? "text-gray-800"
                    : "text-gray-500"
                }`}
              >
                Subscription Plan
                {activeTab === "subscription" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("addon")}
                className={`pb-3 px-1 font-medium transition-colors relative ${
                  activeTab === "addon" ? "text-gray-800" : "text-gray-500"
                }`}
              >
                Add ons
                {activeTab === "addon" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("whatsapp")}
                className={`pb-3 px-1 font-medium transition-colors relative ${
                  activeTab === "whatsapp" ? "text-gray-800" : "text-gray-500"
                }`}
              >
                WhatsApp Credits
                {activeTab === "whatsapp" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800"></div>
                )}
              </button>
            </div>
          </div>
        </div>

        {activeTab === "subscription" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subscription.map((plan) => {
              const currentPlanName = currentPlans?.subscription?.plan;
              const isCurrentPlan =
                currentPlanName &&
                currentPlanName.toLowerCase() === plan.name.toLowerCase();
              const hasActiveSubscription = currentPlanName ? true : false;

              const features = [
                plan.customerLimit > 0 && `${plan.customerLimit} Customers`,
                plan.activityLimit > 0 && `${plan.activityLimit} Activities`,
                plan.whatsappActivityLimit > 0 &&
                  `₹ ${plan.whatsappActivityLimit} WhatsApp Credits`,
                plan.isFreeTrial ? "Free Trial Available" : "Full Access",
              ].filter(Boolean);

              const transformedPlan = {
                title: plan.name,
                price: plan.price,
                period: `${plan.durationInDays} days`,
                features,
                variant:
                  plan.name.toLowerCase() === "enterprise"
                    ? "primary"
                    : "secondary",
                recommended: plan.name.toLowerCase() === "starter",
                isFreeTrial: plan.isFreeTrial,
              };

              return (
                <SubscriptionCard
                  key={plan._id}
                  plan={plan}
                  title={transformedPlan.title}
                  price={transformedPlan.price}
                  period={transformedPlan.period}
                  features={transformedPlan.features}
                  variant={transformedPlan.variant}
                  recommended={transformedPlan.recommended}
                  isCurrentPlan={isCurrentPlan}
                  hasActiveSubscription={hasActiveSubscription}
                  isAddon={false}
                  isSelected={selectedPlan?._id === plan._id}
                  onSelect={handlePlanSelect}
                  onTrial={handleTrialSubscription}
                  onCancel={openCancelConfirmation}
                  activeSubscriptionId={activeSubscriptionId}
                  loading={loading}
                />
              );
            })}
          </div>
        ) : activeTab === "addon" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {addons.map((addon) => {
              const features = [
                addon.extraCustomers > 0 &&
                  `+${addon.extraCustomers} Additional Customers`,
                addon.extraActivities > 0 &&
                  `+${addon.extraActivities} Additional Activities`,
                addon.extraWhatsappActivities > 0 &&
                  `+ ₹${addon.extraWhatsappActivities} Additional WhatsApp Credits`,
                `Validity Based On The Active Plan`,
              ].filter(Boolean);

              const transformedPlan = {
                title: addon.name,
                price: addon.price,
                period: `${addon.durationInDays} days`,
                features,
                variant: "primary",
              };

              const isSelected = selectedAddons.some(
                (a) => a._id === addon._id
              );
              const quantity = addonQuantities[addon._id] || 1;

              return (
                <SubscriptionCard
                  key={addon._id}
                  plan={addon}
                  title={transformedPlan.title}
                  price={transformedPlan.price}
                  period={""}
                  features={transformedPlan.features}
                  variant={transformedPlan.variant}
                  isAddon={true}
                  isSelected={isSelected}
                  quantity={quantity}
                  onSelect={handleAddonToggle}
                  onQuantityChange={handleQuantityChange}
                  loading={loading}
                  isCurrentPlanFreeTrial={isCurrentPlanFreeTrial}
                  hasActiveSubscription={!!currentPlans}
                />
              );
            })}
          </div>
        ) : (
          <WhatsAppCredits />
        )}

        {/* Proceed Button */}
        {activeTab !== "whatsapp" && ((selectedPlan && !selectedPlan.isFreeTrial) ||
          (selectedAddons.length > 0 &&
            (currentPlans?.subscription || selectedPlan))) && (
          <div className="fixed bottom-6 left-2/3 transform -translate-x-1/2">
            <button
              onClick={() => setShowConfirmation(true)}
              className="bg-pink-700 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:bg-pink-800 transition-colors animate-zoom"
            >
              Proceed to Payment
            </button>
          </div>
        )}

        {/* Confirmation Modal for subscription and addons */}
        <ConfirmationModal
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          selectedPlan={selectedPlan}
          selectedAddons={selectedAddons}
          addonQuantities={addonQuantities}
          onQuantityChange={handleQuantityChange}
          totalPrice={calculateTotalPrice()}
          onConfirm={handleProceedToPayment}
          loading={loading}
        />

        {/* Cancel Confirmation Modal */}
        <CancelConfirmationModal
          isOpen={showCancelConfirmation}
          onClose={() => setShowCancelConfirmation(false)}
          onConfirm={handleCancelSubscription}
          loading={cancelLoading}
        />
      </div>
    </div>
  );
}