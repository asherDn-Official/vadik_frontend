import { useState, useCallback, useRef } from "react";
import axios from "axios";
const AdditionalDetails = ({ formData, updateFormData, goToNextStep }) => {
  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.contactNumber)
      newErrors.contactNumber = "Contact number is required";
    if (!formData.ownerName) newErrors.ownerName = "Owner name is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Create FormData object
      const data = new FormData();

      // Append all the form fields to the FormData
      data.append("firstName", formData.firstName);
      data.append("lastName", formData.lastName);
      data.append("phone", formData.mobile); // Note: phone is mapped to mobile in your object
      data.append("email", formData.email);
      data.append("gender", formData.gender || "Male"); // Adding default gender if not in formData
      data.append("storeName", formData.storeName);
      data.append("storeType", formData.storeType);
      data.append("storeAddress", formData.storeAddress);
      data.append("city", formData.city);
      data.append("pincode", formData.pincode);
      if (formData.logo) {
        // photo is mapped to logo in your object
        data.append("photo", formData.logo);
      }
      data.append("gstNumber", formData.gstNumber);
      data.append("numberOfStaffs", formData.staffCount); // staffCount is mapped to numberOfStaffs
      data.append("shopContactNumber", formData.contactNumber); // contactNumber is mapped to shopContactNumber
      data.append("ownerName", formData.ownerName);

      // Make the POST request
      const response = await axios.post(
        "http://localhost:5000/retailer/register",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Registration successful:", response.data);
      // Handle successful registration (redirect, show message, etc.)
    } catch (error) {
      console.error("Registration failed:", error);
      // Handle error (show error message, etc.)
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

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-10"
      >
        <div className="md:col-span-2">
          <label className="form-label mb-7">
            Upload Store Logo or Photo (optional)
          </label>
          <div
            className={`border-2 border-dashed rounded-md p-6 text-center transition-colors ${
              isDragging ? "border-primary bg-primary/10" : "border-gray-300"
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
            value={formData.staffCount}
            onChange={handleChange}
            className="form-input"
          >
            <option value="">Select Number of Staff</option>
            {staffOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

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
            value={formData.customerCount}
            onChange={handleChange}
            className="form-input"
          >
            <option value="">Select Number of Customers</option>
            {customerOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

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
            value={formData.contactNumber}
            onChange={handleChange}
            className={`form-input ${
              errors.contactNumber ? "border-red-500" : ""
            }`}
            placeholder="Store Contact Number"
          />
          {errors.contactNumber && (
            <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>
          )}
        </div>

        <div>
          <label htmlFor="ownerName" className="form-label">
            Owner Name
          </label>
          <p className="text-[16px] text-[#31316699] mb-1">
            Enter the owner's full name.
          </p>
          <input
            type="text"
            id="ownerName"
            name="ownerName"
            value={formData.ownerName}
            onChange={handleChange}
            className={`form-input ${errors.ownerName ? "border-red-500" : ""}`}
            placeholder="Owner Name"
          />
          {errors.ownerName && (
            <p className="text-red-500 text-xs mt-1">{errors.ownerName}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="gstNumber" className="form-label">
            GST Number (optional)
          </label>
          <p className="text-[16px] text-[#31316699] mb-1">
            Add your GST number if your Store is registered.
          </p>
          <input
            type="text"
            id="gstNumber"
            name="gstNumber"
            value={formData.gstNumber}
            onChange={handleChange}
            className="form-input"
            placeholder="GST Number (optional)"
          />
        </div>

        <div className="md:col-span-2 flex justify-center mt-6">
          <button
            type="submit"
            className="min-w-[150px] text-white py-2 px-4 rounded-[10px] bg-gradient-to-r from-[#CB376D] to-[#A72962]"
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdditionalDetails;
