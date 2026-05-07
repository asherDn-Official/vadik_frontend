import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogOut } from "lucide-react";
import LogoutConfirmModal from "./LogoutConfirmModal";
import UnsavedChangesModal from "./UnsavedChangesModal";
import { useUnsavedChanges } from "../../context/UnsavedChangesContext";
import dashboardIcon from "/assets/mage_dashboard-icon.png";
import customersIcon from "/assets/bi_person-fill-icon.png";
import personalisationIcon from "/assets/fluent-insights.png";
import customerOpportunitiesIcon from "/assets/user-check-icon.png";
import integrationIcon from "/assets/integration-icon.png";
import rhytmIcon from "/assets/ix_customer.png";
import subscriptionIcon from "/assets/crown-icon.png";

function Sidebar() {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingPath, setPendingPath] = useState(null);
  const { hasUnsavedChanges, setHasUnsavedChanges } = useUnsavedChanges();
  const location = useLocation();
  const { auth, setAuth } = useAuth();
  const userRole = auth?.data?.role;
  const isUsingOwnWhatsapp = auth?.data?.isUsingOwnWhatsapp;
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Check if user has read permission for a module or is retailer
  const canAccess = (moduleName) => {
    // Special check for Customer Rhythm
    if (moduleName === "Customer Rhythm" && !isUsingOwnWhatsapp) {
      return false;
    }

    // Retailers get full access
    if (userRole === "retailer") return true;

    // Staff permissions check
    if (userRole === "staff" && auth?.user?.permissions) {
      const modulePermission = auth.user.permissions.find(
        (perm) => perm.module === moduleName,
      );
      return modulePermission?.canRead || false;
    }

    return false;
  };

  // Define all possible sidebar items
  const sidebarItems = [
    {
      path: "/dashboard",
      module: "Dashboard",
      icon: dashboardIcon,
      label: "Dashboard",
    },
    {
      path: "/customers",
      module: "Customer Profile",
      icon: customersIcon,
      label: "Customer Profile",
    },
    {
      path: "/personalisation",
      module: "Customer Insight",
      icon: personalisationIcon,
      label: "Customer Insight",
    },
    {
      path: "/customeropportunities",
      module: "Customer Activity",
      icon: customerOpportunitiesIcon,
      label: "Customer Activity",
    },
    // {
    //   path: "/performance",
    //   module: "Performance Tracking",
    //   icon: performanceIcon,
    //   label: "Performance Tracking",
    // },
    {
      path: "/integration",
      module: "Integration Management",
      icon: integrationIcon,
      label: "Integration Management",
    },
    // {
    //   path: "/quicksearch",
    //   module: "Quick Search",
    //   icon: kycIcon,
    //   label: "Quick Search",
    // },
    {
      path: "/customerrhythm",
      module: "Customer Rhythm",
      icon: rhytmIcon,
      label: "Customer Rhythm",
    },
    {
      path: "/subscription",
      module: "Settings",
      icon: subscriptionIcon,
      label: "Subscription",
    },
    // {
    //   path: "/settings",
    //   module: "Settings",
    //   icon: settingsIcon,
    //   label: "Settings",
    // },
  ];

  const handleLogout = (e) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      setPendingPath("logout");
      setShowUnsavedModal(true);
      return;
    }
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("retailerId");
    localStorage.removeItem("token");
    localStorage.removeItem("formData");
    setAuth(null);
    navigate("/", { replace: true });
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const handleNavigation = (e, path) => {
    if (isActive(path)) return;

    if (hasUnsavedChanges) {
      e.preventDefault();
      setPendingPath(path);
      setShowUnsavedModal(true);
    }
  };

  const confirmNavigation = () => {
    setHasUnsavedChanges(false);
    setShowUnsavedModal(false);
    if (pendingPath === "logout") {
      setShowLogoutConfirm(true);
      setPendingPath(null);
    } else if (pendingPath) {
      navigate(pendingPath);
    }
  };

  return (
    <>
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />

      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onConfirm={confirmNavigation}
        onCancel={() => setShowUnsavedModal(false)}
      />

      <aside className="fixed inset-x-0 bottom-0 z-40 flex h-[74px] w-full flex-col border-t border-white/10 bg-[#313166]/95 text-white shadow-[0_-10px_30px_rgba(49,49,102,0.18)] backdrop-blur md:sticky md:left-0 md:top-0 md:h-screen md:w-64 md:shrink-0 md:border-r md:border-t-0 md:border-white/10 md:bg-[#313166] md:shadow-none">
        <div className="hidden px-5 pb-4 pt-5 md:block">
          <div className="flex items-center justify-center rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
            <img className="w-36" src="/vadik_ai_log_.png" alt="Vadik Logo" />
          </div>
        </div>
        {/* <div className="my-3">{userRole === "retailer" && <ToggleBadge />}</div> */}
        <nav className="flex h-full items-center gap-1 overflow-x-auto px-2 py-2 md:h-auto md:flex-1 md:flex-col md:items-stretch md:gap-1.5 md:overflow-y-auto md:overflow-x-hidden md:px-4 md:pb-4 md:pt-1">
          {sidebarItems.map((item) => {
            if (!canAccess(item.module)) return null;
            const active = isActive(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={(e) => handleNavigation(e, item.path)}
                className={`group relative flex h-full min-w-[76px] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-1.5 text-white/75 no-underline transition-all hover:bg-white/10 hover:text-white md:h-auto md:min-w-0 md:flex-row md:justify-start md:gap-3 md:px-4 md:py-[14px] ${
                  active
                    ? "bg-white/12 text-white backdrop-blur-md ring-1 ring-white/10"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span
                  className={`hidden h-10 w-[3px] rounded-full bg-gradient-to-b from-[#FF4D8D] to-[#EC396F] md:absolute md:left-0 md:block ${
                    active ? "opacity-100" : "opacity-0"
                  }`}
                />
                <img
                  src={item.icon}
                  alt={item.label}
                  className={`h-5 w-5 shrink-0 object-contain md:h-6 md:w-6 ${
                    active ? "" : "opacity-90 group-hover:opacity-100"
                  }`}
                />
                <span className="line-clamp-2 max-w-[68px] text-center text-[11px] font-medium leading-tight md:max-w-none md:text-left md:text-sm">
                  {item.label}
                </span>
              </NavLink>
            );
          })}

          <button
            onClick={(e) => handleLogout(e)}
            className="group flex h-full min-w-[76px] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-1.5 text-white/75 transition-all hover:bg-white/10 hover:text-white md:mt-auto md:h-auto md:min-w-0 md:flex-row md:justify-start md:gap-3 md:px-4 md:py-[14px]"
          >
            <LogOut size={16} className="h-5 w-5 shrink-0 md:h-6 md:w-6" />
            <span className="text-[11px] font-medium md:text-sm">Logout</span>
          </button>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
