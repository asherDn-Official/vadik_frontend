import React, { useEffect, useState } from "react";
import api from "../../api/apiconfig";

function OptInOptOut() {
const [optIn, setOptIn] = useState(60); // Mock opt-in %
const [optOut, setOptOut] = useState(40); // Mock opt-out %

  const [loading, setLoading] = useState(true);

useEffect(() => {
  const timer = setTimeout(() => {
    const fetchOptInOut = async () => {
      try {
        const res = await api.get("api/dashboard/optinOutRate");
        const optInValue = parseFloat(res.data.optInRate.replace("%", ""));
        const optOutValue = parseFloat(res.data.optOutRate.replace("%", ""));

        setOptIn(optInValue);
        setOptOut(optOutValue);
      } catch (error) {
        console.error("Error fetching opt-in/out data:", error);
        setOptIn(0);
        setOptOut(0);
      } finally {
        setLoading(false);
      }
    };

    fetchOptInOut();
  }, 1000); // Delay for 1 second

  return () => clearTimeout(timer); // Cleanup if component unmounts
}, []);


  return (
    <div className="bg-white rounded-xl shadow-md px-5 py-4">
      <h2 className="text-base font-semibold text-[#1D1B4F] mb-5">
        Opt-In/Opt-Out
      </h2>

      
        <>
          {/* Opt-out */}
          <div className="flex items-center gap-3 mb-3">
            <div className="relative flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-[#7B1D39] to-[#EF4C7D]"
                style={{ width: `${optOut}%` }}
              />
            </div>
            <span className="text-[#EF4C7D] text-sm font-bold">
              {optOut.toFixed(2)}%
            </span>
          </div>

          {/* Opt-in */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-[#1D1B4F] to-[#000076]"
                style={{ width: `${optIn}%` }}
              />
            </div>
            <span className="text-[#1D1B4F] text-sm font-bold">
              {optIn.toFixed(2)}%
            </span>
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
        </>
      
    </div>
  );
}

export default OptInOptOut;
