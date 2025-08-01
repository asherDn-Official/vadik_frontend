import { useState, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const BasicInformation = ({ formData, updateFormData, goToNextStep }) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    mobile: false,
    email: false
  });

  // Real-time validation when inputs change
  useEffect(() => {
    if (touched.firstName) validateFirstName();
    if (touched.lastName) validateLastName();
    if (touched.mobile) validateMobile();
    if (touched.email) validateEmail();
  }, [formData, touched]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleMobileChange = (value) => {
    updateFormData({ mobile: value });
    setTouched(prev => ({ ...prev, mobile: true }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Individual validation functions
  const validateFirstName = () => {
    if (!formData.firstName) {
      setErrors(prev => ({ ...prev, firstName: "First name is required" }));
    } else if (formData.firstName.length < 3) {
      setErrors(prev => ({ ...prev, firstName: "Minimum 3 characters required" }));
    } else if (formData.firstName.length > 8) {
      setErrors(prev => ({ ...prev, firstName: "Maximum 8 characters allowed" }));
    } else {
      setErrors(prev => ({ ...prev, firstName: "" }));
    }
  };

  const validateLastName = () => {
    if (!formData.lastName) {
      setErrors(prev => ({ ...prev, lastName: "Last name is required" }));
    } else if (formData.lastName.length < 3) {
      setErrors(prev => ({ ...prev, lastName: "Minimum 3 characters required" }));
    } else if (formData.lastName.length > 8) {
      setErrors(prev => ({ ...prev, lastName: "Maximum 8 characters allowed" }));
    } else {
      setErrors(prev => ({ ...prev, lastName: "" }));
    }
  };

  const validateMobile = () => {
    if (!formData.mobile) {
      setErrors(prev => ({ ...prev, mobile: "Mobile number is required" }));
    } else {
      const digits = formData.mobile.replace(/\D/g, "");
      if (!/^(\+91|91|0)?[6-9]\d{9}$/.test(digits)) {
        setErrors(prev => ({ ...prev, mobile: "Enter a valid 10-digit Indian mobile number" }));
      } else {
        setErrors(prev => ({ ...prev, mobile: "" }));
      }
    }
  };

  const validateEmail = () => {
    if (!formData.email) {
      setErrors(prev => ({ ...prev, email: "Email address is required" }));
    } else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(formData.email)) {
      setErrors(prev => ({ ...prev, email: "Enter a valid Gmail address" }));
    } else {
      setErrors(prev => ({ ...prev, email: "" }));
    }
  };

  const validateForm = () => {
    validateFirstName();
    validateLastName();
    validateMobile();
    validateEmail();

    return !errors.firstName && 
           !errors.lastName && 
           !errors.mobile && 
           !errors.email &&
           formData.firstName &&
           formData.lastName &&
           formData.mobile &&
           formData.email;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      goToNextStep();
    }
  };

  return (
    <div className="step-container">
      <h2 className="step-header">Basic Information</h2>
      <p className="step-description">
        Enter your personal details to create your account.
      </p>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-10"
      >
        <div>
          <label htmlFor="firstName" className="form-label">
            First Name
          </label>
          <p className="text-[16px] text-[#31316699] mb-1">
            Enter your given name (e.g., Arun, Priya).
          </p>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName || ""}
            onChange={handleChange}
            onBlur={() => handleBlur('firstName')}
            className={`form-input ${errors.firstName ? "border-red-500" : ""}`}
            placeholder="First Name"
          />
          {errors.firstName && (
            <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="form-label">
            Last Name
          </label>
          <p className="text-[16px] text-[#31316699] mb-1">
            Enter your surname/family name (e.g., Kumar, Reddy).
          </p>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName || ""}
            onChange={handleChange}
            onBlur={() => handleBlur('lastName')}
            className={`form-input ${errors.lastName ? "border-red-500" : ""}`}
            placeholder="Last Name"
          />
          {errors.lastName && (
            <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
          )}
        </div>

        <div>
          <label htmlFor="mobile" className="form-label">
            Mobile Number
          </label>
          <p className="text-[16px] text-[#31316699] mb-1">
            We'll use this to send you OTPs and updates.
          </p>
          <div className=" mt-8">
            <PhoneInput
            country={"in"}
            value={`${formData.phoneCode}${formData.mobile} || ""`}
            onChange={handleMobileChange}
            onBlur={() => handleBlur('mobile')}
            inputProps={{
              name: "mobile",
              required: true,
              className: `pl-10 py-3  w-full border border-gray-300 rounded-md w-full outline-none ${
                errors.mobile ? "border-red-500" : ""
              }`,
            }}
            countryCodeEditable={false}
            onlyCountries={['in']}
          />
          </div>
          {errors.mobile && (
            <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <p className="text-[16px] text-[#31316699] mb-1">
            Used for login and receiving important notifications.
          </p>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            onBlur={() => handleBlur('email')}
            className={`form-input ${errors.email ? "border-red-500" : ""}`}
            placeholder="Email Address"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        <div className="md:col-span-2 flex justify-center mt-6">
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

export default BasicInformation;