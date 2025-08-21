import React, { useState } from "react";
import Layout from "../components/common/Layout";
import SearchBar from "../components/integration/SearchBar";
import PlatformSection from "../components/integration/PlatformSection";
import { Plus } from "lucide-react";

const IntegrationPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const connectedPlatforms = [
    {
      title: "Google Place Review",
      icon: "./assets/whatsapp-icon.png",
      description:
        "Export customer context, quiz responses, and analytics directly to Google Sheets for comprehensive reporting and analysis.",
    },

  ];

  const campaignPlatforms = [
    {
      title: "G-Sheets",
      icon: "./assets/whatsapp-icon.png",
      description:
        "Export customer context, quiz responses, and analytics directly to Google Sheets for comprehensive reporting and analysis.",
    },
    {
      title: "WhatsApp",
      icon: "./assets/whatsapp-icon.png",
      description:
        "Enable automated customer communications and campaign notifications through WhatsApp Business API integration.",
    },
    {
      title: "Engage Bird",
      icon: "./assets/whatsapp-icon.png",
      description:
        "Streamline customer engagement with automated responses and personalized messaging activities.",
    },
    {
      title: "Meta",
      icon: "./assets/whatsapp-icon.png",
      description:
        "Connect with Facebook and Instagram audiences through targeted ads and automated social media activities.",
    },
    {
      title: "Quiz",
      icon: "./assets/whatsapp-icon.png",
      description:
        "Create interactive quizzes to gather customer insights and generate qualified leads through engaging assessments.",
    },
    {
      title: "Digital coupons",
      icon: "./assets/whatsapp-icon.png",
      description:
        "Generate and distribute digital vouchers to boost sales and track redemption rates in real-time.",
    },
    {
      title: "Fly-Wheel",
      icon: "./assets/whatsapp-icon.png",
      description:
        "Implement gamified loyalty programs with points, rewards, and tiered benefits to increase customer retention.",
    },
    {
      title: "Scratch Card",
      icon: "./assets/whatsapp-icon.png",
      description:
        "Deploy virtual scratch cards for instant rewards and promotional activities with guaranteed engagement.",
    },
  ];

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-[20px] font-[500] mb-2 text-[#313166]">
          Integrations
        </h1>
        <p className="text-[14px] font-[400] text-[#313166]">
          Effortless Integration for Seamless User Engagement and Automated
          Communication.
        </p>
      </div>

      <div className="flex justify-between items-center mb-8 border-b border-[#3131661A] pb-8">
        <div className="w-1/3">
          <SearchBar placeholder="Search here" onSearch={handleSearch} />
        </div>
        <button className="bg-[#db3b76] hover:bg-[#c73369] text-white px-4 py-2 rounded-[10px] flex items-center gap-2 transition-colors h-10">
          <Plus size={18} />
          <span>Add Integration</span>
        </button>
      </div>

      <PlatformSection
        title="Connected Platform"
        integrations={connectedPlatforms.filter((item) => {
          return (
            searchQuery === "" ||
            item.title.toLowerCase().includes(searchQuery.toLowerCase())
          );
        })}
      />

      <PlatformSection
        title="Activities Platform"
        integrations={campaignPlatforms.filter((item) => {
          return (
            searchQuery === "" ||
            item.title.toLowerCase().includes(searchQuery.toLowerCase())
          );
        })}
      />
    </div>
  );
};

export default IntegrationPage;
