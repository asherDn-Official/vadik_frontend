// import { useState } from "react";

// const StoreInformation = ({ formData, updateFormData, goToNextStep }) => {
//   const [errors, setErrors] = useState({});

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     updateFormData({ [name]: value });
//   };

//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.storeName) newErrors.storeName = "Store name is required";
//     if (!formData.storeType) newErrors.storeType = "Store type is required";
//     if (!formData.storeAddress)
//       newErrors.storeAddress = "Store address is required";
//     if (!formData.city) newErrors.city = "City/Town is required";
//     if (!formData.pincode) newErrors.pincode = "Pincode is required";

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (validateForm()) {
//       goToNextStep();
//     }
//   };

//   const storeTypes = [
//     "Clothing & Apparel",
//     "Electronics",
//     "Grocery",
//     "Restaurant",
//     "Beauty & Cosmetics",
//     "Home & Furniture",
//     "Books & Stationery",
//     "Jewelry",
//     "Toys & Games",
//     "Sports & Fitness",
//     "Other",
//   ];

//   return (
//     <div className="step-container">
//       <h2 className="step-header">Store Basic Info</h2>
//       <p className="step-description">
//         Tell us about your Store and where it's located.
//       </p>

//       <form
//         onSubmit={handleSubmit}
//         className="grid grid-cols-1 md:grid-cols-2 gap-10"
//       >
//         <div>
//           <label htmlFor="storeName" className="form-label">
//             Store Name
//           </label>
//           <p className="text-[16px] text-[#31316699] mb-1">
//             Enter your official Store name.
//           </p>
//           <input
//             type="text"
//             id="storeName"
//             name="storeName"
//             value={formData.storeName}
//             onChange={handleChange}
//             className={`form-input ${errors.storeName ? "border-red-500" : ""}`}
//             placeholder="Store Name"
//           />
//           {errors.storeName && (
//             <p className="text-red-500 text-xs mt-1">{errors.storeName}</p>
//           )}
//         </div>

//         <div>
//           <label htmlFor="storeType" className="form-label">
//             Store Type
//           </label>
//           <p className="text-[16px] text-[#31316699] mb-1">
//             Choose your business type. (Textile, Footwear, etc)
//           </p>
//           <select
//             id="storeType"
//             name="storeType"
//             value={formData.storeType}
//             onChange={handleChange}
//             className={`form-input ${errors.storeType ? "border-red-500" : ""}`}
//           >
//             <option value="">Select Store Type</option>
//             {storeTypes.map((type) => (
//               <option key={type} value={type}>
//                 {type}
//               </option>
//             ))}
//           </select>
//           {errors.storeType && (
//             <p className="text-red-500 text-xs mt-1">{errors.storeType}</p>
//           )}
//         </div>

//         <div className="md:col-span-2">
//           <label htmlFor="storeAddress" className="form-label">
//             Store Address
//           </label>
//           <p className="text-[16px] text-[#31316699] mb-1">
//             Mention the complete address where your Store is located.
//           </p>
//           <input
//             type="text"
//             id="storeAddress"
//             name="storeAddress"
//             value={formData.storeAddress}
//             onChange={handleChange}
//             className={`form-input ${
//               errors.storeAddress ? "border-red-500" : ""
//             }`}
//             placeholder="Store Address"
//           />
//           {errors.storeAddress && (
//             <p className="text-red-500 text-xs mt-1">{errors.storeAddress}</p>
//           )}
//         </div>

//         <div>
//           <label htmlFor="city" className="form-label">
//             City / Town
//           </label>
//           <p className="text-[16px] text-[#31316699] mb-1">
//             Enter your Store's city or town.
//           </p>
//           <input
//             type="text"
//             id="city"
//             name="city"
//             value={formData.city}
//             onChange={handleChange}
//             className={`form-input ${errors.city ? "border-red-500" : ""}`}
//             placeholder="City / Town"
//           />
//           {errors.city && (
//             <p className="text-red-500 text-xs mt-1">{errors.city}</p>
//           )}
//         </div>

//         <div>
//           <label htmlFor="pincode" className="form-label">
//             Pincode
//           </label>
//           <p className="text-[16px] text-[#31316699] mb-1">
//             Provide the postal code of your Store location.
//           </p>
//           <input
//             type="text"
//             id="pincode"
//             name="pincode"
//             value={formData.pincode}
//             onChange={handleChange}
//             className={`form-input ${errors.pincode ? "border-red-500" : ""}`}
//             placeholder="Pincode"
//           />
//           {errors.pincode && (
//             <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>
//           )}
//         </div>

//         <div className="md:col-span-2 flex justify-center mt-6 ">
//           <button
//             type="submit"
//             className="min-w-[150px] text-white py-2 px-4 rounded-[10px] bg-gradient-to-r from-[#CB376D] to-[#A72962]"
//           >
//             Next
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default StoreInformation;

import { useState } from "react";

const StoreInformation = ({ formData, updateFormData, goToNextStep }) => {
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.storeName) newErrors.storeName = "Store name is required";
    if (!formData.storeType) newErrors.storeType = "Store type is required";
    if (!formData.storeAddress)
      newErrors.storeAddress = "Store address is required";
    if (!formData.city) newErrors.city = "City/Town is required";
    if (!formData.pincode) newErrors.pincode = "Pincode is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      goToNextStep();
    }
  };

  // Use backend keys for values, and labels for user display
  const storeTypes = [
    { label: "Clothing & Apparel", value: "clothingCategory" },
    { label: "Electronics", value: "electronicCategory" },
    { label: "Grocery", value: "groceryCategory" },
    { label: "Restaurant", value: "restaurantCategory" },
    { label: "Beauty & Cosmetics", value: "beautyCategory" },
    { label: "Home & Furniture", value: "homeAppliancesCategory" },
    { label: "Books & Stationery", value: "booksCategory" },
    { label: "Jewelry", value: "jewelleryCategory" },
    { label: "Toys & Games", value: "toysCategory" },
    { label: "Sports & Fitness", value: "sportsCategory" },
    { label: "Other", value: "otherCategory" },
  ];

  return (
    <div className="step-container">
      <h2 className="step-header">Store Basic Info</h2>
      <p className="step-description">
        Tell us about your Store and where it's located.
      </p>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-10"
      >
        {/* Store Name */}
        <div>
          <label htmlFor="storeName" className="form-label">
            Store Name
          </label>
          <p className="text-[16px] text-[#31316699] mb-1">
            Enter your official Store name.
          </p>
          <input
            type="text"
            id="storeName"
            name="storeName"
            value={formData.storeName}
            onChange={handleChange}
            className={`form-input ${errors.storeName ? "border-red-500" : ""}`}
            placeholder="Store Name"
          />
          {errors.storeName && (
            <p className="text-red-500 text-xs mt-1">{errors.storeName}</p>
          )}
        </div>

        {/* Store Type */}
        <div>
          <label htmlFor="storeType" className="form-label">
            Store Type
          </label>
          <p className="text-[16px] text-[#31316699] mb-1">
            Choose your business type. (Textile, Footwear, etc)
          </p>
          <select
            id="storeType"
            name="storeType"
            value={formData.storeType}
            onChange={handleChange}
            className={`form-input ${errors.storeType ? "border-red-500" : ""}`}
          >
            <option value="">Select Store Type</option>
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
            Store Address
          </label>
          <p className="text-[16px] text-[#31316699] mb-1">
            Mention the complete address where your Store is located.
          </p>
          <input
            type="text"
            id="storeAddress"
            name="storeAddress"
            value={formData.storeAddress}
            onChange={handleChange}
            className={`form-input ${
              errors.storeAddress ? "border-red-500" : ""
            }`}
            placeholder="Store Address"
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
            Enter your Store's city or town.
          </p>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={`form-input ${errors.city ? "border-red-500" : ""}`}
            placeholder="City / Town"
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
            Provide the postal code of your Store location.
          </p>
          <input
            type="text"
            id="pincode"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            className={`form-input ${errors.pincode ? "border-red-500" : ""}`}
            placeholder="Pincode"
          />
          {errors.pincode && (
            <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>
          )}
        </div>

        {/* Submit */}
        <div className="md:col-span-2 flex justify-center mt-6 ">
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
