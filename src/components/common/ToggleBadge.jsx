import { useState } from "react";

export default function ToggleBadge() {
  const [isLive, setIsLive] = useState(true);

  return (
    <div className="flex items-center justify-center">
      <div className="">
        <div className="relative inline-flex bg-gray-200 rounded-full shadow-inner">
          {/* Background indicator */}
          <div
            className={`
              absolute top-0.5 bottom-0.5 w-1/2 bg-white rounded-full shadow-md
              transition-transform duration-300 ease-in-out
              ${isLive ? 'transform translate-x-0' : 'transform translate-x-full'}
            `}
          />
          
          {/* Live Button */}
          <button
            onClick={() => setIsLive(true)}
            className={`
              relative z-10 px-4 py-1.5 rounded-full font-medium text-xs
              transition-all duration-300 ease-in-out min-w-16
              ${
                isLive
                  ? "text-green-600"
                  : "text-gray-600 hover:text-green-500"
              }
            `}
          >
            <span className="flex items-center justify-center space-x-1">
              <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span>LIVE</span>
            </span>
          </button>
          
          {/* Demo Button */}
          <button
            onClick={() => setIsLive(false)}
            className={`
              relative z-10 px-4 py-1.5 rounded-full font-medium text-xs
              transition-all duration-300 ease-in-out min-w-16
              ${
                !isLive
                  ? "text-red-600"
                  : "text-gray-600 hover:text-red-500"
              }
            `}
          >
            <span className="flex items-center justify-center space-x-1">
              <div className={`w-1.5 h-1.5 rounded-full ${!isLive ? 'bg-red-500' : 'bg-gray-400'}`}></div>
              <span>DEMO</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}