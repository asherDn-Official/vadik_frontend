import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useRef } from "react";
import api from "../api/apiconfig";
import { useAuth } from "../context/AuthContext";
import { getModulePath } from "../utils/getModulePath";
import Loader from "../utils/Loader";

const Login = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const hasShownLoginNotification = useRef(false);
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

  // const getErrorMessage = (err, fallback) => {
  //   return (
  //     err.response?.data?.message ||
  //     err.response?.data?.error ||
  //     err.message ||
  //     fallback
  //   );
  // };


  const getErrorMessage = (err, fallback) => {
  // Catch Rate Limiter (HTTP 429)
  if (err.response?.status === 429) {
    return (
      err.response?.data?.message ||
      err.response?.data ||
      "Too many requests. Please wait a few minutes before trying again."
    );
  }

  // Catch Account Lockout (HTTP 423)
  if (err.response?.status === 423) {
    return (
      err.response?.data?.message ||
      "Account temporary locked due to security reasons. Please try again later."
    );
  }

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

  // const validateRegistration = () => {
  //   const trimmedName = registrationData.fullName.trim();
  //   const trimmedStoreName = registrationData.storeName.trim();
  //   const trimmedEmail = registrationData.email.trim();

  //   if (!trimmedName) return "Business owner name is required";

  //   if (trimmedName.length < 3) {
  //     return "Business owner name must be at least 3 characters";
  //   }

  //   if (!trimmedStoreName) return "Business name is required";

  //   if (!/^\d{4,14}$/.test(registrationData.phone)) {
  //     return "Enter a valid mobile number";
  //   }

  //   if (!trimmedEmail) return "Email address is required";

  //   if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
  //     return "Enter a valid email address";
  //   }

  //   if (registrationData.password.length < 8) {
  //     return "Password must be at least 8 characters";
  //   }

  //   if (registrationData.password !== registrationData.confirmPassword) {
  //     return "Password and confirm password must match";
  //   }

  //   return "";
  // };


 const validateRegistration = () => {
  const trimmedName = registrationData.fullName.trim();
  const trimmedEmail = registrationData.email.trim();
  const rawPhone = registrationData.phone.replace(/\D/g, ""); // Strip hyphens/spaces
  const password = registrationData.password || "";
  const confirmPassword = registrationData.confirmPassword || "";

  // 1. Full Name (Supports international accented names like Renée Müller)
  if (!trimmedName) return "Business owner name is required";
  if (trimmedName.length < 2 || trimmedName.length > 80) {
    return "Business owner name must be between 2 and 80 characters";
  }
  if (!/^[\p{L}\s'-]+$/u.test(trimmedName)) {
    return "Business owner name can only contain letters, spaces, hyphens, and apostrophes";
  }

  // 2. Business Name
  if (!registrationData.storeName.trim()) {
    return "Business name is required";
  }

  // 3. Phone Number Validation (Strict 10 digits for India +91, or 7-15 digits generally)
  if (registrationData.phoneCode === "+91") {
    if (!/^[6-9]\d{9}$/.test(rawPhone)) {
      return "Please enter a valid 10-digit mobile number";
    }
  } else if (rawPhone.length < 7 || rawPhone.length > 15) {
    return "Please enter a valid mobile number (7–15 digits)";
  }

  // 4. Email Validation
  if (!trimmedEmail) return "Email address is required";
  if (trimmedEmail.length > 254) return "Email address cannot exceed 254 characters";
  
  // Standard email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmedEmail)) {
    return "Please enter a valid email address";
  }
  
  // Optional check to warn/block common typo gmail.co
  if (trimmedEmail.toLowerCase().endsWith("@gmail.co")) {
    return "Did you mean @gmail.com? Please check your email extension.";
  }

  // 5. Password Complexity Validation (Includes # and all symbols)
  if (password.length < 8 || password.length > 128) {
    return "Password must be between 8 and 128 characters";
  }

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  // Added # and full special character support
  const hasSpecial = /[@$!%*?&#^()+=~_\-\[\]{}|\\:;"'<>,./?]/.test(password);

  if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
    return "Password must include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character";
  }

  if (password !== confirmPassword) {
    return "Password and confirm password must match";
  }

  return ""; // All valid!
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

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   resetMessages();

  //   setLoading(true);

  //   try {
  //     const endpoint =
  //       activePortal === "retailer"
  //         ? "api/auth/retailerLogin"
  //         : "api/auth/staffLogin";

  //     const response = await api.post(endpoint, {
  //       email: credentials.email,
  //       password: credentials.password,
  //     });

  //     const data = response.data;
  //     const retailerOnboardingCompleted =
  //       data.retailer?.onboardingCompleted === true ||
  //       data.retailer?.onboarding === true;

  //     if (data.token) {
  //         if (!hasShownLoginNotification.current) {
  //   hasShownLoginNotification.current = true;

  //   if (Notification.permission === "granted") {
  //     // new Notification("Login Successful", {
  //     //   body: "You have successfully logged in",
  //     // });
  //   }
  // }
  //       if (activePortal === "retailer") {
  //         localStorage.setItem("email", credentials.email);
  //       }
  //       localStorage.setItem("token", data.token);

  //       const authResponse = await checkAuth();

  //       if (activePortal === "retailer" && data.retailer?._id) {
  //         localStorage.setItem("retailerId", data.retailer._id);

  //         if (retailerOnboardingCompleted) {
  //           navigate("/dashboard");
  //         } else {
  //           navigate(`/register/basic/${data.retailer._id}`);
  //         }
  //       }

  //       if (activePortal === "staff" && data.staff?._id) {
  //         const navigatePath = getModulePath(
  //           authResponse.user.permissions[0].module,
  //         );

  //         navigate(navigatePath);
  //       }
  //     }
  //   } catch (err) {
  //     setError(getErrorMessage(err, "Login failed"));
  //   } finally {
  //     setLoading(false);
  //   }
  // };


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
    // Correctly captures 429 rate limits, 423 lockouts, and standard login errors
    setError(getErrorMessage(err, "Login failed. Please check your credentials."));
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
          <Loader text="Please wait..." fullHeight={false} variant="white" />
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
              Business Owner
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
                  placeholder="Business owner email"
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

              <form onSubmit={handleRegistrationSubmit} className="space-y-4" noValidate>
                <input
                  type="text"
                  name="fullName"
                  value={registrationData.fullName}
                  onChange={handleRegistrationChange}
                  maxLength={80}
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
                  maxLength={254}
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
                    maxLength={128}
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

               {/* Live Password Criteria Visualizer */}
{registrationData.password && (
  <div className="text-xs grid grid-cols-2 gap-1 mt-2 px-1 text-white/80">
    <div className={registrationData.password.length >= 8 && registrationData.password.length <= 128 ? "text-green-400" : "text-white/50"}>
      ✓ 8–128 characters
    </div>
    <div className={/[A-Z]/.test(registrationData.password) ? "text-green-400" : "text-white/50"}>
      ✓ 1 Uppercase letter
    </div>
    <div className={/[a-z]/.test(registrationData.password) ? "text-green-400" : "text-white/50"}>
      ✓ 1 Lowercase letter
    </div>
    <div className={/\d/.test(registrationData.password) ? "text-green-400" : "text-white/50"}>
      ✓ 1 Number
    </div>
    <div className={/[@$!%*?&_\-#^()+=~`]/.test(registrationData.password) ? "text-green-400" : "text-white/50"}>
      ✓ 1 Special character
    </div>
  </div>
)}

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
