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
        stars.push(<FaStar key={i} className="text-yellow-400 text-2xl" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400 text-2xl" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400 text-2xl" />);
      }
    }
    
    return stars;
  };

  return (
    <div className="dashboard-card h-full flex flex-col">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Customer Satisfaction Score</h2>
      
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-5xl font-bold text-indigo-900 mb-4">{score}</div>
        
        <div className="flex gap-2 mb-2">
          {renderStars()}
        </div>
        
        <p className="text-sm text-gray-500">({totalCustomers} Customers)</p>
      </div>
    </div>
  );
}

export default CustomerSatisfactionScore;