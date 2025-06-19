import React from "react";
import { DivideIcon as LucideIcon } from "lucide-react";

const MetricCard = ({ value, subtitle, icon: Icon, iconColor, bgColor }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-xl ${bgColor} flex-shrink-0`}>
          <Icon size={24} className={iconColor} />
        </div>
        <div className="flex-1">
          <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
          <p className="text-sm text-gray-600 font-medium">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
