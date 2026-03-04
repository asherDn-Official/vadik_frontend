import React, { useState } from "react";
import { Zap, LayoutTemplate, Target, Megaphone, Send } from "lucide-react";
import TemplateDashboard from "../components/customerRhythm/TemplateDashboard";
import TemplateBuilder from "../components/customerRhythm/TemplateBuilder";
import CampaignManager from "../components/customerRhythm/CampaignManager";
import SendCampaign from "../components/customerRhythm/SendCampaign";
import EngagementDashboard from "../components/customerRhythm/EngagementDashboard";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const CustomerRhythm = () => {
  const { auth } = useAuth();
  const [activeSection, setActiveSection] = useState("templates");
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);

  if (!auth?.data?.isUsingOwnWhatsapp) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex flex-col h-full bg-[#F4F5F9]">
      {/* Top Header with Section Options */}
      {!isCreatingTemplate && (
        <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Zap className="text-[#313166] w-6 h-6" />
            <h1 className="text-xl font-bold text-[#313166]">Customer Rhythm</h1>
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner overflow-x-auto">
            <button
              onClick={() => setActiveSection("templates")}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeSection === "templates"
                  ? "bg-white text-[#313166] shadow-md"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <LayoutTemplate size={18} />
              Templates
            </button>
            <button
              onClick={() => setActiveSection("campaign")}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeSection === "campaign"
                  ? "bg-white text-[#313166] shadow-md"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Megaphone size={18} />
              Campaigns
            </button>
            <button
              onClick={() => setActiveSection("send_template")}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeSection === "send_template"
                  ? "bg-white text-[#313166] shadow-md"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Send size={18} />
              Send Template
            </button>
            <button
              onClick={() => setActiveSection("send_campaign")}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
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
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeSection === "automation"
                  ? "bg-white text-[#313166] shadow-md"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Zap size={18} />
              Automation
            </button>
            <button
              onClick={() => setActiveSection("engagement")}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeSection === "engagement"
                  ? "bg-white text-[#313166] shadow-md"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Target size={18} />
              Engagement
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 overflow-auto ${isCreatingTemplate ? '' : 'p-6'}`}>
        {activeSection === "templates" && (
          isCreatingTemplate ? (
            <TemplateBuilder 
              onCancel={() => setIsCreatingTemplate(false)} 
              onSuccess={() => setIsCreatingTemplate(false)}
            />
          ) : (
            <TemplateDashboard onCreateNew={() => setIsCreatingTemplate(true)} />
          )
        )}

        {activeSection === "campaign" && (
          <CampaignManager />
        )}

        {activeSection === "send_template" && (
          <SendCampaign initialMode="direct" />
        )}

        {activeSection === "send_campaign" && (
          <SendCampaign initialMode="saved" />
        )}

        {activeSection === "automation" && (
          <div className="flex flex-col items-center justify-center h-full p-12 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
            <div className="p-4 bg-gray-50 rounded-full mb-6">
              <Zap size={48} className="text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Workflow Automation</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              Design intelligent message sequences that trigger based on customer behavior.
            </p>
            <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold">Coming Soon</span>
          </div>
        )}

        {activeSection === "engagement" && (
          <EngagementDashboard />
        )}
      </div>
    </div>
  );
};

export default CustomerRhythm;
