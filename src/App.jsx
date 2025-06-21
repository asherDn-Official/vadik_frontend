import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CustomerList from "./pages/CustomerList";
// import CustomerProfile from "./pages/CustomerProfile";
import CustomerProfile from "./components/customerProfile/CustomerProfile";
import Layout from "./components/common/Layout";
// import CustomerOpportunities from "./pages/CustomerOpportunities";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useState } from "react";
import Completion from "./components/registration/Completion";
import IntegrationPage from "./pages/IntegrationPage";
import KYCPage from "./pages/kyc";
import SettingsPage from "./pages/SettingsPage";
import PerformanceTracking from "./pages/PerformanceTracking";
import CustomerPersonalisation from "./pages/CustomerPersonalisation";
import CustomerOpportunities from "./pages/CustomerOpportunities";

function App() {
  const [formData, setFormData] = useState({
    // Basic information
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    password: "",

    // Store information
    storeName: "",
    storeType: "",
    storeAddress: "",
    city: "",
    pincode: "",

    // Additional details
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

  return (
    <Router>
      <Routes>
        <Route index element={<Login />} />
        <Route
          path="/register/*"
          element={
            <Register formData={formData} updateFormData={updateFormData} />
          }
        />
        <Route path="completion" element={<Completion />} />
        <Route path="/" element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customers" element={<CustomerList />} />
          {/* <Route path="customers/:id" element={<CustomerProfile />} /> */}
          <Route
            path="/customer-profile/:customerId"
            element={<CustomerProfile />}
          />
          <Route path="personalisation" element={<CustomerPersonalisation />} />{" "}
          <Route
            path="customeropportunities"
            element={<CustomerOpportunities />}
          />
          <Route path="/performance" element={<PerformanceTracking />} />
          <Route path="integration" element={<IntegrationPage />} />
          <Route path="kyc" element={<KYCPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="settings/:tab" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
