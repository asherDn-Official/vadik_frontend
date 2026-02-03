import React, { useEffect, useState } from "react";
import api from "../../api/apiconfig";

function OptInOptOut() {
  const [optIn, setOptIn] = useState(60);
  const [optOut, setOptOut] = useState(40);

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
    <div className="rounded-xl bg-white px-6 py-5 shadow-md border border-[#EEF1FF] h-[237px] flex flex-col justify-between">
      <h2 className="text-[20px] font-medium font-poppins text-[#1F1C5C] leading-[100%] mb-6">
        Opt-In/Opt-Out
      </h2>

      <div className="space-y-5">
        <div className="flex items-center gap-3 pr-4">
          <div className="relative flex-1 h-6 rounded-full bg-[#F2F4FF] overflow-hidden">
            <div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-[#B01D4B] via-[#E43274] to-[#FF5A8C]"
              style={{ width: `${optOut}%` }}
            />
          </div>
          <span className="text-[#E43274] font-poppins font-semibold text-[22px] min-w-[52px] text-right">
            {optOut.toFixed(0)}%
          </span>
        </div>

        <div className="flex items-center gap-3 pr-4">
          <div className="relative flex-1 h-7 rounded-full bg-[#EEF0FF] overflow-hidden">
            <div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-[#1F1C5C] via-[#1C1E8B] to-[#00007A]"
              style={{ width: `${optIn}%` }}
            />
          </div>
          <span className="text-[#1F1C5C] font-poppins font-semibold text-[22px] min-w-[52px] text-right">
            {optIn.toFixed(0)}%
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6 text-sm font-medium">
        <div className="flex items-center gap-2 text-[#1F1C5C]">
          <span className="h-3 w-3 rounded-full bg-[#1F1C5C]"></span>
          Opt-In
        </div>
        <div className="flex items-center gap-2 text-[#E43274]">
          <span className="h-3 w-3 rounded-full bg-[#E43274]"></span>
          Opt-Out
        </div>
      </div>
    </div>
  );
}

export default OptInOptOut;
