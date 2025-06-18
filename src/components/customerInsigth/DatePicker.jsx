import React, { useState } from "react";
import { Calendar } from "lucide-react";

const DatePicker = ({ selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDateChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative">
      <div className="flex items-center border rounded overflow-hidden">
        <input
          type="date"
          value={selected || ""}
          onChange={handleDateChange}
          className="p-2 w-full text-sm focus:outline-none"
        />
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-2 bg-gray-50 border-l"
        >
          {/* <Calendar size={16} className="text-gray-500" /> */}
        </button>
      </div>
    </div>
  );
};

export default DatePicker;
