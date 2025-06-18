import React, { useState } from "react";

const SearchBar = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    // Determine search type based on input format
    if (searchQuery.toLowerCase().startsWith("dha")) {
      onSearch(searchQuery, "coupon");
    } else if (/^[0-9+]{10,13}$/.test(searchQuery)) {
      onSearch(searchQuery, "phone");
    } else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(searchQuery)) {
      onSearch(searchQuery, "email");
    } else {
      onSearch(searchQuery, "name");
    }
  };

  return (
    <div className="mb-8 bg-white p-4 rounded-lg">
      <h2 className="text-[18px] text-[#313166] font-[500] mb-4">
        Search History
      </h2>
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <input
            type="text"
            className="flex-1 px-4 py-3 bg-[#ECEDF3] border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search by Name, Email, Phone or Coupon"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            className="px-6 py-3 bg-[#313166] text-white rounded-lg hover:bg-indigo-800 transition-colors"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
        <div className="flex gap-4">
          <div className="flex-1 text-sm text-gray-500">
            Search by:
            <span className="ml-2 text-gray-700">
              Phone (e.g., +919876543210)
            </span>
            <span className="mx-2">|</span>
            <span className="text-gray-700">Coupon (e.g., Dha01ab)</span>
            <span className="mx-2">|</span>
            <span className="text-gray-700">Name</span>
            <span className="mx-2">|</span>
            <span className="text-gray-700">Email</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
