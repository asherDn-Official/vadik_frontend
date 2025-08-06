import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../api/apiconfig";

const AdditionalDetails = ({ formData, updateFormData, goToNextStep }) => {
  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [touched, setTouched] = useState({
    staffCount: false,
    customerCount: false,
    contactNumber: false,
    ownerName: false,
    gstNumber: false
  });
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const retailerId = localStorage.getItem("retailerId");

  // Real-time validation when inputs change
  useEffect(() => {
    if (touched.staffCount) validateStaffCount();
    if (touched.customerCount) validateCustomerCount();
    if (touched.contactNumber) validateContactNumber();
    if (touched.ownerName) validateOwnerName();
    if (touched.gstNumber && formData.gstNumber) validateGstNumber();
  }, [formData, touched]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    if (type === "file") {
      handleFileUpload(files[0]);
    } else {
      updateFormData({ [name]: value });
    }
  };

  const handleFileUpload = useCallback(
    (file) => {
      if (file) {
        updateFormData({ logo: file });

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
      }
    },
    [updateFormData]
  );

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Individual validation functions
  const validateStaffCount = () => {
    if (!formData.staffCount) {
      setErrors(prev => ({ ...prev, staffCount: "Number of staff is required" }));
    } else {
      setErrors(prev => ({ ...prev, staffCount: "" }));
    }
  };

  const validateCustomerCount = () => {
    if (!formData.customerCount) {
      setErrors(prev => ({ ...prev, customerCount: "Number of customers is required" }));
    } else {
      setErrors(prev => ({ ...prev, customerCount: "" }));
    }
  };

  const validateContactNumber = () => {
    if (!formData.contactNumber) {
      setErrors(prev => ({ ...prev, contactNumber: "Contact number is required" }));
    } else if (!/^\d{10}$/.test(formData.contactNumber)) {
      setErrors(prev => ({ ...prev, contactNumber: "Enter a valid 10-digit number" }));
    } else {
      setErrors(prev => ({ ...prev, contactNumber: "" }));
    }
  };

  const validateOwnerName = () => {
    if (!formData.ownerName) {
      setErrors(prev => ({ ...prev, ownerName: "Owner name is required" }));
    } else if (formData.ownerName.length < 4) {
      setErrors(prev => ({ ...prev, ownerName: "Minimum 4 characters required" }));
    } else {
      setErrors(prev => ({ ...prev, ownerName: "" }));
    }
  };

//   const validateGstNumber = () => {
//   const gst = formData.gstNumber?.trim();

//   if (gst && gst.length !== 15) {
//     setErrors((prev) => ({ ...prev, gstNumber: "GST number must be 15 characters" }));
//   } else {
//     setErrors((prev) => {
//       const { gstNumber, ...rest } = prev;
//       return rest;
//     });
//   }
// };

const validateGstNumber = () => {
  const gst = formData.gstNumber?.trim().toUpperCase();
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  if (!gst) {
    setErrors((prev) => ({ ...prev, gstNumber: "GST number is required" }));
  } else if (gst.length !== 15) {
    setErrors((prev) => ({ ...prev, gstNumber: "GST number must be 15 characters" }));
  } else if (!gstRegex.test(gst)) {
    setErrors((prev) => ({ ...prev, gstNumber: "Invalid GST number format" }));
  } else {
    setErrors((prev) => {
      const { gstNumber, ...rest } = prev;
      return rest;
    });
    updateFormData({ gstNumber: gst }); // ensures stored value is uppercase
  }
};


  const validateForm = () => {
    validateStaffCount();
    validateCustomerCount();
    validateContactNumber();
    validateOwnerName();
    validateGstNumber();

    return !errors.staffCount &&
      !errors.customerCount &&
      !errors.contactNumber &&
      !errors.ownerName &&
      !errors.gstNumber &&
      formData.staffCount &&
      formData.customerCount &&
      formData.contactNumber &&
      formData.ownerName;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Create FormData object
      const data = new FormData();

      // Append all the form fields to the FormData
      data.append("fullName", `${formData.firstName} ${formData.lastName}`);
      data.append("storeName", formData.storeName);
      data.append("storeType", formData.storeType);
      data.append("storeAddress", formData.storeAddress);
      data.append("storeOwnerName", formData.ownerName);
      data.append("storeContactNumber", formData.contactNumber);
      data.append("storeCity", formData.city);
      data.append("storePincode", formData.pincode);
      data.append("GSTNumber", formData.gstNumber || "");
      data.append("numberOfEmployees", formData.staffCount);
      data.append("numberOfCustomers", formData.customerCount);
      data.append("status", "active");
      if (formData.logo) {
        data.append("storeImage", formData.logo);
      }

      data.append("email", formData.email);
      data.append("notes", "Updated retailer information");
      data.append("onboarding", true);

      const response = await api.patch(`api/retailer/${retailerId}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Registration successful:", response.data);
      navigate("/completion", {
        state: {
          success: true,
          data: [],
        },
      });

    } catch (error) {
      console.error("Registration failed:", error);
      setSubmitError(
        error.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const staffOptions = ["1-5", "6-10", "11-20", "21-50", "50+"];
  const customerOptions = [
    "0-100",
    "101-500",
    "501-1000",
    "1001-5000",
    "5000+",
  ];

  return (
    <div className="step-container">
      <h2 className="step-header">Additional Details</h2>
      <p className="step-description">
        Complete your Store profile to finish setup.
      </p>

      {submitError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {submitError}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-10"
      >
        {/* File upload section */}
        <div className="md:col-span-2">
          <label className="form-label mb-7">
            Upload Store Logo or Photo (optional)
          </label>
          <div
            className={`border-2 border-dashed rounded-md p-6 text-center transition-colors ${isDragging ? "border-primary bg-primary/10" : "border-gray-300"
              }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
            style={{ cursor: "pointer" }}
          >
            <div className="space-y-1 text-center">
              {previewImage ? (
                <div className="mx-auto h-48 w-48 rounded-full overflow-hidden border-2 border-gray-200">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              <div className="flex text-sm text-gray-600 justify-center">
                <span className="relative rounded-md font-medium text-primary hover:text-primary-dark">
                  Upload logo
                </span>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
            </div>
            <input
              id="logo"
              name="logo"
              type="file"
              className="sr-only"
              onChange={handleChange}
              accept="image/*"
              ref={fileInputRef}
            />
          </div>
        </div>

        {/* Staff count */}
        <div>
          <label htmlFor="staffCount" className="form-label">
            Number of Staff
          </label>
          <p className="text-[16px] text-[#31316699] mb-1">
            Enter how many staff work in your Store.
          </p>
          <select
            id="staffCount"
            name="staffCount"
            value={formData.staffCount || ""}
            onChange={handleChange}
            onBlur={() => handleBlur('staffCount')}
            className={`form-input ${errors.staffCount ? "border-red-500" : ""}`}
          >
            <option value="">Select Number of Staff</option>
            {staffOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.staffCount && (
            <p className="text-red-500 text-xs mt-1">{errors.staffCount}</p>
          )}
        </div>

        {/* Customer count */}
        <div>
          <label htmlFor="customerCount" className="form-label">
            Number of Customers
          </label>
          <p className="text-[16px] text-[#31316699] mb-1">
            Enter how many customers for your Store.
          </p>
          <select
            id="customerCount"
            name="customerCount"
            value={formData.customerCount || ""}
            onChange={handleChange}
            onBlur={() => handleBlur('customerCount')}
            className={`form-input ${errors.customerCount ? "border-red-500" : ""}`}
          >
            <option value="">Select Number of Customers</option>
            {customerOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.customerCount && (
            <p className="text-red-500 text-xs mt-1">{errors.customerCount}</p>
          )}
        </div>

        {/* Contact number */}
        <div>
          <label htmlFor="contactNumber" className="form-label">
            Store Contact Number
          </label>
          <p className="text-[16px] text-[#31316699] mb-1">
            Provide the main contact number used for Store/business.
          </p>
          <input
            type="tel"
            id="contactNumber"
            name="contactNumber"
            value={formData.contactNumber || ""}
            onChange={handleChange}
            onBlur={() => handleBlur('contactNumber')}
            className={`form-input ${errors.contactNumber ? "border-red-500" : ""
              }`}
            placeholder="Store Contact Number"
            maxLength={10}
          />
          {errors.contactNumber && (
            <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>
          )}
        </div>

        {/* Owner name */}
        <div>
          <label htmlFor="ownerName" className="form-label">
            Owner Name
          </label>
          <p className="text-[16px] text-[#31316699] mb-1">
            Enter the owner's full name (minimum 4 characters).
          </p>
          <input
            type="text"
            id="ownerName"
            name="ownerName"
            value={formData.ownerName || ""}
            onChange={handleChange}
            onBlur={() => handleBlur('ownerName')}
            className={`form-input ${errors.ownerName ? "border-red-500" : ""}`}
            placeholder="Owner Name"
          />
          {errors.ownerName && (
            <p className="text-red-500 text-xs mt-1">{errors.ownerName}</p>
          )}
        </div>

        {/* GST number */}
        <div className="md:col-span-2">
          <label htmlFor="gstNumber" className="form-label">
            GST Number 
          </label>
          <p className="text-[16px] text-[#31316699] mb-1">
            Add your GST number if your Store is registered (15 digits).
          </p>
          <input
            type="text"
            id="gstNumber"
            name="gstNumber"
            value={formData.gstNumber || ""}
            onChange={handleChange}
            onBlur={() => handleBlur('gstNumber')}
            className={`form-input ${errors.gstNumber ? "border-red-500" : ""}`}
            placeholder="GST Number"
            maxLength={15}
          />
          {errors.gstNumber && (
            <p className="text-red-500 text-xs mt-1">{errors.gstNumber}</p>
          )}
        </div>

        {/* Submit button */}
        <div className="md:col-span-2 flex justify-center mt-6">
          <button
            type="submit"
            className={`min-w-[150px] text-white py-2 px-4 rounded-[10px] bg-gradient-to-r from-[#CB376D] to-[#A72962] ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
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
                Registering...
              </span>
            ) : (
              "Register"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdditionalDetails;