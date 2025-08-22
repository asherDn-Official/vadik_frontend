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
import Notification from "./pages/Notification";
import ForgotPassword from "./pages/ForgotPassword";

function App() {
  const { auth, loading, checkAuth } = useAuth();
  const [onboardingDone, setOnboardingDone] = useState(true); // assume true until checked
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

  useEffect(() => {
    const fetchOnboardingStatus = async () => {
      if (!auth) {
        setCheckingOnboarding(false);
        return;
      }
      try {
        const res = await checkAuth();
        setOnboardingDone(res.data.data.onboarding === true); // adjust based on backend meaning
      } catch (err) {
        console.error("Error fetching onboarding status", err);
      } finally {
        setCheckingOnboarding(false);
      }
    };

    fetchOnboardingStatus();
  }, []);

  if (loading || checkingOnboarding) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route index element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/register/*"
          element={<Register formData={formData} updateFormData={updateFormData} />}
        />
        <Route path="completion" element={<Completion />} />

        {auth ? (
          <Route path="/" element={<Layout />}>
            <Route
              path="dashboard"
              element={onboardingDone ? <Dashboard /> : <Navigate to="/register" replace />}
            />
            <Route
              path="customers"
              element={onboardingDone ? <CustomerList /> : <Navigate to="/register" replace />}
            />
            <Route
              path="customers/add"
              element={onboardingDone ? <CustomerAdd /> : <Navigate to="/register" replace />}
            />
            <Route
              path="customers/customer-profile/:customerId"
              element={onboardingDone ? <CustomerProfile /> : <Navigate to="/register" replace />}
            />
            <Route
              path="personalisation"
              element={onboardingDone ? <CustomerPersonalisation /> : <Navigate to="/register" replace />}
            />
            <Route
              path="customeropportunities"
              element={onboardingDone ? <CustomerOpportunities /> : <Navigate to="/register" replace />}
            />
            <Route
              path="performance"
              element={onboardingDone ? <PerformanceTracking /> : <Navigate to="/register" replace />}
            />
            <Route
              path="integration"
              element={onboardingDone ? <IntegrationPage /> : <Navigate to="/register" replace />}
            />
            <Route
              path="kyc"
              element={onboardingDone ? <KYCPage /> : <Navigate to="/register" replace />}
            />
            <Route
              path="settings"
              element={onboardingDone ? <SettingsPage /> : <Navigate to="/register" replace />}
            />
            <Route
              path="settings/:tab"
              element={onboardingDone ? <SettingsPage /> : <Navigate to="/register" replace />}
            />
            <Route
              path="notifications"
              element={onboardingDone ? <Notification /> : <Navigate to="/register" replace />}
            />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/" replace />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
