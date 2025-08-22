import { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
// import usePost from "../../../hooks/usePost";

const schema = yup.object({
  otp: yup
    .array()
    .of(
      yup
        .string()
        .matches(/^\d$/, "Must be a digit")
        .required("Each digit is required")
    )
    .length(6, "OTP must have exactly 6 digits")
    .required("OTP is required"),
  newPassword: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password must not exceed 20 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords must match with new password")
    .required("Confirm password is required"),
});

function ForgotPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    register,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      otp: ["", "", "", "", "", ""],
      newPassword: "",
      confirmPassword: "",
    },
  });

  const otpRefs = useRef([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  // const { postData } = usePost("admin/password");

  const otp = watch("otp");
  const otpArray = Array.isArray(otp) ? otp : ["", "", "", "", "", ""];

  const handleOtpChange = async (index, value) => {
    if (value.length <= 1 && /^\d?$/.test(value)) {
      const newOtp = [...otpArray];
      newOtp[index] = value;
      setValue("otp", newOtp);

      if (value !== "" && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }

      await trigger("otp");
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpArray[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const onSubmit = async (payload) => {
    // const { email } = location.state || {};
    
    // if (!email) {
    //   showToast("Email not found. Please try the password reset process again.", "error");
    //   navigate("/forgot-password");
    //   return;
    // }

    // payload.email = email;
    // payload.otp = payload.otp.join("");
    // setLoading(true);

    // try {
    //   const response = await postData(payload);
    //   showToast(response.message, "success");
    //   setTimeout(() => {
    //     navigate("/account");
    //   }, 1500);
    // } catch (err) {
    //   console.log(err);
    //   showToast(err.response?.data?.message || "An error occurred", "error");
    // } finally {
    //   setLoading(false);
    //   reset();
    // }
  };

  return (
    <div className="login-bg flex items-center justify-center min-h-screen p-4">
      <div className="bg-white/20 backdrop-blur-md rounded-2xl shadow-xl max-w-md w-full p-8 text-white">
        <h1 className="text-2xl font-bold text-center mb-6">
          Reset Your Password
        </h1>
        
        <p className="text-center text-white/80 mb-8">
          Enter the OTP sent to your email and create a new password
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* OTP Section */}
          <div>
            <label className={`block mb-3 text-white ${errors.otp ? "text-red-300" : ""}`}>
              Verification Code
            </label>
            <div className="flex gap-3 justify-center mb-2">
              {otpArray.map((digit, index) => (
                <Controller
                  key={index}
                  name={`otp[${index}]`}
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      ref={(el) => (otpRefs.current[index] = el)}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onInput={(e) =>
                        (e.target.value = e.target.value.replace(/[^\d]/g, ""))
                      }
                      className={`w-12 h-12 text-center text-lg font-medium bg-white/10 backdrop-blur-sm border rounded-md focus:outline-none focus:ring-2 transition-all text-white ${
                        errors.otp
                          ? "border-red-400 focus:ring-red-300/30"
                          : "border-white/20 focus:border-white/50 focus:ring-white/30"
                      }`}
                    />
                  )}
                />
              ))}
            </div>
            {errors.otp && (
              <span className="text-red-300 text-sm block mt-2 text-center">
                {errors.otp.message || "Invalid or incomplete OTP"}
              </span>
            )}
          </div>

          {/* New Password Field */}
          <div>
            <label className="block mb-3 text-white">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("newPassword")}
                placeholder="Enter new password"
                className="w-full px-4 py-3 rounded-md bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/60 hover:text-white transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
            {errors.newPassword && (
              <span className="text-red-300 text-sm block mt-2">
                {errors.newPassword.message}
              </span>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block mb-3 text-white">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                placeholder="Confirm your password"
                className="w-full px-4 py-3 rounded-md bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent pr-12"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/60 hover:text-white transition-colors"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="text-red-300 text-sm block mt-2">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-[#CB376D] to-[#A72962] text-white font-medium py-3 px-4 rounded-md transition duration-200 ease-in-out ${
              loading ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"
            }`}
          >
            {loading ? "Resetting Password..." : "Reset Password"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p>
            Remember your password?{" "}
            <Link to="/account" className="font-medium hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;