import { useState } from "react";

const BasicInformation = ({ formData, updateFormData, goToNextStep }) => {
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.mobile) newErrors.mobile = "Mobile number is required";
    if (!formData.email) newErrors.email = "Email address is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email address is invalid";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
            value={formData.firstName}
            onChange={handleChange}
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
            value={formData.lastName}
            onChange={handleChange}
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
          <input
            type="tel"
            id="mobile"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            className={`form-input ${errors.mobile ? "border-red-500" : ""}`}
            placeholder="Mobile Number"
          />
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
            value={formData.email}
            onChange={handleChange}
            className={`form-input ${errors.email ? "border-red-500" : ""}`}
            placeholder="Email Address"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

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

export default BasicInformation;
