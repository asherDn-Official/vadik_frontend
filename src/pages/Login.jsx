import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi"; // Added eye icons
import api from "../api/apiconfig";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [loginType, setLoginType] = useState("retailer"); // 'retailer' or 'staff'
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false); // Added password visibility state
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = loginType === "retailer"
        ? "api/auth/retailerLogin"
        : "api/auth/staffLogin";

      const response = await api.post(endpoint, {
        email: credentials.email,
        password: credentials.password,
      });

      const data = response.data;

      if (data.token) {
        localStorage.setItem("token", data.token);
        await checkAuth();
        localStorage.setItem('place_id', data.retailer.placeId);
        // navigate("/dashboard");

        // Store appropriate ID based on login type
        if (loginType === "retailer" && data.retailer?._id) {
          if (data.retailer.onboarding) {
            navigate("/dashboard");
          } else {
            navigate(`/register/basic/${data.retailer._id}`);
          }
          localStorage.setItem("retailerId", data.retailer._id);
        } else if (loginType === "staff" && data.staff?._id) {
          localStorage.setItem("retailerId", data.staff._id);
          navigate("/dashboard");
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "An error occurred during login"
      );
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg flex items-center justify-center min-h-screen p-4">
      <div className="bg-white/20 backdrop-blur-md rounded-2xl shadow-xl max-w-md w-full p-8 text-white">
        <h1 className="text-2xl font-bold text-center mb-8">
          Sign in to your account
        </h1>

        {/* Login Type Toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setLoginType("retailer")}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${loginType === "retailer"
                ? "bg-[#CB376D] text-white"
                : "bg-white/10 text-white/70 hover:bg-white/20"}`}
            >
              Business Admin
            </button>
            <button
              type="button"
              onClick={() => setLoginType("staff")}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${loginType === "staff"
                ? "bg-[#CB376D] text-white"
                : "bg-white/10 text-white/70 hover:bg-white/20"}`}
            >
              Team
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/80 text-white rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder={`Enter ${loginType === "retailer" ? "Business Admin" : "Team Member"} Email address`}
              className="w-full px-4 py-3 rounded-md bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
              required
            />
          </div>

          {/* Password field with visibility toggle */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="w-full px-4 py-3 rounded-md bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent pr-12"
              required
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

          <div className="flex items-center justify-between">
            <div className="text-right cursor-pointer " onClick={() => navigate('/forgot-password')}>
              <a className="hover:underline">
                Reset password?
              </a>
            </div>
             <div className="text-right cursor-pointer " onClick={() => navigate('/forgot-password')}>
              {/* <a className="hover:underline">
                Forgot password?
              </a> */}
            </div>
          </div>



          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-[#CB376D] to-[#A72962] text-white font-medium py-3 px-4 rounded-md transition duration-200 ease-in-out ${loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="font-medium hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;