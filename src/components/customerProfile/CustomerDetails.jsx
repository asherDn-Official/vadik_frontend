import React, { useState, useEffect, useCallback, useMemo } from "react";
import { XCircle, CheckCircle, List, BarChart } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import menDefaultUrl from "../../../public/assets/men.png";
import womenDefaultUrl from "../../../public/assets/women.png";
import allowNotificationIconUrl from "../../../public/assets/allowNotification.png";
import loyalityIconUrl from "../../../public/assets/loyality.png";

import * as yup from "yup";
import {
  extractFieldValue,
  transformCustomerData,
  transformFormDataToAPI,
  formatFieldForDisplay,
  getInputType,
  getFieldType,
} from "../../utils/customerDataUtils";
import EditIcon from "../../../public/assets/edit-icon.png";
import profileImg from "../../../public/assets/profile.png";
import PurchaseHistory from "../customeroppertunites/PurchaseHistory";
import { formatIndianMobile } from "./formatIndianMobile";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DetailItem from "./components/DetailItem";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import api from "../../api/apiconfig";

const FieldItem = React.memo(
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
    options: externalOptions,
    fieldType: externalFieldType,
  }) => {
    // Get field data from the nested structure
    const fieldData = customer?.[section]?.[name] || {};
    const isGender = section === "basic" && name === "gender";
    const isMobileNumber = section === "basic" && name === "mobileNumber";
    const isSource = section === "basic" && name === "source";

    // Determine field type
    const fieldType =
      externalFieldType || isGender
        ? "options"
        : isSource
        ? "options"
        : fieldData.type || getFieldType(customer, section, name);

    const inputType = getInputType(fieldType);

    // Determine options
    const options =
      externalOptions ||
      (isGender ? ["male", "female", "others"] : fieldData.options || []);

    // Get the actual value to display - prioritize props over fieldData
    const actualValue =
      value !== undefined ? value : fieldData.value || defaultValue;

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

    const handlePhoneChange = useCallback(
      (phoneValue) => {
        onChange(section, name, phoneValue);
      },
      [onChange, section, name]
    );

    // Debug logging (remove in production)
    useEffect(() => {
      if (fieldType === "options" && isEditing) {
        console.log("Dropdown debug:", {
          label,
          value: actualValue,
          options,
          hasMatch: options.includes(actualValue),
        });
      }
    }, [fieldType, isEditing, actualValue, options, label]);

    // Special rendering for mobile number field
    if (isMobileNumber && isEditing && isEditable) {
      return (
        <div className="mb-4">
          <p className="font-normal text-[14px] leading-[30px] tracking-normal text-[#31316699]">
            {label}
          </p>
          <div
            className={`phone-input-container border ${
              error ? "border-red-500" : "border-gray-300"
            } rounded `}
          >
            <PhoneInput
              international
              defaultCountry="IN"
              value={actualValue || ""}
              onChange={handlePhoneChange}
              className="w-full py-1.5 px-0.5 outline-none"
              inputClassName="!border-none !focus:ring-0 !w-full !py-2 !px-3 !text-sm !font-medium !text-gray-900"
              numberInputProps={{
                className: "focus:ring-0 focus:outline-none",
              }}
            />
          </div>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
      );
    }

    return (
      <div className="mb-4">
        <p className="font-normal text-[14px] leading-[30px] tracking-normal text-[#31316699]">
          {label}
        </p>
        {isEditing && isEditable ? (
          fieldType === "options" ? (
            <div>
              <select
                value={actualValue || ""}
                onChange={handleSelectChange}
                className={`text-sm font-medium text-gray-900 border ${
                  error ? "border-red-500" : "border-gray-300"
                } rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full`}
              >
                <option value="">Select an option</option>
                {options.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
          ) : (
            <div>
              <input
                type={inputType}
                value={actualValue || ""}
                onChange={handleInputChange}
                className={`text-sm font-medium text-gray-900 border ${
                  error ? "border-red-500" : "border-gray-300"
                } rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full`}
                placeholder={`Enter ${label.toLowerCase()}`}
                autoComplete="off"
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
          )
        ) : (
          <p className="font-medium text-[16px] leading-[30px] tracking-normal text-[#313166]">
            {formatFieldForDisplay(actualValue, fieldType)}
          </p>
        )}
      </div>
    );
  }
);

// Set display names for debugging
FieldItem.displayName = "FieldItem";
DetailItem.displayName = "DetailItem";

// Validation schema for basic fields
const basicSchema = yup.object().shape({
  firstname: yup
    .string()
    .required("First name is required")
    .matches(/^[A-Za-z\s]+$/, "Only letters are allowed")
    .min(3, "Must be at least 3 characters")
    .max(15, "Must be 15 characters or less"),
  lastname: yup
    .string()
    .required("Last name is required")
    .matches(/^[A-Za-z\s]+$/, "Only letters are allowed")
    .min(1, "Must be at least 1 character")
    .max(15, "Must be 15 characters or less"),
  source: yup.string().optional(),
  customerId: yup.string().optional(),
  firstVisit: yup.string().optional(),
  mobileNumber: yup
    .string()
    .required("Mobile number is required")
    .test(
      "is-indian-number",
      "Enter a valid 10-digit Indian mobile number after +91 (e.g., +919876543210)",
      (value) => {
        if (!value) return false;
        const normalized = String(value).replace(/\s/g, "");
        return /^\+?91[6-9]\d{9}$/.test(normalized);
      }
    ),
});

// Validation schema for store information fields
const storeSchema = yup.object().shape({
  storeName: yup
    .string()
    .required("Store name is required")
    .min(3, "Store name must be at least 3 characters")
    .max(18, "Store name cannot exceed 18 characters"),
  address: yup
    .string()
    .required("Address is required")
    .min(10, "Address must be at least 10 characters")
    .max(40, "Address cannot exceed 40 characters"),
  city: yup
    .string()
    .required("City/Town is required")
    .max(18, "City/Town cannot exceed 18 characters"),
  pincode: yup
    .string()
    .required("Pincode is required")
    .matches(/^\d{6}$/, "Pincode must be exactly 6 digits"),
});

const CustomerDetails = ({
  customer,
  activeTab,
  setActiveTab,
  isEditing,
  editedData,
  onEdit,
  onCancel,
  onSave,
  onInputChange,
  isLoading,
}) => {
  // Transform customer data to handle new nested structure
  const transformedCustomer = useMemo(
    () => transformCustomerData(customer),
    [customer]
  );

  // Initialize form data with proper default values
  const [formData, setFormData] = useState(() => {
    if (transformedCustomer) {
      return {
        basic: {
          firstname: transformedCustomer?.firstname || "",
          lastname: transformedCustomer?.lastname || "",
          mobileNumber: "+" + transformedCustomer?.mobileNumber || "",
          source: transformedCustomer?.source || "",
          customerId: transformedCustomer?.customerId || "",
          firstVisit: transformedCustomer?.firstVisit
            ? new Date(transformedCustomer.firstVisit).toLocaleDateString()
            : "",
          loyaltyPoints: transformedCustomer?.loyaltyPoints ?? "",
          isOptedIn: transformedCustomer?.isOptedIn ?? null,
          optinMessageSent: transformedCustomer?.optinMessageSent ?? null,
          gender: transformedCustomer?.gender || "",
          isActive: transformedCustomer?.isActive || "",
        },
        additionalData: transformedCustomer?.additionalData || {},
        advancedDetails: transformedCustomer?.advancedDetails || {},
        advancedPrivacyDetails:
          transformedCustomer?.advancedPrivacyDetails || {},
      };
    }
    return {
      basic: {
        firstname: "",
        lastname: "",
        mobileNumber: "",
        source: "",
        customerId: "",
        firstVisit: "",
        loyaltyPoints: "",
        isOptedIn: null,
        optinMessageSent: null,
        gender: "",
        isActive: false,
      },
      additionalData: {},
      advancedDetails: {},
      advancedPrivacyDetails: {},
    };
  });
  const [sourceOptions, setSourceOptions] = useState([]);
  // State for validation errors
  const [errors, setErrors] = useState({
    basic: {},
    additionalData: {},
    advancedDetails: {},
    advancedPrivacyDetails: {},
  });
  // Track touched fields
  const [touched, setTouched] = useState({
    basic: {},
    additionalData: {},
    advancedDetails: {},
    advancedPrivacyDetails: {},
  });

  // Update form data when customer data changes
  useEffect(() => {
    if (transformedCustomer) {
      const newFormData = {
        basic: {
          firstname: transformedCustomer?.firstname || "",
          lastname: transformedCustomer?.lastname || "",
          mobileNumber: "+" + transformedCustomer?.mobileNumber || "",
          source: transformedCustomer?.source || "",
          customerId: transformedCustomer?.customerId || "",
          firstVisit: transformedCustomer?.firstVisit
            ? new Date(transformedCustomer.firstVisit).toLocaleDateString()
            : "",
          loyaltyPoints: transformedCustomer?.loyaltyPoints ?? "",
          isOptedIn: transformedCustomer?.isOptedIn ?? null,
          optinMessageSent: transformedCustomer?.optinMessageSent ?? null,
          gender: transformedCustomer?.gender || "",
          isActive: transformedCustomer?.isActive || "",
        },
        additionalData: transformedCustomer?.additionalData || {},
        advancedDetails: transformedCustomer?.advancedDetails || {},
        advancedPrivacyDetails:
          transformedCustomer?.advancedPrivacyDetails || {},
      };
      setFormData(newFormData);
    }
  }, [transformedCustomer]);

  // Memoized callback for handling input changes
  const handleInputChange = useCallback((section, name, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: value,
      },
    }));

    setTouched((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: true,
      },
    }));

    setErrors((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: null,
      },
    }));
  }, []);

  const customerName = useMemo(() => {
    const first = formData?.basic?.firstname?.trim() || "";
    const last = formData?.basic?.lastname?.trim() || "";
    return [first, last].filter(Boolean).join(" ");
  }, [formData?.basic?.firstname, formData?.basic?.lastname]);

  const handleCustomerNameChange = useCallback(
    (value) => {
      const normalized = value.replace(/\s+/g, " ").trim();
      if (!normalized) {
        handleInputChange("basic", "firstname", "");
        handleInputChange("basic", "lastname", "");
        return;
      }
      const parts = normalized.split(" ");
      const first = parts.shift() || "";
      const last = parts.join(" ");
      handleInputChange("basic", "firstname", first);
      handleInputChange("basic", "lastname", last);
    },
    [handleInputChange]
  );

  // Validate form in real-time
  useEffect(() => {
    const validateForm = async () => {
      try {
        // Validate basic fields
        await basicSchema.validateAt("firstname", formData.basic);
        setErrors((prev) => ({
          ...prev,
          basic: {
            ...prev.basic,
            firstname: null,
          },
        }));
      } catch (err) {
        if (touched.basic?.firstname) {
          setErrors((prev) => ({
            ...prev,
            basic: {
              ...prev.basic,
              firstname: err.message,
            },
          }));
        }
      }

      try {
        await basicSchema.validateAt("lastname", formData.basic);
        setErrors((prev) => ({
          ...prev,
          basic: {
            ...prev.basic,
            lastname: null,
          },
        }));
      } catch (err) {
        if (touched.basic?.lastname) {
          setErrors((prev) => ({
            ...prev,
            basic: {
              ...prev.basic,
              lastname: err.message,
            },
          }));
        }
      }

      try {
        await basicSchema.validateAt("mobileNumber", formData.basic);
        setErrors((prev) => ({
          ...prev,
          basic: {
            ...prev.basic,
            mobileNumber: null,
          },
        }));
      } catch (err) {
        if (touched.basic?.mobileNumber) {
          setErrors((prev) => ({
            ...prev,
            basic: {
              ...prev.basic,
              mobileNumber: err.message,
            },
          }));
        }
      }
    };

    if (isEditing) {
      validateForm();
    }
  }, [formData, touched, isEditing]);

  const tabs = [
    "Advanced Details",
    "Additional Details",
    "Advanced Privacy",
    "Activity",
    // "Referral",
  ];

  useEffect(() => {
    async function fetchSourceOptions() {
      try {
        const response = await api.get("/api/retailer/getSource");
        setSourceOptions(response.data.data);
      } catch (error) {
        console.log(error);
      }
    }

    fetchSourceOptions();
  }, []);

  const renderStars = (rating) => {
    if (!rating) return null;
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="text-yellow-400">
          ★
        </span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-400">
          ☆
        </span>
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300">
          ★
        </span>
      );
    }

    return stars;
  };

  // Memoized function to render dynamic fields
  const renderDynamicFields = useCallback(
    (fields, section) => {
      if (!fields) return null;

      return Object.entries(fields).map(([key, value]) => {
        const isEditable = isEditing;

        if (
          section === "advancedPrivacyDetails" &&
          key.toLowerCase().includes("satisfaction")
        ) {
          return (
            <div
              key={key}
              className="flex items-center p-4 border-b border-gray-100"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4">
                <img
                  src="../ssets/score-icon.png"
                  alt={key}
                  className="w-12 h-12"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1">{key}</p>
                <div className="flex items-center">{renderStars(value)}</div>
              </div>
            </div>
          );
        } else {
          return (
            <DetailItem
              key={key}
              label={key}
              name={key}
              defaultValue={value}
              section={section}
              isEditable={isEditable}
              value={formData?.[section]?.[key]}
              onChange={handleInputChange}
              customer={customer}
              isEditing={isEditing}
              error={errors?.[section]?.[key]}
            />
          );
        }
      });
    },
    [formData, isEditing, handleInputChange, customer, errors]
  );

  const defaultImage = {
    menDefaultImgUrl: menDefaultUrl,
    femaleDefaultImgUrl: womenDefaultUrl,
  };

  const isCustomerActive = transformedCustomer?.isActive === true;
  const statusLabel = isCustomerActive ? "Active" : "Inactive";
  const statusIndicatorColor = isCustomerActive ? "bg-green-500" : "bg-red-500";
  const statusBadgeClasses = isCustomerActive
    ? "bg-green-50 text-green-700"
    : "bg-red-50 text-red-700";

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate basic fields
      await basicSchema.validate(formData.basic, { abortEarly: false });

      // Transform the form data back to API format
      const formattedData = transformFormDataToAPI(formData, customer);

      // Call the parent save handler with formatted data
      onSave(formattedData);
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const newErrors = {};
        err.inner.forEach((error) => {
          newErrors[error.path] = error.message;
        });
        setErrors((prev) => ({
          ...prev,
          basic: {
            ...prev.basic,
            ...newErrors,
          },
        }));
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F4F5F9]">
      <div className=" py-5  px-8">
        <h1 className="text-xl font-semibold text-gray-900">
          Customer Profile
        </h1>
      </div>

      <div className="flex-1 px-8 overflow-y-auto">
        <form onSubmit={onSubmit}>
          <div className="rounded-lg ">
            {/* Profile Header */}
            <div className=" mb-3  border-b border-gray-200  bg-white rounded-[20px]  px-4 py-6 ">
              <div className="flex items-start justify-between ">
                <div className="flex items-center w-full">
                  <div className="relative pl-4">
                    <div
                      className={`absolute top-2 right-1 flex items-center gap-2 px-3 py-1 rounded-full shadow-sm border ${statusBadgeClasses}`}
                    >
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${statusIndicatorColor}`}
                      ></span>
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        {statusLabel}
                      </span>
                    </div>
                    <img
                      src={
                        transformedCustomer?.profileImage ||
                        transformedCustomer?.gender === "male"
                          ? defaultImage.menDefaultImgUrl
                          : transformedCustomer?.gender === "female"
                          ? defaultImage.femaleDefaultImgUrl
                          : transformedCustomer?.gender === "others"
                          ? defaultImage.menDefaultImgUrl
                          : defaultImage.menDefaultImgUrl
                      }
                      alt={`${transformedCustomer?.firstname} ${transformedCustomer?.lastname}`}
                      className="w-[202px] h-[192px] rounded-2xl   "
                    />
                  </div>
                  {/* Basic Details Sections */}
                  <div className="ml-16 w-full  pr-8 pt-3">
                    <div className="flex items-center justify-between mb-1  ">
                      <h2 className="font-semibold text-[18px] leading-[30px] tracking-normal text-[#313166] font-poppins border-b-[1.5px] border-[#313166] pb-[2px]">
                        Basic Details
                      </h2>

                      {!isEditing ? (
                        <button
                          type="button"
                          onClick={onEdit}
                          className="px-4 py-2 text-[#313166] border border-1 border-[#31316680] rounded-lg text-sm font-medium   flex items-center"
                        >
                          <img
                            src={EditIcon}
                            className="w-4 h-4 mr-2"
                            alt="Edit"
                          />
                          Edit
                        </button>
                      ) : (
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-[#313166] text-white rounded-lg text-sm font-medium hover:bg-[#27275a] focus:outline-none focus:ring-2 focus:ring-[#313166]"
                          >
                            Update Changes
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-10  ">
                      <div className="mb-4">
                        <p className="font-normal text-[14px] leading-[30px] tracking-normal text-[#31316699]">
                          Name
                        </p>
                        {isEditing ? (
                          <div>
                            <input
                              type="text"
                              value={customerName}
                              onChange={(e) =>
                                handleCustomerNameChange(e.target.value)
                              }
                              className={`text-sm font-medium text-gray-900 border ${
                                errors?.basic?.firstname ||
                                errors?.basic?.lastname
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full`}
                              placeholder="Enter customer name"
                              autoComplete="off"
                            />
                            {(errors?.basic?.firstname ||
                              errors?.basic?.lastname) && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors?.basic?.firstname ||
                                  errors?.basic?.lastname}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="font-medium text-[16px] leading-[30px] tracking-normal text-[#313166]">
                            {customerName || "-"}
                          </p>
                        )}
                      </div>
                      <FieldItem
                        label="Mobile Number"
                        name="mobileNumber"
                        defaultValue={formatIndianMobile(
                          transformedCustomer?.mobileNumber
                        )}
                        isEditable={isEditing}
                        value={formData?.basic?.mobileNumber}
                        onChange={handleInputChange}
                        customer={customer}
                        isEditing={isEditing}
                        error={errors?.basic?.mobileNumber}
                      />
                      <FieldItem
                        label="Source"
                        name="source"
                        defaultValue={transformedCustomer?.source}
                        isEditable={isEditing}
                        value={formData?.basic?.source}
                        onChange={handleInputChange}
                        options={sourceOptions}
                        customer={customer}
                        isEditing={isEditing}
                      />
                      <FieldItem
                        label="Vadik ID"
                        name="customerId"
                        defaultValue={transformedCustomer?.customerId}
                        value={formData?.basic?.customerId}
                        onChange={handleInputChange}
                        customer={customer}
                        isEditing={isEditing}
                      />
                      <FieldItem
                        label="Gender"
                        name="gender"
                        defaultValue={transformedCustomer?.gender || ""}
                        value={formData?.basic?.gender}
                        onChange={handleInputChange}
                        customer={customer}
                        isEditing={isEditing}
                        isEditable={isEditing}
                      />
                      <FieldItem
                        label="First Visit"
                        name="firstVisit"
                        defaultValue={
                          transformedCustomer?.firstVisit
                            ? new Date(
                                transformedCustomer.firstVisit
                              ).toLocaleDateString()
                            : ""
                        }
                        value={formData?.basic?.firstVisit}
                        onChange={handleInputChange}
                        customer={customer}
                        isEditing={isEditing}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="bg-white px-2 pt-5 rounded-[20px]">
              {/* Tabs */}
              <div className="border-b  border-gray-200  py-3 ">
                <nav className="flex space-x-8  px-4 pb-2 ">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`py-3 px-4 border-b-2 font-normal text-[16px] leading-[100%] rounded-[10px] ${
                        activeTab === tab
                          ? "bg-[#EC396F1A] text-[#EC396F]"
                          : "border-transparent text-[#31316680] hover:text-[#EC396F] hover:bg-[#EC396F1A]"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                  <div className="flex-1 flex justify-end items-center">
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={onEdit}
                        className="px-4 py-2 text-[#313166] border border-1 border-[#31316680] rounded-lg text-sm font-medium   flex items-center"
                      >
                        <img
                          src={EditIcon}
                          className="w-4 h-4 mr-2"
                          alt="Edit"
                        />
                        Edit
                      </button>
                    )}
                  </div>
                </nav>
              </div>

              {/* Tab Content */}
              <div className=" px-5 py-5  max-w-[95%]">
                {activeTab === "Advanced Details" && (
                  <div className="grid grid-cols-2 gap-3">
                    {transformedCustomer?.advancedDetails &&
                      renderDynamicFields(
                        transformedCustomer?.advancedDetails,
                        "advancedDetails"
                      )}
                  </div>
                )}

                {activeTab === "Advanced Privacy" && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                      {transformedCustomer?.advancedPrivacyDetails &&
                        renderDynamicFields(
                          transformedCustomer?.advancedPrivacyDetails,
                          "advancedPrivacyDetails"
                        )}
                    </div>

                    {/* Purchase History Section */}
                    <PurchaseHistory
                      mobileNumber={transformedCustomer?.mobileNumber}
                    />
                  </div>
                )}

                {activeTab === "Additional Details" && (
                  <div className="grid grid-cols-2 gap-2">
                    {transformedCustomer?.additionalData &&
                    Object.keys(transformedCustomer.additionalData).length >
                      0 ? (
                      renderDynamicFields(
                        transformedCustomer?.additionalData,
                        "additionalData"
                      )
                    ) : (
                      <div className="col-span-2 text-center py-8 text-gray-500">
                        No basic data available
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "Activity" && (
                  <div className=" grid grid-cols-2 gap-3">
                    <DetailItem
                      label="Loyalty Points"
                      name="loyaltyPoints"
                      defaultValue={transformedCustomer?.loyaltyPoints ?? ""}
                      section="basic"
                      isEditable={false}
                      value={formData?.basic?.loyaltyPoints}
                      onChange={handleInputChange}
                      customer={{
                        ...customer,
                        basic: {
                          ...customer?.basic,
                          loyaltyPoints: {
                            iconUrl: loyalityIconUrl,
                            value: formData?.basic?.loyaltyPoints,
                          },
                        },
                      }}
                      isEditing={isEditing}
                    />
                    <DetailItem
                      label="Allow Notifications"
                      name="isOptedIn"
                      defaultValue={
                        transformedCustomer?.isOptedIn === true
                          ? "Opt-In"
                          : "Opt-Out"
                      }
                      section="basic"
                      isEditable={false}
                      value={formData?.basic?.isOptedIn}
                      onChange={handleInputChange}
                      customer={{
                        ...customer,
                        basic: {
                          ...customer?.basic,
                          isOptedIn: {
                            iconUrl: allowNotificationIconUrl,
                            value: formData?.basic?.isOptedIn  === true ? "Opt-In" : "Opt-Out",
                          },
                        },
                      }}
                      isEditing={isEditing}
                    />
                  </div>
                )}

                {activeTab === "Referral" && (
                  <div className="p-6">
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              VID.No
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Phone Number
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Join Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Coupon Code
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {(transformedCustomer?.referralData || []).map(
                            (referral, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {referral?.vidNo}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {referral?.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {referral?.phoneNumber}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {referral?.joinDate}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <span
                                    className={`px-2 py-1 rounded text-xs ${
                                      referral?.status === "active"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {referral?.couponCode}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                      referral?.status === "active"
                                        ? "bg-green-500"
                                        : "bg-red-500"
                                    }`}
                                  >
                                    {referral?.status === "active" ? (
                                      <CheckCircle className="w-3 h-3 text-white" />
                                    ) : (
                                      <XCircle className="w-3 h-3 text-white" />
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                      {(transformedCustomer?.referralData || []).length ===
                        0 && (
                        <div className="text-center py-8 text-gray-500">
                          No referral data available
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Edit Mode Buttons */}
            {isEditing && (
              <div className="bg-white border-t border-gray-200 p-6 flex justify-center space-x-4">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="px-6 py-2 border border-pink-600 rounded-md text-sm font-medium text-pink-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-pink-600 text-white rounded-md text-sm font-medium hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50 flex items-center"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    "Update Changes"
                  )}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerDetails;
