import React, { useEffect, useState } from "react";
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
            "api/performanceTracking/customerEngagementScore"
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

  return (
    <div className="bg-white rounded-2xl shadow-sm pl-5 pr-8 pt-5 pb-5 h-[155px] flex flex-col justify-around">
      {/* Title */}
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-[20px] sm:text-[20px] font-medium text-[#1D1B4F] font-poppins leading-[114%]">
          Customer Engagement Score :
        </h2>
        {/* <button className="text-gray-400 hover:text-gray-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 sm:h-6 sm:w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button> */}
      </div>

      {/* Progress Bar and Score */}
      <div className="flex items-center gap-4">
        <div
          className="relative w-full h-5 sm:h-10 bg-gray-200 rounded-full overflow-hidden"
          data-tooltip-id="engagementTooltip"
          data-tooltip-content={`${respondedCustomers} of ${totalCustomers} customers responded`}
        >
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-pink-300 via-pink-500 to-pink-600 rounded-full transition-all duration-500"
            style={{ width: `${score}%` }}
          ></div>
        </div>

        <span className="text-2xl sm:text-3xl font-bold text-indigo-900">
          {loading ? "..." : `${score}%`}
        </span>
      </div>

      {/* Tooltip */}
      <ReactTooltip id="engagementTooltip" place="top" effect="solid" />
    </div>
  );
}

export default CustomerEngagementScore;
