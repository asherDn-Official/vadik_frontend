import React, { useState, useMemo } from "react";
import { Tag, Edit3, Plus, X } from "lucide-react";
import ManageLabelsPopup from "../customerProfile/components/ManageLabelsPopup";
import {
  MAX_CUSTOMER_LABELS,
  normalizeCustomerLabels,
} from "../../utils/customerLabelUtils";

const CustomerLabelInput = ({
  value = "",
  onChange,
  suggestions,
  maxLabels = MAX_CUSTOMER_LABELS,
  maxLabelLength = 20,
  error = "",
  disabled = false,
  className = "",
}) => {
  const [showPopup, setShowPopup] = useState(false);

  const currentLabels = useMemo(() => {
    return normalizeCustomerLabels(value);
  }, [value]);

  const handleRemove = (labelToRemove, e) => {
    e?.stopPropagation();
    const updated = currentLabels.filter(
      (l) => l.toLowerCase() !== labelToRemove.toLowerCase()
    );
    onChange?.(updated.join(", "));
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Label Badges Container */}
      <div className="flex min-h-[44px] flex-wrap items-center gap-1.5 rounded-xl border border-[#EEF1FF] bg-white p-2.5 transition-all">
        {currentLabels.length === 0 ? (
          <span className="text-xs text-[#8B90B2] pl-1">No labels assigned</span>
        ) : (
          currentLabels.map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#DCE2FF] bg-[#F3F5FF] px-2.5 py-1 text-xs font-semibold text-[#313166] shadow-2xs"
            >
              <span>{label}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => handleRemove(label, e)}
                  className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[#8B90B2] transition-colors hover:bg-[#DCE2FF] hover:text-[#1F1C5C]"
                  aria-label={`Remove ${label}`}
                >
                  <X size={10} strokeWidth={2.5} />
                </button>
              )}
            </span>
          ))
        )}
      </div>

      {/* Button to open Manage Labels Popup */}
      {!disabled && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowPopup(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#EEF1FF] bg-[#F8F9FF] px-3 py-1.5 text-xs font-semibold text-[#313166] transition-all hover:border-[#DCE2FF] hover:bg-[#EEF1FF]"
          >
            {currentLabels.length > 0 ? (
              <>
                <Edit3 size={13} />
                <span>Manage Labels</span>
              </>
            ) : (
              <>
                <Plus size={13} />
                <span>Add Labels</span>
              </>
            )}
          </button>
          <span className="text-xs font-medium text-[#8B90B2]">
            {currentLabels.length}/{maxLabels} labels
          </span>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Manage Labels Popup Dialog */}
      <ManageLabelsPopup
        show={showPopup}
        onClose={() => setShowPopup(false)}
        value={value}
        onApply={(newValue) => onChange?.(newValue)}
        suggestions={suggestions}
        maxLabels={maxLabels}
        maxLabelLength={maxLabelLength}
      />
    </div>
  );
};

export default CustomerLabelInput;
