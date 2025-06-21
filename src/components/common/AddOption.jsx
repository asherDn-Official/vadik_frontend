import React from "react";
import { Plus } from "lucide-react";

const AddOption = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center px-4 py-2 text-pink-600 hover:text-pink-700 transition-colors"
    >
      <Plus className="w-4 h-4 mr-2" />
      Add Option
    </button>
  );
};

export default AddOption;
