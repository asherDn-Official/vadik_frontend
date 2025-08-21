import { useState, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import * as yup from "yup";

// Define validation schema
const schema = yup.object().shape({
  firstName: yup
    .string()
    .required("First name is required")
    .matches(/^[A-Za-z\s]+$/, "Only letters are allowed")
    .min(3, "Minimum 3 characters required")
    .max(15, "Maximum 15 characters allowed"),
  lastName: yup
    .string()
    .required("Last name is required")
    .matches(/^[A-Za-z\s]+$/, "Only letters are allowed")
    .min(1, "Minimum 1 character required")
    .max(15, "Maximum 15 characters allowed"),
  mobile: yup
    .string()
    .required("Mobile number is required")
    .test(
      "is-indian-mobile",
      "Enter a valid 10-digit Indian mobile number",
      (value) => {
        if (!value) return false;
        const digits = value.replace(/\D/g, "");
        return /^(\+91|91|0)?[6-9]\d{9}$/.test(digits);
      }
    ),
 email: yup
    .string()
    .required("Email address is required")
    .email("Invalid email format"),
});

const BasicInformation = ({ formData, updateFormData, goToNextStep }) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    mobile: false,
    email: false,
  });

  // Validate field immediately when formData changes
  useEffect(() => {
    const validateField = async (field, value) => {
      try {
        await schema.validateAt(field, { [field]: value });
        setErrors((prev) => ({ ...prev, [field]: "" }));
      } catch (err) {
        setErrors((prev) => ({ ...prev, [field]: err.message }));
      }
    };

    // Validate all touched fields in real-time
    Object.entries(touched).forEach(([field, isTouched]) => {
      if (isTouched) {
        validateField(field, formData[field]);
      }
    });
  }, [formData, touched]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });

    // Mark field as touched on first interaction
    if (!touched[name]) {
      setTouched((prev) => ({ ...prev, [name]: true }));
    }
  };

  const handleMobileChange = (value) => {
    updateFormData({ mobile: value });

    // Mark mobile as touched on first interaction
    if (!touched.mobile) {
      setTouched((prev) => ({ ...prev, mobile: true }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Mark all fields as touched to show all errors
      setTouched({
        firstName: true,
        lastName: true,
        mobile: true,
        email: true,
      });

      // Validate entire form
      await schema.validate(formData, { abortEarly: false });
      goToNextStep();
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        // Handle validation errors
        const newErrors = {};
        error.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      }
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
            onBlur={() => handleBlur("firstName")}
            className={`form-input ${
              touched.firstName && errors.firstName ? "border-red-500" : ""
            }`}
            placeholder="First Name"
          />
          {touched.firstName && errors.firstName && (
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
            onBlur={() => handleBlur("lastName")}
            className={`form-input ${
              touched.lastName && errors.lastName ? "border-red-500" : ""
            }`}
            placeholder="Last Name"
          />
          {touched.lastName && errors.lastName && (
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
          <div className="mt-8">
            <PhoneInput
              country={"in"}
              value={`${formData.phoneCode || ""}${formData.mobile || ""}`} // display only
              inputProps={{
                name: "mobile",
                readOnly: true, // makes the field uneditable
                required: true,
                className: `pl-10 py-3 w-full border ${
                  touched.mobile && errors.mobile
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md outline-none bg-gray-100 cursor-not-allowed`,
              }}
              countryCodeEditable={false}
              onlyCountries={["in"]}
            />
          </div>
          {touched.mobile && errors.mobile && (
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
            onBlur={() => handleBlur("email")}
            className={`form-input ${
              touched.email && errors.email ? "border-red-500" : ""
            }`}
            placeholder="Email Address"
          />
          {touched.email && errors.email && (
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
