import React, { useEffect, useState } from "react";
import MetricCard from "../components/PerformanceTracking/MetricCard";
import CampaignTable from "../components/PerformanceTracking/CampaignTable";
import ConversionChart from "../components/PerformanceTracking/ConversionChart";
import RevenueChart from "../components/PerformanceTracking/RevenueChart";
import CartValueCards from "../components/PerformanceTracking/CartValueCards";
import CLVCard from "../components/PerformanceTracking/CLVCard";
import CustomerTable from "../components/PerformanceTracking/CustomerTable";
import { Users, MessageSquare, Mouse, MessageCircle } from "lucide-react";
import api from "../api/apiconfig";
import { set } from "react-hook-form";
const PerformanceTracking: React.FC = () => {
  const [interactionRate, setInteractionRate] = useState(24); // %
  const [whatsappOpened, setWhatsappOpened] = useState(310);
  const [clickRate, setClickRate] = useState(18); // %
  const [responded, setResponded] = useState(14); // %

  const [currentYearValue, setCurrentYearValue] = useState(2500000);
  const [futureYearValue, setFutureYearValue] = useState(4000000);

  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchData = async () => {
        try {
          const response = await api.get(
            "api/performanceTracking/interactionRate"
          );
          setInteractionRate(response.data.interactionRate);
          setWhatsappOpened(response.data.totalWhatsAppOpened);
          setClickRate(response.data.clickRate);
          setResponded(response.data.responseRate);
        } catch (error) {
          console.error("Error fetching interaction data:", error);
        }
      };
      fetchData();
    }, 1000); // ⏱ 1-second delay

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Performance Tracking
          </h1>
        </div>

        {/* Top Row - 4 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            // icon={Users}
            icon="../assets/per-1.png" // Path to your PNG file
            value={interactionRate}
            label="Interaction Rate"
            iconColor="text-pink-600"
          />
          <MetricCard
            // icon={MessageSquare}
            icon="../assets/per-2.png" // Path to your PNG file
            value={whatsappOpened}
            label="WhatsApp Opened"
            iconColor="text-green-600"
          />
          <MetricCard
            // icon={Mouse}
            icon="../assets/per-3.png" // Path to your PNG file
            value={clickRate}
            label="Click Rate"
            iconColor="text-orange-600"
          />
          <MetricCard
            // icon={MessageCircle}
            icon="../assets/per-4.png" // Path to your PNG file
            value={responded}
            label="Responded"
            iconColor="text-blue-600"
          />
        </div>

        {/* Second Row - Activities Table & Conversion Chart */}
        <div className="grid grid-cols-2 lg:grid-cols-10 gap-6">
          {/* <div className="lg:col-span-7"> */}
          <CampaignTable />
          {/* </div> */}
          {/* <div className="lg:col-span-3"> */}
          <ConversionChart />
          {/* </div> */}
        </div>

        {/* Third Row - Revenue Growth & Cart Value | CLV Section */}
        <div className="grid grid-cols-2 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[10px]">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Customer Lifetime Value (CLV)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CLVCard
                  title="Current Business"
                  amount={currentYearValue}
                  subtitle="Current Business / year"
                  bgColor="#FF961D" // Orange
                />
                <CLVCard
                  title="Future Business"
                  amount={futureYearValue}
                  subtitle="Future Business / year"
                  bgColor="#48C471" // Green
                />
              </div>
            </div>
            {/* <RevenueChart /> */}
            <CartValueCards />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* CLV Cards */}
            {/* <div className="bg-white p-6 rounded-[10px]">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Customer Lifetime Value (CLV)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CLVCard
                  title="Current Business"
                  amount="25,000,00.00"
                  subtitle="Current Business / year"
                  bgColor="#FF961D" // Orange
                />
                <CLVCard
                  title="Future Business"
                  amount="50,000,00.00"
                  subtitle="Future Business / year"
                  bgColor="#48C471" // Green
                />
              </div>
            </div> */}

            {/* Customer Table */}
            <CustomerTable />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceTracking;
