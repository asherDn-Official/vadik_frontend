import React from "react";
import { MessageSquare } from "lucide-react";

const CLVCard = ({ title, amount, subtitle, bgColor }) => {
  return (
    <div className={`${bgColor} rounded-lg p-6 text-white`}>
      <div className="flex items-center space-x-2 mb-4">
        <MessageSquare className="w-5 h-5" />
      </div>
      <div className="text-2xl font-bold mb-1">{amount}</div>
      <div className="text-sm opacity-90">{subtitle}</div>
    </div>
  );
};

export default CLVCard;
