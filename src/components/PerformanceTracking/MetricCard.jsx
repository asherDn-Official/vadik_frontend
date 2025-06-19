import React from "react";
import { DivideIcon as LucideIcon } from "lucide-react";

const MetricCard = ({ value, subtitle, icon: Icon, iconColor, bgColor }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="flex items-center space-x-4 ">
        <div className={`p-3 rounded-xl ${bgColor} flex-shrink-0`}>
          <Icon size={24} className={iconColor} />
        </div>
        <div className="flex-1">
          <div className="text-[26px] font-[500] text-[#313166] mb-1">
            {value}
          </div>
          <p className="text-sm text-[#313166BF] font-medium">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
