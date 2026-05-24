import { useEffect, useState } from "react";
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

  const safeOptIn = Number.isFinite(optIn)
    ? Math.min(Math.max(optIn, 0), 100)
    : 0;
  const safeOptOut = Number.isFinite(optOut)
    ? Math.min(Math.max(optOut, 0), 100)
    : 0;

  return (
    <div className="dashboard-card flex h-full min-h-[260px] flex-col justify-between sm:min-h-[280px]">
      {/* Header */}
      <div>
        <h2 className="dashboard-card-title">
          Customer Loyalty
        </h2>

        <p className="dashboard-card-description">
          Loyalty and disengagement customer analytics
        </p>
      </div>

      {/* Loyal Customers */}
      <div className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#1F1C5C]" />

            <span className="truncate text-sm font-medium text-[#1F1C5C]">
              Loyal Customers
            </span>
          </div>

          <span className="ml-3 text-2xl font-bold leading-none text-[#1F1C5C] sm:text-[28px]">
            {loading ? "--" : `${safeOptIn.toFixed(0)}%`}
          </span>
        </div>

        <div className="relative h-4 overflow-hidden rounded-full bg-[#EEF1FF] sm:h-5">
          <div
            className="
            absolute left-0 top-0 h-full rounded-full
            bg-gradient-to-r
            from-[#1F1C5C]
            via-[#1C1E8B]
            to-[#00007A]
            shadow-[0_0_20px_rgba(28,30,139,0.35)]
            transition-all duration-700 ease-out
          "
            style={{ width: `${safeOptIn}%` }}
          />

          {/* Shine */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </div>

      {/* Non Loyal Customers */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#E43274]" />

            <span className="truncate text-sm font-medium text-[#E43274]">
              Non Loyal Customers
            </span>
          </div>

          <span className="ml-3 text-2xl font-bold leading-none text-[#E43274] sm:text-[28px]">
            {loading ? "--" : `${safeOptOut.toFixed(0)}%`}
          </span>
        </div>

        <div className="relative h-4 overflow-hidden rounded-full bg-[#FFF1F6] sm:h-5">
          <div
            className="
            absolute left-0 top-0 h-full rounded-full
            bg-gradient-to-r
            from-[#FF8DB6]
            via-[#E43274]
            to-[#C81E63]
            shadow-[0_0_20px_rgba(228,50,116,0.35)]
            transition-all duration-700 ease-out
          "
            style={{ width: `${safeOptOut}%` }}
          />

          {/* Shine */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </div>

      {/* Footer Analytics */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
        {/* Loyal Box */}
        <div className="dashboard-stat-panel">
          <div className="text-xs font-medium uppercase tracking-wide text-[#8B90B2]">
            Loyalty Score
          </div>

          <div className="dashboard-stat-value">
            {loading ? "--" : safeOptIn.toFixed(0)}
          </div>
        </div>

        {/* Risk Box */}
        <div className="rounded-xl bg-[#FFF5F8] px-3 py-3 sm:px-4">
          <div className="text-xs font-medium uppercase tracking-wide text-[#D85B8B]">
            Risk Score
          </div>

          <div className="mt-2 text-2xl font-bold leading-none text-[#E43274] sm:text-[28px]">
            {loading ? "--" : safeOptOut.toFixed(0)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OptInOptOut;
