import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import api from "../../api/apiconfig";
import showToast from "../../utils/ToastNotification";
import { useAuth } from "../../context/AuthContext";

const MyProfile = ({ setHasUnsavedChanges }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setError,
    clearErrors,
    setValue,
    trigger,
    watch,
    reset,
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      storeName: "",
      role: "Retailer",
      address: "",
      retentionPeriod: 30,
      loyalCustomerPeriodDays: 120,
      automatedCustomersGreeting: true,
      GSTNumber: "",
      numberOfCustomers: "",
      numberOfEmployees: "",
      storeCity: "",
      storeContactNumber: "",
      storeOwnerName: "",
      storePincode: "",
      storeType: "",
      profilePicture: "https://randomuser.me/api/portraits/men/36.jpg",
    },
    mode: "onChange",
  });

  const [uploadError, setUploadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [retailerId, setRetailerId] = useState(null);
  const fileInputRef = useRef(null);

  const { auth } = useAuth();

  // Watch for changes and notify parent component
  useEffect(() => {
    if (setHasUnsavedChanges) {
      setHasUnsavedChanges(isDirty);
    }
  }, [isDirty, setHasUnsavedChanges]);

  // Handle browser close/reload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Watch the automatedCustomersGreeting value for the toggle
  const automatedGreeting = watch("automatedCustomersGreeting");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await api.get(`api/retailer/profile`);

        if (response.data.status === "success") {
          const retailerData = response.data.data;
          console.log(retailerData);
          const id = retailerData._id;
          setRetailerId(id);

          // Split fullName into firstName and lastName
          const nameParts = retailerData?.fullName?.split(" ") || [];
          const firstName = nameParts[0] || "";
          const lastName = nameParts.slice(1).join(" ") || "";

          const formattedPhone =
            (retailerData.phoneCode?.replace("+", "") || "") +
            (retailerData.phone || "");

          // Set form values and reset to new defaults to clear isDirty
          const initialValues = {
            firstName,
            lastName,
            phone: formattedPhone,
            email: retailerData.email || "",
            storeName: retailerData.storeName || "",
            address: retailerData.storeAddress || "",
            retentionPeriod: retailerData.retentionPeriod || 30,
            loyalCustomerPeriodDays: retailerData.loyalCustomerPeriodDays || 120,
            automatedCustomersGreeting: retailerData.automatedCustomersGreeting || true,
            GSTNumber: retailerData.GSTNumber || "",
            numberOfCustomers: retailerData.numberOfCustomers || "",
            numberOfEmployees: retailerData.numberOfEmployees || "",
            storeCity: retailerData.storeCity || "",
            storeContactNumber: retailerData.storeContactNumber || "",
            storeOwnerName: retailerData.storeOwnerName || "",
            storePincode: retailerData.storePincode || "",
            storeType: retailerData.storeType || "",
            profilePicture: retailerData.storeImage || "https://randomuser.me/api/portraits/men/36.jpg",
          };
          reset(initialValues);
        }

        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch profile data");
        setLoading(false);
      }
    };

    if (auth?.user) {
      fetchProfileData();
    }
  }, [auth, reset, setError]);

  const gstValue = watch("GSTNumber");

  const handlePhoneChange = (phoneValue) => {
    setValue("phone", phoneValue, { shouldValidate: true, shouldDirty: true });

    // Custom validation for 10 digits
    if (phoneValue) {
      const digitsOnly = phoneValue.replace(/\D/g, '');
      if (digitsOnly.length !== 12) {
        setError('phone', {
          type: 'manual',
          message: 'Phone number must be 10 digits'
        });
      } else {
        clearErrors('phone');
      }
    }
  };

  const onSubmit = async (data) => {
    setError(null);
    setSuccessMessage("");

    try {
      const formData = new FormData();
      formData.append("fullName", `${data.firstName} ${data.lastName}`.trim());
      formData.append("email", data.email);

      const phoneCode = `+${data.phone.slice(0, 2)}`;
      const phoneNumber = data.phone.slice(2);
      formData.append("phoneCode", phoneCode);
      formData.append("phone", phoneNumber);

      formData.append("storeName", data.storeName);
      formData.append("storeAddress", data.address);
      formData.append("retentionPeriod", data.retentionPeriod);
      formData.append("loyalCustomerPeriodDays", data.loyalCustomerPeriodDays);
      formData.append("automatedCustomersGreeting", data.automatedCustomersGreeting);
      formData.append("GSTNumber", data.GSTNumber);
      formData.append("numberOfCustomers", data.numberOfCustomers);
      formData.append("numberOfEmployees", data.numberOfEmployees);
      formData.append("storeCity", data.storeCity);
      formData.append("storeContactNumber", data.storeContactNumber);
      formData.append("storeOwnerName", data.storeOwnerName);
      formData.append("storePincode", data.storePincode);
      formData.append("storeType", data.storeType);

      if (data.profilePicture && !data.profilePicture.startsWith("http")) {
        const blob = await fetch(data.profilePicture).then((r) => r.blob());
        formData.append("storeImage", blob, "profile.jpg");
      }

      const response = await api.patch(`api/retailer/${retailerId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.status === "success") {
        showToast("Profile Updated Successfully!", "success");
        
        // Update local state and reset form dirty state
        const updatedData = { ...data };
        if (response.data.data?.storeImage) {
          updatedData.profilePicture = response.data.data.storeImage;
        }
        reset(updatedData);
      }
    } catch (err) {
      showToast(err.response?.data?.message, "error")
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      setUploadError("Please upload an image file (jpg, png)");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError("File size too large (max 2MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setValue("profilePicture", event.target.result, { shouldDirty: true });
      setUploadError("");
    };
    reader.onerror = () => {
      setUploadError("Error reading file");
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  if (loading) {
    return <div className="px-10 py-3 mx-auto">Loading profile data...</div>;
  }


  const validateGstNumber = (value) => {
    if (!value) return "GST is required";

    const gst = value.trim().toUpperCase();
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

    if (gst.length !== 15) return "GST number must be 15 characters";
    if (!gstRegex.test(gst)) return "Invalid GST number format";

    return true;
  };


  return (
    <div className="max-w-5xl mx-auto p-4 md:p-0">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[#313166] text-lg font-semibold">
          Admin Profile
        </h2>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 animate-in fade-in slide-in-from-top-2 duration-300">
          {successMessage}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="flex-1 order-2 lg:order-1">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm text-[#31316680]">
                  First Name
                </label>
                <input
                  type="text"
                  {...register("firstName", {
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
                  placeholder="Enter first name"
                  className="w-full p-2 border border-gray-300 rounded text-[#313166]"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-[#31316680]">
                  Last Name
                </label>
                <input
                  type="text"
                  {...register("lastName", {
                    required: "Last Name is required",
                    minLength: {
                      value: 1,
                      message: "Must be at least 1 characters",
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
                  placeholder="Enter last name"
                  className="w-full p-2 border border-gray-300 rounded text-[#313166]"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm text-[#31316680]">
                  Phone Number
                </label>
                <PhoneInput
                  country={"in"}
                  value={watch("phone")}
                  onChange={handlePhoneChange}
                  inputClass="w-full p-2 border border-gray-300 rounded text-[#313166]"
                  inputStyle={{ width: "100%" }}
                  dropdownClass="text-gray-700"

                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-[#31316680]">
                  Mail Id
                </label>
                <input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Invalid email address"
                    }
                  })}
                  placeholder="Enter your email address"
                  className="w-full p-2 border border-gray-300 rounded text-[#313166]"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm text-[#31316680]">
                  Business Name
                </label>
                <input
                  type="text"
                  {...register("storeName", {
                    required: "Business name is required", minLength: { value: 3, message: "Must be at least 3 characters" }, maxLength: { value: 50, message: "Cannot exceed 50 characters" },
                    pattern: {
                      value: /^[a-zA-Z\u00C0-\u017F\s'-]+$/,
                      message: "Only letters, hyphens, and apostrophes allowed",
                    },
                  })}
                  className="w-full p-2 border border-gray-300 rounded text-[#313166]"
                  placeholder="Enter Business name"
                />

                {errors.storeName && (
                  <p className="text-red-500 text-xs mt-1">{errors.storeName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-[#31316680]">Role</label>
                <input
                  type="text"
                  value={auth.data.role=="retailer"?"Business Admin":auth.data.role}
                  className="w-full p-2 border border-gray-300 rounded text-[#313166] bg-gray-100"
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-[#31316680]">
                Business Address
              </label>
              <textarea
                {...register("address", { required: "Business address is required", minLength: { value: 10, message: "Must be atleast 10 characters" }, maxLength: { value: 250, message: "Cannot exceed 250 characters" } })}
                className="w-full h-36 p-2 border border-gray-300 rounded text-[#313166]"
                placeholder="Enter Business address"
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm text-[#31316680]">
                  Retention Period (days)
                </label>
                <input
                  type="number"
                  {...register("retentionPeriod", {
                    required: "Retention period is required",
                    min: {
                      value: 1,
                      message: "Retention period must be at least 1 day"
                    },
                    max: {
                      value: 90,
                      message: "Retention period cannot exceed 90 days"
                    }
                  })}
                  placeholder="Enter retention period in days"
                  className="w-full p-2 border border-gray-300 rounded text-[#313166]"
                />
                {errors.retentionPeriod && (
                  <p className="text-red-500 text-xs mt-1">{errors.retentionPeriod.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-[#31316680]">
                  Loyal Customer Period (days)
                </label>
                <input
                  type="number"
                  {...register("loyalCustomerPeriodDays", {
                    required: "Loyal customer period is required",
                    min: {
                      value: 1,
                      message: "Loyal customer period must be at least 1 day"
                    },
                    max: {
                      value: 90,
                      message: "Loyal customer period cannot exceed 90 days"
                    }
                  })}
                  placeholder="Enter loyal customer period in days"
                  className="w-full p-2 border border-gray-300 rounded text-[#313166]"
                />
                {errors.loyalCustomerPeriodDays && (
                  <p className="text-red-500 text-xs mt-1">{errors.loyalCustomerPeriodDays.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm text-[#31316680]">
                  GST Number
                </label>
                <input
                  type="text"
                  {...register("GSTNumber", {
                    required: "GST is required",
                    validate: validateGstNumber
                  })}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    setValue("GSTNumber", value, { shouldValidate: true });
                  }}
                  className="w-full p-2 border border-gray-300 rounded text-[#313166]"
                  placeholder="Enter GST number"
                />
                {errors.GSTNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.GSTNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-[#31316680]">
                  Business Owner Name
                </label>
                <input
                  type="text"
                  {...register("storeOwnerName", {
                    required: "Business owner name is required", minLength: { value: 3, message: "Must be at least 3 characters" }, maxLength: { value: 50, message: "Cannot exceed 50 characters" },
                    pattern: {
                      value: /^[a-zA-Z\u00C0-\u017F\s'-]+$/,
                      message: "Only letters, hyphens, and apostrophes allowed",
                    },
                  })}
                  className="w-full p-2 border border-gray-300 rounded text-[#313166]"
                  placeholder="Enter Business owner name"
                />
                {errors.storeOwnerName && (
                  <p className="text-red-500 text-xs mt-1">{errors.storeOwnerName.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm text-[#31316680]">
                  Number of Customers
                </label>
                <select
                  {...register("numberOfCustomers", { required: "Number of customers is required" })}
                  className="w-full p-2 border border-gray-300 rounded text-[#313166]"
                >
                  <option value="">Select range</option>
                  <option value="1-50">1-50</option>
                  <option value="51-100">51-100</option>
                  <option value="101-500">101-500</option>
                  <option value="501-1000">501-1000</option>
                  <option value="1000+">1000+</option>
                </select>
                {errors.numberOfCustomers && (
                  <p className="text-red-500 text-xs mt-1">{errors.numberOfCustomers.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-[#31316680]">
                  Number of Employees
                </label>
                <select
                  {...register("numberOfEmployees", { required: "Number of employees is required" })}
                  className="w-full p-2 border border-gray-300 rounded text-[#313166]"
                >
                  <option value="">Select range</option>
                  <option value="1-5">1-5</option>
                  <option value="6-10">6-10</option>
                  <option value="11-20">11-20</option>
                  <option value="21-50">21-50</option>
                  <option value="50+">50+</option>
                </select>
                {errors.numberOfEmployees && (
                  <p className="text-red-500 text-xs mt-1">{errors.numberOfEmployees.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm text-[#31316680]">
                  Business City
                </label>
                <input
                  type="text"
                  {...register("storeCity", {
                    required: "Business city is required",
                    minLength: {
                      value: 3,
                      message: "Must be at least 3 characters",
                    },
                    maxLength: {
                      value: 50,
                      message: "Cannot exceed 50 characters",
                    },
                    pattern: {
                      value: /^[a-zA-Z\u00C0-\u017F\s'-]+$/,
                      message: "Only letters, hyphens, and apostrophes allowed",
                    },
                  })}
                  className="w-full p-2 border border-gray-300 rounded text-[#313166]"
                  placeholder="Enter Business city"
                />
                {errors.storeCity && (
                  <p className="text-red-500 text-xs mt-1">{errors.storeCity.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-[#31316680]">
                  Business Pincode
                </label>
                <input
                  type="number"
                  {...register("storePincode", {
                    required: "Business pincode is required",
                    min: { value: 100000, message: "Must be 6 digits" },
                    max: { value: 999999, message: "Cannot exceed 6 digits" }
                  }
                  )}
                  className="w-full p-2 border border-gray-300 rounded text-[#313166]"
                  placeholder="Enter Business pincode"
                />
                {errors.storePincode && (
                  <p className="text-red-500 text-xs mt-1">{errors.storePincode.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm text-[#31316680]">
                  Business Contact Number
                </label>
                <input
                  type="number"
                  {...register("storeContactNumber", { required: "Business contact number is required",minLength: { value: 10, message: "Must be 10 digits" }, maxLength: { value: 10, message: "Cannot exceed 10 digits"}}
                  )}
                  className="w-full p-2 border border-gray-300 rounded text-[#313166]"
                  placeholder="Enter Business contact number"
                />
                {errors.storeContactNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.storeContactNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-[#31316680]">
                  Business Type
                </label>
                <input
                  type="text"
                  {...register("storeType", { required: "Business type is required" })}
                  className="w-full p-2 border border-gray-300 rounded text-[#313166]"
                  placeholder="Enter Business type"
                  disabled
                />
                {errors.storeType && (
                  <p className="text-red-500 text-xs mt-1">{errors.storeType.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-[#31316680] mb-2">
                Automated Customers Greeting
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${automatedGreeting ? 'bg-[#CB376D]' : 'bg-gray-300'
                    }`}
                  onClick={() => setValue("automatedCustomersGreeting", !automatedGreeting, { shouldDirty: true })}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${automatedGreeting ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
                <span className="ml-2 text-sm text-gray-600">
                  {automatedGreeting ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-white bg-gradient-to-r from-[#CB376D] to-[#A72962] rounded hover:bg-pink-700 transition"
              >
                Save
              </button>
            </div>
          </form>
        </div>

        <div className="w-full lg:w-72 order-1 lg:order-2">
          <div className="sticky top-6 bg-gray-50 p-6 md:p-8 rounded-[24px] border border-gray-100 flex flex-col items-center">
            <div className="text-center mb-6">
              <h3 className="font-semibold text-[#313166] text-base">
                Business Logo
              </h3>
            </div>
            
            <div className="relative group cursor-pointer" onClick={triggerFileInput}>
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden mb-6 border-4 border-white shadow-md transition-transform group-hover:scale-105">
                <img
                  src={watch("profilePicture")}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>

            <div className="text-center mb-6">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-1">
                Upload JPG or PNG
              </p>
              <p className="text-[#EC396F] text-[10px] font-medium">
                Max 200x200px, 2MB
              </p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />

            <button
              type="button"
              onClick={triggerFileInput}
              className="w-full py-2.5 px-4 border border-gray-200 rounded-xl text-[#313166] font-medium hover:bg-white hover:shadow-sm transition-all text-sm"
            >
              Change Photo
            </button>

            {uploadError && (
              <p className="text-red-500 text-xs mt-4 text-center bg-red-50 py-2 px-3 rounded-lg w-full">
                {uploadError}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;