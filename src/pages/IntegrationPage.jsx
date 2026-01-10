import React, { useState } from "react";
import { Plus, Search, CheckCircle, LinkIcon, ArrowRight } from "lucide-react";
import GooglePlaceReview from "../components/integration/GooglePlaceReview";
import WhatsAppIntegration from "../components/integration/WhatsAppIntegration";

// Mock components for demonstration
const FacebookIntegration = () => (
  <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-2xl font-semibold mb-4 text-[#313166]">
      Facebook Integration
    </h2>
    <p className="text-[#313166] mb-4">
      Manage your Facebook integration settings here.
    </p>
    <div className="bg-gray-100 p-4 rounded-lg">
      <h3 className="font-medium mb-2">Integration Details</h3>
      <p className="text-sm">Status: Connected</p>
      <p className="text-sm">Page: My Business Page</p>
    </div>
  </div>
);

const InstagramIntegration = () => (
  <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-2xl font-semibold mb-4 text-[#313166]">
      Instagram Integration
    </h2>
    <p className="text-[#313166] mb-4">
      Manage your Instagram integration settings here.
    </p>
    <div className="bg-gray-100 p-4 rounded-lg">
      <h3 className="font-medium mb-2">Integration Details</h3>
      <p className="text-sm">Status: Connected</p>
      <p className="text-sm">Account: @mybusiness</p>
    </div>
  </div>
);

const GSheetsIntegration = () => (
  <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-2xl font-semibold mb-4 text-[#313166]">
      Google Sheets Integration
    </h2>
    <p className="text-[#313166] mb-4">
      Manage your Google Sheets integration settings here.
    </p>
    <div className="bg-gray-100 p-4 rounded-lg">
      <h3 className="font-medium mb-2">Integration Details</h3>
      <p className="text-sm">Status: Integrated</p>
      <p className="text-sm">Spreadsheet: Customer Data</p>
    </div>
  </div>
);

const IntegrationDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState("list"); // 'list' or 'detail'
  const [selectedIntegration, setSelectedIntegration] = useState(null);

  const connectedPlatforms = [
    {
      title: "Google Place Review",
      icon: "./assets/whatsapp-icon.png",
      description:
        "Export customer context, quiz responses, and analytics directly to Google Sheets for comprehensive reporting and analysis.",
      status: "integrated",
      component: GooglePlaceReview,
    },
    {
      title: "WhatsApp",
      icon: "./assets/whatsapp-icon.png",
      description:
        "Enable automated customer communications and campaign notifications through WhatsApp Business API integration.",
      status: "integrated",
      component: WhatsAppIntegration,
      button: true,
    },
  ];

  const campaignPlatforms = [
    {
      title: "G-Sheets",
      icon: "./assets/whatsapp-icon.png",
      description:
        "Export customer context, quiz responses, and analytics directly to Google Sheets for comprehensive reporting and analysis.",
      status: "Comming soon",
      component: GSheetsIntegration,
      button: false,
    },
    {
      title: "Engage Bird",
      icon: "./assets/whatsapp-icon.png",
      description:
        "Streamline customer engagement with automated responses and personalized messaging activities.",
      status: "Comming soon",
      component: null, // No component defined for this
      button: false,
    },
    {
      title: "Meta",
      icon: "./assets/whatsapp-icon.png",
      description:
        "Connect with Facebook and Instagram audiences through targeted ads and automated social media activities.",
      status: "Comming soon",
      component: FacebookIntegration,
      button: false,
    },
    {
      title: "Quiz",
      icon: "./assets/whatsapp-icon.png",
      description:
        "Create interactive quizzes to gather customer insights and generate qualified leads through engaging assessments.",
       status: "Comming soon",
      component: null, // No component defined for this
      button: false,
    },
    {
      title: "Digital coupons",
      icon: "./assets/whatsapp-icon.png",
      description:
        "Generate and distribute digital vouchers to boost sales and track redemption rates in real-time.",
      status: "Comming soon",
      component: null, // No component defined for this
      button: false,
    },
    {
      title: "Fly-Wheel",
      icon: "./assets/whatsapp-icon.png",
      description:
        "Implement gamified loyalty programs with points, rewards, and tiered benefits to increase customer retention.",
      status: "Comming soon",
      component: null, // No component defined for this
      button: false,
    },
    {
      title: "Scratch Card",
      icon: "./assets/whatsapp-icon.png",
      description:
        "Deploy virtual scratch cards for instant rewards and promotional activities with guaranteed engagement.",
       status: "Comming soon",
      component: null, // No component defined for this
      button: false,
    },
  ];

  const IntegrationCard = ({
    title,
    icon,
    description,
    status,
    onClick,
    button,
  }) => {
    return (
      <div
        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
        onClick={onClick}
      >
        <div className="flex items-center gap-3 mb-3">
          <img src={icon} alt={title} className="w-8 h-8 object-contain" />
          <h3 className="font-medium  text-[#313166] flex-grow">{title}</h3>
          <div
            className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${
              status === "integrated"
                ? "text-green-700 bg-green-100"
                : "text-blue-700 bg-blue-100"
            }`}
          >
            {status === "integrated" ? (
              <CheckCircle size={12} className="mr-1" />
            ) : (
              <LinkIcon size={12} className="mr-1" />
            )}
            {status}
          </div>
        </div>
        <p className="text-sm text-[#313166] mb-4 leading-relaxed">
          {description}
        </p>
        <button
          disabled={!button}
          className={`flex items-center gap-1 text-xs font-medium text-[#db3b76] bg-[#f9e8ef] px-3 py-2 rounded-md transition-colors w-full justify-center ${
            button ? "hover:bg-[#f5d9e4]" : "opacity-50 cursor-not-allowed"
          }`}
        >
          {status === "integrated" ? "Manage" : "Integrate"}
          <ArrowRight size={14} />
        </button>
      </div>
    );
  };

  const PlatformSection = ({ title, integrations, onIntegrationClick }) => {
    return (
      <div className="mb-8 ">
        <h2 className="text-xl font-semibold mb-4 text-[#313166]">{title}</h2>
        {integrations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-2">
            {integrations.map((integration, index) => (
              <IntegrationCard
                key={index}
                title={integration.title}
                icon={integration.icon}
                description={integration.description}
                status={integration.status}
                button={
                  integration.button !== undefined ? integration.button : true
                }
                onClick={() => onIntegrationClick(integration)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center border border-dashed border-gray-300">
            <p className="text-gray-500">
              No integrations found matching your search.
            </p>
          </div>
        )}
      </div>
    );
  };

  const handleIntegrationClick = (integration) => {
    if (integration.component) {
      setSelectedIntegration(integration);
      setActiveView("detail");
    } else {
      // For integrations without a specific component, show the generic detail view
      setSelectedIntegration(integration);
      setActiveView("detail");
    }
  };

  const handleBackToList = () => {
    setActiveView("list");
    setSelectedIntegration(null);
  };

  const IntegrationDetail = ({ integration, onBack }) => {
    if (!integration) return null;

    // If there's a specific component for this integration, render it
    if (integration.component) {
      const IntegrationComponent = integration.component;
      return (
        <div>
          <button
            onClick={onBack}
            className="flex items-center text-sm text-gray-600 mb-6 hover:text-gray-800"
          >
            <ArrowRight size={16} className="rotate-180 mr-1" /> Back to
            integrations
          </button>
          <IntegrationComponent />
        </div>
      );
    }

    // Otherwise, render the generic detail view
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <button
          onClick={onBack}
          className="flex items-center text-sm text-gray-600 mb-6 hover:text-gray-800"
        >
          <ArrowRight size={16} className="rotate-180 mr-1" /> Back to
          integrations
        </button>

        <div className="flex items-center gap-3 mb-6">
          <img
            src={integration.icon}
            alt={integration.title}
            className="w-12 h-12 object-contain"
          />
          <div>
            <h2 className="text-2xl font-semibold text-[#313166]">
              {integration.title}
            </h2>
            <div
              className={`inline-flex items-center text-xs font-medium px-3 py-1 rounded-full mt-1 ${
                integration.status === "integrated"
                  ? "text-green-700 bg-green-100"
                  : "text-blue-700 bg-blue-100"
              }`}
            >
              {integration.status === "integrated" ? (
                <CheckCircle size={14} className="mr-1" />
              ) : (
                <LinkIcon size={14} className="mr-1" />
              )}
              {integration.status}
            </div>
          </div>
        </div>

        <p className="text-[#313166] mb-6 leading-relaxed">
          {integration.description}
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-[#313166] mb-2">
            About this integration
          </h3>
          <p className="text-sm text-[#313166]">
            This integration allows you to seamlessly connect your account with{" "}
            {integration.title} to enhance your workflow and improve
            productivity. You can manage settings, configure preferences, and
            monitor performance all in one place.
          </p>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 text-sm font-medium text-white bg-[#db3b76] px-4 py-2 rounded-md hover:bg-[#c73369] transition-colors">
            {integration.status === "integrated"
              ? "Manage Settings"
              : "Connect Now"}
            <ArrowRight size={16} />
          </button>
          <button className="text-sm font-medium text-[#313166] bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors">
            Learn More
          </button>
        </div>
      </div>
    );
  };

  if (activeView === "detail") {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <IntegrationDetail
            integration={selectedIntegration}
            onBack={handleBackToList}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-[20px] font-[500] mb-2 text-[#313166]">
          Integration Management
        </h1>
        <p className="text-[14px] font-[400] text-[#313166]">
          Effortless Integration for Seamless User Engagement and Automated
          Communication.
        </p>
      </div>

      <div className="flex justify-between items-center mb-8 border-b border-[#3131661A] pb-8">
        <div className="relative w-1/3">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search here"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#db3b76] focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {/* <button className="bg-[#db3b76] hover:bg-[#c73369] text-white px-4 py-2 rounded-[10px] flex items-center gap-2 transition-colors h-10">
          <Plus size={18} />
          <span>Add Integration</span>
        </button> */}
      </div>

      <PlatformSection
        title="Connected Platform"
        integrations={connectedPlatforms.filter((item) => {
          return (
            searchQuery === "" ||
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
          );
        })}
        onIntegrationClick={handleIntegrationClick}
      />

      <PlatformSection
        title="Activities Platform"
        integrations={campaignPlatforms.filter((item) => {
          return (
            searchQuery === "" ||
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
          );
        })}
        onIntegrationClick={handleIntegrationClick}
      />
    </div>
  );
};

export default IntegrationDashboard;
