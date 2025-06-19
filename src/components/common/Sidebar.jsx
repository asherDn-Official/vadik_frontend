import { NavLink, useLocation } from "react-router-dom";
import {
  FaHome,
  FaUser,
  FaChartPie,
  FaCog,
  FaShieldAlt,
  FaLightbulb,
  FaCogs,
  FaUsersCog,
} from "react-icons/fa";

function Sidebar() {
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <aside className="w-[310px] bg-[#313166] text-white flex flex-col">
      <div className="p-6 font-[400] text-[18px] text-center">
        Vaadikkayalar Ai
      </div>

      <nav className="flex-1 py-4">
        <NavLink
          to="/dashboard"
          className={`sidebar-icon ${isActive("/") ? "sidebar-active" : ""}`}
        >
          {/* <FaHome size={20} /> */}
          <img src="../assets/mage_dashboard-icon.png" alt="" />
          <span>Admin Dashboard</span>
        </NavLink>

        <NavLink
          to="/customers"
          className={`sidebar-icon ${
            isActive("/customers") ? "sidebar-active" : ""
          }`}
        >
          {/* <FaUser size={20} /> */}
          <img src="../assets/bi_person-fill-icon.png" alt="" />
          <span>Customer Profile</span>
        </NavLink>

        <NavLink
          to="/customeropportunities"
          className={`sidebar-icon ${
            isActive("/customeropportunities") ? "sidebar-active" : ""
          }`}
        >
          {/* <FaLightbulb size={20} /> */}
          <img src="../assets/fluent-insights.png" alt="" />
          <span>Personalisation Insight</span>
        </NavLink>

        <NavLink
          to="/personalization"
          className={`sidebar-icon ${
            isActive("/personalization") ? "sidebar-active" : ""
          }`}
        >
          {/* <FaUsersCog size={20} /> */}
          <img src="../assets/user-check-icon.png" alt="" />
          <span>Customer Opportunities</span>
        </NavLink>

        <NavLink
          to="/performance"
          className={`sidebar-icon ${
            isActive("/performance") ? "sidebar-active" : ""
          }`}
        >
          {/* <FaChartPie size={20} /> */}
          <img src="../assets/mdi_performance-icon.png" alt="" />
          <span>Performance Tracking</span>
        </NavLink>

        <NavLink
          to="/integration"
          className={`sidebar-icon ${
            isActive("/integration") ? "sidebar-active" : ""
          }`}
        >
          {/* <FaCogs size={20} /> */}
          <img src="../assets/integration-icon.png" alt="" />
          <span>Integration Management</span>
        </NavLink>

        <NavLink
          to="/kyc"
          className={`sidebar-icon ${isActive("/kyc") ? "sidebar-active" : ""}`}
        >
          {/* <FaShieldAlt size={20} /> */}
          <img src="../assets/kyc-icon.png" alt="" />
          <span>KYC</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={`sidebar-icon ${
            isActive("/settings") ? "sidebar-active" : ""
          }`}
        >
          {/* <FaCog size={20} /> */}
          <img src="../assets/settings-icon.png" alt="" />
          <span>Settings</span>
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;
