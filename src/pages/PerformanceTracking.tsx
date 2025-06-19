import React from "react";
import { User, MessageSquare, MousePointer, MessageCircle } from "lucide-react";
import MetricCard from "../components/PerformanceTracking/MetricCard";
import CampaignTable from "../components/PerformanceTracking/CampaignTable";
import ConversionChart from "../components/PerformanceTracking/ConversionChart";
import RevenueChart from "../components/PerformanceTracking/RevenueChart";
import CLVCard from "../components/PerformanceTracking/CLVCard";
import CustomerTable from "../components/PerformanceTracking/CustomerTable";
import CartValueCards from "../components/PerformanceTracking/CartValueCards";

// Mock API data - in real app, this would come from actual API calls
const mockData = {
  metrics: [
    {
      value: "53%",
      subtitle: "Interaction Rate",
      icon: User,
      iconColor: "text-pink-600",
      bgColor: "bg-pink-100",
    },
    {
      value: "537",
      subtitle: "WhatsApp Opened",
      icon: MessageSquare,
      iconColor: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      value: "220",
      subtitle: "Click Rate",
      icon: MousePointer,
      iconColor: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      value: "124",
      subtitle: "Responded",
      icon: MessageCircle,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ],
  campaigns: [
    {
      name: "Spin the Wheel",
      customers: 100,
      openRate: 74,
      clickRate: 62,
      responded: 30,
    },
    {
      name: "Quiz",
      customers: 120,
      openRate: 82,
      clickRate: 68,
      responded: 24,
    },
    {
      name: "Scratch Card",
      customers: 50,
      openRate: 38,
      clickRate: 24,
      responded: 12,
    },
  ],
  conversionRate: 40,
  revenueData: [
    { month: "Jan", value: 10 },
    { month: "Feb", value: 25 },
    { month: "Mar", value: 15 },
    { month: "Apr", value: 35 },
    { month: "May", value: 45 },
    { month: "Jun", value: 30 },
    { month: "Jul", value: 50 },
    { month: "Aug", value: 25 },
    { month: "Sep", value: 55 },
    { month: "Oct", value: 35 },
    { month: "Nov", value: 60 },
    { month: "Dec", value: 45 },
  ],
  revenue: {
    total: "$ 58,000.00",
    yesterdayChange: 20,
    monthChange: -20,
    yearChange: 20,
  },
  customers: [
    {
      name: "Srinivasan",
      currentValue: "₹24,600.00",
      futureValue: "₹80,000.00",
    },
    { name: "Chandru", currentValue: "₹24,600.00", futureValue: "₹80,000.00" },
    {
      name: "Srinivasan",
      currentValue: "₹24,600.00",
      futureValue: "₹80,000.00",
    },
    { name: "Chandru", currentValue: "₹24,600.00", futureValue: "₹80,000.00" },
    {
      name: "Srinivasan",
      currentValue: "₹24,600.00",
      futureValue: "₹80,000.00",
    },
    { name: "Chandru", currentValue: "₹24,600.00", futureValue: "₹80,000.00" },
    {
      name: "Srinivasan",
      currentValue: "₹24,600.00",
      futureValue: "₹80,000.00",
    },
  ],
  cartValue: {
    customerPercentage: 53,
    totalCustomers: 537,
    revenue: 537,
    avgTurnover: 220,
    avgTurnoverPerDay: 220,
    avgTurnoverPerCustomer: 124,
  },
};

const PerformanceTracking = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-[500] text-[#313166] mb-6">
        Performance Tracking
      </h1>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {mockData.metrics.map((metric, index) => (
          <MetricCard
            key={index}
            value={metric.value}
            subtitle={metric.subtitle}
            icon={metric.icon}
            iconColor={metric.iconColor}
            bgColor={metric.bgColor}
          />
        ))}
      </div>

      {/* Campaigns Table and Conversion Rate */}

      <div className="grid grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        <div className="lg:col-span-2">
          <CampaignTable campaigns={mockData.campaigns} />
        </div>
        <div>
          <ConversionChart percentage={mockData.conversionRate} />
        </div>
      </div>

      {/* Revenue Growth and CLV Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        <div className="lg:col-span-2">
          <RevenueChart
            data={mockData.revenueData}
            totalRevenue={mockData.revenue.total}
            yesterdayChange={mockData.revenue.yesterdayChange}
            monthChange={mockData.revenue.monthChange}
            yearChange={mockData.revenue.yearChange}
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Customer Lifetime Value (CLV)
          </h3>
          <div className="space-y-4">
            <CLVCard
              amount="25,000.00.00"
              subtitle="Current Business / year"
              bgColor="bg-orange-500"
              textColor="text-white"
            />
            <CLVCard
              amount="50,000.00.00"
              subtitle="Future Business / year"
              bgColor="bg-green-500"
              textColor="text-white"
            />
          </div>
        </div>
      </div>

      {/* Customer Table and Cart Value */}
      <div className="grid grid-cols-2 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          <CustomerTable customers={mockData.customers} />
        </div>
        <div>
          <CartValueCards data={mockData.cartValue} />
        </div>
      </div>
    </div>
  );
};

export default PerformanceTracking;
