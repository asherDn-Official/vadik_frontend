import { X } from "lucide-react";
import { usePlan } from "../../context/PlanContext";

function Campaign({ onUpdatePlan, onClose }) {
  const { currentPlans, refreshPlans } = usePlan();

  // Check if data exists before accessing
  if (!currentPlans?.data?.whatsappActivities) {
    refreshPlans();
    return null;
  }

  const { used, allowed, remaining } = currentPlans.data.whatsappActivities;
  const currentCount = used;
  const totalCount = allowed;

  return (
    <div className="top-6 right-6 bg-white rounded-xl border border-[#E8E8E8] shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-4 w-[260px] flex flex-col items-center text-center">
      {/* Heading */}
      <div className="leading-tight pb-2">
        <p className="text-[16px] leading-none font-medium text-gray-700">
          Activity Credits
        </p>
        <p className="text-[12px] text-gray-500 py-1">
          Remaining:{" "}
          <span className="text-[#EC396F] font-semibold">{remaining}</span>
        </p>
      </div>

      {/* CTA Button */}
      <button
        onClick={onUpdatePlan}
        className="w-full h-[34px] rounded-md text-white text-sm font-semibold
    bg-gradient-to-r from-[#EC396F] to-[#313166]
    hover:opacity-90 transition"
      >
        Add Credits
      </button>
    </div>
  );
}

export default Campaign;
