import React from "react";
import { Search } from "lucide-react";

const SearchBar = ({ placeholder, onSearch }) => {
  const handleChange = (e) => {
    onSearch(e.target.value);
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        className="pl-4 pr-10 py-2 rounded-[10px] border border-gray-300 w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent h-10"
        onChange={handleChange}
      />
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        <Search size={20} />
      </div>
    </div>
  );
};

export default SearchBar;
