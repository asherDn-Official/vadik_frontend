import React, { useState } from "react";
import PersonalizationCampaign from "../components/customeroppertunites/PersonalizationCampaign";
import CustomerRecommendation from "../components/customeroppertunites/CustomerRecommendation";
import StoreRecommendation from "../components/customeroppertunites/StoreRecommendation";
import EngagementActivities from "../components/customeroppertunites/EngagementActivities";

const CustomerOpportunities = () => {
  const [activeTab, setActiveTab] = useState("engagement");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Customer Opportunities
          </h1>
          <p className="text-gray-600 ">
            This smart chatbot suggests the right offers to the right customers
            <br />
            at the right time using intelligent triggers.
          </p>
        </div>

        {/* Tabs */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 md:gap-6 lg:gap-8">
          <button
            onClick={() => setActiveTab("engagement")}
            className={`flex w-full max-w-xs sm:w-auto items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              activeTab === "engagement"
                ? "bg-[#3131661A] border-pink-200 rounded-[12px]"
                : "bg-gray-50 border-gray-200 opacity-60 hover:opacity-100"
            }`}
          >
            <div className="w-8 h-8 rounded-lg flex justify-center items-center">
              <img src="../assets/cus-1.png" alt="" />
            </div>
            <div>
              <div className="font-semibold text-slate-800 text-start">
                Personalization engagement
              </div>
              <div className="text-xs text-gray-500 text-start">
                Birthday and anniversary-based personalized offers.
              </div>
            </div>
          </button>

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
                Personalization Activities
              </div>
              <div className="text-xs text-gray-500 text-start">
                Festival and region-specific campaign suggestions.
              </div>
            </div>
          </button>

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
                Customer Recommendation
              </div>
              <div className="text-xs text-gray-500 text-start">
                Product suggestions based on behavior and stock.
              </div>
            </div>
          </button>

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
                Store recommendation
              </div>
              <div className="text-xs text-gray-500 text-start">
                Retailer Stock Management Suggestion
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "engagement" && <EngagementActivities />}
        {activeTab === "campaign" && <PersonalizationCampaign />}
        {activeTab === "customer-recommendation" && <CustomerRecommendation />}
        {activeTab === "store-recommendation" && <StoreRecommendation />}
      </div>
    </div>
  );
};

export default CustomerOpportunities;