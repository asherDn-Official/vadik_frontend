import { useState, useEffect } from "react";
import SubscriptionCard from "./components/SubscriptionCard";
import ConfirmationModal from "./components/ConfirmationModal";
import api from "../../../api/apiconfig";

const SubscriptionPopup = ({ onClose }) => {
  const [open, setOpen] = useState(true);
  const [subscription, setSubscription] = useState([]);
  const [addons, setAddons] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("subscription");
  const [currentPlans, setCurrentPlans] = useState(null);
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

      alert("✅ Trial subscription activated successfully!");
      getCurrentPlanDetails();
      getActiveSubscription();
      handleClose(); // Close popup after trial activation
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

  const handleClose = () => {
    setOpen(false);
    if (onClose) {
      onClose();
    }
  };

  useEffect(() => {
    getCurrentPlanDetails();
    getSubscriptionPlans();
    getAddons();
    getActiveSubscription();
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">
            Subscription Plan
          </h1>
          {/* <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl p-1"
            aria-label="Close"
          >
            ×
          </button> */}
        </div>

        {/* Current Plan Status */}
        {/* <div className="p-6 border-b border-gray-100">
          {currentPlans ? (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gray-700 font-medium">
                    Current Plan:{" "}
                    <span className="font-semibold capitalize">
                      {currentPlans.subscription?.plan} Plan
                    </span>
                  </span>
                  <span
                    className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${
                      currentPlans?.status
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {currentPlans?.status ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="text-gray-600 text-sm">
                  Expiry:{" "}
                  {currentPlans.subscription?.endDate
                    ? new Date(
                        currentPlans.subscription.endDate
                      ).toLocaleDateString()
                    : "-"}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <span className="text-gray-600">
                No active subscription. Choose a plan to get started!
              </span>
            </div>
          )}
        </div> */}

        {/* Tab Navigation */}
        <div className="px-6 pt-6">
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

        {/* Content Area */}
        <div className="p-6">
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
                    compact={true} // Pass compact prop for popup view
                  />
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    compact={true} // Pass compact prop for popup view
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-xl">
          <div className="flex justify-between items-center">
            <div>
              {selectedPlan || selectedAddons.length > 0 ? (
                <div className="text-gray-700">
                  <span className="font-medium">Total:</span>{" "}
                  <span className="text-xl font-bold text-pink-700">
                    ₹{calculateTotalPrice()}
                  </span>
                </div>
              ) : (
                <div className="text-gray-500">
                  Select a plan or addon to proceed
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              {((selectedPlan && !selectedPlan.isFreeTrial) ||
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
        totalPrice={calculateTotalPrice()}
        onConfirm={async () => {
          // Here you would call the actual payment logic from SubscriptionPage
          // For now, we'll just close the confirmation modal
          setShowConfirmation(false);
          alert("Payment flow would start here...");
        }}
        loading={loading}
      />
    </div>
  );
};

export default SubscriptionPopup;