import React from "react";
import IntegrationCard from "./IntegrationCard";

const PlatformSection = ({ title, integrations }) => {
  return (
    <div className="mb-8">
      <h2 className="text-[16px] font-[500] mb-4 text-[#313166]">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 pb-8 border-b border-[#3131661A]">
        {integrations.map((integration, index) => (
          <IntegrationCard
            key={index}
            title={integration.title}
            icon={integration.icon} // image path (string)
            description={integration.description}
          />
        ))}
      </div>
    </div>
  );
};

export default PlatformSection;
