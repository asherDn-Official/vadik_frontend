import React, { useState, useEffect } from "react";
import {
  Calendar,
  Search,
  Plus,
  Minus,
  X,
  User,
  Phone,
  MapPin,
  ShoppingCart,
  Star,
  Palette,
  Ruler,
  Gift,
  Activity,
  Heart,
  MessageCircle,
  Tag,
  FileText,
  Filter,
} from "lucide-react";

import ReactSlider from "react-slider";
import api from "../../api/apiconfig";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const FilterPanel = ({
  filters,
  onFilterChange,
  selectedPeriod,
  onPeriodChange,
  appliedFiltersCount,
  clearAllFilters,
  onFilteredDataChange, // New prop to pass filtered data to parent
}) => {
  const [expandedFilter, setExpandedFilter] = useState(null);
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);
  const [apiFilterOptions, setApiFilterOptions] = useState(null);
  const [dynamicFilterData, setDynamicFilterData] = useState(null);
  // const [loading, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState([]); // Local state for filtered data
  const [retailerId, setRetailerId] = useState(() => {
    return localStorage.getItem("retailerId") || "";
  });


  // Helper function to convert display name to filter key
  const getFilterKey = (displayName) => {
    return displayName
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "");
  };

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
        // setLoading(true);
        const response = await api.get(
          `/api/customer-preferences/${retailerId}`
        );
        const apiData = response.data;

        const mergedData = {
          allData: [
            ...apiData?.additionalData,
            ...apiData?.advancedDetails,
            ...apiData?.advancedPrivacyDetails,
          ],
        };

        // Process API data to create filter options
        const processedOptions = {
          // Static filters
          firstname: { type: "string" },
          lastname: { type: "string" },
          mobileNumber: { type: "number" },
          gender: ["Male", "Female", "Others"],
          firstVisit: { type: "date" },
          source: ["Walk In", "Website", "Social Media"],
          isActive: ['true', 'false'],
        };

        // Process dynamic filters from mergedData.allData
        if (mergedData.allData && Array.isArray(mergedData.allData)) {
          mergedData.allData.forEach((item) => {
            const filterKey = getFilterKey(item.key);

            if (item.type === "options" && item.options) {
              // Add "All" option at the beginning for multi-select filters
              processedOptions[filterKey] = [...item.options];
            } else if (item.type === "string") {
              processedOptions[filterKey] = { type: "string" };
            } else if (item.type === "date") {
              processedOptions[filterKey] = { type: "date" };
            }
          });
        }

        setApiFilterOptions(processedOptions);
        setDynamicFilterData(mergedData.allData || []);
      } catch (error) {
        console.error("Error fetching filter options:", error);
      } finally {
        // setLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);

  const toggleFilter = (key) => {
    setExpandedFilter((prev) => (prev === key ? null : key));
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
          {filters[filterKey] && (
            <button
              className="ml-2 px-2 py-1 text-[10px] text-red-600 hover:underline"
              onClick={() => onFilterChange(filterKey, '')}
              aria-label={`Clear ${filterKey}`}
            >
              Clear
            </button>
          )}
        </div>
      );
    } else if (filterConfig?.type === "string") {
      return (
        <div className="mt-2 relative">
          <input
            type="text"
            placeholder={`Enter ${filterKey
              .replace(/([A-Z])/g, " $1")
              .toLowerCase()}`}
            className="w-full p-2 pl-8 pr-10 border rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-[#2e2d5f] focus:border-transparent"
            value={filters[filterKey] || ""}
            onChange={(e) => onFilterChange(filterKey, e.target.value)}
          />
          <Search
            size={16}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
          />
          {filters[filterKey] && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => onFilterChange(filterKey, '')}
              aria-label={`Clear ${filterKey}`}
            >
              <X size={14} />
            </button>
          )}
        </div>
      );
    } else if (filterConfig?.type === "number") {
      return (
        <div className="mt-2 relative">
          <input
            type="number"
            placeholder={`Enter ${filterKey
              .replace(/([A-Z])/g, " $1")
              .toLowerCase()}`}
            className="w-full p-2 pl-8 pr-10 border rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-[#2e2d5f] focus:border-transparent"
            value={filters[filterKey] || ""}
            onChange={(e) => onFilterChange(filterKey, e.target.value)}
            min="0"
          />
          <Search
            size={16}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
          />
          {filters[filterKey] && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => onFilterChange(filterKey, '')}
              aria-label={`Clear ${filterKey}`}
            >
              <X size={14} />
            </button>
          )}
        </div>
      );
    } else if (filterConfig?.type === "date") {
      return (
        <div className="mt-2 relative ">
          <DatePicker
            selected={filters[filterKey] ? new Date(filters[filterKey]) : null}
            onChange={(date) => onFilterChange(filterKey, date || '')}
            dateFormat="dd/MM/yyyy"
            placeholderText="Select date"
            className=" w-full p-2 pr-10 border rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-[#2e2d5f] focus:border-transparent"
            isClearable={false}
          />

          {filters[filterKey] && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => onFilterChange(filterKey, '')}
              aria-label={`Clear ${filterKey}`}
            >
              <X size={14} />
            </button>
          )}
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
      const selectedYear = filters.periodValue
        ? parseInt(filters.periodValue)
        : currentYear;
      const years = [];

      for (let year = 1999; year <= currentYear + 5; year++) {
        years.push(year);
      }

      return (
        <div className="bg-white p-4 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <h3 className="text-sm font-medium mb-3 text-[#313166]">
            Select Year
          </h3>
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
        { name: "Jan", value: "01" },
        { name: "Feb", value: "02" },
        { name: "Mar", value: "03" },
        { name: "Apr", value: "04" },
        { name: "May", value: "05" },
        { name: "Jun", value: "06" },
        { name: "Jul", value: "07" },
        { name: "Aug", value: "08" },
        { name: "Sep", value: "09" },
        { name: "Oct", value: "10" },
        { name: "Nov", value: "11" },
        { name: "Dec", value: "12" },
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
          <span>
            {filters.periodValue} {new Date().getFullYear()}
          </span>
        </>
      );
    } else if (selectedPeriod === "Monthly") {
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const monthIndex = parseInt(filters.periodValue, 10) - 1;
      const monthName = monthNames[monthIndex] || filters.periodValue;
      return (
        <>
          <Calendar size={18} className="text-[#313166]" />
          <span>
            {monthName} {new Date().getFullYear()}
          </span>
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
    if (!apiFilterOptions || !dynamicFilterData) return null;

    // Define the order of static filters
    const staticFilters = [
      { key: "firstname", name: "FirstName", iconName: "person" },
      { key: "lastname", name: "LastName", iconName: "person" },
      { key: "mobileNumber", name: "Mobile Number", iconName: "phone" },
      { key: "gender", name: "Gender", iconName: "person" },
      { key: "firstVisit", name: "First Visit", iconName: "calendar" },
      { key: "source", name: "Source", iconName: "location" },
      { key: "isActive", name: "Active", iconName: "activity" }
    ];

    // Get dynamic filters from API data
    const dynamicFilters = dynamicFilterData.map((item) => ({
      key: getFilterKey(item.key),
      name: item.key,
      iconName: item.iconName || "filter",
    }));

    console.log(dynamicFilters)

    // Combine static filters with dynamic filters
    const allFilters = [...staticFilters, ...dynamicFilters];

    return allFilters.map(({ key, name, iconName }) => (
      <FilterItem
        key={key}
        name={name}
        // icon={getIconComponent(iconName)}
        expanded={expandedFilter === key}
        onToggle={() => toggleFilter(key)}
        isActive={filters[name] !== undefined && filters[name] !== ''}
      >
        {renderFilterInput(name, apiFilterOptions[key])}
      </FilterItem>
    ));
  };

  return (
    <div className="bg-white rounded-tl-[20px] rounded-bl-[20px] shadow-sm h-screen  overflow-hidden flex flex-col min-h-0">
      {/* Filter Header with Applied Count & Clear */}

      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold">Filter</h2>
        <div className="flex gap-1">
          <div className="flex items-center bg-[#3131661A] font-[500] px-2 py-1 rounded-[5px] text-[#313166] text-[12px]">
            <span className="mr-2">{appliedFiltersCount} applied</span>
            <button
              onClick={() => {
                clearAllFilters();
                setFilteredData([]); // Clear filtered data when clearing filters
                if (onFilteredDataChange) {
                  onFilteredDataChange([]);
                }
              }}
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
                  onFilterChange(
                    "periodValue",
                    new Date().getFullYear().toString()
                  );
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

      {/* Filter Groups */}
      <div className="space-y-2 flex-1 min-h-0 overflow-y-auto scroll-m-3">
        {false ? (
          <></>
        ) : (
          <div className="min-h-full max-h-10">
            {renderFilterItems()}
          </div>
        )}
      </div>
    </div>
  );
};

const FilterItem = ({ name, expanded, onToggle, children, icon, isActive }) => {
  return (
    <div className={`border-b border-gray-200 last:border-b-0 p-4 pt-2 mt-0 ${isActive ? 'bg-[#f5f5ff]' : ''}`}>
      <button
        className="w-full flex justify-between items-center py-2 text-[14px] font-[400] text-[#313166]"
        onClick={onToggle}
      >
        <div className="flex items-center">
          {/* {icon && <span className=\"mr-2\">{icon}</span>} */}
          <span className={`${isActive ? 'font-semibold text-[#313166]' : ''}`}>{name}</span>
        </div>
        <span className={`text-[#313166] ${isActive ? 'font-semibold' : ''}`}>
          {expanded ? <Minus size={16} /> : <Plus size={16} />}
        </span>
      </button>
      {expanded && <div>{children}</div>}
    </div>
  );
};

export default FilterPanel;
