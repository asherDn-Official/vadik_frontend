import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiPackage,
  FiFileText,
  FiUsers,
  FiSettings, 
} from "react-icons/fi";
import { LayoutTemplate } from 'lucide-react';


import { FaCoins } from "react-icons/fa";

import { LuTicketPercent } from "react-icons/lu";
import MyProfile from "../components/settings/MyProfile";
import Inventory from "../components/settings/Inventory";
import DailyBillingUpdate from "../components/settings/DailyBillingUpdate";
import CustomerFieldPreferences from "../components/settings/CustomerFieldPreferences";
import RolesAndPermissions from "../components/settings/RolesAndPermissions";
import AddProduct from "../components/settings/AddProduct";
import Coupon from "../components/settings/Coupon";
import LoyaltyPoint from "../components/settings/LoyaltyPoint";
import Template from "../components/settings/Template";

const SettingsPage = () => {
  const { tab } = useParams();
  const navigate = useNavigate();
  const [showAddProduct, setShowAddProduct] = useState(false);

  const activeTab = tab || "my-profile";

  const handleTabChange = (tabName) => {
    navigate(`/settings/${tabName}`);
    setShowAddProduct(false);
  };

  const handleAddProduct = () => {
    setShowAddProduct(true);
  };

  return (
    <div className="flex h-full p-2 ">
      {/* Settings Sidebar */}
      <div className="w-64 border-r border-gray-200 bg-white rounded-tl-[20px] rounded-bl-[20px]">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-medium text-[#313166]">Settings</h1>
        </div>
        <div className="py-4">
          <SettingsTab
            icon={<FiUser />}
            text="My Profile"
            isActive={activeTab === "my-profile"}
            onClick={() => handleTabChange("my-profile")}
          />
          {/* <SettingsTab
            icon={<FiPackage />}
            text="Inventory"
            isActive={activeTab === "inventory"}
            onClick={() => handleTabChange("inventory")}
          /> */}
          {/* <SettingsTab
            icon={<FiFileText />}
            text="Daily Billing Update"
            isActive={activeTab === "daily-billing"}
            onClick={() => handleTabChange("daily-billing")}
          /> */}
          <SettingsTab
            icon={<FiUsers />}
            text="Customer Field Preferences"
            isActive={activeTab === "customer-preferences"}
            onClick={() => handleTabChange("customer-preferences")}
          />
          <SettingsTab
            icon={<FiSettings />}
            text="Roles And Permissions"
            isActive={activeTab === "roles-permissions"}
            onClick={() => handleTabChange("roles-permissions")}
          />
          <SettingsTab
            icon={<LuTicketPercent />}
            text="Coupons"
            isActive={activeTab === "coupon"}
            onClick={() => handleTabChange("coupon")}
          />
          <SettingsTab
            icon={<FaCoins />}
            text="Loyalty Points"
            isActive={activeTab === "loyalty"}
            onClick={() => handleTabChange("loyalty")}
          />
          <SettingsTab
            icon={<LayoutTemplate />}
            text="template"
            isActive={activeTab === "template"}
            onClick={() => handleTabChange("template")}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 bg-light-bg overflow-auto bg-white rounded-tr-[20px] rounded-br-[20px]">
        {activeTab === "my-profile" && <MyProfile />}
        {activeTab === "inventory" && !showAddProduct && (
          <Inventory onAddProduct={handleAddProduct} />
        )}
        {activeTab === "inventory" && showAddProduct && (
          <AddProduct onBack={() => setShowAddProduct(false)} />
        )}
        {activeTab === "daily-billing" && <DailyBillingUpdate />}
        {activeTab === "customer-preferences" && <CustomerFieldPreferences />}
        {activeTab === "roles-permissions" && <RolesAndPermissions />}
        {activeTab === "coupon" && <Coupon />}
        {activeTab === "loyalty" && <LoyaltyPoint />}
        {activeTab === "template" && <Template />}
      </div>
    </div>
  );
};

const SettingsTab = ({ icon, text, isActive, onClick }) => {
  return (
    <div
      className={`flex items-center px-6 py-3 cursor-pointer hover:bg-gray-100 transition-colors duration-200 ${isActive ? "bg-[#F5F5F7]" : ""
        }`}
      onClick={onClick}
    >
      <span className={`mr-3 ${isActive ? "text-[#313166]" : "text-gray-600"}`}>
        {icon}
      </span>
      <span
        className={`${isActive ? "text-[#313166] font-medium" : "text-[#313166]"
          }`}
      >
        {text}
      </span>
    </div>
  );
};

export default SettingsPage;
