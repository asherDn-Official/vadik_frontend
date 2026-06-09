import React, { useState, useEffect } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
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

const renderModernDateHeader = ({
  date,
  decreaseMonth,
  increaseMonth,
  changeMonth,
  changeYear,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 121 }, (_, index) => currentYear - 110 + index);
  const months = Array.from({ length: 12 }, (_, index) => ({
    value: index,
    label: new Date(2024, index, 1).toLocaleString("en-US", { month: "short" }),
  }));

  return (
    <div className="border-b border-[#EEF1FF] px-3 py-3">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={decreaseMonth}
          disabled={prevMonthButtonDisabled}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E4E8F6] bg-white text-[#5C628B] transition hover:bg-[#F8F9FF] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous month"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="grid flex-1 grid-cols-2 gap-2">
          <select
            value={date.getMonth()}
            onChange={(event) => changeMonth(Number(event.target.value))}
            className="rounded-xl border border-[#E4E8F6] bg-[#FCFCFF] px-3 py-2 text-sm font-medium text-[#313166] outline-none transition focus:border-[#313166]/20"
            aria-label="Select month"
          >
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>

          <select
            value={date.getFullYear()}
            onChange={(event) => changeYear(Number(event.target.value))}
            className="rounded-xl border border-[#E4E8F6] bg-[#FCFCFF] px-3 py-2 text-sm font-medium text-[#313166] outline-none transition focus:border-[#313166]/20"
            aria-label="Select year"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={increaseMonth}
          disabled={nextMonthButtonDisabled}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E4E8F6] bg-white text-[#5C628B] transition hover:bg-[#F8F9FF] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next month"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

const FilterPanel = ({
  filters,
  onFilterChange,
  selectedPeriod,
  onPeriodChange,
  timeFilterMode = "period",
  appliedFiltersCount,
  clearAllFilters,
  onFilteredDataChange, // New prop to pass filtered data to parent
}) => {
  const [expandedFilter, setExpandedFilter] = useState(null);
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);
  const [apiFilterOptions, setApiFilterOptions] = useState(null);
  const [dynamicFilterData, setDynamicFilterData] = useState(null);
  const [maxLoyaltyPoints, setMaxLoyaltyPoints] = useState(10000);
  // const [loading, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState([]); // Local state for filtered data
  const [retailerId, setRetailerId] = useState(() => {
    return localStorage.getItem("retailerId") || "";
  });


  // Date helpers to ensure YYYY-MM-DD format without timezone shifts
  const formatDateToYMD = (date) => {
    if (!date) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const parseYMDToLocalDate = (ymd) => {
    if (!ymd) return null;
    const [y, m, d] = ymd.split("-").map(Number);
    if (!y || !m || !d) return null;
    // Construct local date to avoid UTC offset issues
    return new Date(y, m - 1, d);
  };

  // Helper function to convert display name to filter key
  const getFilterKey = (displayName) => {
    return displayName
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "");
  };

  // Initialize defaults on component mount
  // React.useEffect(() => {
  //   if (!selectedPeriod) {
  //     onPeriodChange("Yearly");
  //   }

  //   if (!filters.periodValue && selectedPeriod === "Yearly") {
  //     const currentYear = new Date().getFullYear().toString();
  //     onFilterChange("periodValue", currentYear);
  //   }
  // }, [selectedPeriod, filters.periodValue, onPeriodChange, onFilterChange]);

  // Fetch filter options from API
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // setLoading(true);
        const response = await api.get(
          `/api/customer-preferences/${retailerId}`
        );

        const getSource = await api.get('/api/retailer/getSource');

        const apiData = response.data;

        if (apiData.maxLoyaltyPoints) {
          setMaxLoyaltyPoints(apiData.maxLoyaltyPoints);
        }

        const mergedData = {
          allData: [
            ...(apiData?.additionalData || []).map(item => ({ ...item, fieldKey: `additionalData.${item.key}` })),
            ...(apiData?.advancedDetails || []).map(item => ({ ...item, fieldKey: `advancedDetails.${item.key}` })),
            ...(apiData?.advancedPrivacyDetails || []).map(item => ({ ...item, fieldKey: `advancedPrivacyDetails.${item.key}` })),
          ],
        };

        // Process API data to create filter options
        const processedOptions = {
          // Static filters
          firstname: { type: "string" },
          lastname: { type: "string" },
          countryCode: { type: "string" },
          mobileNumber: { type: "number" },
          gender: ["male", "female", "others"],
          firstVisit: { type: "date" },
          source: getSource?.data?.data,
          loyaltyPoints: { type: "number" },
          isActive: ['true', 'false'],
        };

        // Process dynamic filters from mergedData.allData
        if (mergedData.allData && Array.isArray(mergedData.allData)) {
          mergedData.allData.forEach((item) => {
            const filterKey = item.fieldKey;

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

  const hasFilterValue = (value) => {
    if (value === undefined || value === null || value === "") {
      return false;
    }

    if (typeof value === "object") {
      return Object.values(value).some(
        (nestedValue) =>
          nestedValue !== undefined &&
          nestedValue !== null &&
          nestedValue !== "",
      );
    }

    return true;
  };

  const handleDateRawChange = (e) => {
    let value = e.target.value;
    // Remove all non-numeric characters
    value = value.replace(/\D/g, "");

    // Limit to 8 digits
    if (value.length > 8) value = value.slice(0, 8);

    // Add slashes automatically
    let formattedValue = "";
    if (value.length > 0) {
      formattedValue = value.slice(0, 2);
      if (value.length > 2) {
        formattedValue += "/" + value.slice(2, 4);
        if (value.length > 4) {
          formattedValue += "/" + value.slice(4, 8);
        }
      }
    }

    e.target.value = formattedValue;
  };

  const renderFilterInput = (filterKey, filterConfig) => {
    if (filterKey === "loyaltyPoints" && filterConfig?.type === "number") {
      const loyaltyFilter = filters[filterKey] || {};
      const min = 0;
      const max = maxLoyaltyPoints;

      const value = [
        parseInt(loyaltyFilter.value) || min,
        parseInt(loyaltyFilter.valueTo) || max
      ];

      return (
        <div className="mt-2 space-y-4 px-2">
          <ReactSlider
            className="loyalty-slider"
            thumbClassName="loyalty-slider-thumb"
            trackClassName="loyalty-slider-track"
            value={value}
            min={min}
            max={max}
            onChange={(val) => {
              onFilterChange(filterKey, {
                operator: "between",
                value: val[0].toString(),
                valueTo: val[1].toString(),
              });
            }}
            pearling
            minDistance={10}
            renderThumb={(props, state) => (
              <div {...props}>
                <div className="loyalty-slider-value">{state.valueNow}</div>
              </div>
            )}
          />

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                min="0"
                placeholder="From"
                className="w-full p-2 border rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-[#2e2d5f] focus:border-transparent"
                value={loyaltyFilter.value || ""}
                onChange={(e) => {
                  let val = e.target.value;
                  if (val !== "") {
                    const numVal = parseInt(val);
                    if (numVal < 0) val = "0";
                    if (numVal > max) val = max.toString();
                  }
                  onFilterChange(filterKey, {
                    operator: "between",
                    value: val,
                    valueTo: loyaltyFilter.valueTo || "",
                  });
                }}
              />
            </div>
            <span className="text-gray-400">to</span>
            <div className="relative flex-1">
              <input
                type="number"
                min="0"
                max={max}
                placeholder="To"
                className="w-full p-2 border rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-[#2e2d5f] focus:border-transparent"
                value={loyaltyFilter.valueTo || ""}
                onChange={(e) => {
                  let val = e.target.value;
                  if (val !== "") {
                    const numVal = parseInt(val);
                    if (numVal < 0) val = "0";
                    if (numVal > max) val = max.toString();
                  }
                  onFilterChange(filterKey, {
                    operator: "between",
                    value: loyaltyFilter.value || "",
                    valueTo: val,
                  });
                }}
              />
            </div>
          </div>
          {loyaltyFilter.value && loyaltyFilter.valueTo && parseInt(loyaltyFilter.value) > parseInt(loyaltyFilter.valueTo) && (
            <p className="text-[10px] text-red-500 mt-1">"From" value should be less than "To" value</p>
          )}
          {hasFilterValue(loyaltyFilter) && (
            <button
              className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
              onClick={() => onFilterChange(filterKey, "")}
            >
              <X size={12} /> Clear Range
            </button>
          )}
        </div>
      );
    }

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
                {option.charAt(0).toUpperCase() + option.slice(1)}
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
            onChange={(e) => {
              let val = e.target.value;
              if (val !== "" && parseInt(val) < 0) val = "0";
              onFilterChange(filterKey, val);
            }}
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
              selected={
                filters[filterKey]
                ? (typeof filters[filterKey] === "string"
                    ? parseYMDToLocalDate(filters[filterKey])
                    : filters[filterKey] instanceof Date
                      ? filters[filterKey]
                      : null)
                : null
            }
            onChange={(date, event) => {
              if (date instanceof Date && !isNaN(date)) {
                onFilterChange(filterKey, formatDateToYMD(date));
              } else if (event?.target?.value === "") {
                onFilterChange(filterKey, "");
              }
            }}
            onChangeRaw={handleDateRawChange}
            dateFormat="dd/MM/yyyy"
            placeholderText="Select date"
            className="w-full rounded-xl border border-[#E4E8F6] bg-[#FCFCFF] p-2.5 pr-10 text-sm text-[#313166] outline-none transition focus:border-[#313166]/20 focus:ring-2 focus:ring-[#313166]/10"
              wrapperClassName="modern-datepicker-field"
              popperClassName="modern-datepicker-popper"
              calendarClassName="modern-datepicker-calendar"
              dayClassName={() => "modern-datepicker-day"}
              showPopperArrow={false}
              portalId="root"
              popperPlacement="bottom-start"
              renderCustomHeader={renderModernDateHeader}
              maxDate={new Date()}
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
      const selectedYear = 
         parseInt(filters.periodValue)
       
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

  const renderDateRangeSection = () => {
    const fromDate = filters.fromDate ? parseYMDToLocalDate(filters.fromDate) : null;
    const toDate = filters.toDate ? parseYMDToLocalDate(filters.toDate) : null;

    return (
      <div className="border-b border-[#EEF1FF] px-4 py-4 sm:px-5">
        <div className="mb-3 flex items-center gap-2">
          <Calendar size={18} className="text-[#313166]" />
          <h3 className="text-sm font-semibold text-[#313166]">Date Range</h3>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-[#8B90B2]">
              From
            </label>
            <DatePicker
              selected={fromDate}
              onChange={(date, event) => {
                if (date instanceof Date && !isNaN(date)) {
                  onFilterChange("fromDate", formatDateToYMD(date));
                } else if (event?.target?.value === "") {
                  onFilterChange("fromDate", "");
                }
              }}
              onChangeRaw={handleDateRawChange}
              dateFormat="dd/MM/yyyy"
              placeholderText="Select start date"
              className="w-full rounded-xl border border-[#E4E8F6] bg-[#FCFCFF] p-2.5 pr-10 text-sm text-[#313166] outline-none transition focus:border-[#313166]/20 focus:ring-2 focus:ring-[#313166]/10"
              wrapperClassName="modern-datepicker-field"
              popperClassName="modern-datepicker-popper"
              calendarClassName="modern-datepicker-calendar"
              dayClassName={() => "modern-datepicker-day"}
              showPopperArrow={false}
              portalId="root"
              popperPlacement="bottom-start"
              renderCustomHeader={renderModernDateHeader}
              maxDate={toDate || new Date()}
              isClearable={false}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-[#8B90B2]">
              To
            </label>
            <DatePicker
              selected={toDate}
              onChange={(date, event) => {
                if (date instanceof Date && !isNaN(date)) {
                  onFilterChange("toDate", formatDateToYMD(date));
                } else if (event?.target?.value === "") {
                  onFilterChange("toDate", "");
                }
              }}
              onChangeRaw={handleDateRawChange}
              dateFormat="dd/MM/yyyy"
              placeholderText="Select end date"
              className="w-full rounded-xl border border-[#E4E8F6] bg-[#FCFCFF] p-2.5 pr-10 text-sm text-[#313166] outline-none transition focus:border-[#313166]/20 focus:ring-2 focus:ring-[#313166]/10"
              wrapperClassName="modern-datepicker-field"
              popperClassName="modern-datepicker-popper"
              calendarClassName="modern-datepicker-calendar"
              dayClassName={() => "modern-datepicker-day"}
              showPopperArrow={false}
              portalId="root"
              popperPlacement="bottom-start"
              renderCustomHeader={renderModernDateHeader}
              minDate={fromDate || null}
              maxDate={new Date()}
              isClearable={false}
            />
          </div>
        </div>

        {(filters.fromDate || filters.toDate) && (
          <button
            className="mt-3 text-xs font-medium text-[#D64045] transition hover:underline"
            onClick={() => {
              onFilterChange("fromDate", "");
              onFilterChange("toDate", "");
            }}
          >
            Clear date range
          </button>
        )}
      </div>
    );
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
      { key: "firstname", name: "firstname", label: "First Name", iconName: "person" },
      { key: "lastname", name: "lastname", label: "Last Name", iconName: "person" },
      { key: "mobileNumber", name: "mobileNumber", label: "Mobile Number", iconName: "phone" },
      { key: "gender", name: "gender", label: "Gender", iconName: "person" },
      { key: "firstVisit", name: "firstVisit", label: "First Visit", iconName: "calendar" },
      { key: "source", name: "source", label: "Source", iconName: "location" },
      { key: "loyaltyPoints", name: "loyaltyPoints", label: "Loyalty Points", iconName: "gift" },
      { key: "isActive", name: "isActive", label: "Active Status", iconName: "activity" }
    ];

    // Get dynamic filters from API data
    const dynamicFilters = dynamicFilterData.map((item) => ({
      key: item.fieldKey,
      name: item.fieldKey,
      label: item.key,
      iconName: item.iconName || "filter",
    }));

    // console.log(dynamicFilters)

    // Combine static filters with dynamic filters
    const allFilters = [...staticFilters, ...dynamicFilters];

    return allFilters.map(({ key, name, label, iconName }) => (
      <FilterItem
        key={key}
        name={label || name}
        // icon={getIconComponent(iconName)}
        expanded={expandedFilter === key}
        onToggle={() => toggleFilter(key)}
        isActive={hasFilterValue(filters[name])}
      >
        {renderFilterInput(name, apiFilterOptions[key])}
      </FilterItem>
    ));
  };
  

  return (
    <div className="flex h-full min-h-0 flex-col overflow-visible bg-white">
      {/* Filter Header with Applied Count & Clear */}

      <div className="flex items-center justify-between gap-3 border-b border-[#EEF1FF] px-4 py-4 sm:px-5">
        <div>
          <h2 className="text-[20px] font-semibold text-[#313166]">Filters</h2>
        </div>
        <div className="flex gap-1">
          <div className="flex items-center rounded-xl bg-[#F3F5FF] px-3 py-2 text-[12px] font-semibold text-[#313166]">
            <span className="mr-2">{appliedFiltersCount} applied</span>
            <button
              onClick={() => {
                clearAllFilters();
                setFilteredData([]); // Clear filtered data when clearing filters
                if (onFilteredDataChange) {
                  onFilteredDataChange([]);
                }
              }}
              className="text-[#313166] transition hover:text-gray-800 focus:outline-none"
              aria-label="Clear filters"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      {timeFilterMode === "dateRange" ? (
        renderDateRangeSection()
      ) : (
        <>
          {/* Period Selection */}
          <div className="border-b border-[#EEF1FF] px-4 py-4 sm:px-5">
            <div className="mb-3 grid h-auto w-full grid-cols-1 gap-2 sm:grid-cols-3">
              {["Yearly", "Quarterly", "Monthly"].map((period) => (
                <button
                  key={period}
                  className={`rounded-xl px-2 py-2 text-[13px] font-medium transition-colors ${selectedPeriod === period
                    ? "bg-[#313166] text-white"
                    : "bg-[#F8F9FF] text-[#5C628B] hover:bg-[#EEF1FF]"
                    }`}
                  onClick={() => {
                    onPeriodChange(period);
                    if (period !== "Yearly") {
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
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#E4E8F6] bg-[#FCFCFF] px-3 py-2.5 text-[14px] font-medium text-[#313166] transition-colors hover:bg-[#F8F9FF]"
                onClick={() => setShowPeriodPicker(true)}
                title={`Select ${selectedPeriod} Period`}
              >
                {getPeriodButtonDisplay()}
              </button>
            </div>
          </div>

          {/* Period Picker Modal */}
          {showPeriodPicker && (
            <div className="layer-modal fixed inset-0 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
                {renderPeriodPicker()}
                <div className="mt-2 text-right">
                  <button
                    className="rounded-lg bg-[#313166] px-3 py-1.5 text-sm text-white"
                    onClick={() => setShowPeriodPicker(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Filter Groups */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {false ? (
          <></>
        ) : (
          <div className="min-h-full">
            {renderFilterItems()}
          </div>
        )}
      </div>
    </div>
  );
};

const FilterItem = ({ name, expanded, onToggle, children, icon, isActive }) => {
  return (
    <div className={`border-b border-[#EEF1FF] px-4 py-3 last:border-b-0 sm:px-5 ${isActive ? 'bg-[#FAFBFF]' : ''}`}>
      <button
        className="flex w-full items-center justify-between gap-3 py-2 text-[14px] font-medium text-[#313166] outline-none"
        onClick={onToggle}
      >
        <div className="min-w-0 flex items-center capitalize">
          {/* {icon && <span className=\"mr-2\">{icon}</span>} */}
          <span className={`break-words ${isActive ? 'font-semibold text-[#313166]' : ''}`}>{name}</span>
        </div>
        <span className={`text-[#313166] ${isActive ? 'font-semibold' : ''}`}>
          {expanded ? <Minus size={16} /> : <Plus size={16} />}
        </span>
      </button>
      {expanded && <div className="pt-1">{children}</div>}
    </div>
  );
};

export default FilterPanel;
