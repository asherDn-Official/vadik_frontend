import React from "react";
import { normalizeCustomerLabels, MAX_CUSTOMER_LABELS } from "../../utils/customerLabelUtils.js";

const LabelPreview = ({ labels, className = "" }) => {
  const normalizedLabels = normalizeCustomerLabels(labels);
  const visibleLabels = normalizedLabels.slice(0, MAX_CUSTOMER_LABELS);
  const hiddenCount = Math.max(0, normalizedLabels.length - visibleLabels.length);
  const tooltip = normalizedLabels.join(", ");

  if (normalizedLabels.length === 0) {
    return <span className={className}>-</span>;
  }

  return (
    <div
      className={`mx-auto flex max-w-full flex-wrap items-center justify-center gap-1 ${className}`}
      title={tooltip}
      aria-label={tooltip}
    >
      {visibleLabels.map((label) => (
        <span
          key={label}
          className="inline-flex items-center rounded-full border border-[#E8ECF8] bg-[#F3F5FF] px-2 py-0.5 text-[10px] font-medium text-[#313166]"
        >
          {label}
        </span>
      ))}
      {hiddenCount > 0 && (
        <span className="inline-flex items-center rounded-full border border-[#E8ECF8] bg-white px-2 py-0.5 text-[10px] font-medium text-[#8B90B2]">
          +{hiddenCount} more
        </span>
      )}
    </div>
  );
};

export default LabelPreview;
