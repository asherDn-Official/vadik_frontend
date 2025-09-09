import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import api from "../../api/apiconfig";
import showToast from "../../utils/ToastNotification";
import { useAuth } from "../../context/AuthContext";

const MyProfile = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
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
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [retailerId, setRetailerId] = useState(null);
  const fileInputRef = useRef(null);

  const { auth } = useAuth();

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

          // Set form values using setValue from react-hook-form
          setValue("firstName", firstName);
          setValue("lastName", lastName);
          setValue("phone", formattedPhone);
          setValue("email", retailerData.email || "");
          setValue("storeName", retailerData.storeName || "");
          setValue("address", retailerData.storeAddress || "");
          setValue("retentionPeriod", retailerData.retentionPeriod || 30);
          setValue("loyalCustomerPeriodDays", retailerData.loyalCustomerPeriodDays || 120);
          setValue("automatedCustomersGreeting", retailerData.automatedCustomersGreeting || true);
          setValue("GSTNumber", retailerData.GSTNumber || "");
          setValue("numberOfCustomers", retailerData.numberOfCustomers || "");
          setValue("numberOfEmployees", retailerData.numberOfEmployees || "");
          setValue("storeCity", retailerData.storeCity || "");
          setValue("storeContactNumber", retailerData.storeContactNumber || "");
          setValue("storeOwnerName", retailerData.storeOwnerName || "");
          setValue("storePincode", retailerData.storePincode || "");
          setValue("storeType", retailerData.storeType || "");
          setValue("profilePicture", retailerData.storeImage || "https://randomuser.me/api/portraits/men/36.jpg");
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
  }, [auth, setValue]);

  const handlePhoneChange = (value) => {
    setValue("phone", value);
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

        if (response.data.data?.avatarUrl) { 
          setValue("profilePicture", response.data.data.avatarUrl);
        }
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
      setValue("profilePicture", event.target.result);
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

  return (
    <div className="px-10 py-3 mx-auto">
      <h2 className="text-[#313166] text-[14px] font-medium mb-6">
        Admin Profile
      </h2>

      {successMessage && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <div className="flex flex-col md:flex-row gap-10">
        <div className="flex-1">
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6">
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
                    // minLength: {
                    //   value: 2,
                    //   message: "Must be at least 2 characters",
                    // },
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
                  Store Name
                </label>
                <input
                  type="text"
                  {...register("storeName", { required: "Store name is required", minLength: { value: 3, message: "Must be at least 3 characters" }, maxLength: { value: 50, message: "Cannot exceed 50 characters" } })}
                  className="w-full p-2 border border-gray-300 rounded text-[#313166]"
                  placeholder="Enter store name"
                />

                {errors.storeName && (
                  <p className="text-red-500 text-xs mt-1">{errors.storeName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-[#31316680]">Role</label>
                <input
                  type="text"
                  value="Retailer"
                  className="w-full p-2 border border-gray-300 rounded text-[#313166] bg-gray-100"
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-[#31316680]">
                Store Address
              </label>
              <input
                type="text"
                {...register("address", { required: "Store address is required" })}
                className="w-full p-2 border border-gray-300 rounded text-[#313166]"
                placeholder="Enter store address"
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
                  {...register("GSTNumber", { required: "GST is required" })}
                  className="w-full p-2 border border-gray-300 rounded text-[#313166]"
                  placeholder="Enter GST number"
                />
                {errors.GSTNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.GSTNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-[#31316680]">
                  Store Owner Name
                </label>
                <input
                  type="text"
                  {...register("storeOwnerName", { required: "Store owner name is required", minLength: { value: 3, message: "Must be at least 3 characters" }, maxLength: { value: 50, message: "Cannot exceed 50 characters" } })}
                  className="w-full p-2 border border-gray-300 rounded text-[#313166]"
                  placeholder="Enter store owner name"
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
                  Store City
                </label>
                <input
                  type="text"
                  {...register("storeCity", { required: "Store city is required" })}
                  className="w-full p-2 border border-gray-300 rounded text-[#313166]"
                  placeholder="Enter store city"
                />
                {errors.storeCity && (
                  <p className="text-red-500 text-xs mt-1">{errors.storeCity.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-[#31316680]">
                  Store Pincode
                </label>
                <input
                  type="text"
                  {...register("storePincode", { required: "Store pincode is required" })}
                  className="w-full p-2 border border-gray-300 rounded text-[#313166]"
                  placeholder="Enter store pincode"
                />
                {errors.storePincode && (
                  <p className="text-red-500 text-xs mt-1">{errors.storePincode.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm text-[#31316680]">
                  Store Contact Number
                </label>
                <input
                  type="text"
                  {...register("storeContactNumber", { required: "Store contact number is required" })}
                  className="w-full p-2 border border-gray-300 rounded text-[#313166]"
                  placeholder="Enter store contact number"
                />
                {errors.storeContactNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.storeContactNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-[#31316680]">
                  Store Type
                </label>
                <input
                  type="text"
                  {...register("storeType", { required: "Store type is required" })}
                  className="w-full p-2 border border-gray-300 rounded text-[#313166]"
                  placeholder="Enter store type"
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
                  onClick={() => setValue("automatedCustomersGreeting", !automatedGreeting)}
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

        <div className="md:w-64 flex flex-col items-center bg-[#F4F5F9] p-5 rounded-[10px] justify-evenly h-[315px]">
          <div className="text-center mb-4">
            <h3 className="font-medium mb-1 text-[#313166] text-[14px]">
              Profile Picture
            </h3>
          </div>
          <div className="w-34 h-34 rounded-full overflow-hidden mb-4 border-2 border-gray-200">
            <img
              src={watch("profilePicture")}
              alt="Profile"
              className="w-[134px] h-[134px] object-cover"
            />
          </div>
          <div className="text-center text-xs text-gray-500 mb-2">
            <span className="text-[#31316680] text-[10px]">
              Upload jpg or png
            </span>
            <br />
            <span className="text-[#EC396F] text-[10px]">
              (max 200x200px, 2MB)
            </span>
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
            className="px-4 py-2 border border-1 border-[#313166] rounded hover:bg-gray-50 w-full"
          >
            Upload Photo
          </button>

          {uploadError && (
            <p className="text-red-500 text-xs mt-2 text-center">
              {uploadError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProfile;