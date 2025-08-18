import React from "react";
import { useForm } from "react-hook-form";
import PhoneInput from "react-phone-number-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

const CustomerForm = ({ onSubmit, resetForm }) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstname: "",
      lastname: "",
      mobileNumber: "",
      source: "walk-in",
      gender: "",
      firstVisit: "",
    },
  });

  // Reset form when resetForm prop changes
  React.useEffect(() => {
    if (resetForm) {
      reset();
    }
  }, [resetForm, reset]);

  const handlePhoneChange = (value) => {
    setValue("mobileNumber", value, { shouldValidate: true });
  };

  const validateMobileNumber = (value) => {
    if (!value) return "Mobile Number is required";

    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');

    // For India (default country), check if it's exactly 12 digits (91 + 10 digits)
    if (digitsOnly.length !== 12) {
      return "Mobile number must be exactly 12 digits (including country code)";
    }

    return true;
  };

  const onFormSubmit = (data) => {
    // Format mobile number by removing all non-digit characters
    const formattedMobile = data.mobileNumber.replace(/\D/g, "");
    const formattedDate = data.firstVisit ? `${data.firstVisit}T00:00:00Z` : "";

    onSubmit({
      ...data,
      mobileNumber: formattedMobile,
      firstVisit: formattedDate,
    });
  };

  const today = new Date().toISOString().split("T")[0];
  const mobileNumber = watch("mobileNumber");

  return (
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
            className={`w-full p-2 border ${errors.lastname ? "border-red-500" : "border-gray-300"
              } rounded text-[#313166]`}
          />
          {errors.lastname && (
            <p className="text-red-500 text-xs">{errors.lastname.message}</p>
          )}
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="space-y-2">
          <label className="block text-sm text-[#31316680]">Mobile Number *</label>
          <PhoneInput
            international
            defaultCountry="IN"
            value={mobileNumber}
            onChange={handlePhoneChange}
            className={`w-full p-2 border ${errors.mobileNumber ? "border-red-500" : "border-gray-300"
              } rounded text-[#313166]`}
            inputStyle={{ width: "100%", padding: "0.5rem" }}
            dropdownClass="text-gray-700"
            countryCallingCodeEditable={false}
            rules={{ validate: validateMobileNumber }}
          />
          {errors.mobileNumber && (
            <p className="text-red-500 text-xs">{errors.mobileNumber.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-[#31316680]">Source *</label>
          <select
            {...register("source", { required: "Source is required" })}
            className={`w-full p-2 border ${errors.source ? "border-red-500" : "border-gray-300"
              } rounded text-[#313166] bg-white`}
          >
            <option value="walk-in">Walk-in</option>
            <option value="website">Website</option>
            <option value="social-media">Social Media</option>
            <option value="others">Others</option>
          </select>
          {errors.source && (
            <p className="text-red-500 text-xs">{errors.source.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-[#31316680]">First Visit Date *</label>
          <input
            type="date"
            {...register("firstVisit", {
              required: "First Visit date is required",
              validate: (value) => {
                const selectedDate = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return selectedDate <= today || "Date cannot be in the future";
              },
            })}
            max={today}
            className={`w-full p-2 border ${errors.firstVisit ? "border-red-500" : "border-gray-300"
              } rounded text-[#313166]`}
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
        >
          Create Customer
        </button>
      </div>
    </form>
  );
};

export default CustomerForm;