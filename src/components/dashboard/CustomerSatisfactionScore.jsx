import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

function CustomerSatisfactionScore() {
  const score = 4.5;
  const totalCustomers = 1500;

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(score);
    const hasHalfStar = score % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400 text-xl" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400 text-xl" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400 text-xl" />);
      }
    }

    return stars;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4  h-[160px] flex flex-col justify-between">
      <h2 className="text-sm font-semibold text-[#313166]">Customer Satisfaction Score</h2>

      <div className="flex flex-col items-center justify-center flex-1">
        <div className="text-3xl font-bold text-[#313166] mb-1">{score}</div>

        <div className="flex gap-1 mb-1">
          {renderStars()}
        </div>

        <p className="text-xs text-[#313166] opacity-70">({totalCustomers} Customers)</p>
      </div>
    </div>
  );
}

export default CustomerSatisfactionScore;
