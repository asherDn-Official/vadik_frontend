import React, { useState, useEffect } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css"; // make sure this is imported

const CustomerForm = ({ onSubmit, resetForm }) => {
  const initialFormData = {
    firstname: "",
    lastname: "",
    mobileNumber: "",
    source: "walk-in",
    gender: "",
    firstVisit: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isTouched, setIsTouched] = useState({
    firstname: false,
    lastname: false,
    mobileNumber: false,
    source: false,
    gender: false,
    firstVisit: false,
  });

  useEffect(() => {
    if (resetForm) {
      setFormData(initialFormData);
      setErrors({});
      setIsTouched({
        firstname: false,
        lastname: false,
        mobileNumber: false,
        source: false,
        gender: false,
        firstVisit: false,
      });
    }
  }, [resetForm]);

  // Real-time validation for showing error messages as you type
  useEffect(() => {
    setErrors(validateForm());
  }, [formData, isTouched]);

  const validateForm = () => {
    const newErrors = {};

    if (isTouched.firstname) {
      if (!formData.firstname.trim()) {
        newErrors.firstname = "First Name is required";
      } else if (formData.firstname.trim().length < 3) {
        newErrors.firstname = "First Name must be at least 3 characters";
      }
    }

    if (isTouched.lastname) {
      if (!formData.lastname.trim()) {
        newErrors.lastname = "Last Name is required";
      }
    }

    if (isTouched.mobileNumber) {
      if (!formData.mobileNumber) {
        newErrors.mobileNumber = "Mobile Number is required";
      } else {
        const digits = formData.mobileNumber.replace(/\D/g, "");
        if (digits.length !== 10 && digits.length !== 12) {
          newErrors.mobileNumber = "Mobile Number must be 10 digits";
        }
      }
    }

    if (isTouched.source && !formData.source) {
      newErrors.source = "Source is required";
    }

    if (isTouched.gender && !formData.gender) {
      newErrors.gender = "Gender is required";
    }

    if (isTouched.firstVisit) {
      if (!formData.firstVisit) {
        newErrors.firstVisit = "First Visit date is required";
      } else {
        const selectedDate = new Date(formData.firstVisit);
        const today = new Date();
        if (selectedDate > today) {
          newErrors.firstVisit = "First Visit date cannot be in the future";
        }
      }
    }

    return newErrors;
  };

  const handleBlur = (field) => {
    setIsTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (value) => {
    setFormData((prev) => ({ ...prev, mobileNumber: value }));
    setIsTouched((prev) => ({ ...prev, mobileNumber: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Touch all fields
    const allTouched = {
      firstname: true,
      lastname: true,
      mobileNumber: true,
      source: true,
      gender: true,
      firstVisit: true,
    };
    setIsTouched(allTouched);

    const validationErrors = validateForm();
    setErrors(validationErrors);

    // if (Object.keys(validationErrors).length > 0) {
    //   alert("Please fill all required fields correctly before submitting.");
    //   return;
    // }

    const formattedMobile = formData.mobileNumber.replace(/\D/g, "");
    const formattedDate = formData.firstVisit
      ? `${formData.firstVisit}T00:00:00Z`
      : "";

    onSubmit({
      ...formData,
      mobileNumber: formattedMobile,
      firstVisit: formattedDate,
    });
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm text-[#31316680]">First Name *</label>
          <input
            type="text"
            name="firstname"
            placeholder="First Name"
            value={formData.firstname}
            onChange={handleChange}
            onBlur={() => handleBlur("firstname")}
            className={`w-full p-2 border ${
              errors.firstname ? "border-red-500" : "border-gray-300"
            } rounded text-[#313166]`}
          />
          {errors.firstname && (
            <p className="text-red-500 text-xs">{errors.firstname}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-[#31316680]">Last Name *</label>
          <input
            type="text"
            name="lastname"
            placeholder="Last Name"
            value={formData.lastname}
            onChange={handleChange}
            onBlur={() => handleBlur("lastname")}
            className={`w-full p-2 border ${
              errors.lastname ? "border-red-500" : "border-gray-300"
            } rounded text-[#313166]`}
          />
          {errors.lastname && (
            <p className="text-red-500 text-xs">{errors.lastname}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm text-[#31316680]">Mobile Number *</label>
          <PhoneInput
            international
            defaultCountry="IN"
            value={formData.mobileNumber}
            onChange={handlePhoneChange}
            onBlur={() => handleBlur("mobileNumber")}
            className={`w-full p-2 border ${
              errors.mobileNumber ? "border-red-500" : "border-gray-300"
            } rounded text-[#313166]`}
            inputStyle={{ width: "100%", padding: "0.5rem" }}
            dropdownClass="text-gray-700"
            countryCallingCodeEditable={false}
          />
          {errors.mobileNumber && (
            <p className="text-red-500 text-xs">{errors.mobileNumber}</p>
          )}
          {formData.mobileNumber && !errors.mobileNumber && (
            <p className="text-green-500 text-xs">Valid phone number</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-[#31316680]">Gender *</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            onBlur={() => handleBlur("gender")}
            className={`w-full p-2 border ${
              errors.gender ? "border-red-500" : "border-gray-300"
            } rounded text-[#313166] bg-white`}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="others">Others</option>
          </select>
          {errors.gender && (
            <p className="text-red-500 text-xs">{errors.gender}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm text-[#31316680]">Source *</label>
          <select
            name="source"
            value={formData.source}
            onChange={handleChange}
            onBlur={() => handleBlur("source")}
            className={`w-full p-2 border ${
              errors.source ? "border-red-500" : "border-gray-300"
            } rounded text-[#313166] bg-white`}
          >
            <option value="walk-in">Walk-in</option>
            <option value="website">Website</option>
            <option value="social-media">Social Media</option>
            <option value="others">Others</option>
          </select>
          {errors.source && (
            <p className="text-red-500 text-xs">{errors.source}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-[#31316680]">
            First Visit Date *
          </label>
          <input
            type="date"
            name="firstVisit"
            value={formData.firstVisit}
            onChange={handleChange}
            onBlur={() => handleBlur("firstVisit")}
            max={today}
            className={`w-full p-2 border ${
              errors.firstVisit ? "border-red-500" : "border-gray-300"
            } rounded text-[#313166]`}
          />
          {errors.firstVisit && (
            <p className="text-red-500 text-xs">{errors.firstVisit}</p>
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
