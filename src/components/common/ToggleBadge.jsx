import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../api/apiconfig";
import { useSecurityPopup } from "../../context/SecurityPopupContext";

export default function ToggleBadge() {
  const { auth } = useAuth();
  // console.log("is Demo",auth?.user?.email); 
  const navigate = useNavigate();
  const [isLive, setIsLive] = useState(true);
  const [pendingMode, setPendingMode] = useState(null);
  const { openPopup, isPopupLoading } = useSecurityPopup();
  const [email] = useState(() => localStorage.getItem("email"));

  async function getDemoStatus() {
    try {
      const response = await api.get(`/api/retailer/demo/status/${email}`);
      setIsLive(!response?.data?.data?.demo);
    } catch (error) {
      console.log('error', error)
    }
  }

  useEffect(() => {
    getDemoStatus();
  }, []);

  const updateDemoStatus = async (demoStatus) => {
    try {
      const response = await api.patch(`/api/retailer/demo/status/${email}`, {
        demo: demoStatus
      });

      if (response.data.status === "success") {
        setIsLive(!demoStatus);
        localStorage.removeItem("retailerId");
        localStorage.removeItem("token");
        localStorage.removeItem("place_id");
        navigate("/");
      }
    } catch (error) {
      console.error("Error updating demo status:", error);
      setIsLive(!demoStatus);
      throw error;
    } finally {
      setPendingMode(null);
    }
  };

  const handleToggle = (newIsLive) => {
    setPendingMode(newIsLive);

    openPopup({
      targetMode: newIsLive ? "LIVE" : "DEMO",
      onConfirm: () => updateDemoStatus(!newIsLive),
      onCancel: () => setPendingMode(null),
    });
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
            disabled={isPopupLoading}
            className={`
              relative z-10 px-4 py-1.5 rounded-full font-medium text-xs
              transition-all duration-300 ease-in-out min-w-16
              ${isLive
                ? "text-green-600"
                : "text-gray-600 hover:text-green-500"
              }
              ${isPopupLoading ? "opacity-50 cursor-not-allowed" : ""}
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
            disabled={isPopupLoading}
            className={`
              relative z-10 px-4 py-1.5 rounded-full font-medium text-xs
              transition-all duration-300 ease-in-out min-w-16
              ${!isLive
                ? "text-red-600"
                : "text-gray-600 hover:text-red-500"
              }
              ${isPopupLoading ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <span className="flex items-center justify-center space-x-1">
              <div className={`w-1.5 h-1.5 rounded-full ${!isLive ? 'bg-red-500' : 'bg-gray-400'}`}></div>
              <span>DEMO</span>
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}