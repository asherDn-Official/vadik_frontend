import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import api from "../api/apiconfig";
import { useAuth } from "../context/AuthContext";
import { getModulePath } from "../utils/getModulePath";
import Loader from "../utils/Loader";

const Login = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const [activePortal, setActivePortal] = useState("retailer");
  const [retailerView, setRetailerView] = useState("login");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [otp, setOtp] = useState("");

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const [registrationData, setRegistrationData] = useState({
    fullName: "",
    storeName: "",
    phoneCode: "+91",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      window.history.pushState(null, "", window.location.href);
    }

    const enforceLogin = () => {
      if (!localStorage.getItem("token")) {
        navigate("/", { replace: true });
      }
    };

    window.addEventListener("popstate", enforceLogin);

    return () => {
      window.removeEventListener("popstate", enforceLogin);
    };
  }, [navigate]);

  const resetMessages = () => {
    setError(null);
    setSuccessMessage("");
  };

  const getErrorMessage = (err, fallback) => {
    return (
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      fallback
    );
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;

    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegistrationChange = (e) => {
    const { name, value } = e.target;

    const nextValue =
      name === "phone" || name === "phoneCode"
        ? value.replace(/[^\d+]/g, "")
        : value;

    setRegistrationData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  const validateRegistration = () => {
    const trimmedName = registrationData.fullName.trim();
    const trimmedStoreName = registrationData.storeName.trim();
    const trimmedEmail = registrationData.email.trim();

    if (!trimmedName) return "Business owner name is required";

    if (trimmedName.length < 3) {
      return "Business owner name must be at least 3 characters";
    }

    if (!trimmedStoreName) return "Business name is required";

    if (!/^\d{4,14}$/.test(registrationData.phone)) {
      return "Enter a valid mobile number";
    }

    if (!trimmedEmail) return "Email address is required";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return "Enter a valid email address";
    }

    if (registrationData.password.length < 8) {
      return "Password must be at least 8 characters";
    }

    if (registrationData.password !== registrationData.confirmPassword) {
      return "Password and confirm password must match";
    }

    return "";
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();

    resetMessages();

    const validationError = validateRegistration();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await api.post("api/retailer/register", {
        fullName: registrationData.fullName.trim(),
        storeOwnerName: registrationData.fullName.trim(),
        storeName: registrationData.storeName.trim(),
        phoneCode: registrationData.phoneCode,
        phone: registrationData.phone,
        email: registrationData.email.trim().toLowerCase(),
        password: registrationData.password,
        confirmPassword: registrationData.confirmPassword,
      });

      setRetailerView("verifyOtp");

      setSuccessMessage(
        "Verification OTP sent to your email. After verification, sign in with the same password you created.",
      );
    } catch (err) {
      setError(getErrorMessage(err, "Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    resetMessages();

    if (!otp.trim()) {
      setError("Enter the OTP sent to your email");
      return;
    }

    setLoading(true);

    try {
      await api.post("api/retailer/verify-email", {
        email: registrationData.email.trim().toLowerCase(),
        otp: otp.trim(),
      });

      setCredentials({
        email: registrationData.email.trim().toLowerCase(),
        password: "",
      });

      setRetailerView("login");

      setSuccessMessage(
        "Email verified successfully. Please sign in with the password you created.",
      );
    } catch (err) {
      setError(getErrorMessage(err, "OTP verification failed."));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    resetMessages();

    setLoading(true);

    try {
      const endpoint =
        activePortal === "retailer"
          ? "api/auth/retailerLogin"
          : "api/auth/staffLogin";

      const response = await api.post(endpoint, {
        email: credentials.email,
        password: credentials.password,
      });

      const data = response.data;
      const retailerOnboardingCompleted =
        data.retailer?.onboardingCompleted === true ||
        data.retailer?.onboarding === true;

      if (data.token) {
        if (activePortal === "retailer") {
          localStorage.setItem("email", credentials.email);
        }
        localStorage.setItem("token", data.token);

        const authResponse = await checkAuth();

        if (activePortal === "retailer" && data.retailer?._id) {
          localStorage.setItem("retailerId", data.retailer._id);

          if (retailerOnboardingCompleted) {
            navigate("/dashboard");
          } else {
            navigate(`/register/basic/${data.retailer._id}`);
          }
        }

        if (activePortal === "staff" && data.staff?._id) {
          const navigatePath = getModulePath(
            authResponse.user.permissions[0].module,
          );

          navigate(navigatePath);
        }
      }
    } catch (err) {
      setError(getErrorMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  const animationVariants = {
    initial: {
      opacity: 0,
      x: 40,
      scale: 0.98,
    },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.35,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      x: -40,
      scale: 0.98,
      transition: {
        duration: 0.25,
        ease: "easeIn",
      },
    },
  };
  return (
    <div className="login-bg flex items-center justify-center min-h-screen p-4 relative">
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-2xl">
          <Loader text="Please wait..." fullHeight={false} />
        </div>
      )}
      <motion.div
        layout
        transition={{
          layout: {
            duration: 0.35,
            ease: "easeInOut",
          },
        }}
        className="bg-white/20 backdrop-blur-md rounded-2xl shadow-xl max-w-md w-full p-6 text-white overflow-hidden"
      >
        <div className="flex justify-center mb-4">
          <img className="w-28" src="/vadik_ai_logo.svg" alt="Vadik Logo" />
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-xl overflow-hidden bg-white/10 p-1">
            <button
              onClick={() => {
                setActivePortal("retailer");
                resetMessages();
              }}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                activePortal === "retailer"
                  ? "bg-[#CB376D] text-white"
                  : "text-white/70"
              }`}
            >
              Business Admin
            </button>

            <button
              onClick={() => {
                setActivePortal("staff");
                resetMessages();
              }}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                activePortal === "staff"
                  ? "bg-[#CB376D] text-white"
                  : "text-white/70"
              }`}
            >
              Team
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/80 text-sm">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/80 text-sm">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait" initial={false}>
          {/* TEAM LOGIN */}

          {activePortal === "staff" && (
            <motion.div
              layout
              key="staff-login"
              variants={animationVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <h1 className="text-3xl font-bold text-center mb-8">
                Team Sign In
              </h1>

              <form onSubmit={handleSubmit} className="space-y-5">
                <input
                  type="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleLoginChange}
                  placeholder="Enter team email"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 placeholder-white/60 focus:outline-none"
                  required
                />

                <div className="relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    name="password"
                    value={credentials.password}
                    onChange={handleLoginChange}
                    placeholder="Enter password"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 placeholder-white/60 focus:outline-none pr-12"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    {showLoginPassword ? (
                      <FiEyeOff size={20} />
                    ) : (
                      <FiEye size={20} />
                    )}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#CB376D] to-[#A72962] py-3 rounded-xl font-medium"
                >
                  Sign In
                </button>
              </form>
            </motion.div>
          )}

          {/* RETAILER LOGIN */}

          {activePortal === "retailer" && retailerView === "login" && (
            <motion.div
              layout
              key="retailer-login"
              variants={animationVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <h1 className="text-3xl font-bold text-center mb-8">
                Sign in to your account
              </h1>

              <form onSubmit={handleSubmit} className="space-y-5">
                <input
                  type="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleLoginChange}
                  placeholder="Business admin email"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 placeholder-white/60 focus:outline-none"
                  required
                />

                <div className="relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    name="password"
                    value={credentials.password}
                    onChange={handleLoginChange}
                    placeholder="Enter password"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 placeholder-white/60 focus:outline-none pr-12"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    {showLoginPassword ? (
                      <FiEyeOff size={20} />
                    ) : (
                      <FiEye size={20} />
                    )}
                  </button>
                </div>

                <div className="text-right text-sm">
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="hover:underline"
                  >
                    Reset password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#CB376D] to-[#A72962] py-3 rounded-xl font-medium"
                >
                  Sign In
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-white/80">
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => {
                    setRetailerView("register");
                    resetMessages();
                  }}
                  className="font-medium text-white hover:underline"
                >
                  Create Account
                </button>
              </div>
            </motion.div>
          )}

          {/* REGISTER */}

          {activePortal === "retailer" && retailerView === "register" && (
            <motion.div
              layout
              key="retailer-register"
              variants={animationVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <h1 className="text-3xl font-bold text-center mb-8">
                Create Business Account
              </h1>

              <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                <input
                  type="text"
                  name="fullName"
                  value={registrationData.fullName}
                  onChange={handleRegistrationChange}
                  placeholder="Business owner full name"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 placeholder-white/60 focus:outline-none"
                  required
                />

                <input
                  type="text"
                  name="storeName"
                  value={registrationData.storeName}
                  onChange={handleRegistrationChange}
                  placeholder="Business name"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 placeholder-white/60 focus:outline-none"
                  required
                />

                <PhoneInput
                  country={"in"}
                  enableSearch
                  searchPlaceholder="Search country..."
                  value={`${registrationData.phoneCode}${registrationData.phone}`}
                  onChange={(value, country) => {
                    const dialCode = `+${country.dialCode}`;

                    const phoneNumber = value.replace(country.dialCode, "");

                    setRegistrationData((prev) => ({
                      ...prev,
                      phoneCode: dialCode,
                      phone: phoneNumber,
                    }));
                  }}
                  inputStyle={{
                    width: "100%",
                    height: "52px",
                    background: "rgba(255,255,255,0.10)",
                    border: "1px solid rgba(255,255,255,0.20)",
                    borderRadius: "0.75rem",
                    color: "white",
                    paddingLeft: "52px",
                  }}
                  buttonStyle={{
                    background: "transparent",
                    border: "none",
                    borderRight: "1px solid rgba(255,255,255,0.10)",
                    borderTopLeftRadius: "0.75rem",
                    borderBottomLeftRadius: "0.75rem",
                  }}
                  dropdownStyle={{
                    background: "#1f1f1f",
                    color: "white",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.10)",
                  }}
                  searchStyle={{
                    background: "#2a2a2a",
                    color: "white",
                    border: "none",
                  }}
                  containerClass="w-full"
                />

                <input
                  type="email"
                  name="email"
                  value={registrationData.email}
                  onChange={handleRegistrationChange}
                  placeholder="Business email"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 placeholder-white/60 focus:outline-none"
                  required
                />

                <div className="relative">
                  <input
                    type={showRegisterPassword ? "text" : "password"}
                    name="password"
                    value={registrationData.password}
                    onChange={handleRegistrationChange}
                    placeholder="Create password"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 placeholder-white/60 focus:outline-none pr-12"
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowRegisterPassword(!showRegisterPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    {showRegisterPassword ? (
                      <FiEyeOff size={20} />
                    ) : (
                      <FiEye size={20} />
                    )}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={registrationData.confirmPassword}
                    onChange={handleRegistrationChange}
                    placeholder="Confirm password"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 placeholder-white/60 focus:outline-none pr-12"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff size={20} />
                    ) : (
                      <FiEye size={20} />
                    )}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#CB376D] to-[#A72962] py-3 rounded-xl font-medium"
                >
                  Create Account
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-white/80">
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setRetailerView("login");
                    resetMessages();
                  }}
                  className="font-medium text-white hover:underline"
                >
                  Sign In
                </button>
              </div>
            </motion.div>
          )}

          {/* VERIFY OTP */}

          {activePortal === "retailer" && retailerView === "verifyOtp" && (
            <motion.div
              layout
              key="verify-otp"
              variants={animationVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <h1 className="text-3xl font-bold text-center mb-3">
                Verify Your Email
              </h1>

              <p className="text-center text-sm text-white/70 mb-8">
                Enter the verification code sent to
                <br />
                {registrationData.email}
              </p>

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter OTP"
                  className="w-full px-4 py-4 rounded-xl bg-white/10 border border-white/20 placeholder-white/60 focus:outline-none text-center tracking-[0.5em]"
                  maxLength={6}
                  required
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#CB376D] to-[#A72962] py-3 rounded-xl font-medium"
                >
                  Verify Email
                </button>
              </form>

              <div className="mt-6 flex justify-center gap-5 text-sm text-white/80">
                <button
                  onClick={() => {
                    setRetailerView("register");
                    resetMessages();
                  }}
                  className="hover:underline"
                >
                  Edit Details
                </button>

                <button
                  onClick={() => {
                    setRetailerView("login");
                    resetMessages();
                  }}
                  className="hover:underline"
                >
                  Back to Sign In
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Login;
