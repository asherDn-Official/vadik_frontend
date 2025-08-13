import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import CustomerList from "./pages/CustomerList";
import CustomerProfile from "./components/customerProfile/CustomerProfile";
import Layout from "./components/common/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Completion from "./components/registration/Completion";
import IntegrationPage from "./pages/IntegrationPage";
import KYCPage from "./pages/kyc";
import SettingsPage from "./pages/SettingsPage";
import PerformanceTracking from "./pages/PerformanceTracking";
import CustomerPersonalisation from "./pages/CustomerPersonalisation";
import CustomerOpportunities from "./pages/CustomerOpportunities";
import { useAuth } from "./context/AuthContext";
import CustomerAdd from "./pages/CustomerAdd";
import api from "./api/apiconfig";

function App() {
  const { auth, loading } = useAuth();
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    password: "",
    storeName: "",
    storeType: "",
    storeAddress: "",
    city: "",
    pincode: "",
    logo: null,
    staffCount: "",
    customerCount: "",
    contactNumber: "",
    ownerName: "",
    gstNumber: "",
  });

  const updateFormData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  // Fetch onboarding status once authenticated
  useEffect(() => {
    const fetchOnboardingStatus = async () => {
      if (auth) {
        try {
          const res = await api.get("/api/retailer/profile");
          setOnboardingDone(res.data.data.onboarding); // true or false
        } catch (err) {
          console.error("Error fetching onboarding status", err);
        } finally {
          setCheckingOnboarding(false);
        }
      } else {
        setCheckingOnboarding(false);
      }
    };

    fetchOnboardingStatus();
  }, [auth]);

  if (loading || checkingOnboarding) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route index element={<Login />} />
        <Route
          path="/register/*"
          element={<Register formData={formData} updateFormData={updateFormData} />}
        />
        <Route path="completion" element={<Completion />} />

        {/* Protected */}
        {auth ? (
          onboardingDone ? (
            <Route path="/" element={<Layout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="customers" element={<CustomerList />} />
              <Route path="customers/add" element={<CustomerAdd />} />
              <Route
                path="customers/customer-profile/:customerId"
                element={<CustomerProfile />}
              />
              <Route path="personalisation" element={<CustomerPersonalisation />} />
              <Route path="customeropportunities" element={<CustomerOpportunities />} />
              <Route path="/performance" element={<PerformanceTracking />} />
              <Route path="integration" element={<IntegrationPage />} />
              <Route path="kyc" element={<KYCPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="settings/:tab" element={<SettingsPage />} />
            </Route>
          ) : (
            // If onboarding not done → force to register flow
            <Route path="*" element={<Navigate to="/register" replace />} />
          )
        ) : (
          <Route path="*" element={<Navigate to="/" replace />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
