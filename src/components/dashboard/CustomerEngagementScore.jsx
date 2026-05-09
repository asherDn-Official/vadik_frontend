import { useEffect, useState } from "react";
import api from "../../api/apiconfig"; // <-- Make sure your axios instance is here
import { Tooltip as ReactTooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

function CustomerEngagementScore() {
  const [score, setScore] = useState(68); // default mock percentage
  const [totalCustomers, setTotalCustomers] = useState(120); // mock
  const [respondedCustomers, setRespondedCustomers] = useState(80); // mock

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchEngagement = async () => {
        try {
          const res = await api.get(
            "api/performanceTracking/customerEngagementScore",
          );
          const data = res.data;
          setScore(data.engagementPercentage ?? 0);
          setTotalCustomers(data.totalCustomers ?? 0);
          setRespondedCustomers(data.respondedCustomers ?? 0);
        } catch (err) {
          console.error("Error fetching engagement score:", err);
          setScore(0);
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

  return (
    <div className="dashboard-card flex min-h-[230px] flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start sm:gap-4">
        <div className="min-w-0">
          <h2 className="dashboard-card-title">
            Customer Engagement
          </h2>

          <p className="dashboard-card-description">
            Customer interaction and response analytics
          </p>
        </div>

        {/* Percentage */}
        <div className="shrink-0 sm:text-right">
          <div className="text-4xl font-bold leading-none text-[#1F1C5C]">
            {loading ? "--" : `${safeScore}%`}
          </div>

          <div className="mt-1 text-xs font-medium text-[#7E85A8]">
            Engagement Score
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="mt-7">
        <div
          className="
          relative h-4 overflow-hidden sm:h-5
          rounded-full bg-[#EEF1FF]
        "
          data-tooltip-id="engagementTooltip"
          data-tooltip-content={`${respondedCustomers} of ${totalCustomers} customers responded`}
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
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {/* Responded */}
        <div className="dashboard-stat-panel">
          <div className="dashboard-stat-label">
            Responded Customers
          </div>

          <div className="dashboard-stat-value">
            {loading ? "--" : respondedCustomers}
          </div>
        </div>

        {/* Total */}
        <div className="dashboard-stat-panel">
          <div className="dashboard-stat-label">
            Total Customers
          </div>

          <div className="dashboard-stat-value">
            {loading ? "--" : totalCustomers}
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
