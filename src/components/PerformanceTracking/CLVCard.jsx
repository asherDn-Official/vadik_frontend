import React from "react";

const CLVCard = ({ title, amount, subtitle, bgColor }) => {
  // Determine which icon to use based on background color
  const iconSrc =
    bgColor === "#FF961D"
      ? "../assets/mess-icon.png"
      : "../assets/mess-icon.png";

  return (
    <div
      className="rounded-lg p-6 text-white"
      style={{ backgroundColor: bgColor }}
    >
      <div className="flex items-center space-x-2 mb-4">
        <img src={iconSrc} alt="Icon" className="w-12 h-12" />
      </div>
      <div className="text-2xl font-bold mb-1">{amount}</div>
      <div className="text-sm opacity-90">{subtitle}</div>
    </div>
  );
};

export default CLVCard;
