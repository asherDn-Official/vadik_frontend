import { useState, useEffect } from "react";

const StoreInformation = ({ formData, updateFormData, goToNextStep, goToPreviousStep }) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({
    storeName: false,
    storeType: false,
    storeAddress: false,
    city: false,
    pincode: false
  });

  // Real-time validation when inputs change
  useEffect(() => {
    if (touched.storeName) validateStoreName();
    if (touched.storeType) validateStoreType();
    if (touched.storeAddress) validateStoreAddress();
    if (touched.city) validateCity();
    if (touched.pincode) validatePincode();
  }, [formData, touched]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Individual validation functions
  const validateStoreName = () => {
    if (!formData.storeName) {
      setErrors(prev => ({ ...prev, storeName: "Business name is required" }));
    } else if (formData.storeName.length < 3) {
      setErrors(prev => ({ ...prev, storeName: "Minimum 3 characters required" }));
    } else if (formData.storeName.length > 60) {
      setErrors(prev => ({ ...prev, storeName: "Maximum 60 characters allowed" }));
    } else {
      setErrors(prev => ({ ...prev, storeName: "" }));
    }
  };

  const validateStoreType = () => {
    if (!formData.storeType) {
      setErrors(prev => ({ ...prev, storeType: "Business  type is required" }));
    } else {
      setErrors(prev => ({ ...prev, storeType: "" }));
    }
  };

  const validateStoreAddress = () => {
    if (!formData.storeAddress) {
      setErrors(prev => ({ ...prev, storeAddress: "Business  address is required" }));
    } else if (formData.storeAddress.length < 10) {
      setErrors(prev => ({ ...prev, storeAddress: "Minimum 10 characters required" }));
    } else if (formData.storeAddress.length > 40) {
      setErrors(prev => ({ ...prev, storeAddress: "Maximum 40 characters allowed" }));
    } else {
      setErrors(prev => ({ ...prev, storeAddress: "" }));
    }
  };

  const validateCity = () => {
    if (!formData.city) {
      setErrors(prev => ({ ...prev, city: "City/Town is required" }));
    } else if (formData.city.length > 18) {
      setErrors(prev => ({ ...prev, city: "Maximum 18 characters allowed" }));
    } else {
      setErrors(prev => ({ ...prev, city: "" }));
    }
  };

  const validatePincode = () => {
    if (!formData.pincode) {
      setErrors(prev => ({ ...prev, pincode: "Pincode is required" }));
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      setErrors(prev => ({ ...prev, pincode: "Must be a 6-digit number" }));
    } else {
      setErrors(prev => ({ ...prev, pincode: "" }));
    }
  };

  const validateForm = () => {
    validateStoreName();
    validateStoreType();
    validateStoreAddress();
    validateCity();
    validatePincode();

    return !errors.storeName && 
           !errors.storeType && 
           !errors.storeAddress && 
           !errors.city &&
           !errors.pincode &&
           formData.storeName &&
           formData.storeType &&
           formData.storeAddress &&
           formData.city &&
           formData.pincode;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      goToNextStep();
    }
  };

  const storeTypes = [
    { label: "Clothing & Apparel", value: "clothingCategory" },
    { label: "Electronics", value: "electronicCategory" },
    { label: "Grocery", value: "groceryCategory" },
    { label: "Beauty & Cosmetics", value: "beautyCategory" },
    { label: "Home & Furniture", value: "homeAppliancesCategory" },
    { label: "Jewelry", value: "jewelleryCategory" },
    { label: "Other", value: "otherCategory" },
  ];

  return (
    <div className="step-container">
      <h2 className="step-header">Business  Basic Info</h2>
      <p className="step-description">
        Tell us about your Business and where it's located.
      </p>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-10"
      >
        {/* Store Name */}
        <div>
          <label htmlFor="storeName" className="form-label">
            Business  Name
          </label>
          <p className="text-[16px] text-[#31316699] mb-1">
            Enter your official Business  name (3-18 characters).
          </p>
          <input
            type="text"
            id="storeName"
            name="storeName"
            value={formData.storeName || ""}
            onChange={handleChange}
            onBlur={() => handleBlur('storeName')}
            className={`form-input ${errors.storeName ? "border-red-500" : ""}`}
            placeholder="Store Name"
            maxLength={60}
            autocomplete="off"
          />
          {errors.storeName && (
            <p className="text-red-500 text-xs mt-1">{errors.storeName}</p>
          )}
        </div>

        {/* Store Type */}
        <div>
          <label htmlFor="storeType" className="form-label">
            Business  Type
          </label>
          <p className="text-[16px] text-[#31316699] mb-1">
            Choose your business type.
          </p>
          <select
            id="storeType"
            name="storeType"
            value={formData.storeType || ""}
            onChange={handleChange}
            onBlur={() => handleBlur('storeType')}
            className={`form-input ${errors.storeType ? "border-red-500" : ""}`}
            autocomplete="off"
          >
            <option value="">Select Business  Type</option>
            {storeTypes.map(({ label, value }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors.storeType && (
            <p className="text-red-500 text-xs mt-1">{errors.storeType}</p>
          )}
        </div>

        {/* Store Address */}
        <div className="md:col-span-2">
          <label htmlFor="storeAddress" className="form-label">
            Business Address
          </label>
          <p className="text-[16px] text-[#31316699] mb-1">
            Mention the complete address where your Business  is located (10-40 characters).
          </p>
          <input
            type="text"
            id="storeAddress"
            name="storeAddress"
            value={formData.storeAddress || ""}
            onChange={handleChange}
            onBlur={() => handleBlur('storeAddress')}
            className={`form-input ${
              errors.storeAddress ? "border-red-500" : ""
            }`}
            placeholder="Business Address"
            maxLength={40}
            autocomplete="off"
          />
          {errors.storeAddress && (
            <p className="text-red-500 text-xs mt-1">{errors.storeAddress}</p>
          )}
        </div>

        {/* City */}
        <div>
          <label htmlFor="city" className="form-label">
            City / Town
          </label>
          <p className="text-[16px] text-[#31316699] mb-1">
            Enter your Business  city or town (max 18 characters).
          </p>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city || ""}
            onChange={handleChange}
            onBlur={() => handleBlur('city')}
            className={`form-input ${errors.city ? "border-red-500" : ""}`}
            placeholder="City / Town"
            maxLength={18}
            autocomplete="off"
          />
          {errors.city && (
            <p className="text-red-500 text-xs mt-1">{errors.city}</p>
          )}
        </div>

        {/* Pincode */}
        <div>
          <label htmlFor="pincode" className="form-label">
            Pincode
          </label>
          <p className="text-[16px] text-[#31316699] mb-1">
            6-digit postal code of your Business  location.
          </p>
          <input
            type="text"
            id="pincode"
            name="pincode"
            value={formData.pincode || ""}
            onChange={handleChange}
            onBlur={() => handleBlur('pincode')}
            className={`form-input ${errors.pincode ? "border-red-500" : ""}`}
            placeholder="Pincode"
            maxLength={6}
            autocomplete="off"
          />
          {errors.pincode && (
            <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>
          )}
        </div>

        {/* Submit */}
        <div className="md:col-span-2 flex justify-center gap-4 mt-6">
          <button
            type="button"
            onClick={goToPreviousStep}
            className="min-w-[150px] text-[#CB376D] py-2 px-4 rounded-[10px] bg-white border-2 border-[#CB376D] hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            className="min-w-[150px] text-white py-2 px-4 rounded-[10px] bg-gradient-to-r from-[#CB376D] to-[#A72962]"
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
};

export default StoreInformation;