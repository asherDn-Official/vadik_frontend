import { useEffect, useState } from "react";
import api from "../../api/apiconfig"; // <-- Make sure your axios instance is here
import { Tooltip as ReactTooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

function CustomerEngagementScore() {
  const [score, setScore] = useState(null);
  const [totalCustomers, setTotalCustomers] = useState(null);
  const [respondedCustomers, setRespondedCustomers] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchEngagement = async () => {
        try {
          const res = await api.get(
            "api/performanceTracking/customerEngagementScore",
          );
          const data = res.data;
          setScore(
            Number.isFinite(Number(data.engagementPercentage))
              ? Number(data.engagementPercentage)
              : 0,
          );
          setTotalCustomers(
            Number.isFinite(Number(data.totalCustomers))
              ? Number(data.totalCustomers)
              : 0,
          );
          setRespondedCustomers(
            Number.isFinite(Number(data.respondedCustomers))
              ? Number(data.respondedCustomers)
              : 0,
          );
        } catch (err) {
          console.error("Error fetching engagement score:", err);
          setScore(null);
          setTotalCustomers(null);
          setRespondedCustomers(null);
        } finally {
          setLoading(false);
        }
      };

      fetchEngagement();
    }, 1000); // 1 second delay

    return () => clearTimeout(timer);
  }, []);

  const safeScore = Number.isFinite(score)
    ? Math.min(Math.max(score, 0), 100)
    : 0;
  const hasData = !loading && score !== null;
  const tooltipContent =
    respondedCustomers !== null && totalCustomers !== null
      ? `${respondedCustomers} of ${totalCustomers} customers responded`
      : "No engagement data available";

  return (
    <div className="dashboard-card flex h-full min-h-[260px] flex-col justify-between sm:min-h-[280px] xl:min-h-[300px]">
      {/* Header */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:gap-4">
        <div className="min-w-0">
          <h2 className="dashboard-card-title">
            Customer Engagement
          </h2>
        </div>

        {/* Percentage */}
        <div className="min-w-[92px] shrink-0 rounded-2xl bg-[#F7F8FE] px-3 py-2 text-right sm:min-w-[104px] sm:px-4">
          <div className="text-[1.8rem] font-bold leading-none tracking-[-0.04em] text-[#1F1C5C] sm:text-[2rem] xl:text-[2.15rem]">
            {loading ? "--" : hasData ? `${safeScore}%` : "--"}
          </div>

          <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7E85A8] sm:text-[11px]">
            Score
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="mt-5">
        <div
          className="
          relative h-3.5 overflow-hidden sm:h-4
          rounded-full bg-[#EEF1FF]
        "
          data-tooltip-id="engagementTooltip"
          data-tooltip-content={tooltipContent}
        >
          {/* Progress Glow */}
          <div
            className="
            absolute left-0 top-0 h-full
            rounded-full
            bg-gradient-to-r
            from-[#FF9AC2]
            via-[#E9357B]
            to-[#C81E63]
            transition-all duration-700 ease-out
            shadow-[0_0_20px_rgba(233,53,123,0.35)]
          "
            style={{ width: `${safeScore}%` }}
          />

          {/* Shine Effect */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
        </div>

        {/* Scale Labels */}
        <div className="mt-2.5 flex justify-between text-[11px] font-semibold text-[#98A0C1]">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="mt-auto grid grid-cols-2 gap-3 pt-5 sm:gap-4">
        {/* Responded */}
        <div className="dashboard-stat-panel flex min-h-[92px] flex-col justify-between">
          <div className="text-sm font-medium leading-5 text-[#4C5685]">
            Responded Customers
          </div>

          <div className="mt-2 text-[2rem] font-bold leading-none tracking-[-0.04em] text-[#1F1C5C] sm:text-[2.15rem]">
            {loading ? "--" : respondedCustomers ?? "--"}
          </div>
        </div>

        {/* Total */}
        <div className="dashboard-stat-panel flex min-h-[92px] flex-col justify-between">
          <div className="text-sm font-medium leading-5 text-[#4C5685]">
            Total Customers
          </div>

          <div className="mt-2 text-[2rem] font-bold leading-none tracking-[-0.04em] text-[#1F1C5C] sm:text-[2.15rem]">
            {loading ? "--" : totalCustomers ?? "--"}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      <ReactTooltip
        id="engagementTooltip"
        place="top"
        style={{
          backgroundColor: "#1F1C5C",
          borderRadius: "12px",
          padding: "10px 14px",
          fontSize: "13px",
        }}
      />
    </div>
  );
}

export default CustomerEngagementScore;
