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
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState("");
  const [apiFilterOptions, setApiFilterOptions] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize defaults on component mount
  React.useEffect(() => {
    if (!selectedPeriod) {
      onPeriodChange("Yearly");
    }
    
    if (!filters.periodValue && selectedPeriod === "Yearly") {
      const currentYear = new Date().getFullYear().toString();
      onFilterChange("periodValue", currentYear);
    }
  }, [selectedPeriod, filters.periodValue, onPeriodChange, onFilterChange]);

  // Fetch filter options from API
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/customer-preferences/688c7981ed36e50360334689");
        const apiData = response.data;
        
        // Process API data to create filter options
        const processedOptions = {
          // Static filters
          name: { type: "string" },
          mobileNumber: { type: "number" },
          gender: ["All", "Male", "Female", "Others"],
          firstVisit: { type: "date" },
          source: ["All", "Walk In", "Website", "Social Media"],
          // active: ["All", "Active", "Inactive"],
          // churnRole: ["All", "High Risk", "Medium Risk", "Low Risk"],
          // ratingFilter: ["All", "1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"],
          // customerLabel: ["All", "WhatsApp"],
          // specialDays: ["All", "Birthday", "Anniversary", "Festival"],
          // satisfactionScore: [0, 100],
          // engagementScore: [0, 100],
          // loyaltyPoints: [0, 100],
          // currentBusinessValue: [0, 100000],
          // predictedFutureValue: [0, 200000],
        };

        // Process additionalData from API
        // apiData.additionalData?.forEach((item) => {
        //   let key = item.key.toLowerCase().replace(/\s+/g, '');
        //   if (item.key === "Income Level") key = "income";
          
        //   if (item.type === "options" && item.options) {
        //     processedOptions[key] = ["All", ...item.options];
        //   } else if (item.type === "string") {
        //     processedOptions[key] = { type: "string" };
        //   } else if (item.type === "date") {
        //     processedOptions[key] = { type: "date" };
        //   }
        // });

        // Process advancedDetails from API
        // apiData.advancedDetails?.forEach((item) => {
        //   let key = item.key.toLowerCase().replace(/\s+/g, '');
          
        //   if (item.key === "Favourite Products") key = "favoriteProduct";
        //   if (item.key === "Favourite Brands") key = "favoriteBrand";
        //   if (item.key === "Favourite Colours") key = "favoriteColour";
        //   if (item.key === "Interests") key = "interest";
        //   if (item.key === "Lifestyle") key = "lifeStyle";
          
        //   if (item.type === "options" && item.options) {
        //     processedOptions[key] = ["All", ...item.options];
        //   } else if (item.type === "string") {
        //     processedOptions[key] = { type: "string" };
        //   } else if (item.type === "date") {
        //     processedOptions[key] = { type: "date" };
        //   }
        // });

        // Process advancedPrivacyDetails from API
        // apiData.advancedPrivacyDetails?.forEach((item) => {
        //   let key = item.key.toLowerCase().replace(/\s+/g, '');
          
        //   if (item.key === "Communication Channel") key = "communicationChannel";
        //   if (item.key === "Type of Communication") key = "typeOfCommunication";
        //   if (item.key === "Privacy Note") key = "privacyNote";
          
        //   if (item.type === "options" && item.options) {
        //     processedOptions[key] = ["All", ...item.options];
        //   } else if (item.type === "string") {
        //     processedOptions[key] = { type: "string" };
        //   }
        // });

        setApiFilterOptions(processedOptions);
        
        // Set default profession if not already set
        if (Array.isArray(processedOptions.profession) && processedOptions.profession.length > 1) {
          const firstProfession = processedOptions.profession.find(p => p !== "All");
          if (firstProfession && (!filters.profession || filters.profession === "All")) {
            onFilterChange("profession", firstProfession);
          }
        }
      } catch (error) {
        console.error("Error fetching filter options:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);

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

  const renderFilterInput = (filterKey, filterConfig) => {
    if (Array.isArray(filterConfig)) {
      return (
        <div className="mt-2 flex flex-wrap gap-1">
          {filterConfig.map((option) => {
            const isActive = filters[filterKey] === option;
            return (
              <button
                key={option}
                className={`px-2 py-1 rounded-md border text-[10px] transition-colors duration-200 ${isActive
                    ? "bg-[#2e2d5f] text-white border-[#2e2d5f]"
                    : "bg-transparent text-[#2e2d5f] border-[#2e2d5f]"
                  }`}
                onClick={() => onFilterChange(filterKey, option)}
              >
                {option}
              </button>
            );
          })}
        </div>
      );
    } else if (filterConfig?.type === "string") {
      return (
        <div className="mt-2 relative">
          <input
            type="text"
            placeholder={`Enter ${filterKey.replace(/([A-Z])/g, " $1").toLowerCase()}`}
            className="w-full p-2 pl-8 border rounded-[10px] text-sm"
            value={filters[filterKey] || ""}
            onChange={(e) => onFilterChange(filterKey, e.target.value)}
          />
          <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      );
    } else if (filterConfig?.type === "number") {
      return (
        <div className="mt-2 relative">
          <input
            type="number"
            placeholder={`Enter ${filterKey.replace(/([A-Z])/g, " $1").toLowerCase()}`}
            className="w-full p-2 pl-8 border rounded-[10px] text-sm"
            value={filters[filterKey] || ""}
            onChange={(e) => onFilterChange(filterKey, e.target.value)}
            min="0"
          />
          <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      );
    } else if (filterConfig?.type === "date") {
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

    return (
      <div className="mt-2 text-sm text-gray-500">No options available</div>
    );
  };

  const renderPeriodPicker = () => {
    if (selectedPeriod === "Yearly") {
      const currentYear = new Date().getFullYear();
      const selectedYear = filters.periodValue ? parseInt(filters.periodValue) : currentYear;
      const years = [];
      
      for (let year = 1999; year <= currentYear + 5; year++) {
        years.push(year);
      }
      
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <h3 className="text-sm font-medium mb-3 text-[#313166]">Select Year</h3>
          <div className="grid grid-cols-3 gap-2">
            {years.map((year) => (
              <button
                key={year}
                className={`p-2 rounded-md text-sm transition-colors ${selectedYear === year
                    ? "bg-[#313166] text-white"
                    : "bg-gray-100 text-[#313166] hover:bg-gray-200"
                  }`}
                onClick={() => {
                  onFilterChange("periodValue", year.toString());
                  setShowPeriodPicker(false);
                }}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      );
    } else if (selectedPeriod === "Quarterly") {
      const quarters = ["Q1", "Q2", "Q3", "Q4"];
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <div className="grid grid-cols-2 gap-2">
            {quarters.map((quarter) => (
              <button
                key={quarter}
                className={`p-2 rounded-md ${filters.periodValue === quarter
                    ? "bg-[#2e2d5f] text-white"
                    : "bg-gray-100 text-[#2e2d5f] hover:bg-gray-200"
                  }`}
                onClick={() => {
                  onFilterChange("periodValue", quarter);
                  setShowPeriodPicker(false);
                }}
              >
                {quarter}
              </button>
            ))}
          </div>
        </div>
      );
    } else if (selectedPeriod === "Monthly") {
      const months = [
        { name: "Jan", value: "01" }, { name: "Feb", value: "02" },
        { name: "Mar", value: "03" }, { name: "Apr", value: "04" },
        { name: "May", value: "05" }, { name: "Jun", value: "06" },
        { name: "Jul", value: "07" }, { name: "Aug", value: "08" },
        { name: "Sep", value: "09" }, { name: "Oct", value: "10" },
        { name: "Nov", value: "11" }, { name: "Dec", value: "12" },
      ];
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <div className="grid grid-cols-3 gap-2">
            {months.map((month) => (
              <button
                key={month.value}
                className={`p-2 rounded-md text-sm ${filters.periodValue === month.value
                    ? "bg-[#2e2d5f] text-white"
                    : "bg-gray-100 text-[#2e2d5f] hover:bg-gray-200"
                  }`}
                onClick={() => {
                  onFilterChange("periodValue", month.value);
                  setShowPeriodPicker(false);
                }}
              >
                {month.name}
              </button>
            ))}
          </div>
        </div>
      );
    }
  };

  const getPeriodButtonDisplay = () => {
    if (!filters.periodValue) {
      return (
        <>
          <Calendar size={18} className="text-[#313166]" />
          <span>Select {selectedPeriod}</span>
        </>
      );
    }

    if (selectedPeriod === "Yearly") {
      return (
        <>
          <Calendar size={18} className="text-[#313166]" />
          <span>Year {filters.periodValue}</span>
        </>
      );
    } else if (selectedPeriod === "Quarterly") {
      return (
        <>
          <Calendar size={18} className="text-[#313166]" />
          <span>{filters.periodValue} {new Date().getFullYear()}</span>
        </>
      );
    } else if (selectedPeriod === "Monthly") {
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const monthIndex = parseInt(filters.periodValue, 10) - 1;
      const monthName = monthNames[monthIndex] || filters.periodValue;
      return (
        <>
          <Calendar size={18} className="text-[#313166]" />
          <span>{monthName} {new Date().getFullYear()}</span>
        </>
      );
    }

    return (
      <>
        <Calendar size={18} className="text-[#313166]" />
        <span>Select {selectedPeriod}</span>
      </>
    );
  };

  // Map all filter options to FilterItem components
  const renderFilterItems = () => {
    if (!apiFilterOptions) return null;

    // Define the order of static filters
    const staticFilters = [
      { key: "name", name: "Name" },
      { key: "mobileNumber", name: "Mobile Number" },
      { key: "gender", name: "Gender" },
      { key: "firstVisit", name: "First Visit" },
      { key: "source", name: "Source" },
    ];

    // Get all other filters (excluding static ones)
    const otherFilters = Object.keys(apiFilterOptions)
      .filter(key => !staticFilters.some(f => f.key === key))
      .map(key => ({ key, name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) }));

    // Combine static filters with other filters
    const allFilters = [...staticFilters, ...otherFilters];

    return allFilters.map(({ key, name }) => (
      <FilterItem
        key={key}
        name={name}
        expanded={expandedFilter === key}
        onToggle={() => toggleFilter(key)}
      >
        {renderFilterInput(key, apiFilterOptions[key])}
      </FilterItem>
    ));
  };

  return (
    <div className="bg-white rounded-tl-[20px] rounded-bl-[20px] shadow-sm h-full overflow-hidden flex flex-col">
      {/* Filter Header with Applied Count & Clear */}
      <div className="flex items-center justify-between p-4 border-b">
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

      {/* Period Selection */}
      <div className="p-4 border-b mb-2">
        <div className="flex gap-2 h-8 w-full justify-between mb-3">
          {["Yearly", "Quarterly", "Monthly"].map((period) => (
            <button
              key={period}
              className={`px-1.5 py-1 rounded text-[13px] transition-colors ${selectedPeriod === period
                  ? "bg-[#313166] text-white"
                  : "text-gray-600 hover:bg-gray-100"
                }`}
              onClick={() => {
                onPeriodChange(period);
                if (period === "Yearly" && !filters.periodValue) {
                  onFilterChange("periodValue", new Date().getFullYear().toString());
                } else if (period !== "Yearly") {
                  onFilterChange("periodValue", "");
                }
              }}
            >
              {period}
            </button>
          ))}
        </div>
        
        <div className="w-full">
          <button
            className="w-full rounded-lg text-[14px] text-[#313166] flex items-center justify-center gap-2 hover:bg-gray-50 px-3 py-2 border border-[#313166] bg-white transition-colors font-medium"
            onClick={() => setShowPeriodPicker(true)}
            title={`Select ${selectedPeriod} Period`}
          >
            {getPeriodButtonDisplay()}
          </button>
        </div>
      </div>

      {/* Period Picker Modal */}
      {showPeriodPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            {renderPeriodPicker()}
            <div className="text-right mt-2">
              <button
                className="px-2 py-0 text-sm bg-[#313166] text-white rounded"
                onClick={() => setShowPeriodPicker(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
        {loading ? (
          <div className="p-4 text-center">Loading filters...</div>
        ) : (
          renderFilterItems()
        )}
      </div>
    </div>
  );
};

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