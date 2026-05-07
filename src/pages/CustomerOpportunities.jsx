// src/pages/CustomerOpportunities.jsx
/* eslint-disable react/prop-types */

import { useRef, useState } from "react";
import PersonalizationCampaign from "../components/customeroppertunites/PersonalizationCampaign";
import EngagementActivities from "../components/customeroppertunites/EngagementActivities";
import VideoPopupWithShare from "../components/common/VideoPopupWithShare";
import ComingSoon from "../components/common/ComingSoon";
import Campaign from "../components/customeroppertunites/Campaign";
import SubscriptionPopup from "../components/settings/subscription/SubscriptionPopup";
import Coupon from "../components/settings/Coupon";
import LoyaltyPoint from "../components/settings/LoyaltyPoint";
import { LuTicketPercent } from "react-icons/lu";
import { FaCoins } from "react-icons/fa";
import { Info, PlayCircle, Send, Sparkles } from "lucide-react";
import PerformanceTracking from "./PerformanceTracking";

const CustomerOpportunities = () => {
  const [activeTab, setActiveTab] = useState("engagement");
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);

  const handleUpdatePlan = () => {
    setShowSubscriptionPopup((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-[#F6F7FB]">
      {/* Header Section */}
      <div className="px-4 md:px-6 xl:px-8 py-5">
        <div className="relative overflow-visible bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-6 max-w-7xl mx-auto">
          {/* Top Header */}
          <div className="text-center max-w-4xl mx-auto mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-[#313166]">
              Customer Activity
            </h1>

            <p className="text-gray-500 mt-4 text-sm md:text-base leading-relaxed">
              Create campaigns, engagement activities, loyalty rewards, and
              customer interaction workflows from one place.
            </p>

            <div className="mt-6 flex justify-center">
              <Campaign onUpdatePlan={handleUpdatePlan} />

              {showSubscriptionPopup && (
                <SubscriptionPopup
                  onClose={() => setShowSubscriptionPopup(false)}
                  activeTabName={"addon"}
                  showCloseButton={true}
                  showAutopay={false}
                  showSubscription={false}
                  showAddon={true}
                  title={"Add Ons Plan "}
                />
              )}
            </div>
          </div>

          {/* Top Navigation Tabs */}
          <div className="relative z-20 max-w-6xl mx-auto overflow-visible">
            <div className="flex justify-center overflow-visible">
              <div className="flex max-w-full flex-wrap items-center justify-center gap-1 overflow-visible rounded-xl bg-gray-100 p-1 shadow-inner">
                <TopTab
                  active={activeTab === "engagement"}
                  onClick={() => setActiveTab("engagement")}
                  icon={<Sparkles size={18} />}
                  title="Create Activity"
                  description="Build quizzes, scratch cards, and spin wheel campaigns to increase customer interaction."
                  video={true}
                />

                <TopTab
                  active={activeTab === "campaign"}
                  onClick={() => setActiveTab("campaign")}
                  icon={<Send size={18} />}
                  title="Send Activity"
                  description="Launch WhatsApp campaigns and engagement workflows."
                  video={true}
                />

                {/* <TopTab
                  active={activeTab === "customer-recommendation"}
                  onClick={() => setActiveTab("customer-recommendation")}
                  icon={<Info size={18} />}
                  title="Customer Recommendation"
                  description="Provide personalized product recommendations to customers based on their browsing and purchase history."
                  video={false}
                />

                <TopTab
                  active={activeTab === "store-recommendation"}
                  onClick={() => setActiveTab("store-recommendation")}
                  icon={<Info size={18} />}
                  title="Store Recommendation"
                  description="Offer personalized store recommendations to customers based on their location and preferences."
                  video={false}
                /> */}

                <TopTab
                  active={activeTab === "coupon"}
                  onClick={() => setActiveTab("coupon")}
                  icon={<LuTicketPercent size={18} />}
                  title="Coupons"
                  description="Create and manage promotional coupons to drive customer engagement."
                  video={false}
                />

                <TopTab
                  active={activeTab === "loyalty"}
                  onClick={() => setActiveTab("loyalty")}
                  icon={<FaCoins size={17} />}
                  title="Loyalty Points"
                  description="Manage loyalty points and rewards to increase customer retention."
                  video={false}
                />

                <TopTab
                  active={activeTab === "performanceTracking"}
                  onClick={() => setActiveTab("performanceTracking")}
                  icon={<FaCoins size={17} />}
                  title="Performance Tracking"
                  description="Monitor and analyze customer performance metrics."
                  video={false}
                />
              </div>
            </div>

            {/* Active Tab Description */}
            {/* <div className="mt-5 max-w-3xl mx-auto">
              <TabDescriptionCloud activeTab={activeTab} />
            </div> */}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-4 md:px-6 xl:px-8 pb-6">
        {activeTab === "engagement" && (
          <div className="max-w-7xl mx-auto">
            <EngagementActivities />
          </div>
        )}

        {activeTab === "campaign" && (
          <div className="max-w-7xl mx-auto">
            <PersonalizationCampaign />
          </div>
        )}

        {/* Future Ready */}
        {/* 
        {activeTab === "customer-recommendation" && (
          <CustomerRecommendation />
        )}

        {activeTab === "store-recommendation" && (
          <StoreRecommendation />
        )} 
        */}

        {activeTab === "customer-recommendation" && (
          <div className="max-w-7xl mx-auto">
            <ComingSoon />
          </div>
        )}

        {activeTab === "store-recommendation" && (
          <div className="max-w-7xl mx-auto">
            <ComingSoon />
          </div>
        )}

        {activeTab === "coupon" && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 md:p-6 max-w-7xl mx-auto">
            <Coupon />
          </div>
        )}

        {activeTab === "loyalty" && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 md:p-6 max-w-7xl mx-auto">
            <LoyaltyPoint />
          </div>
        )}

        {activeTab === "performanceTracking" && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 md:p-6 max-w-7xl mx-auto">
            <PerformanceTracking />
          </div>
        )}
      </div>
    </div>
  );
};

/* ========================================================= */
/* Reusable Tab Card */
/* ========================================================= */

const TopTab = ({ active, onClick, icon, title, description, video }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ left: 0, top: 0 });
  const tabRef = useRef(null);
  const hiddenVideoButtonRef = useRef(null);

  const openTooltip = () => {
    const rect = tabRef.current?.getBoundingClientRect();

    if (rect) {
      const tooltipWidth = Math.min(320, window.innerWidth - 48);
      const halfTooltipWidth = tooltipWidth / 2;
      const center = rect.left + rect.width / 2;

      setTooltipPosition({
        left: Math.min(
          Math.max(center, halfTooltipWidth + 24),
          window.innerWidth - halfTooltipWidth - 24,
        ),
        top: rect.bottom + 8,
      });
    }

    setShowTooltip(true);
  };

  return (
    <div
      ref={tabRef}
      className={`relative flex items-center gap-2 rounded-lg px-3 py-2 transition-all whitespace-nowrap sm:px-4 ${
        active
          ? "bg-white text-[#313166] shadow-md"
          : "text-gray-500 hover:text-gray-700"
      }`}
      onMouseEnter={openTooltip}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        onClick={onClick}
        className="flex items-center gap-2 text-xs font-medium"
      >
        {icon}
        {title}
      </button>

      <button
        type="button"
        aria-label={`${title} details`}
        onClick={(event) => {
          event.stopPropagation();
          if (showTooltip) {
            setShowTooltip(false);
          } else {
            openTooltip();
          }
        }}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-100 hover:text-[#EC396F]"
      >
        <Info size={14} />
      </button>

      <div
        style={{
          left: `${tooltipPosition.left}px`,
          top: `${tooltipPosition.top}px`,
        }}
        className={`fixed z-[9999] -translate-x-1/2 transition-all duration-200 ${
          showTooltip
            ? "visible translate-y-0 opacity-100"
            : "invisible translate-y-1 opacity-0"
        }`}
      >
        <div className="relative w-[min(320px,calc(100vw-48px))] rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-[0_10px_40px_rgba(0,0,0,0.14)]">
          <div className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-gray-100 bg-white" />

          <div className="flex items-start gap-3 w-full">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF1F5] text-[#EC396F]">
              {icon}
            </div>

            <div className="flex-1 min-w-0 overflow-hidden">
              <h4 className="text-[17px] font-semibold leading-tight text-[#313166] break-words">
                {title}
              </h4>

              <p
                className="
                  mt-2
                  text-sm
                  leading-relaxed
                  text-gray-500
                  break-words
                  whitespace-normal
                "
              >
                {description}
              </p>
            </div>
          </div>

          {video && (
            <div className="mt-5">
              <button
                onClick={() => {
                  hiddenVideoButtonRef.current
                    ?.querySelector("button")
                    ?.click();

                  setTimeout(() => {
                    setShowTooltip(false);
                  }, 150);
                }}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#EC396F] to-[#7C3AED] text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:opacity-95"
              >
                <PlayCircle size={18} />
                Watch Video
              </button>
            </div>
          )}
        </div>
      </div>

      {video && (
        <div ref={hiddenVideoButtonRef} className="absolute left-0 top-0">
          <VideoPopupWithShare
            video_url="https://www.youtube.com/embed/dQw4w9WgXcQ"
            buttonCss="!absolute !m-0 !h-0 !w-0 !overflow-hidden !border-0 !p-0 !opacity-0"
          />
        </div>
      )}
    </div>
  );
};

export default CustomerOpportunities;
