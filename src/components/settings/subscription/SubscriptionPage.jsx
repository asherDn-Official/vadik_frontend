import { useEffect, useState } from "react";
import SubscriptionCard from "./components/SubscriptionCard";
import UsageTable from "./components/UsageTable";
import api from "../../../api/apiconfig";
// import { useFormState } from 'react-hook-form';

export default function SubscriptionPage() {
  const [activeTab, setActiveTab] = useState("subscription");
  const [currentPlans, setCurrentPlans] = useState(null);
  const [subscription, setSubscription] = useState([]);
  const [addons, setAddons] = useState([]);

  const usageData = [
    { feature: "User", given: 1, used: 1, balance: "-" },
    { feature: "Profile", given: 250, used: 200, balance: 50, isWarning: true },
    {
      feature: "Media Storage",
      given: "200 MB",
      used: "180 MB",
      balance: "20 MB",
      isWarning: true,
    },
    { feature: "Activities", given: 10, used: 2, balance: 8 },
  ];

  const getCurrentPlanDetails = async () => {
    try {
      const response = await api.get("/api/subscriptions/credit/usage");
      setCurrentPlans(response.data);
      console.log(currentPlans?.subscription?.plan);
    } catch (error) {
      console.log("error", error.response.status);
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
      console.log(response.data.data);
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

  useEffect(() => {
    getCurrentPlanDetails();
    getSubscriptionPlans();
    getAddons();
  }, []);

  const subscriptionPlans = [
    {
      title: "Basic",
      price: 499,
      period: "month",
      features: [
        "3 Users",
        "1000 Profiles",
        "1000 Activities",
        "500 MB Storage",
      ],
      variant: "secondary",
    },
    {
      title: "Standard",
      price: 1499,
      period: "month",
      features: ["5 Users", "5000 Profiles", "5000 Activities", "1 GB Storage"],
      variant: "primary",
      recommended: true,
    },
    {
      title: "Basic",
      price: 2499,
      period: "month",
      features: [
        "3 Users",
        "10000 Profiles",
        "5000 Activities",
        "2 GB Storage",
      ],
      variant: "secondary",
    },
  ];

  const addonPlans = [
    {
      title: "Profile Add on",
      price: 1000,
      period: "month",
      features: ["10,000 Profiles"],
      variant: "primary",
    },
    {
      title: "User Add on",
      price: 399,
      period: "month",
      features: ["Add 1 New User"],
      variant: "primary",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-8">
          My Subscription
        </h1>

        {/* current Plan detiails */}
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
              Add on
              {activeTab === "addon" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800"></div>
              )}
            </button>
          </div>
        </div>

        {activeTab === "subscription" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subscription.map((plan, index) => {
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
                //   `${plan.mediaStorageSizeMB} MB Storage`,
                  plan.isFreeTrial ? "Free Trial" : "Full Access",
                ],
                variant: plan.name.toLowerCase() === "enterprise" ?  "primary" : "secondary",
                recommended: plan.name.toLowerCase() === "starter",
              };

              return (
                <SubscriptionCard
                  key={plan._id}
                  title={transformedPlan.title}
                  price={transformedPlan.price}
                  period={transformedPlan.period}
                  features={transformedPlan.features}
                  variant={transformedPlan.variant}
                  recommended={transformedPlan.recommended}
                  isCurrentPlan={isCurrentPlan}
                  hasActiveSubscription={hasActiveSubscription}
                  isAddon={false}
                />
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {addons.map((plan) => {
              const transformedPlan = {
                title: plan.name,
                price: plan.price,
                period: `${plan.durationInDays} days`,
                features: [
                  `+${plan.extraCustomers} Additional Customers`,
                  `+${plan.extraActivities} Additional Activities`,
                  `+${plan.extraWhatsappActivities} Additional WhatsApp Activities`,
                  plan.description,
                  `${plan.durationInDays} Days Validity`,
                ],
                variant: "primary",
              };

              return (
                <SubscriptionCard
                  key={plan._id}
                  title={transformedPlan.title}
                  price={transformedPlan.price}
                  period={transformedPlan.period}
                  features={transformedPlan.features}
                  variant={transformedPlan.variant}
                  isAddon={true}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
