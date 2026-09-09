import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Search, Check, Tag } from "lucide-react";
import api from "../../../api/apiconfig";
import {
  MAX_CUSTOMER_LABELS,
  normalizeCustomerLabels,
} from "../../../utils/customerLabelUtils";

const ManageLabelsPopup = ({
  show,
  onClose,
  value = "",
  onApply,
  suggestions: externalSuggestions,
  maxLabels = MAX_CUSTOMER_LABELS,
  maxLabelLength = 20,
}) => {
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [newLabelInput, setNewLabelInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchedSuggestions, setFetchedSuggestions] = useState([]);
  const [error, setError] = useState("");

  const retailerId = localStorage.getItem("retailerId");

  // Fetch unique labels from preferences if not passed as prop
  useEffect(() => {
    if (externalSuggestions && Array.isArray(externalSuggestions)) {
      return;
    }
    const fetchLabels = async () => {
      try {
        if (!retailerId) return;
        const response = await api.get(`/api/customer-preferences/${retailerId}`);
        if (response.data && response.data.uniqueLabels) {
          setFetchedSuggestions(response.data.uniqueLabels);
        }
      } catch (err) {
        console.error("Error fetching label suggestions:", err);
      }
    };
    if (show) {
      fetchLabels();
    }
  }, [externalSuggestions, retailerId, show]);

  const allSuggestions = externalSuggestions || fetchedSuggestions;

  // Initialize selected labels and lock body scroll when modal opens
  useEffect(() => {
    if (show) {
      setSelectedLabels(normalizeCustomerLabels(value));
      setNewLabelInput("");
      setSearchQuery("");
      setError("");
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [show, value]);

  // Merge external suggestions with currently selected labels to show in the list
  const combinedSuggestions = useMemo(() => {
    const map = new Map();
    (allSuggestions || []).forEach((item) => {
      const trimmed = String(item || "").trim();
      if (trimmed) map.set(trimmed.toLowerCase(), trimmed);
    });
    selectedLabels.forEach((item) => {
      const trimmed = String(item || "").trim();
      if (trimmed && !map.has(trimmed.toLowerCase())) {
        map.set(trimmed.toLowerCase(), trimmed);
      }
    });
    return Array.from(map.values());
  }, [allSuggestions, selectedLabels]);

  // Filter available suggestions by search query
  const filteredSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return combinedSuggestions;
    return combinedSuggestions.filter((item) =>
      item.toLowerCase().includes(q)
    );
  }, [combinedSuggestions, searchQuery]);

  // Check if search query exactly matches an existing label
  const hasExactSearchMatch = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return false;
    return combinedSuggestions.some((item) => item.toLowerCase() === q);
  }, [combinedSuggestions, searchQuery]);

  // Toggle selection
  const handleToggleLabel = (label) => {
    setError("");
    const isSelected = selectedLabels.some(
      (l) => l.toLowerCase() === label.toLowerCase()
    );

    if (isSelected) {
      setSelectedLabels((prev) =>
        prev.filter((l) => l.toLowerCase() !== label.toLowerCase())
      );
    } else {
      if (selectedLabels.length >= maxLabels) {
        setError(`You can select up to ${maxLabels} labels only.`);
        return;
      }
      setSelectedLabels((prev) => [...prev, label]);
    }
  };

  // Add new label from input or search query
  const handleAddNewLabel = (labelToAdd) => {
    setError("");
    const trimmed = String(labelToAdd || newLabelInput || searchQuery || "").trim();

    if (!trimmed) {
      setError("Please enter a label name.");
      return;
    }

    if (trimmed.length > maxLabelLength) {
      setError(`Label must not exceed ${maxLabelLength} characters.`);
      return;
    }

    const isAlreadySelected = selectedLabels.some(
      (l) => l.toLowerCase() === trimmed.toLowerCase()
    );

    if (isAlreadySelected) {
      setError(`"${trimmed}" is already selected.`);
      return;
    }

    if (selectedLabels.length >= maxLabels) {
      setError(`You can select up to ${maxLabels} labels only.`);
      return;
    }

    setSelectedLabels((prev) => [...prev, trimmed]);
    setNewLabelInput("");
    setSearchQuery("");
  };

  const handleApply = () => {
    onApply(selectedLabels.join(", "));
    onClose();
  };

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && show) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [show, onClose]);

  if (!show) return null;

  const isLimitReached = selectedLabels.length >= maxLabels;

  const modalContent = (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div className="flex w-full max-w-md flex-col rounded-3xl border border-[#EEF1FF] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EEF1FF] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F3F5FF] text-[#313166]">
              <Tag size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1F1C5C]">
                Customer Labels
              </h3>
              <p className="text-xs text-[#8B90B2]">
                Select or create labels for this customer
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Selected Labels Summary */}
        <div className="space-y-2 py-4 border-b border-[#EEF1FF]">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[#313166]">Selected Labels</span>
            <span
              className={
                isLimitReached ? "text-amber-600 font-bold" : "text-[#8B90B2]"
              }
            >
              {selectedLabels.length} / {maxLabels}
            </span>
          </div>

          <div className="flex min-h-[44px] flex-wrap items-center gap-1.5 rounded-2xl border border-[#EEF1FF] bg-[#FCFCFF] p-2.5">
            {selectedLabels.length === 0 ? (
              <span className="text-xs text-[#8B90B2]">No labels selected</span>
            ) : (
              selectedLabels.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#DCE2FF] bg-[#313166] px-3 py-1 text-xs font-medium text-white shadow-xs"
                >
                  <span>{label}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleLabel(label)}
                    className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                  >
                    <X size={10} strokeWidth={3} />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Search / Add Section */}
        <div className="space-y-3 py-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#8B90B2]">
              <Search size={15} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddNewLabel(searchQuery);
                }
              }}
              placeholder="Search or type new label name..."
              className="h-10 w-full rounded-xl border border-[#E5E9FF] bg-white pl-9 pr-20 text-xs font-medium text-[#1F1C5C] outline-none transition-all focus:border-[#313166]/40 focus:shadow-[0_0_0_3px_rgba(49,49,102,0.06)]"
            />
            {searchQuery.trim() && (
              <button
                type="button"
                onClick={() => handleAddNewLabel(searchQuery)}
                disabled={isLimitReached}
                className="absolute right-1 top-1 flex h-8 items-center gap-1 rounded-lg bg-[#313166] px-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#25254f] disabled:opacity-50"
              >
                <Plus size={12} strokeWidth={2.5} />
                Add
              </button>
            )}
          </div>

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

          {/* Available Labels Checklist */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8B90B2]">
              Available Labels
            </p>
            <div className="max-h-48 overflow-y-auto rounded-2xl border border-[#EEF1FF] bg-[#FCFCFF] p-2 space-y-1">
              {/* Create action if typed text doesn't exist */}
              {searchQuery.trim() && !hasExactSearchMatch && !isLimitReached && (
                <button
                  type="button"
                  onClick={() => handleAddNewLabel(searchQuery)}
                  className="flex w-full items-center gap-2 rounded-xl border border-dashed border-[#313166] bg-white p-2 text-left text-xs font-bold text-[#313166] hover:bg-[#F3F5FF]"
                >
                  <Plus size={14} />
                  <span>
                    Create "<span className="underline">{searchQuery.trim()}</span>"
                  </span>
                </button>
              )}

              {filteredSuggestions.length > 0 ? (
                filteredSuggestions.map((label) => {
                  const isSelected = selectedLabels.some(
                    (l) => l.toLowerCase() === label.toLowerCase()
                  );
                  return (
                    <button
                      key={label}
                      type="button"
                      disabled={!isSelected && isLimitReached}
                      onClick={() => handleToggleLabel(label)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-[#313166] text-white shadow-xs"
                          : isLimitReached
                          ? "cursor-not-allowed opacity-40 text-gray-400 bg-white"
                          : "bg-white text-[#1F1C5C] hover:bg-[#EEF1FF] hover:text-[#313166]"
                      }`}
                    >
                      <span className="truncate">{label}</span>
                      {isSelected ? (
                        <Check size={14} strokeWidth={2.5} className="text-white" />
                      ) : (
                        <span className="text-[11px] text-[#8B90B2]">+ Select</span>
                      )}
                    </button>
                  );
                })
              ) : (
                !searchQuery.trim() && (
                  <p className="py-4 text-center text-xs text-[#8B90B2]">
                    No existing labels found. Type above to create one.
                  </p>
                )
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#EEF1FF]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#EEF1FF] bg-white px-4 py-2.5 text-xs font-semibold text-[#1F1C5C] transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="rounded-xl bg-[#313166] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#25254f]"
          >
            Apply Labels
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
};

export default ManageLabelsPopup;
