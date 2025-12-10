import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { SecurityPopupProvider } from "../../context/SecurityPopupContext";
import { useState, useEffect } from "react";
import { sampleTours } from "../../data/data.js";
import TourModal from "./TourModal";
import api from "../../api/apiconfig.js";
import { Subscript } from "lucide-react";
import SubscriptionPopup from "../settings/subscription/SubscriptionPopup.jsx";
import { usePlan } from "../../context/PlanContext.jsx";

function Layout() {
  const [activeTour, setActiveTour] = useState(null);
  const [currentTour, setCurrentTour] = useState(null);
  const [isDemo, setDemo] = useState(null);
  const [email] = useState(() => localStorage.getItem("email"));
  const [isTourComplete, setIsTourComplete] = useState(null);
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(true);
  const { currentPlans, refreshPlans,loading } = usePlan();



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

  useEffect(() => {
    getDemoStatus();
    getTourStatus();
    refreshPlans();
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
        {currentTour && isDemo && !isTourComplete && (
          <TourModal
            tour={currentTour}
            isOpen={!!activeTour}
            onClose={handleTourClose}
            onConfirmation={handleConfirmation}
          />
        )}

        {!isDemo && currentPlans === null && showSubscriptionPopup && !loading && (
          <SubscriptionPopup
            onClose={() => setShowSubscriptionPopup(false)}
            showAutopay={false}
            showSubscription={true}
            showAddon={true}
          />
        )}

        <Sidebar onOpenTour={setActiveTour} />
        <main className="flex-1 bg-[#F4F5F9]">
          <Outlet />
        </main>
      </div>
    </SecurityPopupProvider>
  );
}

export default Layout;
