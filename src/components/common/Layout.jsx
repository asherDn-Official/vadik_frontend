import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { SecurityPopupProvider } from "../../context/SecurityPopupContext";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { sampleTours } from "../../data/data.js";
import TourModal from "./TourModal";
import api from "../../api/apiconfig.js";
import SubscriptionPopup from "../settings/subscription/SubscriptionPopup.jsx";
import { usePlan } from "../../context/PlanContext.jsx";
import WhatsAppAlertPopup from "./WhatsAppAlertPopup.jsx";
import { FiUser, FiUsers } from "react-icons/fi";
import { FiSearch } from "react-icons/fi";
import { useLocation } from "react-router-dom";

function Layout() {
  const [activeTour, setActiveTour] = useState(null);
  const [currentTour, setCurrentTour] = useState(null);
  const [isDemo, setDemo] = useState(null);
  const [email] = useState(() => localStorage.getItem("email"));
  const [isTourComplete, setIsTourComplete] = useState(null);
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(true);
  const { currentPlans, refreshPlans, loading } = usePlan();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const [profileData, setProfileData] = useState({
    fullName: "",
    profilePicture: "",
  });

  async function getProfileData() {
    try {
      const response = await api.get("/api/retailer/profile");

      if (response.data.status === "success") {
        const retailerData = response.data.data;

        setProfileData({
          fullName: retailerData.fullName || "",
          profilePicture: retailerData.storeImage || "",
        });
      }
    } catch (error) {
      console.log("Profile fetch error:", error);
    }
  }


  async function getUnreadNotifications() {
    try {

      const response = await api.get(
        "/api/notifications/stats"
      );

      // console.log(
      //   "notification stats",
      //   response.data
      // );

      setUnreadCount(
        response.data?.overall?.unread || 0
      );

    } catch (error) {

      console.log(
        "Unread notification error:",
        error
      );

    }
  }

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && searchInput.trim()) {
      navigate(`/search?q=${searchInput}`, {
        state: { from: location.pathname },
      });
      setSearchInput("");
    }
  };
  useEffect(() => {
    if (!searchInput.trim()) return;

    const delay = setTimeout(() => {
      navigate(`/search?q=${searchInput}`, {
        state: { from: location.pathname },
      });
    }, 500); // delay (important)

    return () => clearTimeout(delay);
  }, [searchInput]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  function gotoNotification() {
    navigate("/notifications");
  }

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
    getProfileData();
    refreshPlans();
    getUnreadNotifications();
  }, []);

  const profileName = profileData?.fullName || "User";

  const profileInitial = profileName?.charAt(0)?.toUpperCase() || "U";

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
        <WhatsAppAlertPopup />
        {currentTour && isDemo && !isTourComplete && (
          <TourModal
            tour={currentTour}
            isOpen={!!activeTour}
            onClose={handleTourClose}
            onConfirmation={handleConfirmation}
          />
        )}

        {!isDemo &&
          currentPlans === null &&
          showSubscriptionPopup &&
          !loading && (
            <SubscriptionPopup
              onClose={() => setShowSubscriptionPopup(false)}
              showAutopay={true}
              showSubscription={true}
              showAddon={true}
            />
          )}

        <Sidebar onOpenTour={setActiveTour} />
        <main className="flex flex-1 flex-col overflow-hidden bg-[#F4F5F9] pb-20 md:pb-0">
          <div className="bg-white px-3 py-3 shadow-sm sm:px-4">
            <header
              className="
                grid grid-cols-1 gap-3
                px-1 py-1
                sm:px-4
                md:grid-cols-[minmax(180px,1fr)_minmax(280px,560px)_auto]
                md:items-center
                md:gap-5
                xl:grid-cols-[minmax(260px,1fr)_minmax(420px,700px)_minmax(220px,1fr)]
              "
            >
              {/* LEFT */}
              <div className="min-w-0 md:justify-self-start">
                <h1
                  className="
                    truncate
                    font-[Poppins]
                    text-[24px]
                    font-medium
                    leading-[114%]
                    text-[#313166]
                  "
                >
                  Welcome, {profileName}
                </h1>

                <p className="mt-1 hidden text-sm text-gray-500 lg:block">
                  Manage your customers and business insights
                </p>
              </div>

              {/* CENTER SEARCH */}
              <div className="w-full md:justify-self-center">
                <div
                  className="
                    flex h-11 w-full items-center
                    rounded-full border border-gray-100
                    bg-[#F7F8FC]
                    px-4 sm:px-5
                    md:h-12
                    shadow-sm
                    transition-all

                    focus-within:border-[#313166]/20
                    focus-within:bg-white
                    focus-within:shadow-md
                  "
                >
                  <FiSearch className="mr-3 h-4 w-4 shrink-0 text-gray-500" />

                  <input
                    type="text"
                    placeholder="Search customer..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleSearchSubmit}
                    className="
                      h-full w-full bg-transparent
                      text-sm text-[#313166]
                      outline-none
                      placeholder:text-gray-400
                    "
                  />
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex items-center justify-end gap-3 md:justify-self-end">
                {/* Notification */}
                <button
                  type="button"
                  aria-label="Notifications"
                  className="
    relative
    flex h-11 w-11 items-center justify-center
    rounded-full bg-[#F4F5F9]
    text-gray-600
    transition-all
    hover:bg-[#ECEEF8]
    hover:text-gray-800
  "
                  onClick={() => gotoNotification()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>

                  {unreadCount > 0 && (
                    <div
                      className="
        absolute
        -top-1
        -right-1
        z-50
        flex
        min-h-[20px]
        min-w-[20px]
        items-center
        justify-center
        rounded-full
        bg-red-500
        px-1
        text-[10px]
        font-bold
        leading-none
        text-white
      "
                    >
                      {unreadCount}
                    </div>
                  )}
                </button>

                {/* PROFILE */}
                <div className="relative" ref={dropdownRef}>
                  <div
                    className="
                      flex cursor-pointer items-center gap-3
                      rounded-full border border-gray-100 bg-[#F8F9FD]
                      py-1.5 pl-1.5 pr-2
                      transition-all
                      hover:bg-[#EEF1FA]
                      hover:shadow-sm
                    "
                    onClick={() => setShowDropdown((prev) => !prev)}
                  >
                    {profileData?.profilePicture ? (
                      <img
                        src={profileData.profilePicture}
                        alt={profileName}
                        className="h-10 w-10 rounded-full object-cover border border-white shadow-sm"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold uppercase text-white shadow-sm">
                        {profileInitial}
                      </div>
                    )}

                    <div className="hidden max-w-[140px] pr-1 sm:block">
                      <p className="truncate text-sm font-medium text-[#313166]">
                        {profileName}
                      </p>

                      <p className="truncate text-xs text-gray-500">Admin</p>
                    </div>
                  </div>

                  {showDropdown && (
                    <div className="absolute right-0 z-50 mt-3 w-72 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
                      <div className="flex items-center gap-3 border-b border-gray-100 bg-[#F8F9FD] p-4">
                        {profileData?.profilePicture ? (
                          <img
                            src={profileData.profilePicture}
                            alt={profileName}
                            className="h-12 w-12 rounded-full border border-white object-cover shadow-sm"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-base font-semibold uppercase text-white shadow-sm">
                            {profileInitial}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#313166]">
                            {profileName}
                          </p>
                          <p className="truncate text-xs text-gray-500">
                            {email || "Admin"}
                          </p>
                        </div>
                      </div>

                      <div className="p-2">
                        <button
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-100"
                          onClick={() => {
                            navigate("/my-profile");
                            setShowDropdown(false);
                          }}
                        >
                          <FiUser className="h-4 w-4 text-[#313166]" />
                          My Profile
                        </button>

                        <button
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-100"
                          onClick={() => {
                            navigate("/roles-permissions");
                            setShowDropdown(false);
                          }}
                        >
                          <FiUsers className="h-4 w-4 text-[#313166]" />
                          Roles & Permissions
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </header>
          </div>
          <div className="mx-auto flex min-h-0 w-full max-w-[1700px] flex-1 flex-col">
            <Outlet />
          </div>
        </main>
      </div>
    </SecurityPopupProvider>
  );
}

export default Layout;
