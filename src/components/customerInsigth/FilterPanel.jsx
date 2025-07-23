import React, { useState, useEffect } from "react";
import { Calendar, Search, Plus, Minus, X } from "lucide-react";
import DatePicker from "./DatePicker";
import ReactSlider from "react-slider";
import api from "../../api/apiconfig";

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
  const [apiFilterOptions, setApiFilterOptions] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch customer preferences from API
  useEffect(() => {
    const fetchCustomerPreferences = async () => {
      try {
        setLoading(true);
        // Get retailerId from localStorage/sessionStorage
        const retailerId =
          localStorage.getItem("retailerId") ||
          sessionStorage.getItem("retailerId") ||
          "6856350030bcee9b82be4c17"; // fallback retailerId

        // Use axios instance which already handles authentication
        const response = await api.get(
          `/api/customer-preferences/${retailerId}`
        );
        const data = response.data;

        // Debug: Log the API response
        console.log("API Response:", data);

        // Process API data to create filter options
        const processedOptions = {
          // Static filters (not from API)
          gender: ["All", "Male", "Female", "Others"],
          source: ["All", "Walk In", "Website", "Social Media"],
          active: ["All", "Active", "Inactive"],
          churnRole: ["All", "High Risk", "Medium Risk", "Low Risk"],
          ratingFilter: [
            "All",
            "1 Star",
            "2 Stars",
            "3 Stars",
            "4 Stars",
            "5 Stars",
          ],

          // Dynamic filters from API
          profession: ["All"], // Will be populated from additionalData
          income: ["All"], // Will be populated from additionalData
          location: ["All"], // Will be populated from additionalData
          education: ["All"], // Will be populated from additionalData
          interest: ["All"], // Will be populated from advancedDetails
          favoriteColour: ["All"], // Will be populated from advancedDetails
          customerLabel: ["All", "WhatsApp"],
          specialDays: ["All", "Birthday", "Anniversary", "Festival"],
          communicationChannel: ["All"], // Will be populated from advancedPrivacyDetails
          satisfactionScore: [0, 100], // Range slider
          engagementScore: [0, 100], // Range slider
          loyaltyPoints: [0, 100], // Range slider
        };

        // Process additionalData
        if (data.additionalData && Array.isArray(data.additionalData)) {
          data.additionalData.forEach((item) => {
            // Handle different field types based on API response
            if (item.key === "profession") {
              if (item.options && Array.isArray(item.options)) {
                processedOptions.profession = ["All", ...item.options];
              } else {
                // For string/number types, make it a text input
                processedOptions.profession = { type: item.type || "string" };
              }
            }
            if (item.key === "income") {
              if (item.options && Array.isArray(item.options)) {
                processedOptions.income = ["All", ...item.options];
              } else {
                // For number type, make it a number input
                processedOptions.income = { type: item.type || "number" };
              }
            }
            if (item.key === "location") {
              if (item.options && Array.isArray(item.options)) {
                processedOptions.location = ["All", ...item.options];
              } else {
                // For string type, make it a text input
                processedOptions.location = { type: item.type || "string" };
              }
            }
            if (item.key === "education") {
              if (item.options && Array.isArray(item.options)) {
                processedOptions.education = ["All", ...item.options];
              } else {
                // For string type, make it a text input
                processedOptions.education = { type: item.type || "string" };
              }
            }
          });
        }

        // Process advancedDetails
        if (data.advancedDetails && Array.isArray(data.advancedDetails)) {
          data.advancedDetails.forEach((item) => {
            if (item.key === "interest") {
              if (item.options && Array.isArray(item.options)) {
                processedOptions.interest = ["All", ...item.options];
              } else {
                // For array type, provide default interest options
                processedOptions.interest = [
                  "All",
                  "Music",
                  "Sports",
                  "Reading",
                  "Travel",
                  "Movies",
                  "Gaming",
                  "Cooking",
                  "Art",
                  "Technology",
                  "Fashion",
                  "Fitness",
                ];
              }
            }
            if (item.key === "favirote colors") {
              if (item.options && Array.isArray(item.options)) {
                processedOptions.favoriteColour = [
                  "All",
                  ...item.options.map(
                    (color) => color.charAt(0).toUpperCase() + color.slice(1)
                  ),
                ];
              } else {
                processedOptions.favoriteColour = {
                  type: item.type || "percentage",
                };
              }
            }
            if (item.key === "anniversary") {
              // Date type should be a date picker
              processedOptions.anniversary = { type: "date" };
            }
            if (item.key === "short measurement") {
              // Number type should be a number input
              processedOptions.shortMeasurement = { type: "number" };
            }
          });
        }

        // Process advancedPrivacyDetails
        if (
          data.advancedPrivacyDetails &&
          Array.isArray(data.advancedPrivacyDetails)
        ) {
          data.advancedPrivacyDetails.forEach((item) => {
            if (item.key === "communication channel") {
              if (item.options && Array.isArray(item.options)) {
                processedOptions.communicationChannel = [
                  "All",
                  ...item.options,
                ];
              } else {
                // For string type, make it a text input
                processedOptions.communicationChannel = {
                  type: item.type || "string",
                };
              }
            }
            if (item.key === "satisfaction score") {
              // Number type should be a number input or range slider
              processedOptions.satisfactionScore = { type: "number" };
            }
            if (item.key === "engagement score") {
              // Number type should be a number input or range slider
              processedOptions.engagementScore = { type: "number" };
            }
            if (item.key === "loyalty points") {
              // Percentage type should be a range slider or number input
              processedOptions.loyaltyPoints = { type: "percentage" };
            }
          });
        }

        // Debug: Log the processed options
        console.log("Processed Filter Options:", processedOptions);

        setApiFilterOptions(processedOptions);
      } catch (error) {
        console.error("Error fetching customer preferences:", error);

        // Handle specific axios errors
        if (error.response?.status === 401) {
          console.error(
            "Authentication failed. Please check your login status."
          );
        } else if (error.response?.status === 404) {
          console.error("Customer preferences not found for this retailer.");
        } else if (error.response) {
          console.error(
            `API Error: ${error.response.status} - ${error.response.statusText}`
          );
        } else if (error.request) {
          console.error("Network error: Unable to reach the server.");
        } else {
          console.error("Error:", error.message);
        }
        // Fallback to static options
        setApiFilterOptions({
          gender: ["All", "Male", "Female", "Others"],
          profession: [
            "All",
            "Corporate",
            "Student",
            "Home Maker",
            "Business",
            "IT",
            "Medicine",
            "Service",
            "Teacher",
          ],
          source: ["All", "Walk In", "Website", "Social Media"],
          income: ["All", "High", "Medium", "Low"],
          location: ["All", "City", "Suburban", "Rural"],
          education: ["All", "High School", "Bachelor's", "Master's", "PhD"],
          favoriteColour: [
            "All",
            "Black",
            "Blue",
            "Red",
            "White",
            "Green",
            "Orange",
            "Violet",
          ],
          interest: [
            "All",
            "Music",
            "Sports",
            "Reading",
            "Travel",
            "Movies",
            "Gaming",
            "Cooking",
            "Art",
            "Technology",
            "Fashion",
            "Fitness",
          ],
          customerLabel: ["All", "WhatsApp"],
          specialDays: ["All", "Birthday", "Anniversary", "Festival"],
          communicationChannel: ["All", "Email", "SMS", "WhatsApp", "Phone"],
          active: ["All", "Active", "Inactive"],
          churnRole: ["All", "High Risk", "Medium Risk", "Low Risk"],
          ratingFilter: [
            "All",
            "1 Star",
            "2 Stars",
            "3 Stars",
            "4 Stars",
            "5 Stars",
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerPreferences();
  }, []);

  // Use API options or fallback to static options
  const filterOptions = apiFilterOptions || {
    gender: ["All", "Male", "Female", "Others"],
    profession: [
      "All",
      "Corporate",
      "Student",
      "Home Maker",
      "Business",
      "IT",
      "Medicine",
      "Service",
      "Teacher",
    ],
    source: ["All", "Walk In", "Website", "Social Media"],
    income: ["All", "High", "Medium", "Low"],
    location: ["All", "City", "Suburban", "Rural"],
    education: ["All", "High School", "Bachelor's", "Master's", "PhD"],
    favoriteColour: [
      "All",
      "Black",
      "Blue",
      "Red",
      "White",
      "Green",
      "Orange",
      "Violet",
    ],
    interest: [
      "All",
      "Music",
      "Sports",
      "Reading",
      "Travel",
      "Movies",
      "Gaming",
      "Cooking",
      "Art",
      "Technology",
      "Fashion",
      "Fitness",
    ],
    customerLabel: ["All", "WhatsApp"],
    specialDays: ["All", "Birthday", "Anniversary", "Festival"],
    communicationChannel: ["All", "Email", "SMS", "WhatsApp", "Phone"],
    active: ["All", "Active", "Inactive"],
    churnRole: ["All", "High Risk", "Medium Risk", "Low Risk"],
    ratingFilter: ["All", "1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"],
  };

  const toggleFilter = (key) => {
    setExpandedFilter((prev) => (prev === key ? null : key));
  };

  const handleDateSelect = (date) => {
    if (datePickerType === "specialDaysStart") {
      onFilterChange("specialDaysStart", date);
    } else if (datePickerType === "specialDaysEnd") {
      onFilterChange("specialDaysEnd", date);
    } else if (datePickerType === "anniversary") {
      onFilterChange("anniversary", date);
    }
    setShowDatePicker(false);
  };

  // Helper function to render different input types
  const renderFilterInput = (filterKey, filterConfig) => {
    if (Array.isArray(filterConfig)) {
      // Render as button options
      return (
        <div className="mt-2 flex flex-wrap gap-1">
          {loading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : (
            filterConfig.map((option) => {
              const isActive = filters[filterKey] === option;
              return (
                <button
                  key={option}
                  className={`px-2 py-1 rounded-md border text-[10px] transition-colors duration-200 ${
                    isActive
                      ? "bg-[#2e2d5f] text-white border-[#2e2d5f]"
                      : "bg-transparent text-[#2e2d5f] border-[#2e2d5f]"
                  }`}
                  onClick={() => onFilterChange(filterKey, option)}
                >
                  {option}
                </button>
              );
            })
          )}
        </div>
      );
    } else if (filterConfig?.type === "string") {
      // Render as text input
      return (
        <div className="mt-2 relative">
          <input
            type="text"
            placeholder={`Enter ${filterKey
              .replace(/([A-Z])/g, " $1")
              .toLowerCase()}`}
            className="w-full p-2 pl-8 border rounded-[10px] text-sm"
            value={filters[filterKey] || ""}
            onChange={(e) => onFilterChange(filterKey, e.target.value)}
          />
          <Search
            size={16}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
      );
    } else if (
      filterConfig?.type === "number" ||
      filterConfig?.type === "percentage"
    ) {
      // Render as number input
      return (
        <div className="mt-2">
          <input
            type="number"
            placeholder={`Enter ${filterKey
              .replace(/([A-Z])/g, " $1")
              .toLowerCase()}`}
            className="w-full p-2 border rounded-[10px] text-sm"
            value={filters[filterKey] || ""}
            onChange={(e) => onFilterChange(filterKey, e.target.value)}
            min="0"
            step={filterConfig?.type === "percentage" ? "0.1" : "1"}
          />
        </div>
      );
    } else if (filterConfig?.type === "date") {
      // Render as date picker
      return (
        <div className="mt-2">
          <button
            className="w-full p-2 border rounded text-sm text-left flex items-center justify-between"
            onClick={() => {
              setDatePickerType(filterKey);
              if (!filters[filterKey]) {
                const today = new Date();
                onFilterChange(filterKey, today);
              }
              setShowDatePicker(true);
            }}
          >
            {filters[filterKey]
              ? new Date(filters[filterKey]).toLocaleDateString()
              : "Select date"}
            <Calendar size={16} className="text-gray-400" />
          </button>
        </div>
      );
    }

    // Default fallback
    return (
      <div className="mt-2 text-sm text-gray-500">No options available</div>
    );
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
        <div className="flex gap-2 h-8 w-full justify-between">
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
          {renderFilterInput("profession", filterOptions.profession)}
        </FilterItem>

        {/* Income Level Filter */}
        <FilterItem
          name="Income Level"
          expanded={expandedFilter === "income"}
          onToggle={() => toggleFilter("income")}
        >
          {renderFilterInput("income", filterOptions.income)}
        </FilterItem>

        {/* Location Filter */}
        <FilterItem
          name="Location"
          expanded={expandedFilter === "location"}
          onToggle={() => toggleFilter("location")}
        >
          {renderFilterInput("location", filterOptions.location)}
        </FilterItem>

        {/* Education Filter */}
        <FilterItem
          name="Education"
          expanded={expandedFilter === "education"}
          onToggle={() => toggleFilter("education")}
        >
          {renderFilterInput("education", filterOptions.education)}
        </FilterItem>

        {/* Favorite Colour Filter */}
        <FilterItem
          name="Favourite Colour"
          expanded={expandedFilter === "favoriteColour"}
          onToggle={() => toggleFilter("favoriteColour")}
        >
          <div className="mt-2 flex flex-wrap gap-2">
            {loading ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : (
              filterOptions.favoriteColour.map((option) => {
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
                  Violet: "#8000FF",
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
              })
            )}
          </div>
        </FilterItem>

        {/* Interest Filter */}
        <FilterItem
          name="Interest"
          expanded={expandedFilter === "interest"}
          onToggle={() => toggleFilter("interest")}
        >
          {renderFilterInput("interest", filterOptions.interest)}
        </FilterItem>

        {/* Anniversary Filter */}
        {filterOptions.anniversary && (
          <FilterItem
            name="Anniversary"
            expanded={expandedFilter === "anniversary"}
            onToggle={() => toggleFilter("anniversary")}
          >
            {renderFilterInput("anniversary", filterOptions.anniversary)}
          </FilterItem>
        )}

        {/* Short Measurement Filter */}
        {filterOptions.shortMeasurement && (
          <FilterItem
            name="Short Measurement"
            expanded={expandedFilter === "shortMeasurement"}
            onToggle={() => toggleFilter("shortMeasurement")}
          >
            {renderFilterInput(
              "shortMeasurement",
              filterOptions.shortMeasurement
            )}
          </FilterItem>
        )}

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
                  ? new Date(filters.specialDaysStart).toLocaleDateString(
                      "en-GB"
                    )
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

        {/* Communication Channel Filter */}
        <FilterItem
          name="Communication Channel"
          expanded={expandedFilter === "communicationChannel"}
          onToggle={() => toggleFilter("communicationChannel")}
        >
          {renderFilterInput(
            "communicationChannel",
            filterOptions.communicationChannel
          )}
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
                  {option === "All"
                    ? "All"
                    : [...Array(stars)].map((_, i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5 text-[#facc15]" // Tailwind amber-400
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.138 3.498a1 1 0 00.95.69h3.676c.969 0 1.371 1.24.588 1.81l-2.975 2.163a1 1 0 00-.364 1.118l1.139 3.498c.3.921-.755 1.688-1.54 1.118l-2.976-2.163a1 1 0 00-1.176 0l-2.976 2.163c-.784.57-1.838-.197-1.539-1.118l1.138-3.498a1 1 0 00-.364-1.118L2.21 8.925c-.783-.57-.38-1.81.588-1.81h3.675a1 1 0 00.951-.69l1.138-3.498z" />
                        </svg>
                      ))}
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
          {filterOptions.loyaltyPoints?.type === "percentage" ? (
            renderFilterInput("loyaltyPoints", filterOptions.loyaltyPoints)
          ) : (
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
                <span>
                  ₹{" "}
                  {Number(filters.loyaltyPoints?.[0] || 0).toLocaleString(
                    "en-IN",
                    {
                      minimumFractionDigits: 2,
                    }
                  )}
                </span>
                <span>
                  ₹{" "}
                  {Number(filters.loyaltyPoints?.[1] || 40000).toLocaleString(
                    "en-IN",
                    {
                      minimumFractionDigits: 2,
                    }
                  )}
                </span>
              </div>
            </div>
          )}
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
              onChange={(value) =>
                onFilterChange("currentBusinessValue", value)
              }
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
              <span>
                ₹{" "}
                {Number(filters.currentBusinessValue?.[0] || 0).toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 2,
                  }
                )}
              </span>
              <span>
                ₹{" "}
                {Number(
                  filters.currentBusinessValue?.[1] || 100000
                ).toLocaleString("en-IN", {
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
              onChange={(value) =>
                onFilterChange("predictedFutureValue", value)
              }
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
                {Number(filters.predictedFutureValue?.[0] || 0).toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 2,
                  }
                )}
              </span>
              <span>
                ₹{" "}
                {Number(
                  filters.predictedFutureValue?.[1] || 200000
                ).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </FilterItem>

        {/* Satisfaction Score Filter */}
        <FilterItem
          name="Satisfaction Score"
          expanded={expandedFilter === "satisfactionScore"}
          onToggle={() => toggleFilter("satisfactionScore")}
        >
          {filterOptions.satisfactionScore?.type === "number" ? (
            renderFilterInput(
              "satisfactionScore",
              filterOptions.satisfactionScore
            )
          ) : (
            <div className="mt-3">
              <ReactSlider
                min={0}
                max={100}
                step={1}
                pearling
                minDistance={5}
                value={filters.satisfactionScore || [0, 100]}
                onChange={(value) => onFilterChange("satisfactionScore", value)}
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
                <span>{filters.satisfactionScore?.[0] ?? 0}</span>
                <span>{filters.satisfactionScore?.[1] ?? 100}</span>
              </div>
            </div>
          )}
        </FilterItem>

        {/* Engagement Score Filter */}
        <FilterItem
          name="Engagement Score"
          expanded={expandedFilter === "engagementScore"}
          onToggle={() => toggleFilter("engagementScore")}
        >
          {filterOptions.engagementScore?.type === "number" ? (
            renderFilterInput("engagementScore", filterOptions.engagementScore)
          ) : (
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
          )}
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
