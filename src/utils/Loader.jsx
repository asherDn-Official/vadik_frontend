// components/Loader.jsx
import React from "react";

const Loader = ({ text = "Loading...", fullHeight = true, size = "md", variant = "primary" }) => {
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-4",
    lg: "w-16 h-16 border-4"
  };

  const colorClasses = {
    primary: "border-[#313166] text-[#313166]",
    white: "border-white text-white"
  };

  const selectedColors = colorClasses[variant] || colorClasses.primary;

  return (
    <div className={`flex flex-col items-center justify-center ${fullHeight ? 'h-full' : 'py-10'} space-y-4`}>
      <div className={`${sizeClasses[size] || sizeClasses.md} ${selectedColors.split(' ')[0]} border-t-transparent animate-spin rounded-full`}></div>
      <p className={`${size === 'sm' ? 'text-[10px]' : 'text-sm'} font-bold ${selectedColors.split(' ')[1]} animate-pulse`}>{text}</p>
    </div>
  );
};

export default Loader;
