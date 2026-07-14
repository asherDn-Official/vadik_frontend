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
import CustomerImportNavbarProgress from "./CustomerImportNavbarProgress.jsx";
import { FiUser, FiUsers } from "react-icons/fi";
import { FiSearch } from "react-icons/fi";
import { useLocation } from "react-router-dom";
import { ChatNotificationProvider } from "../../context/ChatNotificationContext";
import GlobalChatNotification from "../GlobalChatNotification.jsx";
import { useNotification } from "../../context/NotificationContext.jsx";

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
  const { unreadCount } = useNotification();

  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const [profileData, setProfileData] = useState({
    fullName: "",
    profilePicture: "",
  });
  const [profileCompletion, setProfileCompletion] = useState(100);

  async function getProfileData() {
    try {
      const response = await api.get("/api/retailer/profile");

      if (response.data.status === "success") {
        const retailerData = response.data.data;

        setProfileData({
          fullName: retailerData.fullName || "",
          profilePicture: retailerData.storeImage || "",
        });

        const requiredFields = [
          retailerData.fullName,
          retailerData.email,
          retailerData.phone,
          retailerData.storeName,
          retailerData.storeType,
          retailerData.storeAddress,
          retailerData.storeOwnerName,
          retailerData.storeContactNumber,
          retailerData.storeCity,
          retailerData.storePincode,
          retailerData.GSTNumber,
          retailerData.storeImage,
        ];

        const completedFields =
          requiredFields.filter(
            field =>
              field !== null &&
              field !== undefined &&
              field !== ""
          ).length;

        const percentage = Math.round(
          (completedFields / requiredFields.length) * 100
        );

        setProfileCompletion(
          percentage
        );

        console.log(
          "PROFILE COMPLETION:",
          percentage
        );

      }
    } catch (error) {
      console.log("Profile fetch error:", error);
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
          <ChatNotificationProvider>
      <div className="flex min-h-screen overflow-x-clip bg-[#F4F5F9]">
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
        <main className="flex min-w-0 flex-1 flex-col overflow-visible bg-[#F4F5F9] pb-[88px] md:pb-0">
          <div className="bg-white px-3 py-3 shadow-sm sm:px-4 lg:px-5 xl:px-6">
            <header
              className="
                mx-auto grid max-w-[1680px] grid-cols-1 gap-3
                px-0 py-1
                md:grid-cols-[minmax(120px,1fr)_minmax(300px,640px)_minmax(180px,1fr)]
                md:items-center
                md:gap-4
                lg:grid-cols-[minmax(160px,1fr)_minmax(360px,680px)_minmax(220px,1fr)]
                xl:gap-5
                2xl:grid-cols-[minmax(220px,1fr)_minmax(420px,760px)_minmax(260px,1fr)]
                2xl:gap-6
              "
            >
              <div className="hidden md:block" aria-hidden="true" />

              {/* CENTER SEARCH */}
              <div className="order-2 w-full min-w-0 md:order-1 md:col-start-2 md:justify-self-center">
                <div
                  className="
                    mx-auto flex h-12 w-full max-w-[620px] items-center
                    rounded-full border border-[#E7EBF5]
                    bg-white
                    px-4 sm:px-5
                    md:h-[54px]
                    shadow-[0_2px_10px_rgba(15,23,42,0.05)]
                    transition-all duration-200
                    hover:shadow-[0_4px_14px_rgba(15,23,42,0.08)]
                    focus-within:border-[#DADFED]
                    focus-within:shadow-[0_6px_18px_rgba(15,23,42,0.10)]
                    md:max-w-none
                  "
                >
                  <FiSearch className="mr-3 h-4 w-4 shrink-0 text-[#7E85A8]" />

                  <input
                    type="text"
                    placeholder="Search customer..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleSearchSubmit}
                    className="
                      h-full w-full bg-transparent
                      text-[15px] text-[#313166]
                      outline-none
                      placeholder:font-normal
                      placeholder:text-[#9AA3C7]
                    "
                  />
                </div>
              </div>

              {/* RIGHT */}
              <div className="order-1 flex min-w-0 items-center justify-end gap-2 md:order-1 md:col-start-3 md:justify-self-end lg:gap-3">
                
                <CustomerImportNavbarProgress />

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
        layer-dropdown
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
                      flex min-w-0 cursor-pointer items-center gap-2
                      rounded-full border border-[#E7EBF5] bg-white
                      py-1.5 pl-1.5 pr-2
                      transition-all
                      hover:bg-[#F8F9FD]
                      hover:shadow-sm
                    "
                    onClick={() => setShowDropdown((prev) => !prev)}
                  >
                    <div className="relative">

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

                      {profileCompletion < 100 && (
                        <span
                          className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"
                        />
                      )}

                    </div>

                    <div className="hidden min-w-0 pr-1 xl:block xl:max-w-[148px]">
                      <p className="truncate text-sm font-medium text-[#313166]">
                        {profileName}
                      </p>

                      <p className="truncate text-xs text-gray-500">Admin</p>
                    </div>
                  </div>

                  {showDropdown && (
                    <div className="layer-dropdown absolute right-0 mt-3 w-72 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
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
          <div className="flex min-h-0 w-full flex-1 flex-col">
            <Outlet />
          </div>
        </main>
      </div>
      <GlobalChatNotification />
      </ChatNotificationProvider>
    </SecurityPopupProvider>
  );
}

export default Layout;
