// import React from "react";
// import { DivideIcon as LucideIcon } from "lucide-react";

// const MetricCard = ({
//   icon: Icon,
//   value,
//   label,
//   bgColor = "bg-white",
//   iconColor = "text-gray-600",
// }) => {
//   return (
//     <div
//       className={`${bgColor} rounded-lg p-6 shadow-sm border border-gray-100`}
//     >
//       <div className="flex items-center space-x-4">
//         <div className="p-3 rounded-full bg-gray-50">
//           <Icon className={`w-6 h-6 ${iconColor}`} />
//         </div>
//         <div>
//           <div className="text-2xl font-bold text-gray-900">{value}</div>
//           <div className="text-sm text-gray-600">{label}</div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MetricCard;

import React from "react";

const MetricCard = ({
  icon, // Now expecting a string path to the image
  value,
  label,
  bgColor = "bg-white",
  iconColor = "text-gray-600",
}) => {
  return (
    <div
      className={`${bgColor} rounded-lg p-6 shadow-sm border border-gray-100`}
    >
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full bg-gray-50`}>
          <img src={icon} alt="Metric icon" className="w-12 h-12" />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-sm text-gray-600">{label}</div>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
