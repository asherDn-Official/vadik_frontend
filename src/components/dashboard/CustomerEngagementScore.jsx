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
    <div className="dashboard-card flex h-full min-h-[210px] flex-col justify-between sm:min-h-[220px] lg:min-h-[210px] xl:min-h-[220px]">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start sm:gap-4">
        <div className="min-w-0">
          <h2 className="dashboard-card-title">
            Customer Engagement
          </h2>
        </div>

        {/* Percentage */}
        <div className="shrink-0 sm:text-right">
          <div className="text-4xl font-bold leading-none text-[#1F1C5C]">
            {loading ? "--" : hasData ? `${safeScore}%` : "--"}
          </div>

          <div className="mt-1 text-xs font-medium text-[#7E85A8]">
            Engagement Score
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="mt-6 lg:mt-5 xl:mt-6">
        <div
          className="
          relative h-4 overflow-hidden sm:h-5
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
        <div className="mt-3 flex justify-between text-xs font-medium text-[#7E85A8]">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:mt-4 lg:gap-3">
        {/* Responded */}
        <div className="dashboard-stat-panel">
          <div className="dashboard-stat-label">
            Responded Customers
          </div>

          <div className="dashboard-stat-value">
            {loading ? "--" : respondedCustomers ?? "--"}
          </div>
        </div>

        {/* Total */}
        <div className="dashboard-stat-panel">
          <div className="dashboard-stat-label">
            Total Customers
          </div>

          <div className="dashboard-stat-value">
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
