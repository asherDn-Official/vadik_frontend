import { useState, useEffect } from "react";
import SubscriptionCard from "./components/SubscriptionCard";
import ConfirmationModal from "./components/ConfirmationModal";
import BillingDetailsModal from "./components/BillingDetailsModal";
import WhatsAppCredits from "./components/WhatsAppCredits";
import api from "../../../api/apiconfig";
import { useAuth } from "../../../context/AuthContext";
import { calculateTotalWithGST } from "../../../utils/billingUtils";

const SubscriptionPopup = ({
  onClose,
  activeTabName = "subscription",
  showCloseButton = false,
  showAutopay = false,
  showSubscription = true,
  showAddon = true,
  title = "Subscription Plan",
}) => {
  const [open, setOpen] = useState(true);
  const [subscription, setSubscription] = useState([]);
  const [addons, setAddons] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPlans, setCurrentPlans] = useState(null);
  const [activeSubscriptionId, setActiveSubscriptionId] = useState(null);
  const [autoplay, setAutoplay] = useState(true);
  const [addonQuantities, setAddonQuantities] = useState({});
  const [billingDetails, setBillingDetails] = useState(null);
  const [showBillingModal, setShowBillingModal] = useState(false);
  
  const retailerid = localStorage.getItem("retailerId");
  const { auth } = useAuth();
  
  // Check if we should show tabs
  const shouldShowTabs = showSubscription && showAddon;
  
  // Set active tab based on props and availability
  const [activeTab, setActiveTab] = useState(() => {
    if (!shouldShowTabs) {
      if (showSubscription) return "subscription";
      if (showAddon) return "addon";
    }
    
    if (activeTabName === "subscription" && !showSubscription) {
      return showAddon ? "addon" : "subscription";
    }
    if (activeTabName === "addon" && !showAddon) {
      return showSubscription ? "subscription" : "addon";
    }
    return activeTabName;
  });

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
        }
      }
    } catch (error) {
      console.error("Error fetching active subscription:", error);
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
        addOnIds: addonsWithQuantities, // Include quantities
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

      setBillingDetails({
        billNumber: billing?.billNumber,
        totalAmount: billing?.totalAmount,
        gstAmount: billing?.gstAmount,
        subtotal: billing?.subtotal || (billing?.totalAmount - billing?.gstAmount),
        isCredits: false,
      });
      setShowBillingModal(true);

      setShowConfirmation(false);
      setSelectedPlan(null);
      setSelectedAddons([]);
      setAddonQuantities({});
      getCurrentPlanDetails();
      getActiveSubscription();
      handleClose();
    } catch (error) {
      console.error("Payment verification failed:", error);
      alert("Payment verification failed. Please contact support.");
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
        addOnIds: addonsWithQuantities,
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

      setBillingDetails({
        billNumber: billing?.billNumber,
        totalAmount: billing?.totalAmount,
        gstAmount: billing?.gstAmount,
        subtotal: billing?.subtotal || (billing?.totalAmount - billing?.gstAmount),
        isCredits: true,
      });
      setShowBillingModal(true);

      setShowConfirmation(false);
      setSelectedAddons([]);
      setAddonQuantities({});
      getCurrentPlanDetails();
      handleClose();
    } catch (error) {
      console.error("Credits payment verification failed:", error);
      alert("Credits payment verification failed. Please contact support.");
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

    setShowConfirmation(true);
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
      handleClose();
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

  // Main payment processing function
  const handlePaymentProcess = async () => {
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
          addOnIds: addonsWithQuantities,
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
        addOnIds: addonsWithQuantities,
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

  const handleClose = () => {
    setOpen(false);
    if (onClose) {
      onClose();
    }
  };

  useEffect(() => {
    getCurrentPlanDetails();
    if (showSubscription) {
      getSubscriptionPlans();
    }
    if (showAddon) {
      getAddons();
    }
    getActiveSubscription();
  }, []);

  if (!open) return null;

  // Check if current plan has free trial
  const isCurrentPlanFreeTrial = currentPlans?.subscription?.isTrial || false;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">
            {title}
          </h1>
          {/* <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl p-1"
            aria-label="Close"
          >
            ×
          </button> */}
        </div>

        {/* Tab Navigation - Only show if both tabs are enabled */}
        {shouldShowTabs ? (
          <div className="px-6 pt-6">
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
              {showAutopay && (
                <div className="flex items-center gap-2 pb-3">
                  <label htmlFor="autoplay" className="text-gray-700 font-medium">
                    Autopay
                  </label>
                  <input
                    id="autoplay"
                    type="checkbox"
                    checked={autoplay}
                    onChange={(e) => setAutoplay(e.target.checked)}
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        ) : showAutopay ? (
          // Show Autopay standalone when tabs are hidden but autopay is enabled
          <div className="px-6 pt-6">
            <div className="flex justify-end border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <label htmlFor="autoplay" className="text-gray-700 font-medium">
                  Autopay
                </label>
                <input
                  id="autoplay"
                  type="checkbox"
                  checked={autoplay}
                  onChange={(e) => setAutoplay(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          </div>
        ) : null}

        {/* Content Area */}
        <div className="p-6">
          {activeTab === "subscription" && showSubscription ? (
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
                  plan.whatsappActivityLimit > 0 && `${plan.whatsappActivityLimit} WhatsApp Credits`,
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
                    loading={loading}
                    compact={true}
                  />
                );
              })}
            </div>
          ) : activeTab === "addon" && showAddon ? (
            <div>
              {(selectedPlan?.isFreeTrial || currentPlans?.subscription?.isTrial) && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 font-medium">
                    ⚠️ Add-ons are not available during Free Trial. Please
                    upgrade to a paid plan to add credits.
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addons.map((addon) => {
                  const features = [
                    addon.extraCustomers > 0 && `+${addon.extraCustomers} Additional Customers`,
                    addon.extraActivities > 0 && `+${addon.extraActivities} Additional Activities`,
                    addon.extraWhatsappActivities > 0 &&  `+${addon.extraWhatsappActivities} Additional WhatsApp Credits`,
                    `Validity Based On The Active Plan`,
                  ].filter(Boolean);

                  const transformedPlan = {
                    title: addon.name,
                    price: addon.price,
                    features,
                    variant: "primary",
                  };

                  const isSelected = selectedAddons.some(
                    (a) => a._id === addon._id
                  );
                  const quantity = addonQuantities[addon._id] || 1;
                  const isCurrentPlanFreeTrial =
                    currentPlans?.subscription?.isTrial ||
                    selectedPlan?.isFreeTrial;

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
                      compact={true}
                    />
                  );
                })}
              </div>
            </div>
          ) : (
            <WhatsAppCredits />
          )}
        </div>

        {/* Footer with Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-xl">
          <div className="flex justify-between items-center">
            <div>
              {activeTab !== "whatsapp" && (
                <>
                  {!selectedPlan?.isFreeTrial &&
                  (selectedPlan || selectedAddons.length > 0) ? (
                    (() => {
                      const totalPrice = calculateTotalPrice();
                      const billing = calculateTotalWithGST(totalPrice);
                      return (
                        <div className="space-y-1">
                          <div className="text-gray-600 text-sm">
                            <span>Subtotal: </span>
                            <span className="font-medium">₹{billing.subtotal.toLocaleString()}</span>
                          </div>
                          <div className="text-gray-600 text-sm">
                            <span>GST (18%): </span>
                            <span className="font-medium">₹{billing.gstAmount.toLocaleString()}</span>
                          </div>
                          <div className="text-gray-700 font-medium">
                            <span>Total: </span>
                            <span className="text-xl font-bold text-pink-700">
                              ₹{billing.totalAmount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-gray-500">
                      {selectedPlan?.isFreeTrial
                        ? ""
                        : "Select a plan or addon to proceed"}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex gap-4">
              {showCloseButton && (
                <button
                  onClick={handleClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  {activeTab === "whatsapp" ? "Close" : "Cancel"}
                </button>
              )}

              {activeTab !== "whatsapp" && !selectedPlan?.isFreeTrial &&
                ((selectedPlan && !selectedPlan.isFreeTrial) ||
                  (selectedAddons.length > 0 &&
                    (currentPlans?.subscription || selectedPlan))) && (
                  <button
                    onClick={handleProceedToPayment}
                    className="bg-pink-700 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:bg-pink-800 transition-colors"
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Proceed to Payment"}
                  </button>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        selectedPlan={selectedPlan}
        selectedAddons={selectedAddons}
        addonQuantities={addonQuantities}
        onQuantityChange={handleQuantityChange}
        totalPrice={calculateTotalPrice()}
        onConfirm={handlePaymentProcess}
        loading={loading}
      />

      {/* Billing Details Modal */}
      <BillingDetailsModal
        isOpen={showBillingModal}
        onClose={() => {
          setShowBillingModal(false);
          handleClose();
        }}
        billNumber={billingDetails?.billNumber}
        totalAmount={billingDetails?.totalAmount}
        gstAmount={billingDetails?.gstAmount}
        subtotal={billingDetails?.subtotal}
        isCredits={billingDetails?.isCredits}
      />
    </div>
  );
};

export default SubscriptionPopup;