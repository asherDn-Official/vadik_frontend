import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogOut } from "lucide-react";
import ToggleBadge from "./ToggleBadge";
import dashboardIcon from "../../../public/assets/mage_dashboard-icon.png"
import customersIcon from "../../../public/assets/bi_person-fill-icon.png"
import personalisationIcon from "../../../public/assets/fluent-insights.png"
import customerOpportunitiesIcon from "../../../public/assets/user-check-icon.png"
import performanceIcon from "../../../public/assets/mdi_performance-icon.png"
import integrationIcon from "../../../public/assets/integration-icon.png"
import kycIcon from "../../../public/assets/kyc-icon.png"
import settingsIcon from "../../../public/assets/settings-icon.png"

function Sidebar() {
  const location = useLocation();
  const { auth } = useAuth();
  const userRole = auth?.data?.role;
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Check if user has read permission for a module or is retailer
  const canAccess = (moduleName) => {
    // Retailers get full access
    if (userRole === "retailer") return true;

    // Staff permissions check
    if (userRole === "staff" && auth?.user?.permissions) {
      const modulePermission = auth.user.permissions.find(
        (perm) => perm.module === moduleName
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
      module: "Personalisation Insight",
      icon: personalisationIcon,
      label: "Personalisation Insight",
    },
    {
      path: "/customeropportunities",
      module: "Customer Opportunities",
      icon: customerOpportunitiesIcon,
      label: "Customer Opportunities",
    },
    {
      path: "/performance",
      module: "Performance Tracking",
      icon: performanceIcon,
      label: "Performance Tracking",
    },
    {
      path: "/integration",
      module: "Integration Management",
      icon: integrationIcon,
      label: "Integration Management",
    },
    {
      path: "/kyc",
      module: "Quick Search",
      icon: kycIcon,
      label: "Quick Search",
    },
    {
      path: "/settings",
      module: "Settings",
      icon: settingsIcon,
      label: "Settings",
    },
  ];

  // Handle logout functionality
  const handleLogout = () => {
    localStorage.removeItem("retailerId");
    localStorage.removeItem("token");
    navigate('/');
  };

  return (
    <aside className="sticky left-0 top-0 h-screen w-full md:w-48 lg:w-64 xl:w-72 bg-[#313166] text-white flex flex-col overflow-y-auto">
      <div className="pt-4 font-medium text-base md:text-lg lg:text-xl text-center truncate">
        Vadik AI
      </div>
      <div className="my-3">
        {userRole === "retailer" && (
          <ToggleBadge />
        )}
      </div>
      <nav className="flex-1 pb-2 md:pb-4">
        {sidebarItems.map((item) => {
          if (!canAccess(item.module)) return null;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`sidebar-icon flex items-center px-4 md:px-6 py-3 md:py-4 text-white no-underline transition-colors hover:bg-[#3d3b83] ${isActive(item.path) ? "sidebar-active bg-[#3d3b83]" : ""
                }`}
            >
              <img
                src={item.icon}
                alt={item.label}
                className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 mr-2 md:mr-3 flex-shrink-0"
              />
              <span className="text-xs md:text-sm lg:text-base truncate">{item.label}</span>
            </NavLink>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex w-full items-center px-4 md:px-6 py-3 md:py-4 text-white no-underline transition-colors hover:bg-[#3d3b83] mt-auto"
        >
          <LogOut size={16} className="mr-2 md:mr-3 w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
          <span className="text-xs md:text-sm lg:text-base">Logout</span>
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;