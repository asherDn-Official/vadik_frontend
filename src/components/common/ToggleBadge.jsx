import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../api/apiconfig";
import SecurityPopup from "./SecurityPopup";

export default function ToggleBadge() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [isLive, setIsLive] = useState(!auth.user.demo);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingMode, setPendingMode] = useState(null);

  const handleToggle = (newIsLive) => {
    // Always show security popup for any mode change
    setPendingMode(newIsLive);
    setShowPopup(true);
  };

  const updateDemoStatus = async (demoStatus) => {
    setIsLoading(true);
    try {
      const response = await api.patch("/api/retailer/demo/status", {
        demo: demoStatus
      });

      if (response.data.status === "success") {
        setIsLive(!demoStatus);
        // If switching to live mode, log user out
        // logout();
        localStorage.removeItem("retailerId");
        localStorage.removeItem("token");
        localStorage.removeItem("place_id");
        navigate("/");
      }


    } catch (error) {
      console.error("Error updating demo status:", error);
      // Revert UI state on error
      setIsLive(!demoStatus);
    } finally {
      setIsLoading(false);
      setShowPopup(false);
      setPendingMode(null);
    }
  };

  const handleConfirm = () => {
    // Update mode based on pending selection
    updateDemoStatus(!pendingMode);
  };

  const handleCancel = () => {
    // Simply close the popup without changing anything
    // The toggle will remain in its previous state
    setShowPopup(false);
    setPendingMode(null);
  };

  return (
    <div className="flex items-center justify-center">
      <div className="">
        <div className="relative inline-flex bg-gray-200 rounded-full shadow-inner">
          {/* Background indicator */}
          <div
            className={`
              absolute top-0.5 bottom-0.5 w-1/2 bg-white rounded-full shadow-md
              transition-transform duration-300 ease-in-out
              ${isLive ? 'transform translate-x-0' : 'transform translate-x-full'}
            `}
          />

          {/* Live Button */}
          <button
            onClick={() => handleToggle(true)}
            disabled={isLoading}
            className={`
              relative z-10 px-4 py-1.5 rounded-full font-medium text-xs
              transition-all duration-300 ease-in-out min-w-16
              ${isLive
                ? "text-green-600"
                : "text-gray-600 hover:text-green-500"
              }
              ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <span className="flex items-center justify-center space-x-1">
              <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span>LIVE</span>
            </span>
          </button>

          {/* Demo Button */}
          <button
            onClick={() => handleToggle(false)}
            disabled={isLoading}
            className={`
              relative z-10 px-4 py-1.5 rounded-full font-medium text-xs
              transition-all duration-300 ease-in-out min-w-16
              ${!isLive
                ? "text-red-600"
                : "text-gray-600 hover:text-red-500"
              }
              ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <span className="flex items-center justify-center space-x-1">
              <div className={`w-1.5 h-1.5 rounded-full ${!isLive ? 'bg-red-500' : 'bg-gray-400'}`}></div>
              <span>DEMO</span>
            </span>
          </button>
        </div>

        {/* Security Popup */}
        {showPopup && (
          <SecurityPopup
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            isLoading={isLoading}
            targetMode={pendingMode ? "LIVE" : "DEMO"}
          />
        )}
      </div>
    </div>
  );
}