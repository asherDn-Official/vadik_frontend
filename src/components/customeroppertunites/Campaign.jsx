import { X } from "lucide-react";
import { usePlan } from "../../context/PlanContext";

function Campaign({ onUpdatePlan, onClose }) {
  const { currentPlans } = usePlan();

  // Check if data exists before accessing
  if (!currentPlans?.data?.whatsappActivities) {
    return null;
  }

  const { used, allowed, remaining } = currentPlans.data.whatsappActivities;
  const totalCount = allowed;
  
  // Calculate percentage of remaining credits
  const remainingPercentage = totalCount > 0 ? (remaining / totalCount) * 100 : 0;
  
  // Determine color based on percentage
  const getRemainingColor = () => {
    if (remainingPercentage >= 80) {
      return "text-green-600"; // Green for 80% or more remaining
    } else if (remainingPercentage >= 30) {
      return "text-yellow-600"; // Yellow for 30-79% remaining
    } else {
      return "text-red-600"; // Red for below 30% remaining
    }
  };

  return (
    <div className="absolute top-6 right-6 bg-white rounded-xl border border-[#E8E8E8] shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-4 w-[260px] flex flex-col items-center text-center">
      {/* Close button */}
      {/* <button 
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
      >
        <X size={18} />
      </button> */}
      
      {/* Heading */}
      <div className="leading-tight pb-2">
        <p className="text-[16px] leading-none font-medium text-gray-700">
          Activity Credits
        </p>
        <p className="text-[12px] text-gray-500 py-1">
          Remaining:{" "}
          <span className={`font-semibold ${getRemainingColor()}`}>
            {remaining}
          </span>
        </p>
        
      </div>

      {/* CTA Button */}
      <button
        onClick={onUpdatePlan}
        className="w-full h-[34px] rounded-md text-white text-sm font-semibold
    bg-gradient-to-r from-[#EC396F] to-[#313166]
    hover:opacity-90 transition mt-1"
      >
        Add Credits
      </button>
    </div>
  );
}

export default Campaign;