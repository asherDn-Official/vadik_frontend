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
    setSelectedAddons(prev => {
      const isSelected = prev.find(a => a._id === addon._id);
      if (isSelected) {
        return prev.filter(a => a._id !== addon._id);
      } else {
        return [...prev, addon];
      }
    });
  };

  const calculateTotalPrice = () => {
    let total = selectedPlan ? selectedPlan.price : 0;
    selectedAddons.forEach(addon => {
      total += addon.price;
    });
    return total;
  };

  const handleProceedToPayment = async () => {
    setLoading(true);
    try {
      // Step 1: Create Subscription
      const subscriptionPayload = {
        planId: selectedPlan._id,
        addOnIds: selectedAddons.map(addon => addon._id),
        isTrial: false,
        enableAutoPay: true
      };

      const subscriptionResponse = await api.post("/api/subscriptions", subscriptionPayload);
      const subscriptionData = subscriptionResponse.data;

      // Step 2: Create Razorpay Order
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      const orderPayload = {
        subscriptionData: {
          user: retailerid,
          plan: selectedPlan._id,
          addOns: selectedAddons.map(addon => addon._id),
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          isActive: false,
          isTrial: false,
          autoPay: {
            enabled: true,
            razorpayCustomerId: null,
            razorpayTokenId: null
          },
          totalCustomersAllowed: subscriptionData.totalCustomersAllowed,
          totalActivitiesAllowed: subscriptionData.totalActivitiesAllowed,
          totalWhatsappActivitiesAllowed: subscriptionData.totalWhatsappActivitiesAllowed
        }
      };

      const orderResponse = await api.post("/api/subscriptions/create-order", orderPayload);
      const { orderId, subscriptionId } = orderResponse.data;

      // Step 3: Initialize Razorpay Payment
      const options = {
        key: "rzp_test_RiIfKOp1omFGAu",
        amount: orderResponse.data.amount,
        currency: "INR",
        name: "Vadik AI Subscription",
        description: `${selectedPlan.name} Plan with Addons`,
        order_id: orderId,
        handler: async function (response) {
           // Step 4: Verify Payment
          try {
            const verificationPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              subscriptionId: subscriptionId
            };

            await api.post("/api/subscriptions/verify-payment", verificationPayload);
            
            // Payment successful
            alert("Payment successful! Your subscription is now active.");
            setShowConfirmation(false);
            getCurrentPlanDetails(); // Refresh current plan details
          } catch (error) {
            console.error("Payment verification failed:", error);
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: "Customer Name", // You can get this from user profile
          email: "customer@email.com", // You can get this from user profile
          contact: "9999999999" // You can get this from user profile
        },
        theme: {
          color: "#D3285B"
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error("Payment process failed:", error);
      alert("Failed to process payment. Please try again.");
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
        enableAutoPay: false
      };

      await api.post("/api/subscriptions", trialPayload);
      alert("Trial subscription activated successfully!");
      getCurrentPlanDetails(); // Refresh current plan details
    } catch (error) {
      console.error("Trial subscription failed:", error);
      alert("Failed to activate trial. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentPlanDetails();
    getSubscriptionPlans();
    getAddons();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
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
              const isCurrentPlan = currentPlanName && currentPlanName.toLowerCase() === plan.name.toLowerCase();
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
                variant: plan.name.toLowerCase() === "enterprise" ? "primary" : "secondary",
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
                  isSelected={selectedAddons.some(a => a._id === addon._id)}
                  onSelect={handleAddonToggle}
                  loading={loading}
                />
              );
            })}
          </div>
        )}

        {/* Proceed Button */}
        {(selectedPlan || selectedAddons.length > 0) && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
            <button
              onClick={() => setShowConfirmation(true)}
              className="bg-pink-700 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:bg-pink-800 transition-colors"
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