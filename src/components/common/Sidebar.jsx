import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogOut } from "lucide-react";

function Sidebar() {
  const location = useLocation();
  const { auth } = useAuth();
  const userRole = auth?.data?.role;
  const navigate  = useNavigate();

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
      module: "dashboard",
      icon: "../assets/mage_dashboard-icon.png",
      label: "Retailer Dashboard",
    },
    {
      path: "/customers",
      module: "customers",
      icon: "../assets/bi_person-fill-icon.png",
      label: "Customer Profile",
    },
    {
      path: "/personalisation",
      module: "personalisation",
      icon: "../assets/fluent-insights.png",
      label: "Personalisation Insight",
    },
    {
      path: "/customeropportunities",
      module: "customerOpportunities",
      icon: "../assets/user-check-icon.png",
      label: "Customer Opportunities",
    },
    {
      path: "/performance",
      module: "performance",
      icon: "../assets/mdi_performance-icon.png",
      label: "Performance Tracking",
    },
    {
      path: "/integration",
      module: "integration",
      icon: "../assets/integration-icon.png",
      label: "Integration Management",
    },
    {
      path: "/kyc",
      module: "kyc",
      icon: "../assets/kyc-icon.png",
      label: "KYC",
    },
    {
      path: "/settings",
      module: "settings",
      icon: "../assets/settings-icon.png",
      label: "Settings",
    },
  ];

  // Handle logout functionality
  const handleLogout = () => {
    localStorage.removeItem("retailerId");
    localStorage.removeItem("token");
    navigate('/')
  };

  return (
    <aside className="w-[290px] bg-[#313166] text-white flex flex-col">
      <div className="p-6 font-[400] text-[18px] text-center">
        Vaadikkayalar Ai
      </div>

      <nav className="flex-1 py-4">
        {sidebarItems.map((item) => {
          if (!canAccess(item.module)) return null;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`sidebar-icon flex items-center px-6 py-5 text-white no-underline transition-colors hover:bg-[#3d3b83] ${isActive(item.path) ? "sidebar-active" : ""
                }`}
            >
              <img src={item.icon} alt={item.label} className="w-5 h-5 mr-3" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
        <button onClick={handleLogout} className=" flex flex-1 w-full items-center px-6 py-5 text-white no-underline transition-colors hover:bg-[#3d3b83]">
          <LogOut size={20} className="mr-3" />
          Logout
        </button>
      </nav>

    </aside>
  );
}

export default Sidebar;
