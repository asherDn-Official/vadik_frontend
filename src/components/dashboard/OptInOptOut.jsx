import React from "react";

function OptInOptOut() {
  const optOut = 25;
  const optIn = 75;

  return (
    <div className="bg-white rounded-xl shadow-md px-5 py-4 ">
      {/* Title */}
      <h2 className="text-base font-semibold text-[#1D1B4F] mb-5">
        Opt-In/Opt-Out
      </h2>

      {/* Opt-out */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-[#7B1D39] to-[#EF4C7D]"
            style={{ width: `${optOut}%` }}
          />
        </div>
        <span className="text-[#EF4C7D] text-sm font-bold">{optOut}%</span>
      </div>

      {/* Opt-in */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-[#1D1B4F] to-[#000076]"
            style={{ width: `${optIn}%` }}
          />
        </div>
        <span className="text-[#1D1B4F] text-sm font-bold">{optIn}%</span>
      </div>

      {/* Legend */}
      <div className="flex justify-start gap-6 pt-1">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[#1D1B4F]"></span>
          <span className="text-xs text-[#1D1B4F]">Opt-in</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[#EF4C7D]"></span>
          <span className="text-xs text-[#EF4C7D]">Opt-out</span>
        </div>
      </div>
    </div>
  );
}

export default OptInOptOut;
