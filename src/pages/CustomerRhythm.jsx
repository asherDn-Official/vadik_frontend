import { useState, useEffect } from "react";
import { Zap, LayoutTemplate, Target, Megaphone, MessageCircle } from "lucide-react";
import TemplateDashboard from "../components/customerRhythm/TemplateDashboard";
import TemplateBuilder from "../components/customerRhythm/TemplateBuilder";
import SendCampaign from "../components/customerRhythm/SendCampaign";
import EngagementDashboard from "../components/customerRhythm/EngagementDashboard";
import LiveChat from "../components/customerRhythm/LiveChat";
import RetentionRhythmAutomation from "../components/customerRhythm/RetentionRhythmAutomation";
import { useAuth } from "../context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import VideoPopupWithShare from "../components/common/VideoPopupWithShare";
import Template from "../components/settings/Template";

  const CustomerRhythm = () => {
  const { auth } = useAuth();
  const location = useLocation();
  const [soon, setSoon] = useState();
  const [activeSection, setActiveSection] = useState("live_chat");
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [templateToCopy, setTemplateToCopy] = useState(null);

  useEffect(() => {
    fetch("/assets/comingSoon.json")
      .then((res) => res.json())
      .then(setSoon)
      .catch(console.error);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get("section");
    if (section && ["templates", "send_campaign", "automation", "retention", "engagement", "live_chat"].includes(section)) {
      setActiveSection(section);
    }
  }, [location.search]);

  if (!auth?.data?.isUsingOwnWhatsapp) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="app-page">
      <div className="app-page-shell min-h-0">
      {/* Top Header with Section Options */}
      {!isCreatingTemplate && (
        <div className="sticky top-0 z-10 flex flex-col gap-4 rounded-[24px] border border-gray-100 bg-white px-4 py-4 shadow-sm sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          
          <div className="flex items-center gap-2 ">
            <Zap className="text-[#313166] w-6 h-6" />
            <h1 className="text-xl  font-semibold text-[#313166]">Customer Rhythm</h1>
          </div>
          
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="app-tabs-row rounded-xl bg-gray-100 p-1 shadow-inner">
              <button
                onClick={() => setActiveSection("live_chat")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  activeSection === "live_chat"
                    ? "bg-white text-[#313166] shadow-md"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <MessageCircle size={18} />
                Live Chat
              </button>
              <button
                onClick={() => setActiveSection("templates")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  activeSection === "templates"
                    ? "bg-white text-[#313166] shadow-md"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <LayoutTemplate size={18} />
                Templates
              </button>
              <button
                onClick={() => setActiveSection("send_campaign")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  activeSection === "send_campaign"
                    ? "bg-white text-[#313166] shadow-md"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Megaphone size={18} />
                Send Campaign
              </button>
              <button
                onClick={() => setActiveSection("automation")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  activeSection === "automation"
                    ? "bg-white text-[#313166] shadow-md"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Zap size={18} />
                Automation
              </button>
              <button
                onClick={() => setActiveSection("retention")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  activeSection === "retention"
                    ? "bg-white text-[#313166] shadow-md"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Target size={18} />
                Retention Rhythm
              </button>
              <button
                onClick={() => setActiveSection("engagement")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs  font-medium transition-all whitespace-nowrap ${
                  activeSection === "engagement"
                    ? "bg-white text-[#313166] shadow-md"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Target size={18} />
                Report
              </button>
            </div>
            <VideoPopupWithShare
              // video_url="https://www.youtube.com/embed/MzEFeIRJ0eQ?si=JGtmQtyRIt_K6Dt5"
              animationData={soon}
              buttonCss="flex items-center text-sm gap-2 px-4 py-2  text-gray-700 bg-white rounded  hover:text-gray-500"
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`min-h-0 flex-1 overflow-auto ${isCreatingTemplate ? '' : 'rounded-[24px] border border-gray-100 bg-white p-4 shadow-sm sm:p-5 lg:p-6'}`}>
        {activeSection === "live_chat" && (
          <LiveChat />
        )}
        {activeSection === "templates" && (
          isCreatingTemplate ? (
            <TemplateBuilder 
              initialTemplate={templateToCopy}
              onCancel={() => {
                setIsCreatingTemplate(false);
                setTemplateToCopy(null);
              }} 
              onSuccess={() => {
                setIsCreatingTemplate(false);
                setTemplateToCopy(null);
              }}
            />
          ) : (
            <TemplateDashboard 
              onCreateNew={() => {
                setTemplateToCopy(null);
                setIsCreatingTemplate(true);
              }}
              onCopyTemplate={(template) => {
                setTemplateToCopy(template);
                setIsCreatingTemplate(true);
              }}
            />
          )
        )}

        {activeSection === "send_campaign" && (
          <SendCampaign />
        )}

        {activeSection === "automation" && (
          <Template />
        )}

        {activeSection === "retention" && (
          <RetentionRhythmAutomation />
        )}

        {activeSection === "engagement" && (
          <EngagementDashboard />
        )}
      </div>
      </div>
    </div>
  );
};

export default CustomerRhythm;
