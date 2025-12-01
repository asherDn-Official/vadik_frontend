import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { SecurityPopupProvider } from "../../context/SecurityPopupContext";
import { useState, useEffect } from "react";
import { sampleTours } from "../../data/data.js";
import TourModal from "./TourModal";
import api from "../../api/apiconfig.js";
import { Subscript } from "lucide-react";
import SubscriptionPopup from "../settings/subscription/SubscriptionPopup.jsx";

function Layout() {
  const [activeTour, setActiveTour] = useState(null);
  const [currentTour, setCurrentTour] = useState(null);
  const [isDemo, setDemo] = useState(null);
  const [email] = useState(() => localStorage.getItem("email"));
  const [isTourComplete, setIsTourComplete] = useState(null);
  const [currentPlans, setCurrentPlans] = useState("");
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(true);

  console.log(currentPlans);

  useEffect(() => {
    // Tour opens by default on mount with quick-start
    setActiveTour("quick-start");
  }, []);

  useEffect(() => {
    if (activeTour) {
      const tour = sampleTours.find((t) => t.id === activeTour);
      setCurrentTour(tour);
    } else {
      setCurrentTour(null);
    }
  }, [activeTour]);

  async function getDemoStatus() {
    try {
      const response = await api.get(`/api/retailer/demo/status/${email}`);
      setDemo(response?.data?.data?.demo);
    } catch (error) {
      console.log("error", error);
    }
  }

  async function getTourStatus() {
    try {
      const res = await api.get("/api/auth/tour/status");
      setIsTourComplete(res.data.isTourCompleted);
    } catch (error) {
      console.log("error", error);
    }
  }

  const isCurrentPlansAvailable = async () => {
    try {
      const response = await api.get("/api/subscriptions/credit/usage");
      setCurrentPlans(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setCurrentPlans(null);
      }
    }
  };

  useEffect(() => {
    getDemoStatus();
    getTourStatus();
    isCurrentPlansAvailable();
  }, []);

  const handleTourClose = () => {
    setActiveTour(null);
    setCurrentTour(null);
  };

  const handleConfirmation = (nextTourId) => {
    setActiveTour(nextTourId);
  };

  return (
    <SecurityPopupProvider>
      <div className="flex min-h-screen">
        {currentTour && isDemo && !isTourComplete &&  (
          <TourModal
            tour={currentTour}
            isOpen={!!activeTour}
            onClose={handleTourClose}
            onConfirmation={handleConfirmation}
          />
        )}
        
        {/* {!isDemo && currentPlans === null && showSubscriptionPopup && (
           <SubscriptionPopup onClose={() => setShowSubscriptionPopup(false)}/>
        )} */}

        <Sidebar onOpenTour={setActiveTour} />
        <main className="flex-1 bg-[#F4F5F9]">
          <Outlet />
        </main>
      </div>
    </SecurityPopupProvider>
  );
}

export default Layout;
