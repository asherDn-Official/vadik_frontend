import { useEffect, useState } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import api from "../../api/apiconfig";

function CustomerSatisfactionScore() {
  const [starCount, setStarCount] = useState(0);
  const [customers, setCustomers] = useState(0);
  const score = 4.5;

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const response = await api.get(
          "api/dashboard/customerSatifactionScore"
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

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(starCount);
    const hasHalfStar = starCount % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400 text-4xl" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <FaStarHalfAlt key={i} className="text-yellow-400 text-4xl" />
        );
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400 text-3xl" />);
      }
    }
    return stars;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4  h-[237px] flex flex-col justify-between">
      <h2 className="text-[20px] text-center py-3 font-medium  text-[#313166] leading-[114%]">
        Customer Satisfaction Score
      </h2>

      <div className="flex flex-col items-center justify-center flex-1">
        <div className="text-[40px] font-medium  text-[#313166] leading-[114%] mb-1">
          {starCount}
        </div>

        <div className="flex gap-1 mb-1">{renderStars()}</div>

        <p className="text-[14px] font-normal font-poppins text-[#313166] leading-[114%] opacity-70">
          ({customers} Customers)
        </p>
      </div>
    </div>
  );
}

export default CustomerSatisfactionScore;
