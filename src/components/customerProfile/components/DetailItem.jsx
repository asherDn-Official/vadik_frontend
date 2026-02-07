import React, { useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DetailItem = React.memo(
  ({
    label,
    name,
    defaultValue,
    section = "basic",
    isEditable = false,
    value,
    onChange,
    customer,
    isEditing,
    error,
  }) => {
    // Get field data from the nested structure
    const fieldData = customer?.[section]?.[name] || {};
    const fieldType = fieldData.type || getFieldType(customer, section, name);
    const inputType = getInputType(fieldType);
    const options = fieldData.options || [];

    // Convert DD/MM/YYYY string to Date object for DatePicker
    const parseDateFromString = useCallback((dateString) => {
      if (!dateString) return null;

      try {
        // Handle both DD/MM/YYYY and other formats
        if (typeof dateString === "string" && dateString.includes("/")) {
          const [day, month, year] = dateString.split("/").map(Number);
          // Validate date components
          if (day > 0 && day <= 31 && month > 0 && month <= 12 && year > 1900) {
            return new Date(year, month - 1, day);
          }
        }

        // Fallback: try parsing as Date object
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date;
      } catch {
        return null;
      }
    }, []);

    const handleInputChange = useCallback(
      (e) => {
        onChange(section, name, e.target.value);
      },
      [onChange, section, name]
    );

    const handleSelectChange = useCallback(
      (e) => {
        onChange(section, name, e.target.value);
      },
      [onChange, section, name]
    );

    const handleDateChange = useCallback(
      (date) => {
        if (date && !isNaN(date.getTime())) {
          // Format date as DD/MM/YYYY
          const day = date.getDate().toString().padStart(2, "0");
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const year = date.getFullYear();
          const formattedDate = `${year}-${month}-${day}`;
          onChange(section, name, formattedDate);
        } else {
          onChange(section, name, "");
        }
      },
      [onChange, section, name]
    );

    // Format value for display (non-editing mode) - FIXED: Returns string only
    const formatDisplayValue = useCallback(() => {
      if (fieldType === "date") {
        // For date fields, display as stored (DD/MM/YYYY) or format if needed
        const displayValue = value || fieldData.value || defaultValue;
        if (!displayValue) return "";

        // If it's already a string in DD/MM/YYYY format, return it
        if (typeof displayValue === "string" && displayValue.includes("/")) {
          return displayValue;
        }

        // If it's a Date object, convert to DD/MM/YYYY string
        if (displayValue instanceof Date) {
          const day = displayValue.getDate().toString().padStart(2, "0");
          const month = (displayValue.getMonth() + 1)
            .toString()
            .padStart(2, "0");
          const year = displayValue.getFullYear();
          return `${day}/${month}/${year}`;
        }

        // Try to parse other date formats
        try {
          const date = new Date(displayValue);
          if (!isNaN(date.getTime())) {
            const day = date.getDate().toString().padStart(2, "0");
            const month = (date.getMonth() + 1).toString().padStart(2, "0");
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
          }
        } catch {
          // If parsing fails, return empty string or original value as string
          return typeof displayValue === "string"
            ? displayValue
            : String(displayValue || "");
        }

        return typeof displayValue === "string"
          ? displayValue
          : String(displayValue || "");
      }

      // For non-date fields, use the existing formatter
      const fieldValue = fieldData.value || defaultValue;
      return formatFieldForDisplay(fieldValue, fieldType);
    }, [fieldType, value, fieldData.value, defaultValue]);

    // Custom input component for DatePicker to match styling
    const CustomDateInput = React.forwardRef(
      ({ value, onClick, onChange, error }, ref) => (
        <input
          type="text"
          value={value}
          onClick={onClick}
          onChange={onChange}
          ref={ref}
          placeholder="DD/MM/YYYY"
          className={`mt-1 px-2 py-1 border ${
            error ? "border-red-500" : "border-gray-300"
          } rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-full cursor-pointer`}
          autoComplete="off"
          readOnly
        />
      )
    );

    const displayValue = formatDisplayValue();
    const displayContent =
      displayValue === null || displayValue === undefined || displayValue === ""
        ? "\u00A0"
        : displayValue.replace(/,\s*/g, ", ");


    return (
      <div
        className="flex items-center justify-between px-3 py-4 rounded-[14px]"
        style={{ border: "1px solid #3131661A" }}
      >
        <div className="flex items-center gap-x-5">
          {fieldData.iconUrl && (
            <img src={fieldData.iconUrl} alt={label} className="w-12 h-12" />
          )}
          <div className="flex-1">
            <p className="font-medium text-[16px] leading-normal tracking-normal text-[#31316699]">
              {label}
            </p>
            {isEditing && isEditable ? (
              fieldType === "options" ? (
                <div>
                  <select
                    value={value || ""}
                    onChange={handleSelectChange}
                    className={`mt-1 px-2 py-1 border ${
                      error ? "border-red-500" : "border-gray-300"
                    } rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-full`}
                  >
                    <option value="">Select an option</option>
                    {options.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {error && (
                    <p className="text-red-500 text-xs mt-1">{error}</p>
                  )}
                </div>
              ) : fieldType === "date" ? (
                <div>
                  <DatePicker
                    selected={parseDateFromString(value)}
                    onChange={handleDateChange}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="DD/MM/YYYY"
                    maxDate={new Date()} // Prevents future dates
                    customInput={<CustomDateInput error={error} />}
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={100}
                    showMonthDropdown
                    dropdownMode="select"
                  />
                  {error && (
                    <p className="text-red-500 text-xs mt-1">{error}</p>
                  )}
                </div>
              ) : (
                <div>
                  <input
                    type={inputType}
                    value={value || ""}
                    onChange={handleInputChange}
                    className={`mt-1 px-2 py-1 border ${
                      error ? "border-red-500" : "border-gray-300"
                    } rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-full`}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    autoComplete="off"
                  />
                  {error && (
                    <p className="text-red-500 text-xs mt-1">{error}</p>
                  )}
                </div>
              )
            ) : (
              <p className="font-medium text-[16px] leading-[30px] tracking-normal text-[#313166]">
                {displayContent}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
);

// Helper functions
const getFieldType = (customer, section, name) => {
  // Your implementation here
  return "text";
};

const getInputType = (fieldType) => {
  const typeMap = {
    email: "email",
    number: "number",
    tel: "tel",
    url: "url",
    date: "text",
    password: "password",
    default: "text",
  };
  return typeMap[fieldType] || typeMap.default;
};

const formatFieldForDisplay = (value, fieldType) => {
  if (value === null || value === undefined) return "";

  // Ensure we never return a Date object, only strings
  if (value instanceof Date) {
    const day = value.getDate().toString().padStart(2, "0");
    const month = (value.getMonth() + 1).toString().padStart(2, "0");
    const year = value.getFullYear();
    return `${day}/${month}/${year}`;
  }

  return String(value);
};

export default DetailItem;
