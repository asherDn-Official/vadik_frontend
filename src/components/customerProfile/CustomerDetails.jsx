import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { XCircle, CheckCircle, List, BarChart, Camera, User, X } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import menDefaultUrl from "/assets/men.png";
import womenDefaultUrl from "/assets/women.png";
import allowNotificationIconUrl from "/assets/allowNotification.png";
import loyalityIconUrl from "/assets/loyality.png";

import * as yup from "yup";
import {
  extractFieldValue,
  transformCustomerData,
  transformFormDataToAPI,
  formatFieldForDisplay,
  getInputType,
  getFieldType,
} from "../../utils/customerDataUtils";
import EditIcon from "/assets/edit-icon.png";
import profileImg from "/assets/profile.png";
import PurchaseHistory from "../customeroppertunites/PurchaseHistory";
import { formatIndianMobile } from "./formatIndianMobile";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DetailItem from "./components/DetailItem";
import showToast from "../../utils/ToastNotification";
import PhoneInput, {
  isValidPhoneNumber,
  parsePhoneNumber,
} from "react-phone-number-input";
import "react-phone-number-input/style.css";
import api from "../../api/apiconfig";
import CustomerJourneyPanel from "./CustomerJourneyPanel";
import { getCustomerProfilePictureSrc } from "../../utils/customerImageUtils";
import LabelPreview from "../common/LabelPreview";
import {
  MAX_CUSTOMER_LABELS,
  normalizeCustomerLabels,
} from "../../utils/customerLabelUtils";

const MAX_PROFILE_PICTURE_SIZE_BYTES = 2 * 1024 * 1024;
const PROFILE_PICTURE_SIZE_ERROR =
  "Profile picture must be 2 MB or smaller. Please upload a smaller image.";

const LabelSuggestions = ({ currentLabels, onLabelAdd }) => {
  const [labels, setLabels] = useState([]);
  const retailerId = localStorage.getItem("retailerId");

  useEffect(() => {
    const fetchLabels = async () => {
      try {
        if (!retailerId) return;
        const response = await api.get(`/api/customer-preferences/${retailerId}`);
        if (response.data && response.data.uniqueLabels) {
          setLabels(response.data.uniqueLabels);
        }
      } catch (error) {
        console.error("Error fetching labels:", error);
      }
    };
    fetchLabels();
  }, [retailerId]);

  if (labels.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <span className="text-[10px] text-[#8B90B2] w-full mb-0.5">Quick Add:</span>
      {labels.map((label) => (
        <button
          key={label}
          type="button"
          onClick={() => onLabelAdd(label)}
          className="px-2 py-0.5 text-[10px] bg-[#F3F5FF] text-[#313166] rounded-full border border-[#E8ECF8] hover:bg-[#E8ECF8] transition-colors"
        >
          + {label}
        </button>
      ))}
    </div>
  );
};

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
      [onChange, section, name],
    );

    const handleSelectChange = useCallback(
      (e) => {
        onChange(section, name, e.target.value);
      },
      [onChange, section, name],
    );

    const handlePhoneChange = useCallback(
      (phoneValue) => {
        onChange(section, name, phoneValue || "");
      },
      [onChange, section, name],
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
        <div
          className="
    group

    rounded-xl

    border border-[#EEF1FF]

    bg-[#FCFCFF]

    p-4

    transition-all duration-200

    hover:border-[#DCE2FF]
    hover:bg-white
    hover:shadow-[0_8px_24px_rgba(49,49,102,0.05)]
  "
        >
          <p
            className="
    mb-2

    text-[12px]
    font-semibold
    uppercase
    tracking-[0.08em]

    text-[#8B90B2]
  "
          >
            {label}
          </p>
          <div
            className={`
  overflow-hidden

  rounded-xl

  border

  bg-white

  transition-all duration-200

  ${
    error
      ? "border-red-400"
      : `
        border-[#E5E9FF]

        focus-within:border-[#313166]/30
        focus-within:shadow-[0_0_0_4px_rgba(49,49,102,0.06)]
      `
  }
`}
          >
            <PhoneInput
              international
              defaultCountry="IN"
              value={actualValue || ""}
              onChange={handlePhoneChange}
              className="w-full px-2 py-1"
              inputClassName="
  !h-10
  !w-full

  !border-none
  !bg-transparent

  !px-3

  !text-sm
  !font-medium
  !text-[#1F1C5C]

  focus:!ring-0
  focus:!outline-none
"
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
      <div
        className="
    group

                rounded-xl

    border border-[#EEF1FF]

    bg-[#FCFCFF]

    p-4

    transition-all duration-200

    hover:border-[#DCE2FF]
    hover:bg-white
    hover:shadow-[0_8px_24px_rgba(49,49,102,0.05)]
  "
      >
        <p
          className="
    mb-2

    text-[12px]
    font-semibold
    uppercase
    tracking-[0.08em]

    text-[#8B90B2]
  "
        >
          {label}
        </p>
        {isEditing && isEditable ? (
          fieldType === "options" ? (
            <div>
              <select
                value={actualValue || ""}
                onChange={handleSelectChange}
                className={`
  h-11 w-full appearance-none rounded-xl border bg-white px-4 text-sm font-medium text-[#1F1C5C] outline-none transition-all duration-200
  ${
    error
      ? "border-red-400 focus:border-red-500"
      : "border-[#E5E9FF] focus:border-[#313166]/30 focus:bg-[#FCFCFF] focus:shadow-[0_0_0_4px_rgba(49,49,102,0.06)]"
  }
`}
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
                className={`
  h-11 w-full rounded-xl border bg-white px-4 text-sm font-medium text-[#1F1C5C] outline-none transition-all duration-200 placeholder:text-[#A0A6C2]
  ${
    error
      ? "border-red-400 focus:border-red-500"
      : "border-[#E5E9FF] focus:border-[#313166]/30 focus:bg-[#FCFCFF] focus:shadow-[0_0_0_4px_rgba(49,49,102,0.06)]"
  }
`}
                placeholder={`Enter ${label.toLowerCase()}`}
                autoComplete="off"
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
          )
        ) : (
          <p
            className="
    break-words

    text-[15px]
    font-semibold

    text-[#1F1C5C]
  "
          >
            {isMobileNumber
              ? formatIndianMobile(actualValue)
              : formatFieldForDisplay(actualValue, fieldType)}
          </p>
        )}
      </div>
    );
  },
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
    .trim()
    .matches(/^[A-Za-z\s]*$/, {
      message: "Only letters are allowed",
      excludeEmptyString: true,
    })
    .max(15, "Must be 15 characters or less"),
  source: yup.string().optional(),
  customerId: yup.string().optional(),
  firstVisit: yup.string().optional(),
  labels: yup
    .string()
    .test(
      "labels-limit",
      `You can add up to ${MAX_CUSTOMER_LABELS} labels only`,
      (value) => normalizeCustomerLabels(value).length <= MAX_CUSTOMER_LABELS,
    ),
  mobileNumber: yup
    .string()
    .required("Mobile number is required")
    .test(
      "is-valid-phone",
      "Enter a valid mobile number (4-14 digits)",
      (value) => {
        if (!value) return false;
        const phoneNumber = parsePhoneNumber(value);
        if (!phoneNumber) return false;
        const nationalNumber = phoneNumber.nationalNumber;
        return nationalNumber.length >= 4 && nationalNumber.length <= 14;
      },
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
  const [profilePreview, setProfilePreview] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [removeProfilePicture, setRemoveProfilePicture] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        showToast(
          "Unsupported image format. Please upload a JPG, JPEG, PNG, or WebP file.",
          "error",
        );
        setProfileFile(null);
        setProfilePreview(null);
        setRemoveProfilePicture(false);
        e.target.value = "";
        return;
      }

      if (file.size > MAX_PROFILE_PICTURE_SIZE_BYTES) {
        showToast(PROFILE_PICTURE_SIZE_ERROR, "error");
        setProfileFile(null);
        setProfilePreview(null);
        setRemoveProfilePicture(false);
        e.target.value = "";
        return;
      }

      setProfileFile(file);
      setRemoveProfilePicture(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePicture = () => {
    setProfileFile(null);
    setProfilePreview(null);
    setRemoveProfilePicture(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    showToast("Profile picture will be removed when you save changes.", "success");
  };

  // Reset profile state when editing is cancelled or saved
  useEffect(() => {
    if (!isEditing) {
      setProfilePreview(null);
      setProfileFile(null);
      setRemoveProfilePicture(false);
    }
  }, [isEditing]);

  // Transform customer data to handle new nested structure
  const transformedCustomer = useMemo(
    () => transformCustomerData(customer),
    [customer],
  );

  // Initialize form data with proper default values
  const [formData, setFormData] = useState(() => {
    if (transformedCustomer) {
      return {
        basic: {
          firstname: transformedCustomer?.firstname || "",
          lastname: transformedCustomer?.lastname || "",
          mobileNumber:
            transformedCustomer?.countryCode &&
            transformedCustomer?.mobileNumber
              ? `+${transformedCustomer.countryCode}${transformedCustomer.mobileNumber}`
              : transformedCustomer?.mobileNumber
                ? transformedCustomer.mobileNumber.startsWith("+")
                  ? transformedCustomer.mobileNumber
                  : "+" + transformedCustomer.mobileNumber
                : "",
          source: transformedCustomer?.source || "",
          customerId: transformedCustomer?.customerId || "",
          firstVisit: transformedCustomer?.firstVisit
            ? new Date(transformedCustomer.firstVisit).toLocaleDateString(
                "en-GB",
              )
            : "",
          loyaltyPoints: transformedCustomer?.loyaltyPoints ?? "",
          isOptedIn: transformedCustomer?.isOptedIn ?? null,
          optinMessageSent: transformedCustomer?.optinMessageSent ?? null,
          gender: transformedCustomer?.gender || "",
          isActive: transformedCustomer?.isActive || "",
          labels: Array.isArray(transformedCustomer?.labels) 
            ? transformedCustomer.labels.join(", ") 
            : (transformedCustomer?.labels || ""),
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
        labels: "",
      },
      additionalData: {},
      advancedDetails: {},
      advancedPrivacyDetails: {},
    };
  });
  const [sourceOptions, setSourceOptions] = useState([]);
  const [customerNameInput, setCustomerNameInput] = useState("");
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
          mobileNumber:
            transformedCustomer?.countryCode &&
            transformedCustomer?.mobileNumber
              ? `+${transformedCustomer.countryCode}${transformedCustomer.mobileNumber}`
              : transformedCustomer?.mobileNumber
                ? transformedCustomer.mobileNumber.startsWith("+")
                  ? transformedCustomer.mobileNumber
                  : "+" + transformedCustomer.mobileNumber
                : "",
          source: transformedCustomer?.source || "",
          customerId: transformedCustomer?.customerId || "",
          firstVisit: transformedCustomer?.firstVisit
            ? new Date(transformedCustomer.firstVisit).toLocaleDateString(
                "en-GB",
              )
            : "",
          loyaltyPoints: transformedCustomer?.loyaltyPoints ?? "",
          isOptedIn: transformedCustomer?.isOptedIn ?? null,
          optinMessageSent: transformedCustomer?.optinMessageSent ?? null,
          gender: transformedCustomer?.gender || "",
          isActive: transformedCustomer?.isActive || "",
          labels: Array.isArray(transformedCustomer?.labels) 
            ? transformedCustomer.labels.join(", ") 
            : (transformedCustomer?.labels || ""),
        },
        additionalData: transformedCustomer?.additionalData || {},
        advancedDetails: transformedCustomer?.advancedDetails || {},
        advancedPrivacyDetails:
          transformedCustomer?.advancedPrivacyDetails || {},
      };
      setFormData(newFormData);
      setCustomerNameInput(
        [newFormData.basic.firstname, newFormData.basic.lastname]
          .filter(Boolean)
          .join(" "),
      );
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
    const first = formData?.basic?.firstname || "";
    const last = formData?.basic?.lastname || "";
    return [first, last].filter(Boolean).join(" ");
  }, [formData?.basic?.firstname, formData?.basic?.lastname]);

  // Set customerNameInput when editing starts
  useEffect(() => {
    if (isEditing) {
      setCustomerNameInput(customerName);
    }
  }, [isEditing, customerName]);

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
    [handleInputChange],
  );

  const handleLabelAdd = useCallback(
    (newLabel) => {
      const currentLabels = normalizeCustomerLabels(
        formData?.basic?.labels || "",
      );
      const existingKeys = new Set(
        currentLabels.map((label) => label.toLowerCase()),
      );

      if (existingKeys.has(newLabel.toLowerCase())) {
        return;
      }

      if (currentLabels.length >= MAX_CUSTOMER_LABELS) {
        showToast(
          `You can add up to ${MAX_CUSTOMER_LABELS} labels only.`,
          "error",
        );
        return;
      }

      handleInputChange("basic", "labels", [...currentLabels, newLabel].join(", "));
    },
    [formData?.basic?.labels, handleInputChange],
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

      try {
        await basicSchema.validateAt("labels", formData.basic);
        setErrors((prev) => ({
          ...prev,
          basic: {
            ...prev.basic,
            labels: null,
          },
        }));
      } catch (err) {
        if (touched.basic?.labels) {
          setErrors((prev) => ({
            ...prev,
            basic: {
              ...prev.basic,
              labels: err.message,
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
    "Customer Journey",
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
        </span>,
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-400">
          ☆
        </span>,
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300">
          ★
        </span>,
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
              className="flex min-h-[86px] items-center rounded-xl border border-[#EEF1FF] bg-[#FCFCFF] p-4 transition-all duration-200 hover:border-[#DCE2FF] hover:bg-white hover:shadow-[0_8px_24px_rgba(49,49,102,0.05)]"
            >
              <div className="mr-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F8F9FF]">
                <img
                  src="../ssets/score-icon.png"
                  alt={key}
                  className="h-8 w-8"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#8B90B2]">
                  {key}
                </p>
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
    [formData, isEditing, handleInputChange, customer, errors],
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
    console.log("CustomerDetails onSubmit called");
    console.log("Current formData:", formData);
    console.log("Current profileFile:", profileFile);

    try {
      // Validate basic fields
      await basicSchema.validate(formData.basic, { abortEarly: false });

      // Transform the form data back to API format
      const formattedData = transformFormDataToAPI(formData, customer);
      console.log("Formatted data for API:", formattedData);

      // Call the parent save handler with formatted data
      onSave({
        ...formattedData,
        profilePicture: profileFile,
        removeProfilePicture,
      });
    } catch (err) {
      console.error("Validation error in onSubmit:", err);
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
    <div className="flex h-full min-w-0 flex-1 flex-col bg-transparent xl:overflow-hidden">
      <div className="min-h-0 flex-1 overflow-visible px-3 py-3 sm:px-4 xl:h-0 xl:min-h-0 xl:overflow-y-auto xl:overscroll-contain xl:px-4 xl:py-4 xl:pr-4 2xl:px-5">
        <form onSubmit={onSubmit} className="min-h-full">
          <div className="space-y-3 xl:space-y-4">
            {/* Profile Header */}
            <div
              className="
    relative overflow-hidden

    rounded-2xl

    border border-[#EEF1FF]

    bg-white/95
    backdrop-blur-sm

    px-4 py-4
    sm:px-5
    lg:px-6 lg:py-5
    xl:px-7 xl:py-6

    shadow-[0_4px_20px_rgba(49,49,102,0.06)]
  "
            >
              <div className="relative z-10">
                <div
                  className="
    flex flex-col gap-5

    lg:flex-row
    lg:items-center
    xl:gap-6
  "
                >
                  <div className="relative mx-auto shrink-0 lg:mx-0 lg:self-center">
                    <div
                      className={`absolute right-3 top-3 z-10 flex items-center gap-2 rounded-full border border-white/80 px-3 py-1 shadow-sm backdrop-blur-sm ${statusBadgeClasses}`}
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${statusIndicatorColor}`}
                      ></span>
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        {statusLabel}
                      </span>
                    </div>
                    <div
                      className="
  relative
  rounded-[28px]
  border border-[#EEF1FF]
  bg-[linear-gradient(180deg,#FCFCFF_0%,#F4F6FD_100%)]
  p-3
  shadow-[0_12px_32px_rgba(49,49,102,0.07)]
"
                    >
                      <img
                        src={
                          profilePreview || 
                          (removeProfilePicture
                            ? ""
                            : getCustomerProfilePictureSrc(
                                transformedCustomer?.profilePictureUrl,
                                transformedCustomer?.updatedAt,
                              )) || 
                          (transformedCustomer?.gender === "male"
                            ? defaultImage.menDefaultImgUrl
                            : transformedCustomer?.gender === "female"
                              ? defaultImage.femaleDefaultImgUrl
                              : defaultImage.menDefaultImgUrl)
                        }
                        alt={`${transformedCustomer?.firstname} ${transformedCustomer?.lastname}`}
                        className="
  h-[150px]
  w-[150px]
  rounded-[22px]
  object-cover
  sm:h-[168px]
  sm:w-[168px]
  xl:h-[176px]
  xl:w-[176px]
"
                      />
                      {isEditing && (
                        <>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="
                              absolute bottom-4 right-4
                              p-2 rounded-xl bg-white/90
                              border border-[#EEF1FF]
                              text-[#313166] shadow-sm
                              hover:bg-white transition-all
                              backdrop-blur-sm
                            "
                          >
                            <Camera size={18} />
                          </button>
                          {(profilePreview ||
                            transformedCustomer?.profilePictureUrl) && (
                            <button
                              type="button"
                              onClick={handleRemoveProfilePicture}
                              className="
                                absolute bottom-4 left-4
                                inline-flex items-center gap-1.5
                                rounded-xl border border-red-100
                                bg-white/90 px-3 py-2
                                text-xs font-semibold text-red-600
                                shadow-sm transition-all
                                hover:bg-red-50
                                backdrop-blur-sm
                              "
                            >
                              <X size={14} />
                              Remove
                            </button>
                          )}
                        </>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </div>
                  {/* Basic Details Sections */}
                  <div className="min-w-0 flex-1 lg:pt-0">
                    <div
                      className="
    flex flex-col gap-4

    sm:flex-row
    sm:items-center
    sm:justify-between
  "
                    >
                      <div className="min-w-0">
                        <h1 className="truncate text-[24px] font-bold text-[#1F1C5C] sm:text-[28px] xl:text-[30px]">
                          {customerName || "Customer Profile"}
                        </h1>
                        <p className="mt-1 text-sm text-[#8B90B2]">
                          Basic details, preferences and customer activity
                        </p>
                      </div>

                      {!isEditing ? (
                        <button
                          type="button"
                          onClick={onEdit}
                          className="flex h-10 items-center rounded-xl border border-[#31316680] px-4 text-sm font-medium text-[#313166] transition-all duration-200 hover:bg-[#F8F9FF]"
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
                            className="h-10 rounded-xl border border-[#E5E9FF] bg-white px-4 text-sm font-medium text-[#313166] transition hover:bg-[#F8F9FF]"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="h-10 rounded-xl bg-pink-700 px-4 text-sm font-medium text-white transition hover:bg-[#b11a63]"
                          >
                            Update Changes
                          </button>
                        </div>
                      )}
                    </div>

                    <div
                      className="
    mt-5

    grid grid-cols-1
    gap-3

    md:grid-cols-2
    2xl:grid-cols-3
    xl:gap-4
  "
                    >
                      <div
                        className="
    group

    rounded-xl

    border border-[#EEF1FF]

    bg-[#FCFCFF]

    p-4

    transition-all duration-200

    hover:border-[#DCE2FF]
    hover:bg-white
    hover:shadow-[0_8px_24px_rgba(49,49,102,0.05)]
  "
                      >
                        <p
                          className="
    mb-2

    text-[12px]
    font-semibold
    uppercase
    tracking-[0.08em]

    text-[#8B90B2]
  "
                        >
                          Name
                        </p>
                        {isEditing ? (
                          <div>
                            <input
                              type="text"
                              value={customerNameInput}
                              onChange={(e) => {
                                setCustomerNameInput(e.target.value);
                                handleCustomerNameChange(e.target.value);
                              }}
                              className={`
  h-11 w-full

  rounded-xl

  border

  bg-white

  px-4

  text-sm
  font-medium
  text-[#1F1C5C]

  outline-none

  transition-all duration-200

  placeholder:text-[#A0A6C2]

  ${
    errors?.basic?.firstname || errors?.basic?.lastname
      ? "border-red-400 focus:border-red-500"
      : `
        border-[#E5E9FF]

        focus:border-[#313166]/30
        focus:bg-[#FCFCFF]

        focus:shadow-[0_0_0_4px_rgba(49,49,102,0.06)]
      `
  }
`}
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
                          <p
                            className="
    break-words

    text-[15px]
    font-semibold

    text-[#1F1C5C]
  "
                          >
                            {customerName || "-"}
                          </p>
                        )}
                      </div>
                      <FieldItem
                        label="Mobile Number"
                        name="mobileNumber"
                        defaultValue={formatIndianMobile(
                          transformedCustomer?.countryCode &&
                            transformedCustomer?.mobileNumber
                            ? transformedCustomer.countryCode +
                                transformedCustomer.mobileNumber
                            : transformedCustomer?.mobileNumber,
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
                      <div
                        className="
    group
    rounded-xl
    border border-[#EEF1FF]
    bg-[#FCFCFF]
    p-4
    transition-all duration-200
    hover:border-[#DCE2FF]
    hover:bg-white
    hover:shadow-[0_8px_24px_rgba(49,49,102,0.05)]
  "
                      >
                        <p
                          className="
    mb-2
    text-[12px]
    font-semibold
    uppercase
    tracking-[0.08em]
    text-[#8B90B2]
  "
                        >
                          Labels
                        </p>
                        {isEditing ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={formData?.basic?.labels || ""}
                              onChange={(e) => handleInputChange("basic", "labels", e.target.value)}
                              className="h-11 w-full rounded-xl border bg-white px-4 text-sm font-medium text-[#1F1C5C] outline-none transition-all duration-200 focus:border-[#313166]/30 focus:shadow-[0_0_0_4px_rgba(49,49,102,0.06)]"
                              placeholder="VIP, New, Summer Sale"
                            />
                            {errors.basic?.labels && (
                              <p className="text-xs text-red-500">{errors.basic.labels}</p>
                            )}
                            {sourceOptions && sourceOptions.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {/* Use a separate labels fetch if needed, or if we can get it from preferences */}
                              </div>
                            )}
                            {/* Adding Label Suggestions here */}
                            <LabelSuggestions 
                              currentLabels={formData?.basic?.labels || ""} 
                              onLabelAdd={handleLabelAdd}
                            />
                            <p className="text-[10px] text-[#8B90B2] mt-1">Comma-separated</p>
                          </div>
                        ) : (
                          <LabelPreview
                            labels={formData?.basic?.labels}
                            className="justify-start"
                          />
                        )}
                      </div>
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
                                transformedCustomer.firstVisit,
                              ).toLocaleDateString("en-GB")
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
            <div
              className="
    relative overflow-hidden

    rounded-2xl

    border border-[#EEF1FF]

    bg-white/95
    backdrop-blur-sm

    shadow-[0_4px_20px_rgba(49,49,102,0.06)]
  "
            >
              {/* Tabs */}
              <div className="relative z-10 border-b border-[#EEF1FF] px-3 pt-3 sm:px-4">
                <nav
                  className="
    flex items-center gap-2

    overflow-x-auto
    scrollbar-hide

    pb-3
  "
                >
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`
  whitespace-nowrap

    rounded-xl

  px-4 py-2.5

  text-sm font-semibold

  transition-all duration-200

  ${
    activeTab === tab
      ? `
        bg-[#313166]

        text-white

        shadow-[0_8px_18px_rgba(49,49,102,0.18)]
      `
      : `
        bg-[#F8F9FF]

        text-[#8B90B2]

        hover:bg-[#EEF1FF]
        hover:text-[#1F1C5C]
      `
  }
`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div
                className="
    relative z-10

    px-4 py-4
    sm:px-5

    min-h-[320px]
  "
              >
                {activeTab === "Customer Journey" && (
                  <CustomerJourneyPanel
                    customerId={customer?._id}
                    isActive={activeTab === "Customer Journey"}
                  />
                )}

                {activeTab === "Advanced Details" && (
                  <div
                    className="
    grid grid-cols-1
    gap-3

    xl:grid-cols-2
    2xl:grid-cols-3
  "
                  >
                    {transformedCustomer?.advancedDetails &&
                      renderDynamicFields(
                        transformedCustomer?.advancedDetails,
                        "advancedDetails",
                      )}
                  </div>
                )}

                {activeTab === "Advanced Privacy" && (
                  <div className="space-y-3">
                    <div
                      className="
    grid grid-cols-1
    gap-3

    xl:grid-cols-2
    2xl:grid-cols-3
  "
                    >
                      {transformedCustomer?.advancedPrivacyDetails &&
                        renderDynamicFields(
                          transformedCustomer?.advancedPrivacyDetails,
                          "advancedPrivacyDetails",
                        )}
                    </div>

                    {/* Purchase History Section */}
                    <PurchaseHistory
                      mobileNumber={transformedCustomer?.mobileNumber}
                    />
                  </div>
                )}

                {activeTab === "Additional Details" && (
                  <div
                    className="
    grid grid-cols-1
    gap-3

    xl:grid-cols-2
    2xl:grid-cols-3
  "
                  >
                    {transformedCustomer?.additionalData &&
                    Object.keys(transformedCustomer.additionalData).length >
                      0 ? (
                      renderDynamicFields(
                        transformedCustomer?.additionalData,
                        "additionalData",
                      )
                    ) : (
                      <div
                        className="
    col-span-full

    rounded-2xl

    border border-dashed border-[#DCE2FF]

    bg-[#FAFBFF]

    py-12

    text-center
    text-sm
    font-medium
    text-[#8B90B2]
  "
                      >
                        No basic data available
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "Activity" && (
                  <div
                    className="
    grid grid-cols-1
    gap-3

    lg:grid-cols-2
    2xl:grid-cols-3
  "
                  >
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
                          ? "Start"
                          : "Stop"
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
                            value:
                              formData?.basic?.isOptedIn === true
                                ? "Start"
                                : "Stop",
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
                            ),
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
              <div
                className="
    sticky bottom-0 z-20

    flex flex-col gap-3
    sm:flex-row sm:justify-end

    border-t border-[#EEF1FF]

    bg-white/90
    backdrop-blur-xl

    px-4 py-3
    sm:px-5
  "
              >
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="
  rounded-xl

  border border-[#E5E9FF]

  px-5 py-2.5

  text-sm font-semibold
  text-[#313166]

  transition-all duration-200

  hover:bg-[#F8F9FF]
"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="
  flex items-center justify-center

  rounded-xl

  bg-[#313166]

  px-5 py-2.5

  text-sm font-semibold text-white

  shadow-[0_8px_18px_rgba(49,49,102,0.18)]

  transition-all duration-200

  hover:bg-[#27275a]

  disabled:opacity-50
"
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
