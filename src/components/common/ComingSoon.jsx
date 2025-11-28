import React from "react";
import { Clock } from "lucide-react"; // Optional icon (you can remove)

function ComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center h-[250px] text-center p-6">
      <Clock className="w-10 h-10 text-[#EF4C7D] mb-3" />

      <h2 className="text-xl font-semibold text-[#1D1B4F]">
        Coming Soon
      </h2>

      <p className="text-sm text-gray-500 mt-1 max-w-xs">
        This feature is currently under development. 
        Stay tuned!
      </p>
    </div>
  );
}

export default ComingSoon;
