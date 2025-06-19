import React from "react";
import { CreditCard } from "lucide-react";

const CLVCard = ({ amount, subtitle, bgColor, textColor }) => {
  return (
    <div className={`${bgColor} rounded-xl p-6 ${textColor} shadow-lg`}>
      <div className="flex items-center space-x-3 mb-3">
        <div className="p-2 bg-white bg-opacity-20 rounded-lg">
          <CreditCard size={20} />
        </div>
      </div>
      <div className="text-xl font-bold mb-1">{amount}</div>
      <div className="text-sm opacity-90">{subtitle}</div>
    </div>
  );
};

export default CLVCard;
