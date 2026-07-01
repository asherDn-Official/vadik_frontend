import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Camera, User, X } from "lucide-react";
import PhoneInput, {
  isValidPhoneNumber,
  parsePhoneNumber,
} from "react-phone-number-input";
import "react-phone-number-input/style.css";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, isValid } from "date-fns";
import api from "../../api/apiconfig";
import showToast from "../../utils/ToastNotification";
import ManageSourcesPopup from "./components/ManageSourcesPopup.jsx";
import {
  MAX_CUSTOMER_LABELS,
  normalizeCustomerLabels,
} from "../../utils/customerLabelUtils";

const MAX_PROFILE_PICTURE_SIZE_BYTES = 2 * 1024 * 1024;
const PROFILE_PICTURE_SIZE_ERROR =
  "Profile picture must be 2 MB or smaller. Please upload a smaller image.";

const CustomerForm = ({ onSubmit, resetForm, isSubmitting = false }) => {
  const [sources, setSources] = React.useState([]);
  const [uniqueLabels, setUniqueLabels] = React.useState([]);
  const [showSourcePopup, setShowSourcePopup] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [profilePreview, setProfilePreview] = useState(null);
  const [profileFile, setProfileFile] = useState(null);

  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        showToast("Unsupported image format. Please upload a JPG, JPEG, PNG, or WebP file.", "error");
        setProfileFile(null);
        setProfilePreview(null);
        e.target.value = "";
        return;
      }

      if (file.size > MAX_PROFILE_PICTURE_SIZE_BYTES) {
        showToast(PROFILE_PICTURE_SIZE_ERROR, "error");
        setProfileFile(null);
        setProfilePreview(null);
        e.target.value = "";
        return;
      }

      setProfileFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePicture = () => {
    setProfileFile(null);
    setProfilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const sanitizeSourceName = React.useCallback(
    (value = "") => value.trim().toLowerCase(),
    [],
  );

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
      labels: "",
    },
    mode: "onChange",
  });

  const [retailerId] = React.useState(() => localStorage.getItem("retailerId") || "");

  // Fetch sources on component mount
  React.useEffect(() => {
    fetchSources();
    fetchLabels();
  }, []);

  // Fetch unique labels from preferences
  const fetchLabels = async () => {
    try {
      if (!retailerId) return;
      const response = await api.get(`/api/customer-preferences/${retailerId}`);
      if (response.data && response.data.uniqueLabels) {
        setUniqueLabels(response.data.uniqueLabels);
      }
    } catch (error) {
      console.error("Error fetching labels:", error);
    }
  };

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
          const nextSource =
            currentSource && fetchedSources.includes(currentSource)
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

  // Handle sources update from popup
  const handleSourcesUpdate = (updatedSources) => {
    setSources(updatedSources);

    const currentSource = getValues("source");
    const nextSelection =
      currentSource && updatedSources.includes(currentSource)
        ? currentSource
        : (updatedSources[0] ?? "");

    setValue("source", nextSelection);
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
    const formattedDate = format(value, "dd/MM/yyyy");
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

    if (!dateRegex.test(formattedDate)) {
      return "Date must be in DD/MM/YYYY format";
    }

    return true;
  };

  const validateMobileNumber = (value) => {
    if (!value) return "Mobile Number is required";

    const phoneNumber = parsePhoneNumber(value);
    if (!phoneNumber) return "Invalid phone number";

    const nationalNumber = phoneNumber.nationalNumber;
    const countryCallingCode = phoneNumber.countryCallingCode;

    // Must be between 4 and 14 digits
    if (nationalNumber.length < 4 || nationalNumber.length > 14) {
      return "Mobile number must be between 4 and 14 digits";
    }

    // Country code must be between 1 and 4 digits
    if (countryCallingCode.length < 1 || countryCallingCode.length > 4) {
      return "Invalid country code";
    }

    return true;
  };

  const onFormSubmit = (data) => {
    const phoneNumber = parsePhoneNumber(data.mobileNumber);
    const countryCode = phoneNumber.countryCallingCode;
    const mobileNumber = phoneNumber.nationalNumber;

    // Ensure firstVisit is sent as YYYY-MM-DD string
    const firstVisitDate = data.firstVisit ? new Date(data.firstVisit) : null;
    const formattedFirstVisit = firstVisitDate
      ? `${firstVisitDate.getFullYear()}-${String(
          firstVisitDate.getMonth() + 1,
        ).padStart(2, "0")}-${String(firstVisitDate.getDate()).padStart(
          2,
          "0",
        )}`
      : null;

    onSubmit({
      ...data,
      countryCode,
      mobileNumber,
      firstVisit: formattedFirstVisit,
      profilePicture: profileFile,
    });
  };

  const inputStyles = `
  h-14 w-full
  rounded-2xl

  border border-[#E8ECF8]

  bg-[#F8F9FF]
  px-4

  text-sm text-[#1F1C5C]

  outline-none

  transition-all duration-200

  placeholder:text-[#8B90B2]

  focus:border-[#313166]/20
  focus:bg-white
  focus:shadow-[0_0_0_4px_rgba(49,49,102,0.06)]
`;

  const today = new Date().toISOString().split("T")[0];
  const mobileNumber = watch("mobileNumber");

  return (
    <>
      {/* Manage Sources Popup */}
      <ManageSourcesPopup
        show={showSourcePopup}
        onClose={() => setShowSourcePopup(false)}
        sources={sources}
        onSourcesUpdate={handleSourcesUpdate}
        updateSources={updateSources}
        loading={loading}
        setLoading={setLoading}
        sanitizeSourceName={sanitizeSourceName}
      />

      <form
        onSubmit={handleSubmit(onFormSubmit)}
        className="flex flex-col gap-8"
      >
        {/* Profile Picture Upload */}
        <div className="flex flex-col items-center justify-center gap-4 py-4">
          <div className="relative group">
            <div
              className={`
                w-32 h-32 rounded-full overflow-hidden
                border-2 border-dashed border-[#E8ECF8]
                bg-[#F8F9FF] flex items-center justify-center
                transition-all duration-200
                group-hover:border-[#313166]/40
              `}
            >
              {profilePreview ? (
                <img
                  src={profilePreview}
                  alt="Profile Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={48} className="text-[#8B90B2]" />
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="
                absolute bottom-0 right-0
                p-2 rounded-full bg-white
                border border-[#EEF1FF]
                text-[#313166] shadow-lg
                hover:bg-[#F8F9FF] transition-all
              "
            >
              <Camera size={18} />
            </button>

            {profilePreview && (
              <button
                type="button"
                onClick={removeProfilePicture}
                className="
                  absolute top-0 right-0
                  p-1.5 rounded-full bg-red-50
                  border border-red-100
                  text-red-500 shadow-sm
                  hover:bg-red-100 transition-all
                "
              >
                <X size={14} />
              </button>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <div className="text-center">
            <p className="text-sm font-medium text-[#313166]">Customer Picture</p>
            <p className="text-xs text-[#8B90B2] mt-1">PNG, JPG up to 1MB</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="space-y-2">
            <label
              className="
  mb-2 block
  text-sm font-medium
  text-[#313166]
"
            >
              First Name *
            </label>
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
              className={`${inputStyles} ${
                errors.firstname ? "border-red-400 focus:shadow-red-100" : ""
              }`}
            />
            {errors.firstname && (
              <p className="text-red-500 text-xs">{errors.firstname.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              className="
  mb-2 block
  text-sm font-medium
  text-[#313166]
"
            >
              Last Name
            </label>
            <input
              type="text"
              placeholder="Last Name"
              {...register("lastname", {
                maxLength: {
                  value: 20,
                  message: "Cannot exceed 20 characters",
                },
                pattern: {
                  value: /^[a-zA-Z\u00C0-\u017F\s'-]*$/,
                  message: "Only letters, hyphens, and apostrophes allowed",
                },
              })}
              className={`${inputStyles} ${
                errors.lastname ? "border-red-400 focus:shadow-red-100" : ""
              }`}
            />
            {errors.lastname && (
              <p className="text-red-500 text-xs">{errors.lastname.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="space-y-2">
            <label
              className="
  mb-2 block
  text-sm font-medium
  text-[#313166]
"
            >
              Mobile Number *
            </label>
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
                  className={`
                    phone-input-modern

                    h-14 w-full

                    rounded-2xl
                    border

                    ${errors.mobileNumber ? "border-red-400" : "border-[#E8ECF8]"}

                    bg-[#F8F9FF]

                    px-4

                    text-sm text-[#1F1C5C]

                    transition-all duration-200

                    focus-within:border-[#313166]/20
                    focus-within:bg-white
                    focus-within:shadow-[0_0_0_4px_rgba(49,49,102,0.06)]
                  `}
                  inputStyle={{ width: "100%", padding: "0.5rem" }}
                  dropdownClass="text-gray-700"
                  countryCallingCodeEditable={false}
                  limitMaxLength={true}
                />
              )}
            />
            {errors.mobileNumber && (
              <p className="text-red-500 text-xs">
                {errors.mobileNumber.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Enter 4-14 digit mobile number
            </p>
          </div>

          <div className="space-y-2">
            <label
              className="
  mb-2 block
  text-sm font-medium
  text-[#313166]
"
            >
              Gender *
            </label>
            <select
              {...register("gender", { required: "Gender is required" })}
              className={`${inputStyles} appearance-none ${
                errors.gender ? "border-red-400" : ""
              }`}
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
              <label
                className="
  mb-2 block
  text-sm font-medium
  text-[#313166]
"
              >
                Source *
              </label>
              <div
                className="text-sm text-blue-400 underline cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => setShowSourcePopup(true)}
              >
                Manage Sources
              </div>
            </div>
            <select
              {...register("source", { required: "Source is required" })}
              className={`${inputStyles} ${
                errors.source ? "border-red-400" : ""
              }`}
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
            <label
              className="
  mb-2 block
  text-sm font-medium
  text-[#313166]
"
            >
              First Visit Date *
            </label>
            <Controller
              name="firstVisit"
              control={control}
              rules={{
                required: "First Visit Date is required",
                validate: validateDateFormat,
              }}
              render={({ field }) => (
                <DatePicker
                  className={inputStyles}
                  selected={field.value}
                  onChange={(date) => field.onChange(date)}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="DD/MM/YYYY"
                  minDate={new Date(2000, 0, 1)}
                  maxDate={new Date()}
                  showYearDropdown
                  scrollableYearDropdown
                />
              )}
            />
            {errors.firstVisit && (
              <p className="text-red-500 text-xs">
                {errors.firstVisit.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="mb-2 block text-sm font-medium text-[#313166]">
              Labels (comma-separated)
            </label>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="VIP, New, Summer Sale"
                {...register("labels", {
                  validate: (value) => {
                    const labels = normalizeCustomerLabels(value);
                    return (
                      labels.length <= MAX_CUSTOMER_LABELS ||
                      `You can add up to ${MAX_CUSTOMER_LABELS} labels only`
                    );
                  },
                })}
                className={inputStyles}
              />
              {errors.labels && (
                <p className="text-red-500 text-xs">{errors.labels.message}</p>
              )}
              
              {uniqueLabels.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-[#8B90B2] w-full mb-1">Quick Add:</span>
                  {uniqueLabels.map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        const currentLabels = normalizeCustomerLabels(
                          getValues("labels") || "",
                        );
                        const existingKeys = new Set(
                          currentLabels.map((item) => item.toLowerCase()),
                        );

                        if (existingKeys.has(label.toLowerCase())) {
                          return;
                        }

                        if (currentLabels.length >= MAX_CUSTOMER_LABELS) {
                          showToast(
                            `You can add up to ${MAX_CUSTOMER_LABELS} labels only.`,
                            "error",
                          );
                          return;
                        }

                        setValue("labels", [...currentLabels, label].join(", "));
                      }}
                      className="px-2 py-1 text-[10px] bg-[#F3F5FF] text-[#313166] rounded-full border border-[#E8ECF8] hover:bg-[#E8ECF8] transition-colors"
                    >
                      + {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-[#8B90B2]">Add tags to group and filter customers</p>
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="
              inline-flex items-center justify-center

              h-14
              rounded-2xl

              bg-[#313166]

              px-8

              text-sm font-semibold
              text-white

              shadow-[0_10px_30px_rgba(49,49,102,0.18)]

              transition-all duration-200

              hover:scale-[1.01]
              hover:bg-[#272757]

              disabled:cursor-not-allowed
              disabled:opacity-60
            "
            disabled={loading || isSubmitting}
          >
            {loading || isSubmitting ? "Processing..." : "Create Customer"}
          </button>
        </div>
      </form>
    </>
  );
};

export default CustomerForm;
