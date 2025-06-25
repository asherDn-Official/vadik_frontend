import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/apiconfig";

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: "", // Changed from emailOrPhone to match API
    password: "",
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
      const response = await api.post("api/auth/retailerLogin", {
        email: credentials.email,
        password: credentials.password,
      });

      const data = response.data;

      // Store token or user data if needed
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      if (data.retailer && data.retailer._id) {
        localStorage.setItem("retailerId", data.retailer._id);
      }

      // Redirect to dashboard or appropriate page
      navigate("/dashboard"); // Change this to your desired route
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

        {error && (
          <div className="mb-4 p-3 bg-red-500/80 text-white rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email" // Changed to email to match API
              name="email" // Changed from emailOrPhone to match API
              value={credentials.email}
              onChange={handleChange}
              placeholder="Enter Email address"
              className="w-full px-4 py-3 rounded-md bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
              required
            />
          </div>

          <div>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="w-full px-4 py-3 rounded-md bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="rememberMe"
                id="rememberMe"
                checked={credentials.rememberMe}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm">
                Remember me
              </label>
            </div>

            <a href="#" className="text-sm hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-[#CB376D] to-[#A72962] text-white font-medium py-3 px-4 rounded-md transition duration-200 ease-in-out ${
              loading ? "opacity-70 cursor-not-allowed" : ""
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
