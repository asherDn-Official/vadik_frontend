import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const QuestionTypeDropdown = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const questionTypes = [
    { value: "mcq", label: "Multiple Choice" },
    { value: "short-answer", label: "Short Answer" },
    { value: "profession", label: "Profession" },
    { value: "income-level", label: "Income Level" },
    { value: "location", label: "Location" },
    { value: "favourite-product", label: "Favourite Product" },
    { value: "favourite-colour", label: "Favourite Colour" },
    { value: "favourite-brand", label: "Favourite Brand" },
    { value: "birthday", label: "Birthday" },
  ];

  const selectedType = questionTypes.find((type) => type.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-48 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
      >
        <span className="text-sm">
          {selectedType?.label || "Search Quiz Type"}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
          {questionTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => {
                onChange(type.value);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 outline-none"
            >
              {type.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionTypeDropdown;
