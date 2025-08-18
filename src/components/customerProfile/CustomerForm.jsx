import React from "react";
import { Controller, useForm } from "react-hook-form";
import PhoneInput from "react-phone-number-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


const CustomerForm = ({ onSubmit, resetForm }) => {
  const {
    register,
    handleSubmit,
    control,
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
      firstVisit: null,
    },
  });

  // Reset form when resetForm prop changes
  React.useEffect(() => {
    if (resetForm) {
      reset();
    }
  }, [resetForm, reset]);

  const validateMobileNumber = (value) => {
    if (!value) return "Mobile Number is required";

    // Check if the phone number is valid
    if (!isValidPhoneNumber(value)) {
      return "Invalid phone number";
    }

    // Extract just the national number (without country code)
    const nationalNumber = value.replace(/\D/g, '').slice(-10);

    // For India, check if it's exactly 10 digits (national number)
    if (nationalNumber.length !== 10) {
      return "Mobile number must be exactly 10 digits";
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
      firstVisit: data.firstVisit,
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
                value: 2,
                message: "Must be at least 2 characters",
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg">
        <div className="space-y-2">
          <label className="block text-sm text-[#31316680]">Mobile Number *</label>
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
                className={`w-full p-2 border ${errors.mobileNumber ? "border-red-500" : "border-gray-300"
                  } rounded text-[#313166] `}
                inputStyle={{ width: "100%", padding: "0.5rem" }}
                dropdownClass="text-gray-700"
                countryCallingCodeEditable={false}
                limitMaxLength={true}
              />
            )}
          />
          {errors.mobileNumber && (
            <p className="text-red-500 text-xs">{errors.mobileNumber.message}</p>
          )}
          <p className="text-xs text-gray-500">Enter 10-digit mobile number</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-[#31316680]">Gender *</label>
          <select
            {...register("gender", { required: "Gender is required" })}
            className={`w-full p-2 border ${errors.gender ? "border-red-500" : "border-gray-300"
              } rounded text-[#313166] bg-white`}
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
          <Controller
            name="firstVisit"
            control={control}
            rules={{ required: "First Visit Date is required" }}
            render={({ field }) => (
              <DatePicker
                selected={field.value}
                onChange={(date) => field.onChange(date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="DD/MM/YYYY"
                className={`w-full p-2 border ${errors.firstVisit ? "border-red-500" : "border-gray-300"
                  } rounded text-[#313166]`}
                maxDate={new Date()}
              />
            )}
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