import React from "react";
import { ArrowRight } from "lucide-react";

const IntegrationCard = ({ title, icon, description }) => {
  return (
    <div className="bg-white p-2 rounded-[12px] shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-2">
        <img src={icon} alt={title} className="w-4 h-4 object-contain" />
        <h3 className="font-[100] text-[2px] text-[#000000]">{title}</h3>
      </div>
      <p className="text-[10px] text-[#686880] mb-3 font-[400]">
        {description}
      </p>
      <button className="flex items-center gap-1 text-[8px] font-[400] text-[#00914D] bg-green-50 px-2 py-1 rounded-[3px] hover:bg-green-100 transition-colors">
        Integrate
        <ArrowRight size={10} />
      </button>
    </div>
  );
};

export default IntegrationCard;
