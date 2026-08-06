import { useState, useEffect } from "react";
import { Zap, LayoutTemplate, Target, Megaphone } from "lucide-react";
import TemplateDashboard from "../components/customerRhythm/TemplateDashboard";
import TemplateBuilder from "../components/customerRhythm/TemplateBuilder";
import SendCampaign from "../components/customerRhythm/SendCampaign";
import EngagementDashboard from "../components/customerRhythm/EngagementDashboard";
import RetentionRhythmAutomation from "../components/customerRhythm/RetentionRhythmAutomation";
import { useAuth } from "../context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import VideoPopupWithShare from "../components/common/VideoPopupWithShare";

const CustomerRhythm = () => {
  const { auth } = useAuth();
  const location = useLocation();
  const [soon, setSoon] = useState(null);
  const [activeSection, setActiveSection] = useState("templates");
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [templateToCopy, setTemplateToCopy] = useState(null);

  useEffect(() => {
    const loadComingSoonAnimation = async () => {
      try {
        const response = await fetch("/assets/Comingsoon.json");
        const contentType = response.headers.get("content-type") || "";

        if (!response.ok) {
          throw new Error(`Comingsoon.json failed with ${response.status}`);
        }

        if (!contentType.includes("application/json")) {
          throw new Error("Comingsoon.json did not return JSON");
        }

        setSoon(await response.json());
      } catch {
        setSoon(null);
      }
    };

    loadComingSoonAnimation();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get("section");
    if (section && ["templates", "send_campaign", "retention", "engagement"].includes(section)) {
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
              animationData={soon}
              buttonCss="flex items-center text-sm gap-2 px-4 py-2  text-gray-700 bg-white rounded  hover:text-gray-500"
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`min-h-0 flex-1 overflow-auto ${isCreatingTemplate ? '' : 'rounded-[24px] border border-gray-100 bg-white p-4 shadow-sm sm:p-5 lg:p-6'}`}>
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
