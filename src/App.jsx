import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import {
  requestPermission,
  listenNotifications,
} from "./notification";
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
import CustomerRhythm from "./pages/CustomerRhythm";
import CampaignAnalytics from "./pages/CampaignAnalytics";
import CustomerOpportunities from "./pages/CustomerOpportunities";
import { useAuth } from "./context/AuthContext";
import { CustomerImportProvider } from "./context/CustomerImportContext";
import CustomerAdd from "./pages/CustomerAdd";
import QRGenerator from "./pages/QRGenerator";
import DialogueFlow from "./pages/DialogueFlow";
import Notification from "./pages/Notification";
import ForgotPassword from "./pages/ForgotPassword";
import Subscription from "./pages/Subscription";
import CustomerFieldPreferences from "./components/settings/CustomerFieldPreferences";
import RolesAndPermissions from "./components/settings/RolesAndPermissions";
import MyProfile from "./components/settings/MyProfile";
import SearchPage from "./components/common/SearchPage";
import CustomerProfilePage from "./components/common/CustomerProfilePage";
import Loader from "./utils/Loader";
import GlobalChatNotification from "./components/GlobalChatNotification";
// import api from "./api/apiconfig";
// import { useChatNotification } from "./context/ChatNotificationContext";


function App() {
  // console.log("APP COMPONENT RUNNING");
  
  const { auth, loading } = useAuth();
  // const { totalUnread } = useChatNotification();

  // const [totalUnread, setTotalUnread] = useState(0);
  
//   const fetchUnreadCount = async () => {
//   try {
//     const retailerId = localStorage.getItem("retailerId");

//     if (!retailerId) return;

//     const res = await api.get(
//       `/api/customers/all?retailerId=${retailerId}&limit=200&fields=chat&chatOnly=true&skipCount=true`
//     );

//     if (res.data?.status === "success") {
//       setTotalUnread(res.data.totalUnread || 0);
//     }
//   } catch (err) {
//     console.error(err);
//      setTotalUnread(0);
//   }
// };

// useEffect(() => {
//   if (!auth) return;

//   fetchUnreadCount();

//   const interval = setInterval(fetchUnreadCount, 5000);

//   return () => clearInterval(interval);
// }, [auth]);
  
// console.log("AUTH:", auth);
 useEffect(() => {

  // console.log(
  //   "NOTIFICATION EFFECT RUNNING"
  // );

  // console.log(
  //   "AUTH ID:",
  //   auth?.user?._id
  // );

  if (auth?.user?._id) {

    // console.log(
    //   "CALLING requestPermission"
    // );

    requestPermission(
      auth.user._id
    );

    listenNotifications();

  }

}, [auth]);
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

  const onboardingDone =
    auth?.data?.onboardingCompleted === true || auth?.data?.onboarding === true;

  if (loading) {
    return <Loader fullHeight={true} text="Initializing application..." />;
  }


  return (
    <Router>
      <CustomerImportProvider>
        <Routes>
          {/* Public */}
          <Route index element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/register/*"
            element={
              <Register formData={formData} updateFormData={updateFormData} />
            }
          />
          <Route path="completion" element={<Completion />} />

          {auth ? (
            <Route path="/" element={<Layout />}>
              <Route
                path="dashboard"
                element={
                  onboardingDone ? (
                    <Dashboard />
                  ) : (
                    <Navigate to="/register" replace />
                  )
                }
              />
              <Route
                path="customers"
                element={
                  onboardingDone ? (
                    <CustomerList />
                  ) : (
                    <Navigate to="/register" replace />
                  )
                }
              />
              <Route
                path="customers/add"
                element={
                  onboardingDone ? (
                    <CustomerAdd />
                  ) : (
                    <Navigate to="/register" replace />
                  )
                }
              />
              <Route
                path="customers/customer-profile/:customerId"
                element={
                  onboardingDone ? (
                    <CustomerProfile />
                  ) : (
                    <Navigate to="/register" replace />
                  )
                }
              />
              <Route
                path="personalisation"
                element={
                  onboardingDone ? (
                    <CustomerPersonalisation />
                  ) : (
                    <Navigate to="/register" replace />
                  )
                }
              />
              <Route
  path="customerrhythm"
  element={
    onboardingDone && auth?.data?.isUsingOwnWhatsapp ? (
      <CustomerRhythm />
    ) : (
      <Navigate to="/dashboard" replace />
    )
  }
/>
              <Route
                path="customerrhythm/campaign/:campaignId"
                element={
                  onboardingDone && auth?.data?.isUsingOwnWhatsapp ? (
                    <CampaignAnalytics />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )
                }
              />
              <Route
                path="customeropportunities"
                element={
                  onboardingDone ? (
                    <CustomerOpportunities />
                  ) : (
                    <Navigate to="/register" replace />
                  )
                }
              />
              <Route
                path="performance"
                element={
                  onboardingDone ? (
                    <PerformanceTracking />
                  ) : (
                    <Navigate to="/register" replace />
                  )
                }
              />
              <Route
                path="integration"
                element={
                  onboardingDone ? (
                    <IntegrationPage />
                  ) : (
                    <Navigate to="/register" replace />
                  )
                }
              />
              <Route
                path="quicksearch"
                element={
                  onboardingDone ? (
                    <KYCPage />
                  ) : (
                    <Navigate to="/register" replace />
                  )
                }
              />
              <Route
                path="settings"
                element={
                  onboardingDone ? (
                    <SettingsPage />
                  ) : (
                    <Navigate to="/register" replace />
                  )
                }
              />
              <Route
                path="settings/:tab"
                element={
                  onboardingDone ? (
                    <SettingsPage />
                  ) : (
                    <Navigate to="/register" replace />
                  )
                }
              />
              <Route
                path="customer-preferences"
                element={
                  onboardingDone ? (
                    <div className="p-6 bg-white rounded-xl">
                      <CustomerFieldPreferences />
                    </div>
                  ) : (
                    <Navigate to="/register" replace />
                  )
                }
              />
              <Route
                path="my-profile"
                element={
                  onboardingDone ? (
                    <div className="p-6 bg-white rounded-xl">
                      <MyProfile />
                    </div>
                  ) : (
                    <Navigate to="/register" replace />
                  )
                }
              />
              <Route
                path="roles-permissions"
                element={
                  onboardingDone ? (
                    <div className="p-6 bg-white rounded-xl">
                      <RolesAndPermissions />
                    </div>
                  ) : (
                    <Navigate to="/register" replace />
                  )
                }
              />
              <Route
                path="search"
                element={
                  onboardingDone ? (
                    <SearchPage />
                  ) : (
                    <Navigate to="/register" replace />
                  )
                }
              />
              <Route
                path="customer/:customerId"
                element={
                  onboardingDone ? (
                    <CustomerProfilePage />
                  ) : (
                    <Navigate to="/register" replace />
                  )
                }
              />
              <Route
                path="subscription"
                element={
                  onboardingDone ? (
                    <Subscription />
                  ) : (
                    <Navigate to="/register" replace />
                  )
                }
              />
              <Route
                path="notifications"
                element={
                  onboardingDone ? (
                    <Notification />
                  ) : (
                    <Navigate to="/register" replace />
                  )
                }
              />
              <Route
                path="qr-generator"
                element={
                  onboardingDone ? (
                    <QRGenerator />
                  ) : (
                    <Navigate to="/register" replace />
                  )
                }
              />
              <Route
                path="flowbuilder"
                element={
                  onboardingDone ? (
                    <DialogueFlow />
                  ) : (
                    <Navigate to="/register" replace />
                  )
                }
              />
            </Route>
          ) : (
            <Route path="*" element={<Navigate to="/" replace />} />
          )}
        </Routes>
       {/* <GlobalChatNotification unreadCount={totalUnread} /> */}
       {/* <GlobalChatNotification /> */}
      </CustomerImportProvider>
    </Router>
  );
}

export default App;
