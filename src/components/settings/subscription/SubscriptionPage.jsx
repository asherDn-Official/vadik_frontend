import { useEffect, useState } from "react";
import SubscriptionCard from "./components/SubscriptionCard";
import UsageTable from "./components/UsageTable";
import ConfirmationModal from "./components/ConfirmationModal";
import api from "../../../api/apiconfig";

export default function SubscriptionPage() {
  const [activeTab, setActiveTab] = useState("subscription");
  const [currentPlans, setCurrentPlans] = useState(null);
  const [subscription, setSubscription] = useState([]);
  const [addons, setAddons] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeSubscriptionId, setActiveSubscriptionId] = useState(null);
  const retailerid = localStorage.getItem("retailerId");

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
        // Find subscription with plan (not add-on only)
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

  const handleAddonToggle = (addon) => {
    setSelectedAddons((prev) => {
      const isSelected = prev.find((a) => a._id === addon._id);
      if (isSelected) {
        return prev.filter((a) => a._id !== addon._id);
      } else {
        return [...prev, addon];
      }
    });
  };

  const calculateTotalPrice = () => {
    let total = selectedPlan ? selectedPlan.price : 0;
    selectedAddons.forEach((addon) => {
      total += addon.price;
    });
    return total;
  };

  // Regular subscription payment verification
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

      console.log("✅ Payment Verified:", {
        subscriptionId: verificationResponse.data?.subscription?._id,
        plan: verificationResponse.data?.subscription?.plan?.name,
        autoPay: verificationResponse.data?.subscription?.autoPay,
        status: verificationResponse.data?.status,
      });

      setShowConfirmation(false);
      setSelectedPlan(null);
      setSelectedAddons([]);
      getCurrentPlanDetails();
      getActiveSubscription();
    } catch (error) {
      console.error("Payment verification failed:", error);
      alert("Payment verification failed. Please contact support.");
    } finally {
      setLoading(false);
    }
  };

  // Add-credits payment verification
  const verifyAddCreditsPayment = async (response, subscriptionId) => {
    try {
      const verificationPayload = {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        subscriptionId: subscriptionId,
        addOnIds: selectedAddons.map((addon) => addon._id),
      };

      const verificationResponse = await api.post(
        "/api/subscriptions/add-credits/verify",
        verificationPayload
      );

      if (!verificationResponse.data?.status) {
        throw new Error("❌ Credits payment verification failed");
      }

      console.log("✅ Credits Added:", {
        subscriptionId: verificationResponse.data?.data?.subscription?._id,
        creditsAdded: verificationResponse.data?.data?.creditsAdded,
        newTotals: verificationResponse.data?.data?.newTotals,
      });

      setShowConfirmation(false);
      setSelectedAddons([]);
      getCurrentPlanDetails();
      // alert("✅ Credits added successfully!");
    } catch (error) {
      console.error("Credits payment verification failed:", error);
      alert("Credits payment verification failed. Please contact support.");
    } finally {
      setLoading(false);
    }
  };

  // Main payment handler - decides which flow to use
  const handleProceedToPayment = async () => {
    if (!selectedPlan && selectedAddons.length === 0) {
      alert("Please select a plan or addons before proceeding to payment.");
      return;
    }

    setLoading(true);

    // Determine which flow to use
    const isAddonsOnly = !selectedPlan && selectedAddons.length > 0;
    const hasActiveSubscription = activeSubscriptionId !== null;

    if (isAddonsOnly && hasActiveSubscription) {
      // Use add-credits flow
      await handleAddCreditsFlow();
    } else {
      // Use regular subscription flow
      await handleRegularSubscriptionFlow();
    }
  };

  // Regular subscription flow (plan or plan + addons)
  const handleRegularSubscriptionFlow = async () => {
    try {
      let subscriptionData = null;

      // Step 1: Create Subscription (only if plan is selected)
      if (selectedPlan) {
        const subscriptionPayload = {
          planId: selectedPlan._id,
          addOnIds: selectedAddons.map((addon) => addon._id),
          isTrial: false,
          enableAutoPay: true,
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

      // Step 2: Create Razorpay Order
      const orderPayload = {
        subscriptionData: {
          user: retailerid,
          plan: selectedPlan?._id || null,
          addOns: selectedAddons.map((addon) => addon._id),
          startDate: new Date().toISOString(),
          endDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          isActive: false,
          isTrial: selectedPlan?.isFreeTrial || false,
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

      // Step 3: Initialize Razorpay Payment
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Vadik AI Subscription",
        description: `${selectedPlan ? selectedPlan.name + " Plan" : "Addon"}${
          selectedAddons.length > 0 ? " with Addons" : ""
        }`,
        order_id: order.id,
        handler: async function (response) {
          await verifyRazorpayPayment(response, subscriptionId);
        },
        prefill: {
          name: "Customer Name",
          email: "customer@email.com",
          contact: "9999999999",
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

  // Add-credits flow (addons only to existing subscription)
  const handleAddCreditsFlow = async () => {
    try {
      // Step 1: Prepare add credits
      const preparePayload = {
        subscriptionId: activeSubscriptionId,
        addOnIds: selectedAddons.map((addon) => addon._id),
      };

      const prepareResponse = await api.post(
        "/api/subscriptions/add-credits/prepare",
        preparePayload
      );

      console.log("🔍 Step 1 - Prepare Add Credits:", prepareResponse);

      if (!prepareResponse.data.status) {
        throw new Error("❌ Failed to prepare credits");
      }

      // Step 2: Create order for add credits
      const orderResponse = await api.post(
        "/api/subscriptions/add-credits/create-order",
        preparePayload
      );

      console.log("🔍 Step 2 - Create Add Credits Order:", orderResponse);

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

      // Step 3: Initialize Razorpay Payment
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Vadik AI Add Credits",
        description: `Add credits to subscription`,
        order_id: order.id,
        handler: async function (response) {
          await verifyAddCreditsPayment(response, subscriptionId);
        },
        prefill: {
          name: "Customer Name",
          email: "customer@email.com",
          contact: "9999999999",
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

      // alert("✅ Trial subscription activated successfully!");
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

  useEffect(() => {
    getCurrentPlanDetails();
    getSubscriptionPlans();
    getAddons();
    getActiveSubscription();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-8">
          My Subscription
        </h1>

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

        <div className="mb-6">
          <div className="flex gap-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("subscription")}
              className={`pb-3 px-1 font-medium transition-colors relative ${
                activeTab === "subscription" ? "text-gray-800" : "text-gray-500"
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

              const transformedPlan = {
                title: plan.name,
                price: plan.price,
                period: `${plan.durationInDays} days`,
                features: [
                  `${plan.customerLimit} Customers`,
                  `${plan.activityLimit} Activities`,
                  `${plan.whatsappActivityLimit} WhatsApp Activities`,
                  plan.isFreeTrial ? "Free Trial Available" : "Full Access",
                ],
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
                />
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {addons.map((addon) => {
              const transformedPlan = {
                title: addon.name,
                price: addon.price,
                period: `${addon.durationInDays} days`,
                features: [
                  `+${addon.extraCustomers} Additional Customers`,
                  `+${addon.extraActivities} Additional Activities`,
                  `+${addon.extraWhatsappActivities} Additional WhatsApp Activities`,
                  addon.description,
                  `${addon.durationInDays} Days Validity`,
                ],
                variant: "primary",
              };

              const isCurrentPlanFreeTrial =
                currentPlans?.subscription?.isTrial;

              return (
                <SubscriptionCard
                  key={addon._id}
                  plan={addon}
                  title={transformedPlan.title}
                  price={transformedPlan.price}
                  period={transformedPlan.period}
                  features={transformedPlan.features}
                  variant={transformedPlan.variant}
                  isAddon={true}
                  isSelected={selectedAddons.some((a) => a._id === addon._id)}
                  onSelect={handleAddonToggle}
                  loading={loading}
                  isCurrentPlanFreeTrial={isCurrentPlanFreeTrial}
                />
              );
            })}
          </div>
        )}

        {/* Proceed Button */}
        {((selectedPlan && !selectedPlan.isFreeTrial) ||
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

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          selectedPlan={selectedPlan}
          selectedAddons={selectedAddons}
          totalPrice={calculateTotalPrice()}
          onConfirm={handleProceedToPayment}
          loading={loading}
        />
      </div>
    </div>
  );
}
