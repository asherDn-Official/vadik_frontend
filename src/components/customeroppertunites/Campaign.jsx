import { X } from "lucide-react";
import { usePlan } from "../../context/PlanContext";

function Campaign({ onUpdatePlan, onClose }) {
  const { currentPlans, refreshPlans } = usePlan();

  // Check if data exists before accessing
  if (!currentPlans?.data?.whatsappActivities) {
    refreshPlans();
    return null;
  }

  const { used, allowed } = currentPlans.data.whatsappActivities;
  const currentCount = used;
  const totalCount = allowed;

  return (
    <div className="fixed top-6 right-6 bg-white rounded-xl border border-[#E8E8E8] shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-4 w-[250px]">
      {/* Top: Campaign Count + Close Button */}
      <div className="flex justify-between items-start mb-2">
        <div className="leading-tight pb-1">
          <p className="text-[16px] leading-none tracking-normal font-normal text-gray-500">
            Campaign :<span className="text-[#EC396F]"> {currentCount}</span>
            <span className="text-gray-400"> / {totalCount}</span>
          </p>
          {/* <p className="text-[10px] text-gray-400 mt-0.5">
            Remaining: {remaining}
          </p> */}
        </div>

        {/* <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={16} />
        </button> */}
      </div>

      {/* Gradient Update Button */}
      <button
        onClick={onUpdatePlan}
        className="w-full h-[32px] rounded-md text-white text-sm font-semibold
        bg-gradient-to-r from-[#EC396F] to-[#313166]
        hover:opacity-90 transition"
      >
        Update Plan
      </button>
    </div>
  );
}

export default Campaign;
