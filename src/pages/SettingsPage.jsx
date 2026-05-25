import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiPackage,
  FiFileText,
  FiUsers,
  FiSettings,
  FiRepeat,
} from "react-icons/fi";

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
import RetryAutomationSettings from "../components/settings/RetryAutomationSettings";

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

  useEffect(() => {
    if (tab === "subscription") {
      navigate("/subscription", { replace: true });
    }
    if (tab === "template") {
      navigate("/customerrhythm?section=automation", { replace: true });
    }
  }, [tab, navigate]);

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
    <div className="app-page">
      <div className="app-page-shell">
        <UnsavedChangesModal
          isOpen={showModal}
          onConfirm={() => proceedWithTabChange(pendingTab)}
          onCancel={() => {
            setShowModal(false);
            setPendingTab(null);
          }}
        />

        <div className="app-panel flex flex-col overflow-hidden lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
          <div className="border-b border-gray-200 lg:border-b-0 lg:border-r">
            <div className="border-b border-gray-200 p-5 sm:p-6">
              <h1 className="text-xl font-medium text-[#313166]">Settings</h1>
            </div>
            <div className="app-tabs-row px-2 py-2 md:px-3 md:py-4 lg:block lg:space-y-1 lg:overflow-visible lg:px-0">
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
                icon={<FiRepeat />}
                text="Retry Automation"
                isActive={activeTab === "retry-automation"}
                onClick={() => handleTabChange("retry-automation")}
              />
            </div>
          </div>

          <div className="min-w-0 overflow-x-hidden p-4 sm:p-5 lg:p-6">
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
            {activeTab === "retry-automation" && <RetryAutomationSettings />}
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsTab = ({ icon, text, isActive, onClick }) => {
  return (
    <div
      className={`flex min-w-max items-center rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors duration-200 whitespace-nowrap md:min-w-0 md:px-5 lg:mx-2 ${isActive ? "bg-[#F5F5F7] border-b-2 md:border-b-0 lg:border-l-4 border-[#313166]" : ""
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
