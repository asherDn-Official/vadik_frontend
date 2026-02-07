import React, { useState } from "react";
import PersonalizationCampaign from "../components/customeroppertunites/PersonalizationCampaign";
import CustomerRecommendation from "../components/customeroppertunites/CustomerRecommendation";
import StoreRecommendation from "../components/customeroppertunites/StoreRecommendation";
import EngagementActivities from "../components/customeroppertunites/EngagementActivities";
import VideoPopupWithShare from "../components/common/VideoPopupWithShare";
import ComingSoon from "../components/common/ComingSoon";
import Campaign from "../components/customeroppertunites/Campaign";
import SubscriptionPopup from "../components/settings/subscription/SubscriptionPopup";

const CustomerOpportunities = () => {
  const [activeTab, setActiveTab] = useState("engagement");
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);

  const handleUpdatePlan = () => {
    setShowSubscriptionPopup((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className=" flex justify-center items-center flex-wrap">
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              Customer Activity
            </h1>
            <p className="text-gray-600 ">
              This smart chatbot suggests the right offers to the right
              customers
              <br />
              at the right time using intelligent triggers.
            </p>
          </div>
          <div className=" text-center ">
            <Campaign onUpdatePlan={handleUpdatePlan} />

            {showSubscriptionPopup && (
              <SubscriptionPopup
                onClose={() => setShowSubscriptionPopup(false)}
                activeTabName={"addon"}
                showCloseButton={true}
                showAutopay={false}
                showSubscription={false}
                showAddon={true}
                title= {"Add Ons Plan "}
              />
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 sm:mt-10 flex flex-wrap justify-center items-center gap-4 md:gap-6 lg:gap-8">
          <div>
            <button
              onClick={() => setActiveTab("engagement")}
              className={`flex w-full max-w-xs sm:w-auto items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                activeTab === "engagement"
                  ? "bg-[#3131661A] border-pink-200 rounded-[12px]"
                  : "bg-gray-50 border-gray-200 opacity-60 hover:opacity-100"
              }`}
            >
              <div className="w-10 h-10 rounded-lg flex justify-center items-center">
                <img src="../assets/cus-1.png" alt="" />
              </div>

              <div>
                <div className="font-semibold text-slate-800 text-start">
                  Create Activity
                </div>
                <div className=" flex items-center justify-between">
                  <span className="text-xs text-gray-500 text-start  ">
                    Birthday and anniversary-based personalized offers.
                    <span className=" float-right">
                      <VideoPopupWithShare
                        video_url="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        buttonCss=" flex text-pink-500 items-center gap-2 whitespace-nowrap "
                      />
                    </span>
                  </span>
                </div>
              </div>
            </button>
          </div>

          <div>
            <button
              onClick={() => setActiveTab("campaign")}
              className={`flex w-full max-w-xs sm:w-auto items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                activeTab === "campaign"
                  ? "bg-[#3131661A] border-pink-200 rounded-[12px]"
                  : "bg-gray-50 border-gray-200 opacity-60 hover:opacity-100"
              }`}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <img src="../assets/cus-2.png" alt="" />
              </div>
              <div>
                <div className="font-semibold text-slate-800 text-start">
                  Send Activity
                </div>
                <div className=" flex items-center justify-between">
                  <span className="text-xs text-gray-500 text-start">
                    Festival and region-specific campaign suggestions.
                    <span className=" float-right">
                      <VideoPopupWithShare
                        video_url="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        buttonCss=" flex text-pink-500  items-center gap-2 whitespace-nowrap "
                      />
                    </span>
                  </span>
                </div>
              </div>
            </button>
          </div>

          <div>
            <button
              onClick={() => setActiveTab("customer-recommendation")}
              className={`flex w-full max-w-xs sm:w-auto items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                activeTab === "customer-recommendation"
                  ? "bg-[#3131661A] border-pink-200 rounded-[12px]"
                  : "bg-gray-50 border-gray-200 opacity-60 hover:opacity-100"
              }`}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <img src="../assets/cus-3.png" alt="" />
              </div>
              <div>
                <div className="font-semibold text-slate-800 text-start">
                  Chats
                </div>
                <div className="text-xs text-gray-500 text-start">
                  Product suggestions based on behavior and stock.
                </div>
              </div>
            </button>
          </div>

          <div>
            <button
              onClick={() => setActiveTab("store-recommendation")}
              className={`flex w-full max-w-xs sm:w-auto items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                activeTab === "store-recommendation"
                  ? "bg-[#3131661A] border-pink-200 rounded-[12px]"
                  : "bg-gray-50 border-gray-200 opacity-60 hover:opacity-100"
              }`}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <img src="../assets/cus-4.png" alt="" />
              </div>
              <div>
                <div className="font-semibold text-slate-800 text-start">
                 Vadik Assistant 
                </div>
                <div className="text-xs text-gray-500 text-start">
                   Stock Management Suggestion
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "engagement" && <EngagementActivities />}
        {activeTab === "campaign" && <PersonalizationCampaign />}
        {/* {activeTab === "customer-recommendation" && <CustomerRecommendation />}
        {activeTab === "store-recommendation" && <StoreRecommendation />} */}
        {activeTab === "customer-recommendation" && <ComingSoon />}
        {activeTab === "store-recommendation" && <ComingSoon />}
      </div>
    </div>
  );
};

export default CustomerOpportunities;
