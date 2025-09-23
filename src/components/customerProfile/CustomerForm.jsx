import React from "react";
import { Controller, useForm } from "react-hook-form";
import PhoneInput from "react-phone-number-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, isValid } from "date-fns";


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
      firstVisit: new Date(),
    },
    mode: "onChange", // Change validation mode to onChange for real-time
  });

  // Reset form when resetForm prop changes
  React.useEffect(() => {
    if (resetForm) {
      reset();
    }
  }, [resetForm, reset]);

  const validateDateFormat = (value) => {
    if (!value) return "First Visit Date is required";

    // Check if it's a valid Date object
    if (!(value instanceof Date) || !isValid(value)) {
      return "Please enter a valid date";
    }

    // Reject unrealistic years (e.g., 1111)
    const year = value.getFullYear();
    const minYear = 2000;
    const maxYear = new Date().getFullYear();
    if (year < minYear) {
      return "Date must be 2000 or later";
    }
    if (year > maxYear) {
      return "Date cannot be in the future";
    }

    // Additional format validation if needed
    const formattedDate = format(value, 'dd/MM/yyyy');
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

    if (!dateRegex.test(formattedDate)) {
      return "Date must be in DD/MM/YYYY format";
    }

    return true;
  };

  const validateMobileNumber = (value) => {
    if (!value) return "Mobile Number is required";

    // Check if the phone number is valid (using libphonenumber-js or similar)
    if (!isValidPhoneNumber(value)) {
      return "Invalid phone number";
    }

    // Extract just the national number (last 10 digits)
    const nationalNumber = value.replace(/\D/g, '').slice(-10);

    // Must be exactly 10 digits
    if (nationalNumber.length !== 10) {
      return "Mobile number must be exactly 10 digits";
    }

    // Must start with 6, 7, 8, or 9 (India mobile numbers)
    if (!/^[6-9]\d{9}$/.test(nationalNumber)) {
      return "Mobile number must be valid India mobile number";
    }

    return true;
  };


  const onFormSubmit = (data) => {
    // Format mobile number by removing all non-digit characters
    const formattedMobile = data.mobileNumber.replace(/\D/g, "");

    // Ensure firstVisit is sent as YYYY-MM-DD string
    const firstVisitDate = data.firstVisit ? new Date(data.firstVisit) : null;
    const formattedFirstVisit = firstVisitDate
      ? `${firstVisitDate.getFullYear()}-${String(firstVisitDate.getMonth() + 1).padStart(2, "0")}-${String(firstVisitDate.getDate()).padStart(2, "0")}`
      : null;

    onSubmit({
      ...data,
      mobileNumber: formattedMobile,
      firstVisit: formattedFirstVisit,
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
            rules={{ required: "First Visit Date is required", validate: validateDateFormat }}
            render={({ field }) => (
              <DatePicker
                selected={field.value}
                onChange={(date) => field.onChange(date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="DD/MM/YYYY"
                className={`w-full p-2 border ${errors.firstVisit ? "border-red-500" : "border-gray-300"
                  } rounded text-[#313166]`}
                minDate={new Date(2025, 0, 1)}
                maxDate={new Date()}
                showYearDropdown
                scrollableYearDropdown
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