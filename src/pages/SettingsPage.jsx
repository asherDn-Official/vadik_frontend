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
import { BadgeIndianRupee } from 'lucide-react';



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
import SubscriptionPage from "../components/settings/subscription/SubscriptionPage";

import UnsavedChangesModal from "../components/common/UnsavedChangesModal";
import { useUnsavedChanges } from "../context/UnsavedChangesContext";

const SettingsPage = () => {
  const { tab } = useParams();
  const navigate = useNavigate();
  const [showAddProduct, setShowAddProduct] = useState(false);
  const { hasUnsavedChanges, setHasUnsavedChanges } = useUnsavedChanges();
  const [pendingTab, setPendingTab] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const activeTab = tab || "my-profile";

  const handleTabChange = (tabName) => {
    if (tabName === activeTab) return;
    
    if (hasUnsavedChanges) {
      setPendingTab(tabName);
      setShowModal(true);
      return;
    }
    
    proceedWithTabChange(tabName);
  };

  const proceedWithTabChange = (tabName) => {
    setHasUnsavedChanges(false);
    setShowModal(false);
    setPendingTab(null);
    navigate(`/settings/${tabName}`);
    setShowAddProduct(false);
  };

  const handleAddProduct = () => {
    setShowAddProduct(true);
  };

  return (
    <div className="flex flex-col md:flex-row h-full p-2 md:p-4 gap-4 bg-[#F4F5F9]">
      <UnsavedChangesModal 
        isOpen={showModal}
        onConfirm={() => proceedWithTabChange(pendingTab)}
        onCancel={() => {
          setShowModal(false);
          setPendingTab(null);
        }}
      />
      
      {/* Settings Sidebar */}
      <div className="w-full md:w-64 border-r border-gray-200 bg-white rounded-[20px] shadow-sm flex-shrink-0">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-medium text-[#313166]">Settings</h1>
        </div>
        <div className="py-2 md:py-4 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible no-scrollbar">
          <SettingsTab
            icon={<FiUser />}
            text="My Profile"
            isActive={activeTab === "my-profile"}
            onClick={() => handleTabChange("my-profile")}
          />
          <SettingsTab
            icon={<FiUsers />}
            text="Customer Preferences"
            isActive={activeTab === "customer-preferences"}
            onClick={() => handleTabChange("customer-preferences")}
          />
          <SettingsTab
            icon={<FiSettings />}
            text="Roles & Permissions"
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
            text="Template"
            isActive={activeTab === "template"}
            onClick={() => handleTabChange("template")}
          />
          <SettingsTab
            icon={<BadgeIndianRupee  />}
            text="Subscription"
            isActive={activeTab === "subscription"}
            onClick={() => handleTabChange("subscription")}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-8 bg-white rounded-[20px] shadow-sm overflow-auto">
        {activeTab === "my-profile" && (
          <MyProfile />
        )}
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
        {activeTab === "subscription" && <SubscriptionPage />}
      </div>
    </div>
  );
};

const SettingsTab = ({ icon, text, isActive, onClick }) => {
  return (
    <div
      className={`flex items-center px-4 md:px-6 py-3 cursor-pointer hover:bg-gray-50 transition-colors duration-200 whitespace-nowrap md:whitespace-normal ${isActive ? "bg-[#F5F5F7] border-b-2 md:border-b-0 md:border-l-4 border-[#313166]" : ""
        }`}
      onClick={onClick}
    >
      <span className={`mr-3 ${isActive ? "text-[#313166]" : "text-gray-500"}`}>
        {icon}
      </span>
      <span
        className={`text-sm md:text-base ${isActive ? "text-[#313166] font-semibold" : "text-[#313166]"
          }`}
      >
        {text}
      </span>
    </div>
  );
};

export default SettingsPage;
