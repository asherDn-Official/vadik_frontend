import React from "react";
import { Controller, useForm } from "react-hook-form";
import PhoneInput from "react-phone-number-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, isValid } from "date-fns";
import api from "../../api/apiconfig";

const CustomerForm = ({ onSubmit, resetForm }) => {
  const [sources, setSources] = React.useState([]);
  const [popupSources, setPopupSources] = React.useState([]);
  const [showSourcePopup, setShowSourcePopup] = React.useState(false);
  const [newSource, setNewSource] = React.useState("");
  const [sourceError, setSourceError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const sanitizeSourceName = React.useCallback((value = "") => value.trim().toLowerCase(), []);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstname: "",
      lastname: "",
      mobileNumber: "",
      source: "",
      gender: "",
      firstVisit: new Date(),
    },
    mode: "onChange",
  });

  // Fetch sources on component mount
  React.useEffect(() => {
    fetchSources();
  }, []);

  React.useEffect(() => {
    if (showSourcePopup) {
      setPopupSources(sources);
      setNewSource("");
      setSourceError("");
    }
  }, [showSourcePopup, sources]);

  // Reset form when resetForm prop changes
  React.useEffect(() => {
    if (resetForm) {
      reset();
    }
  }, [resetForm, reset]);

  // Fetch sources from API
  const fetchSources = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/retailer/getSource");
      if (response.data.status === "success") {
        const fetchedSources = response.data.data;
        setSources(fetchedSources);
        // Set default value to first source if available
        if (fetchedSources.length > 0) {
          const currentSource = getValues("source");
          const nextSource = currentSource && fetchedSources.includes(currentSource)
            ? currentSource
            : fetchedSources[0];
          setValue("source", nextSource);
        }
      }
    } catch (error) {
      console.error("Error fetching sources:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update sources in API
  const updateSources = async (updatedSources) => {
    try {
      setLoading(true);
      const payload = {
        sources: updatedSources,
      };
      const response = await api.patch("/api/retailer/getSource", payload);
      const statusText = response?.data?.status?.toLowerCase() ?? "";

      if (statusText.includes("success")) {
        const refreshedSources = response?.data?.data ?? updatedSources;
        return { success: true, sources: refreshedSources };
      }

      return { success: false };
    } catch (error) {
      console.error("Error updating sources:", error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Add new source
  const handleAddSource = () => {
    setSourceError("");
    const sanitizedSource = sanitizeSourceName(newSource);

    if (!sanitizedSource) {
      setSourceError("Please enter a source name.");
      return;
    }

    if (popupSources.includes(sanitizedSource)) {
      setSourceError("This source already exists!");
      return;
    }

    setPopupSources((prev) => [...prev, sanitizedSource]);
    setNewSource("");
  };

  const handleUpdateSourceName = (index, value) => {
    setSourceError("");
    const sanitizedSource = sanitizeSourceName(value);
    setPopupSources((prev) => {
      const next = [...prev];
      next[index] = sanitizedSource;
      return next;
    });
  };

  const handleRemoveSource = (index) => {
    setSourceError("");
    setPopupSources((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveSources = async () => {
    setSourceError("");

    const sanitizedList = popupSources
      .map((item) => sanitizeSourceName(item))
      .filter((item) => item.length > 0);

    if (sanitizedList.length !== popupSources.length) {
      setSourceError("Source names cannot be empty.");
      return;
    }

    const uniqueList = Array.from(new Set(sanitizedList));

    if (uniqueList.length !== sanitizedList.length) {
      setSourceError("Duplicate source names are not allowed.");
      return;
    }

    if (uniqueList.length === 0) {
      setSourceError("Please keep at least one source.");
      return;
    }

    const { success, sources: refreshedSources } = await updateSources(uniqueList);

    if (success) {
      const nextSources = refreshedSources ?? uniqueList;
      setSources(nextSources);
      setPopupSources(nextSources);
      setNewSource("");
      setShowSourcePopup(false);

      const currentSource = getValues("source");
      const nextSelection = currentSource && nextSources.includes(currentSource)
        ? currentSource
        : nextSources[0] ?? "";

      setValue("source", nextSelection);
    } else {
      setSourceError("Unable to update sources. Please try again.");
    }
  };

  const validateDateFormat = (value) => {
    if (!value) return "First Visit Date is required";

    // Check if it's a valid Date object
    if (!(value instanceof Date) || !isValid(value)) {
      return "Please enter a valid date";
    }

    // Reject unrealistic years (e.g., 1111)
    const year = value.getFullYear();
    const minYear = 2000;
    const maxYear = new Date().getFullYear();
    if (year < minYear) {
      return "Date must be 2000 or later";
    }
    if (year > maxYear) {
      return "Date cannot be in the future";
    }

    // Additional format validation if needed
    const formattedDate = format(value, 'dd/MM/yyyy');
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

    if (!dateRegex.test(formattedDate)) {
      return "Date must be in DD/MM/YYYY format";
    }

    return true;
  };

  const validateMobileNumber = (value) => {
    if (!value) return "Mobile Number is required";

    // Check if the phone number is valid (using libphonenumber-js or similar)
    if (!isValidPhoneNumber(value)) {
      return "Invalid phone number";
    }

    // Extract just the national number (last 10 digits)
    const nationalNumber = value.replace(/\D/g, '').slice(-10);

    // Must be exactly 10 digits
    if (nationalNumber.length !== 10) {
      return "Mobile number must be exactly 10 digits";
    }

    // Must start with 6, 7, 8, or 9 (India mobile numbers)
    if (!/^[6-9]\d{9}$/.test(nationalNumber)) {
      return "Mobile number must be valid India mobile number";
    }

    return true;
  };

  const onFormSubmit = (data) => {
    // Format mobile number by removing all non-digit characters
    const formattedMobile = data.mobileNumber.replace(/\D/g, "");

    // Ensure firstVisit is sent as YYYY-MM-DD string
    const firstVisitDate = data.firstVisit ? new Date(data.firstVisit) : null;
    const formattedFirstVisit = firstVisitDate
      ? `${firstVisitDate.getFullYear()}-${String(firstVisitDate.getMonth() + 1).padStart(2, "0")}-${String(firstVisitDate.getDate()).padStart(2, "0")}`
      : null;

    onSubmit({
      ...data,
      mobileNumber: formattedMobile,
      firstVisit: formattedFirstVisit,
    });
  };

  const today = new Date().toISOString().split("T")[0];
  const mobileNumber = watch("mobileNumber");

  return (
    <>
      {/* Add Source Popup */}
      {showSourcePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#313166]">Add New Source</h3>
              <button
                onClick={() => setShowSourcePopup(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#31316680] mb-2">Add New Source</label>
                <input
                  type="text"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  placeholder="Enter source name"
                  className="w-full p-2 border border-gray-300 rounded text-[#313166]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSource();
                    }
                  }}
                />
                {sourceError && (
                  <p className="text-red-500 text-xs mt-1">{sourceError}</p>
                )}
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowSourcePopup(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSource}
                  disabled={loading || !newSource.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Adding..." : "Add Source"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)} className="grid grid-cols-1 gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm text-[#31316680]">First Name *</label>
            <input
              type="text"
              placeholder="First Name"
              {...register("firstname", {
                required: "First Name is required",
                minLength: {
                  value: 3,
                  message: "Must be at least 3 characters",
                },
                maxLength: {
                  value: 20,
                  message: "Cannot exceed 20 characters",
                },
                pattern: {
                  value: /^[a-zA-Z\u00C0-\u017F\s'-]+$/,
                  message: "Only letters, hyphens, and apostrophes allowed",
                },
              })}
              className={`w-full p-2 border ${errors.firstname ? "border-red-500" : "border-gray-300"
                } rounded text-[#313166]`}
            />
            {errors.firstname && (
              <p className="text-red-500 text-xs">{errors.firstname.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-[#31316680]">Last Name *</label>
            <input
              type="text"
              placeholder="Last Name"
              {...register("lastname", {
                required: "Last Name is required",
                maxLength: {
                  value: 20,
                  message: "Cannot exceed 20 characters",
                },
                pattern: {
                  value: /^[a-zA-Z\u00C0-\u017F\s'-]+$/,
                  message: "Only letters, hyphens, and apostrophes allowed",
                },
              })}
              className={`w-full p-2 border ${errors.lastname ? "border-red-500" : "border-gray-300"
                } rounded text-[#313166]`}
            />
            {errors.lastname && (
              <p className="text-red-500 text-xs">{errors.lastname.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg">
          <div className="space-y-2">
            <label className="block text-sm text-[#31316680]">Mobile Number *</label>
            <Controller
              name="mobileNumber"
              control={control}
              rules={{
                validate: validateMobileNumber,
                required: "Mobile Number is required",
              }}
              render={({ field: { onChange, value } }) => (
                <PhoneInput
                  international
                  defaultCountry="IN"
                  value={value}
                  onChange={onChange}
                  className={`w-full p-2 border ${errors.mobileNumber ? "border-red-500" : "border-gray-300"
                    } rounded text-[#313166] `}
                  inputStyle={{ width: "100%", padding: "0.5rem" }}
                  dropdownClass="text-gray-700"
                  countryCallingCodeEditable={false}
                  limitMaxLength={true}
                />
              )}
            />
            {errors.mobileNumber && (
              <p className="text-red-500 text-xs">{errors.mobileNumber.message}</p>
            )}
            <p className="text-xs text-gray-500">Enter 10-digit mobile number</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-[#31316680]">Gender *</label>
            <select
              {...register("gender", { required: "Gender is required" })}
              className={`w-full p-2 border ${errors.gender ? "border-red-500" : "border-gray-300"
                } rounded text-[#313166] bg-white`}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="others">Others</option>
            </select>
            {errors.gender && (
              <p className="text-red-500 text-xs">{errors.gender.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm text-[#31316680]">Source *</label>
              <div 
                className="text-sm text-blue-400 underline cursor-pointer hover:text-blue-600"
                onClick={() => setShowSourcePopup(true)}
              >
                Add Source
              </div>
            </div>
            <select
              {...register("source", { required: "Source is required" })}
              className={`w-full p-2 border ${errors.source ? "border-red-500" : "border-gray-300"
                } rounded text-[#313166] bg-white`}
              disabled={loading || sources.length === 0}
            >
              {loading ? (
                <option value="">Loading sources...</option>
              ) : sources.length === 0 ? (
                <option value="">No sources available</option>
              ) : (
                sources.map((source, index) => (
                  <option key={index} value={source}>
                    {source.charAt(0).toUpperCase() + source.slice(1)}
                  </option>
                ))
              )}
            </select>
            {errors.source && (
              <p className="text-red-500 text-xs">{errors.source.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-[#31316680]">First Visit Date *</label>
            <Controller
              name="firstVisit"
              control={control}
              rules={{ required: "First Visit Date is required", validate: validateDateFormat }}
              render={({ field }) => (
                <DatePicker
                  selected={field.value}
                  onChange={(date) => field.onChange(date)}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="DD/MM/YYYY"
                  className={`w-full p-2 border ${errors.firstVisit ? "border-red-500" : "border-gray-300"
                    } rounded text-[#313166]`}
                  minDate={new Date(2025, 0, 1)}
                  maxDate={new Date()}
                  showYearDropdown
                  scrollableYearDropdown
                />
              )}
            />
            {errors.firstVisit && (
              <p className="text-red-500 text-xs">{errors.firstVisit.message}</p>
            )}
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-white bg-gradient-to-r from-[#CB376D] to-[#A72962] rounded hover:bg-pink-700 transition"
            disabled={loading}
          >
            {loading ? "Processing..." : "Create Customer"}
          </button>
        </div>
      </form>
    </>
  );
};

export default CustomerForm;