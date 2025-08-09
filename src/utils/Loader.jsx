// components/Loader.jsx
import React from "react";

const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="w-12 h-12 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
      <p className="mt-3 text-gray-600 animate-pulse">{text}</p>
    </div>
  );
};

export default Loader;
