import React from "react";
import MetricCard from "../components/PerformanceTracking/MetricCard";
import CampaignTable from "../components/PerformanceTracking/CampaignTable";
import ConversionChart from "../components/PerformanceTracking/ConversionChart";
import RevenueChart from "../components/PerformanceTracking/RevenueChart";
import CartValueCards from "../components/PerformanceTracking/CartValueCards";
import CLVCard from "../components/PerformanceTracking/CLVCard";
import CustomerTable from "../components/PerformanceTracking/CustomerTable";
import { Users, MessageSquare, Mouse, MessageCircle } from "lucide-react";

const PerformanceTracking: React.FC = () => {
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
            icon={Users}
            value="53%"
            label="Interaction Rate"
            iconColor="text-pink-600"
          />
          <MetricCard
            icon={MessageSquare}
            value="537"
            label="WhatsApp Opened"
            iconColor="text-green-600"
          />
          <MetricCard
            icon={Mouse}
            value="220"
            label="Click Rate"
            iconColor="text-orange-600"
          />
          <MetricCard
            icon={MessageCircle}
            value="124"
            label="Responded"
            iconColor="text-blue-600"
          />
        </div>

        {/* Second Row - Campaign Table & Conversion Chart */}
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
            <RevenueChart />
            <CartValueCards />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* CLV Cards */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Customer Lifetime Value (CLV)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CLVCard
                  title="Current Business"
                  amount="25,000,00.00"
                  subtitle="Current Business / year"
                  bgColor="bg-orange-500"
                />
                <CLVCard
                  title="Future Business"
                  amount="50,000,00.00"
                  subtitle="Future Business / year"
                  bgColor="bg-green-500"
                />
              </div>
            </div>

            {/* Customer Table */}
            <CustomerTable />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceTracking;
