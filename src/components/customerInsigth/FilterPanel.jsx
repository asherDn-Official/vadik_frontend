import React, { useState } from "react";
import { Calendar, Search, Plus, Minus, X } from "lucide-react";
import DatePicker from "./DatePicker";
import ReactSlider from "react-slider";


const FilterPanel = ({
  filters,
  onFilterChange,
  selectedPeriod,
  onPeriodChange,
  appliedFiltersCount,
  clearAllFilters,
}) => {
  const [expandedFilter, setExpandedFilter] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState("");
  const [brandSearchTerm, setBrandSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const filterOptions = {
    gender: ["All", "Male", "Female", "Others"],
    profession: [
      "All", "Corporate", "Student", "Home Maker", "Business",
      "IT", "Medicine", "Service", "Teacher",
    ],
    source: ["All", "Walk In", "Website", "Social Media"],
    incomeLevel: ["All", "High", "Medium", "Low"],
    location: ["All", "City", "Suburban", "Rural"],
    favoriteProduct: ["All", "Jean", "T-Shirt", "Formal Wear", "Casual Wear"],
    favoriteColour: ["All", "Black", "Blue", "Red", "White"],
    favoriteBrand: ["All", "Peter England", "Van Heusen", "Allen Solly"],
    lifeStyle: ["All", "Fitness", "Fashion", "Sports", "Travel"],
    customerLabel: ["All", "WhatsApp"],
    specialDays: ["All", "Birthday", "Anniversary", "Festival"],
    interest: ["All", "Music", "Sports", "Reading", "Travel"],
    active: ["All", "Active", "Inactive"],
    churnRole: ["All", "High Risk", "Medium Risk", "Low Risk"],
    ratingFilter: ["All", "1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"],
  };

  // ✅ Use safe fallback to avoid .map crash
  const favoriteSelected = Array.isArray(filters.favoriteProduct)
    ? filters.favoriteProduct
    : [];

  const favoriteBrandSelected = Array.isArray(filters.favoriteBrand)
  ? filters.favoriteBrand
  : [];

  const toggleFilter = (key) => {
    setExpandedFilter((prev) => (prev === key ? null : key));
  };

  const handleDateSelect = (date) => {
    if (datePickerType === "specialDaysStart") {
      onFilterChange("specialDaysStart", date);
    } else if (datePickerType === "specialDaysEnd") {
      onFilterChange("specialDaysEnd", date);
    }
    setShowDatePicker(false);
  };

  return (
    <div className="bg-white rounded-tl-[20px] rounded-bl-[20px] shadow-sm h-full overflow-hidden flex flex-col">
      {/* Filter Header with Applied Count & Clear */}
      <div className="flex items-center justify-between  p-4 border-b">
        <h2 className="font-semibold">Filter</h2>
        <div className="flex gap-1">
          <div className="flex items-center bg-[#3131661A] font-[500] px-2 py-1 rounded-[5px] text-[#313166] text-[12px]">
            <span className="mr-2">{appliedFiltersCount} applied</span>
            <button
              onClick={clearAllFilters}
              className="text-[#313166] text-[14px] font-[700] hover:text-gray-800 focus:outline-none"
              aria-label="Clear filters"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Period Selection with Standalone Calendar Button */}
      <div className="flex items-center justify-between p-4 border-b mb-2">
        <div className="flex gap-2 h-8">
          {["Yearly", "Quarterly", "Monthly"].map((period) => (
            <button
              key={period}
              className={`px-1.5 py-1 rounded text-[13px] transition-colors ${
                selectedPeriod === period
                  ? "bg-[#313166] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => onPeriodChange(period)}
            >
              {period}
            </button>
          ))}
          {/* Standalone Calendar Button */}
          <button
            className=" rounded text-[13px] text-gray-600  flex items-center gap-1"
            onClick={() => {
              setDatePickerType("custom");
              setShowDatePicker(true);
            }}
          >
            {/* <Calendar size={14} /> */}
            <img src="../assets/calendar-icon.png" alt="" />
          </button>
        </div>
      </div>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <DatePicker
              selected={
                datePickerType === "firstVisit"
                  ? filters.firstVisit || new Date()
                  : datePickerType === "custom"
                  ? filters.customDate || new Date()
                  : selectedPeriod
              }
              onChange={(date) => {
                if (datePickerType === "firstVisit") {
                  onFilterChange("firstVisit", date);
                } else if (datePickerType === "custom") {
                  onFilterChange("customDate", date);
                }
                setShowDatePicker(false);
              }}
              onClose={() => setShowDatePicker(false)}
            />
          </div>
        </div>
      )}


      {/* Filter Groups */}
      <div className="space-y-2 overflow-y-auto flex-1">
        {/* Name Filter */}
        <FilterItem
          name="Name"
          expanded={expandedFilter === "name"}
          onToggle={() => toggleFilter("name")}
        >
          <div className="mt-2 relative">
            <input
              type="text"
              placeholder="Search by name"
              className="w-full p-2 pl-8 border rounded-[10px] text-sm"
              value={filters.name || ""}
              onChange={(e) => onFilterChange("name", e.target.value)}
            />
            <Search
              size={16}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </FilterItem>

        {/* Mobile Number Filter */}
        <FilterItem
          name="Mobile Number"
          expanded={expandedFilter === "mobileNumber"}
          onToggle={() => toggleFilter("mobileNumber")}
        >
          <div className="mt-2 relative">
            <input
              type="text"
              placeholder="Search by mobile"
              className="w-full p-2 pl-8 border rounded-[10px] text-sm"
              value={filters.mobileNumber || ""}
              onChange={(e) => onFilterChange("mobileNumber", e.target.value)}
            />
            <Search
              size={16}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </FilterItem>

        {/* Gender Filter */}
        <FilterItem
          name="Gender"
          expanded={expandedFilter === "gender"}
          onToggle={() => toggleFilter("gender")}
        >
          <div className="mt-2 w-full">
            <div className="flex flex-nowrap gap-1 whitespace-nowrap overflow-hidden text-[10px]">
              {filterOptions.gender.map((option) => {
                const isActive = filters.gender === option;
                return (
                  <button
                    key={option}
                    className={`px-2 py-0.5 rounded-md border transition-colors duration-200 ${
                      isActive
                        ? "bg-[#2e2d5f] text-white border-[#2e2d5f]"
                        : "bg-transparent text-[#2e2d5f] border-[#2e2d5f]"
                    }`}
                    onClick={() => onFilterChange("gender", option)}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        </FilterItem>

        {/* First Visit Filter */}
        <FilterItem
          name="First Visit"
          expanded={expandedFilter === "firstVisit"}
          onToggle={() => toggleFilter("firstVisit")}
        >
          <div className="mt-2">
            <button
              className="w-full p-2 border rounded text-sm text-left flex items-center justify-between"
              onClick={() => {
                setDatePickerType("firstVisit");

                // Auto-fill current date if not already set
                if (!filters.firstVisit) {
                  const today = new Date();
                  onFilterChange("firstVisit", today);
                }

                setShowDatePicker(true);
              }}
            >
              {filters.firstVisit
                ? new Date(filters.firstVisit).toLocaleDateString()
                : "Select date"}
              <Calendar size={16} className="text-gray-400" />
            </button>
          </div>
        </FilterItem>


        {/* Source Filter */}
        <FilterItem
          name="Source"
          expanded={expandedFilter === "source"}
          onToggle={() => toggleFilter("source")}
        >
          <div className="mt-2 flex flex-wrap gap-1">
            {filterOptions.source.map((option) => {
              const isActive = filters.source === option;
              return (
                <button
                  key={option}
                  className={`px-2 py-1 rounded-md border text-[10px] transition-colors duration-200 ${
                    isActive
                      ? "bg-[#2e2d5f] text-white border-[#2e2d5f]"
                      : "bg-transparent text-[#2e2d5f] border-[#2e2d5f]"
                  }`}
                  onClick={() => onFilterChange("source", option)}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </FilterItem>

        {/* Profession Filter */}
        <FilterItem
          name="Profession"
          expanded={expandedFilter === "profession"}
          onToggle={() => toggleFilter("profession")}
        >
          <div className="mt-2 flex flex-wrap gap-1">
            {filterOptions.profession.map((option) => {
              const isActive = filters.profession === option;
              return (
                <button
                  key={option}
                  className={`px-2 py-1 rounded-md border text-[10px] transition-colors duration-200 ${
                    isActive
                      ? "bg-[#2e2d5f] text-white border-[#2e2d5f]"
                      : "bg-transparent text-[#2e2d5f] border-[#2e2d5f]"
                  }`}
                  onClick={() => onFilterChange("profession", option)}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </FilterItem>

        {/* Income Level Filter */}
        <FilterItem
          name="Income Level"
          expanded={expandedFilter === "incomeLevel"}
          onToggle={() => toggleFilter("incomeLevel")}
        >
          <div className="mt-2 flex flex-wrap gap-1">
            {filterOptions.incomeLevel.map((option) => {
              const isActive = filters.incomeLevel === option;
              return (
                <button
                  key={option}
                  className={`px-2 py-1 rounded-md border text-[10px] transition-colors duration-200 ${
                    isActive
                      ? "bg-[#2e2d5f] text-white border-[#2e2d5f]"
                      : "bg-transparent text-[#2e2d5f] border-[#2e2d5f]"
                  }`}
                  onClick={() => onFilterChange("incomeLevel", option)}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </FilterItem>

        {/* Location Filter */}
        <FilterItem
          name="Location"
          expanded={expandedFilter === "location"}
          onToggle={() => toggleFilter("location")}
        >
          <div className="mt-2 flex flex-wrap gap-1">
            {filterOptions.location.map((option) => {
              const isActive = filters.location === option;
              return (
                <button
                  key={option}
                  className={`px-2 py-1 rounded-md border text-[10px] transition-colors duration-200 ${
                    isActive
                      ? "bg-[#2e2d5f] text-white border-[#2e2d5f]"
                      : "bg-transparent text-[#2e2d5f] border-[#2e2d5f]"
                  }`}
                  onClick={() => onFilterChange("location", option)}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </FilterItem>

        {/* Favorite Product Filter */}
        <FilterItem
          name="Favourite Product"
          expanded={expandedFilter === "favoriteProduct"}
          onToggle={() => toggleFilter("favoriteProduct")}
        >
          <div className="mt-2">
            {/* Search Box */}
            <div className="relative mb-2">
              <input
                type="text"
                placeholder="Search Product"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#2e2d5f]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7c7ba0]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35M5.5 11a5.5 5.5 0 1111 0 5.5 5.5 0 01-11 0z"
                  />
                </svg>
              </span>
            </div>

            {/* Show Chips Only When Input is Empty */}
            {searchTerm === "" && favoriteSelected.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {favoriteSelected.map((item) => (
                  <div
                    key={item}
                    className="flex items-center px-3 py-1.5 bg-gray-100 text-[#2e2d5f] rounded-md text-sm"
                  >
                    <span className="mr-1">{item}</span>
                    <button
                      onClick={() =>
                        onFilterChange(
                          "favoriteProduct",
                          favoriteSelected.filter((i) => i !== item)
                        )
                      }
                      className="ml-1 text-[#2e2d5f] hover:text-red-500 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Filter Buttons (Search Results) */}
            {searchTerm && (
              <div className="flex flex-wrap gap-1">
                {filterOptions.favoriteProduct
                  .filter(
                    (option) =>
                      option.toLowerCase().includes(searchTerm.toLowerCase()) &&
                      !favoriteSelected.includes(option)
                  )
                  .map((option) => (
                    <button
                      key={option}
                      className="px-3 py-1 rounded-md border text-[10px] bg-transparent text-[#2e2d5f] border-[#2e2d5f] hover:bg-[#f1f1f8] transition"
                      onClick={() => {
                        onFilterChange("favoriteProduct", [
                          ...favoriteSelected,
                          option,
                        ]);
                        setSearchTerm(""); // Clear input after selecting
                      }}
                    >
                      {option}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </FilterItem>
        
        {/* Favorite Colour Filter */}
        <FilterItem
          name="Favourite Colour"
          expanded={expandedFilter === "favoriteColour"}
          onToggle={() => toggleFilter("favoriteColour")}
        >
          <div className="mt-2 flex flex-wrap gap-2">
            {filterOptions.favoriteColour.map((option) => {
              const isSelected = filters.favoriteColour === option;

              const colorMap = {
                Black: "#000000",
                Red: "#FF0000",
                Blue: "#0000FF",
                Pink: "#FF69B4",
                Green: "#00C853",
                Brown: "#8B4513",
                Orange: "#FFA500",
                White: "#FFFFFF",
                Purple: "#8000FF",
                Yellow: "#FFD700",
              };

              const dotColor = colorMap[option] || "#999999";
              const isWhite = option === "White";

              return (
                <button
                  key={option}
                  onClick={() => onFilterChange("favoriteColour", option)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm transition-all duration-200 ${
                    isSelected
                      ? "bg-[#f1f1fb] text-[#2e2d5f] border-[#2e2d5f]"
                      : "bg-white text-[#2e2d5f] border-[#2e2d5f]"
                  }`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full border ${
                      isWhite ? "border-gray-400" : ""
                    }`}
                    style={{ backgroundColor: dotColor }}
                  />
                  {option}
                </button>
              );
            })}
          </div>
        </FilterItem>

        {/* Favorite Brand Filter */}
        <FilterItem
          name="Favorite Brand"
          expanded={expandedFilter === "favoriteBrand"}
          onToggle={() => toggleFilter("favoriteBrand")}
        >
          <div className="mt-2">
            {/* Search Box */}
            <div className="relative mb-2">
              <input
                type="text"
                placeholder="Search Brand"
                value={brandSearchTerm}
                onChange={(e) => setBrandSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#2e2d5f]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7c7ba0]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35M5.5 11a5.5 5.5 0 1111 0 5.5 5.5 0 01-11 0z"
                  />
                </svg>
              </span>
            </div>

            {/* Selected Chips Only When Not Typing */}
            {brandSearchTerm === "" && favoriteBrandSelected.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {favoriteBrandSelected.map((item) => (
                  <div
                    key={item}
                    className="flex items-center px-3 py-1.5 bg-gray-100 text-[#2e2d5f] rounded-md text-sm"
                  >
                    <span className="mr-1">{item}</span>
                    <button
                      onClick={() =>
                        onFilterChange(
                          "favoriteBrand",
                          favoriteBrandSelected.filter((i) => i !== item)
                        )
                      }
                      className="ml-1 text-[#2e2d5f] hover:text-red-500 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Filter Buttons Based on Search */}
            {brandSearchTerm && (
              <div className="flex flex-wrap gap-1">
                {filterOptions.favoriteBrand
                  .filter(
                    (option) =>
                      option.toLowerCase().includes(brandSearchTerm.toLowerCase()) &&
                      !favoriteBrandSelected.includes(option)
                  )
                  .map((option) => (
                    <button
                      key={option}
                      className="px-3 py-1 rounded-md border text-[10px] bg-transparent text-[#2e2d5f] border-[#2e2d5f] hover:bg-[#f1f1f8] transition"
                      onClick={() => {
                        onFilterChange("favoriteBrand", [
                          ...favoriteBrandSelected,
                          option,
                        ]);
                        setBrandSearchTerm(""); // Clear input after selecting
                      }}
                    >
                      {option}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </FilterItem>

        {/* Special Days Filter */}
        <FilterItem
          name="Special Days"
          expanded={expandedFilter === "specialDays"}
          onToggle={() => toggleFilter("specialDays")}
        >
          <div className="mt-2">
            {/* Day Type Buttons */}
            <div className="flex flex-wrap gap-1 mb-2">
              {filterOptions.specialDays.map((option) => {
                const isSelected = filters.specialDays === option;
                return (
                  <button
                    key={option}
                    className={`px-2 py-1 rounded border text-xs transition ${
                      isSelected
                        ? "bg-[#313166] text-white border-[#313166]"
                        : "bg-white text-[#313166] border-[#313166]"
                    }`}
                    onClick={() => onFilterChange("specialDays", option)}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {/* Date Range Picker */}
            <div className="flex items-center gap-1">
              {/* Start Date */}
              <button
                className="flex items-center gap-1 bg-[#f1f1fb] px-2 py-0.5 text-[10px] rounded"
                onClick={() => {
                  setDatePickerType("specialDaysStart");
                  setShowDatePicker(true);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 text-[#313166]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {filters.specialDaysStart
                  ? new Date(filters.specialDaysStart).toLocaleDateString("en-GB")
                  : "DD/MM/YYYY"}
              </button>

              <span className="text-gray-400 text-xs">-</span>

              {/* End Date */}
              <button
                className="flex items-center gap-1 bg-[#f1f1fb] px-2 py-0.5 text-[10px] rounded"
                onClick={() => {
                  setDatePickerType("specialDaysEnd");
                  setShowDatePicker(true);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 text-[#313166]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {filters.specialDaysEnd
                  ? new Date(filters.specialDaysEnd).toLocaleDateString("en-GB")
                  : "DD/MM/YYYY"}
              </button>
            </div>

            {/* Date Picker Popup */}
            {showDatePicker && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white p-4 rounded shadow-md">
                  <DatePicker
                    selected={
                      datePickerType === "specialDaysStart"
                        ? new Date(filters.specialDaysStart || new Date())
                        : new Date(filters.specialDaysEnd || new Date())
                    }
                    onChange={(date) => {
                      onFilterChange(datePickerType, date);
                      setShowDatePicker(false);
                    }}
                    inline
                  />
                  <div className="text-right mt-2">
                    <button
                      className="px-2 py-0 text-sm bg-[#313166] text-white rounded"
                      onClick={() => setShowDatePicker(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </FilterItem>

        {/* Life Style Filter */}
        <FilterItem
          name="Life Style"
          expanded={expandedFilter === "lifeStyle"}
          onToggle={() => toggleFilter("lifeStyle")}
        >
          <div className="mt-2 flex flex-wrap gap-1">
            {filterOptions.lifeStyle.map((option) => {
              const isActive = filters.lifeStyle === option;
              return (
                <button
                  key={option}
                  className={`px-2 py-1 rounded-md border text-[10px] transition-colors duration-200 ${
                    isActive
                      ? "bg-[#2e2d5f] text-white border-[#2e2d5f]"
                      : "bg-transparent text-[#2e2d5f] border-[#2e2d5f]"
                  }`}
                  onClick={() => onFilterChange("lifeStyle", option)}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </FilterItem>

        {/* Interest Filter */}
        <FilterItem
          name="Interest"
          expanded={expandedFilter === "interest"}
          onToggle={() => toggleFilter("interest")}
        >
          <div className="mt-2 flex flex-wrap gap-1">
            {filterOptions.interest.map((option) => {
              const isActive = filters.interest === option;
              return (
                <button
                  key={option}
                  className={`px-2 py-1 rounded-md border text-[10px] transition-colors duration-200 ${
                    isActive
                      ? "bg-[#2e2d5f] text-white border-[#2e2d5f]"
                      : "bg-transparent text-[#2e2d5f] border-[#2e2d5f]"
                  }`}
                  onClick={() => onFilterChange("interest", option)}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </FilterItem>

        {/* Customer Label Filter */}
        <FilterItem
          name="Customer Label"
          expanded={expandedFilter === "customerLabel"}
          onToggle={() => toggleFilter("customerLabel")}
        >
          <div className="mt-2 flex flex-wrap gap-2">
            {filterOptions.customerLabel.map((option) => {
              const isActive = filters.customerLabel === option;

              return (
                <button
                  key={option}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? "bg-[#2e2d5f] text-white"
                      : "bg-gray-100 text-[#2e2d5f]"
                  }`}
                  onClick={() => onFilterChange("customerLabel", option)}
                >
                  {/* WhatsApp icon conditionally rendered */}
                  {option === "WhatsApp" && (
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                      alt="whatsapp"
                      className="w-4 h-4"
                    />
                  )}
                  {option}
                </button>
              );
            })}
          </div>
        </FilterItem>

        {/* Active Filter */}
        <FilterItem
          name="Active"
          expanded={expandedFilter === "active"}
          onToggle={() => toggleFilter("active")}
        >
          <div className="mt-2 flex flex-wrap gap-1">
            {filterOptions.active.map((option) => {
              const isActive = filters.active === option;
              return (
                <button
                  key={option}
                  className={`px-2 py-1 rounded-md border text-[10px] transition-colors duration-200 ${
                    isActive
                      ? "bg-[#2e2d5f] text-white border-[#2e2d5f]"
                      : "bg-transparent text-[#2e2d5f] border-[#2e2d5f]"
                  }`}
                  onClick={() => onFilterChange("active", option)}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </FilterItem>

        {/* Churn Role Filter */}
        <FilterItem
          name="Churn Role"
          expanded={expandedFilter === "churnRole"}
          onToggle={() => toggleFilter("churnRole")}
        >
          <div className="mt-2 flex flex-wrap gap-1">
            {filterOptions.churnRole.map((option) => {
              const isActive = filters.churnRole === option;
              return (
                <button
                  key={option}
                  className={`px-2 py-1 rounded-md border text-[10px] transition-colors duration-200 ${
                    isActive
                      ? "bg-[#2e2d5f] text-white border-[#2e2d5f]"
                      : "bg-transparent text-[#2e2d5f] border-[#2e2d5f]"
                  }`}
                  onClick={() => onFilterChange("churnRole", option)}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </FilterItem>

        {/* Rating Filter */}
        <FilterItem
          name="Rating Filter"
          expanded={expandedFilter === "ratingFilter"}
          onToggle={() => toggleFilter("ratingFilter")}
        >
          <div className="mt-2 flex flex-wrap gap-2">
            {filterOptions.ratingFilter.map((option) => {
              const isActive = filters.ratingFilter === option;

              // Get number of stars from "1 Star", "2 Stars", etc.
              const match = option.match(/\d/);
              const stars = match ? parseInt(match[0], 10) : 0;

              return (
                <button
                  key={option}
                  className={`flex items-center gap-0.5 px-3 py-1 rounded-md border transition-colors duration-200 text-[12px] ${
                    isActive
                      ? "bg-[#2e2d5f] text-white border-[#2e2d5f]"
                      : "bg-white text-[#2e2d5f] border-[#2e2d5f]"
                  }`}
                  onClick={() => onFilterChange("ratingFilter", option)}
                >
                  {option === "All" ? (
                    "All"
                  ) : (
                    [...Array(stars)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5 text-[#facc15]" // Tailwind amber-400
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.138 3.498a1 1 0 00.95.69h3.676c.969 0 1.371 1.24.588 1.81l-2.975 2.163a1 1 0 00-.364 1.118l1.139 3.498c.3.921-.755 1.688-1.54 1.118l-2.976-2.163a1 1 0 00-1.176 0l-2.976 2.163c-.784.57-1.838-.197-1.539-1.118l1.138-3.498a1 1 0 00-.364-1.118L2.21 8.925c-.783-.57-.38-1.81.588-1.81h3.675a1 1 0 00.951-.69l1.138-3.498z" />
                      </svg>
                    ))
                  )}
                </button>
              );
            })}
          </div>
        </FilterItem>

        {/* Loyalty Points Filter */}
        <FilterItem
          name="Loyalty Points"
          expanded={expandedFilter === "loyaltyPoints"}
          onToggle={() => toggleFilter("loyaltyPoints")}
        >
          <div className="mt-3">
            <ReactSlider
              min={0}
              max={40000}
              step={100}
              pearling
              minDistance={1000}
              value={filters.loyaltyPoints || [0, 40000]}
              onChange={(value) => onFilterChange("loyaltyPoints", value)}
              className="relative w-full h-1.5 mt-2"
              renderTrack={(props, state) => (
                <div
                  {...props}
                  className={`absolute top-0 h-1.5 rounded-full ${
                    state.index === 1 ? 'bg-[#2e2d5f]' : 'bg-[#e5e5eb]'
                  }`}
                />
              )}
              renderThumb={(props) => (
                <div
                  {...props}
                  className="flex items-center justify-center absolute top-0 transform -translate-y-1.5 h-5 w-5 rounded-full bg-[#2e2d5f] shadow-[0_0_0_8px_rgba(47,45,95,0.15)]"
                />
              )}
            />

            {/* Value Labels */}
            <div className="flex justify-between text-xs text-[#2e2d5f] font-medium mt-2">
              <span>
                ₹ {Number(filters.loyaltyPoints?.[0] || 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </span>
              <span>
                ₹ {Number(filters.loyaltyPoints?.[1] || 40000).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </FilterItem>

        {/* Current Business Value Filter */}
        <FilterItem
          name="Current Business Value"
          expanded={expandedFilter === "currentBusinessValue"}
          onToggle={() => toggleFilter("currentBusinessValue")}
        >
          <div className="mt-3">
            <ReactSlider
              min={0}
              max={100000}
              step={100}
              pearling
              minDistance={1000}
              value={filters.currentBusinessValue || [0, 100000]}
              onChange={(value) => onFilterChange("currentBusinessValue", value)}
              className="relative w-full h-1.5 mt-2"
              renderTrack={(props, state) => (
                <div
                  {...props}
                  className={`absolute top-0 h-1.5 rounded-full ${
                    state.index === 1 ? 'bg-[#2e2d5f]' : 'bg-[#e5e5eb]'
                  }`}
                />
              )}
              renderThumb={(props) => (
                <div
                  {...props}
                  className="flex items-center justify-center absolute top-0 transform -translate-y-1.5 h-5 w-5 rounded-full bg-[#2e2d5f] shadow-[0_0_0_8px_rgba(47,45,95,0.15)]"
                />
              )}
            />

            {/* Value Labels */}
            <div className="flex justify-between text-xs text-[#2e2d5f] font-medium mt-2">
              <span>
                ₹{" "}
                {Number(filters.currentBusinessValue?.[0] || 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </span>
              <span>
                ₹{" "}
                {Number(filters.currentBusinessValue?.[1] || 100000).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </FilterItem>

        {/* Predicted Future Value Filter */}
        <FilterItem
          name="Predicted Future Value"
          expanded={expandedFilter === "predictedFutureValue"}
          onToggle={() => toggleFilter("predictedFutureValue")}
        >
          <div className="mt-3">
            <ReactSlider
              min={0}
              max={200000}
              step={100}
              pearling
              minDistance={1000}
              value={filters.predictedFutureValue || [0, 200000]}
              onChange={(value) => onFilterChange("predictedFutureValue", value)}
              className="relative w-full h-1.5 mt-2"
              renderTrack={(props, state) => (
                <div
                  {...props}
                  className={`absolute top-0 h-1.5 rounded-full ${
                    state.index === 1 ? "bg-[#2e2d5f]" : "bg-[#e5e5eb]"
                  }`}
                />
              )}
              renderThumb={(props) => (
                <div
                  {...props}
                  className="flex items-center justify-center absolute top-0 transform -translate-y-1.5 h-5 w-5 rounded-full bg-[#2e2d5f] shadow-[0_0_0_8px_rgba(47,45,95,0.15)]"
                />
              )}
            />

            {/* ₹ Value Labels */}
            <div className="flex justify-between text-xs text-[#2e2d5f] font-medium mt-2">
              <span>
                ₹{" "}
                {Number(filters.predictedFutureValue?.[0] || 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </span>
              <span>
                ₹{" "}
                {Number(filters.predictedFutureValue?.[1] || 200000).toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 2,
                  }
                )}
              </span>
            </div>
          </div>
        </FilterItem>

        {/* Engagement Score Filter */}
        <FilterItem
          name="Engagement Score"
          expanded={expandedFilter === "engagementScore"}
          onToggle={() => toggleFilter("engagementScore")}
        >
          <div className="mt-3">
            <ReactSlider
              min={0}
              max={100}
              step={1}
              pearling
              minDistance={5}
              value={filters.engagementScore || [0, 100]}
              onChange={(value) => onFilterChange("engagementScore", value)}
              className="relative w-full h-1.5 mt-2"
              renderTrack={(props, state) => (
                <div
                  {...props}
                  className={`absolute top-0 h-1.5 rounded-full ${
                    state.index === 1 ? "bg-[#2e2d5f]" : "bg-[#e5e5eb]"
                  }`}
                />
              )}
              renderThumb={(props) => (
                <div
                  {...props}
                  className="flex items-center justify-center absolute top-0 transform -translate-y-1.5 h-5 w-5 rounded-full bg-[#2e2d5f] shadow-[0_0_0_8px_rgba(47,45,95,0.15)]"
                />
              )}
            />

            {/* Value Labels */}
            <div className="flex justify-between text-xs text-[#2e2d5f] font-medium mt-2">
              <span>{filters.engagementScore?.[0] ?? 0}</span>
              <span>{filters.engagementScore?.[1] ?? 100}</span>
            </div>
          </div>
        </FilterItem>
      </div>
    </div>
  );
};

// Subcomponent for each filter section
const FilterItem = ({ name, expanded, onToggle, children, icon }) => {
  return (
    <div className="border-b border-gray-200 last:border-b-0 p-4 pt-2 mt-0">
      <button
        className="w-full flex justify-between items-center py-2 text-[14px] font-[400] text-[#313166]"
        onClick={onToggle}
      >
        <div className="flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          <span>{name}</span>
        </div>
        <span className="text-[#313166]">
          {expanded ? <Minus size={16} /> : <Plus size={16} />}
        </span>
      </button>
      {expanded && <div>{children}</div>}
    </div>
  );
};

export default FilterPanel;
