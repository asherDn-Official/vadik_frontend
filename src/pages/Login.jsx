import { useState } from "react";
import { Link } from "react-router-dom";

const Login = () => {
  const [credentials, setCredentials] = useState({
    emailOrPhone: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would handle authentication
    console.log("Login attempt with:", credentials);

    // For demo purposes, redirect to register page
    window.location.href = "/register";
  };

  return (
    <div className="login-bg flex items-center justify-center min-h-screen p-4">
      <div className="bg-white/20 backdrop-blur-md rounded-2xl shadow-xl max-w-md w-full p-8 text-white">
        <h1 className="text-2xl font-bold text-center mb-8">
          Sign in to your account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              name="emailOrPhone"
              value={credentials.emailOrPhone}
              onChange={handleChange}
              placeholder="Enter Email address or Phone Number"
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
            className="w-full bg-gradient-to-r from-[#CB376D] to-[#A72962] text-white font-medium py-3 px-4 rounded-md transition duration-200 ease-in-out"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
