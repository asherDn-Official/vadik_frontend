import { useEffect, useState } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import api from "../../api/apiconfig";

function CustomerSatisfactionScore() {
  const [starCount, setStarCount] = useState(0);
  const [customers, setCustomers] = useState(0);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const response = await api.get(
          "api/dashboard/customerSatifactionScore",
        );
        const data = response.data;
        console.log("data of customer retension rate", data);
        setCustomers(data.data.user_ratings_total);
        setStarCount(data.data.rating);
      } catch (error) {
        console.log("error", error);
      }
    };
    fetchCustomerData();
  }, []);

  const safeStarCount = Number.isFinite(starCount)
    ? Math.min(Math.max(starCount, 0), 5)
    : 0;

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(safeStarCount);
    const hasHalfStar = safeStarCount % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <FaStar
            key={i}
            className="text-[#F5B301]
drop-shadow-[0_2px_8px_rgba(245,179,1,0.35)] text-[22px] sm:text-[26px]"
          />,
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <FaStarHalfAlt
            key={i}
            className="text-[#F5B301]
drop-shadow-[0_2px_8px_rgba(245,179,1,0.35)] text-[22px] sm:text-[26px]"
          />,
        );
      } else {
        stars.push(
          <FaRegStar
            key={i}
            className="text-[#F5B301]
drop-shadow-[0_2px_8px_rgba(245,179,1,0.35)] text-[22px] sm:text-[25px]"
          />,
        );
      }
    }
    return stars;
  };

  return (
    <div className="dashboard-card flex h-full min-h-[240px] flex-col justify-between sm:min-h-[280px] lg:min-h-[220px] xl:min-h-[250px]">
      {/* Header */}
      <div>
        <h2 className="dashboard-card-title">
          Customer Satisfaction
        </h2>
      </div>

      {/* Main Rating Section */}
      <div className="flex flex-col items-center justify-center py-4 lg:py-3 xl:py-5">
        {/* Rating */}
        <div className="text-5xl font-bold leading-none text-[#1F1C5C] sm:text-[54px] lg:text-[42px] xl:text-[50px]">
          {safeStarCount}
        </div>

        {/* Stars */}
        <div className="mt-3 flex items-center gap-1">
          {renderStars()}
        </div>

        {/* Customer Count */}
        <p className="mt-3 text-center text-sm font-medium leading-5 text-[#7E85A8]">
          Based on {customers} customer reviews
        </p>
      </div>

      {/* Footer Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Satisfaction */}
        <div className="rounded-xl bg-[#FFF9EB] px-3 py-3 sm:px-4">
          <div className="text-xs font-medium uppercase tracking-wide text-[#A56F00]">
            Satisfaction
          </div>

          <div className="mt-2 truncate text-xl font-bold leading-none text-[#1F1C5C] sm:text-2xl">
            Excellent
          </div>
        </div>

        {/* Rating */}
        <div className="dashboard-stat-panel">
          <div className="text-xs font-medium uppercase tracking-wide text-[#8B90B2]">
            Average Rating
          </div>

          <div className="dashboard-stat-value">
            {safeStarCount}/5
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerSatisfactionScore;
