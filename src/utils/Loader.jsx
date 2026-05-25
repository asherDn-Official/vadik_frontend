// components/Loader.jsx
import React from "react";

const Loader = ({ text = "Loading...", fullHeight = true, size = "md" }) => {
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-4",
    lg: "w-16 h-16 border-4"
  };

  return (
    <div className={`flex flex-col items-center justify-center ${fullHeight ? 'h-full' : 'py-10'} space-y-4`}>
      <div className={`${sizeClasses[size] || sizeClasses.md} border-[#313166] border-t-transparent animate-spin rounded-full`}></div>
      <p className={`${size === 'sm' ? 'text-[10px]' : 'text-sm'} font-bold text-[#313166] animate-pulse`}>{text}</p>
    </div>
  );
};

export default Loader;
